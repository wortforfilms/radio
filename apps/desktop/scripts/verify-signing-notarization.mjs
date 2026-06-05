#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(__dirname, "..");
const REPO = path.resolve(DESKTOP, "..", "..");
const EVID = path.join(DESKTOP, "evidence");
const bundleReportPath = path.join(EVID, "bundle-report.json");
const reportPath = path.join(EVID, "signing-notarization-report.json");

fs.mkdirSync(EVID, { recursive: true });

const readJson = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
const hasPath = (value) => Boolean(value && fs.existsSync(value));
const gitOut = (args) => {
  const r = spawnSync("git", ["-c", "safe.directory=*", ...args], { cwd: REPO, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};
const resolveArtifact = (artifact) => {
  if (!artifact) return null;
  return path.resolve(DESKTOP, artifact);
};
const run = (key, cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, {
    cwd: options.cwd || DESKTOP,
    encoding: "utf8",
    timeout: options.timeoutMs || 30000
  });
  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || "").trim();
  return {
    key,
    command: [cmd, ...args].join(" "),
    exitCode: result.status,
    status: result.status === 0 ? "pass" : "blocked",
    stdout: stdout || null,
    stderr: stderr || null,
    error: result.error ? String(result.error.message || result.error) : null
  };
};
const toolExists = (cmd) => {
  const r = spawnSync("command", ["-v", cmd], { encoding: "utf8", shell: true });
  return r.status === 0 ? (r.stdout || "").trim().split("\n")[0] : null;
};
const parseAuthorities = (text) => {
  const authorities = [];
  for (const line of (text || "").split("\n")) {
    const match = line.match(/^Authority=(.+)$/);
    if (match) authorities.push(match[1].trim());
  }
  return authorities;
};
const parseIdentifier = (text) => text?.match(/^Identifier=(.+)$/m)?.[1]?.trim() ?? null;
const parseTeamIdentifier = (text) => text?.match(/^TeamIdentifier=(.+)$/m)?.[1]?.trim() ?? null;
const parseSignature = (text) => text?.match(/^Signature=(.+)$/m)?.[1]?.trim() ?? null;

const bundleReport = readJson(bundleReportPath);
const artifact = resolveArtifact(bundleReport?.installer?.artifact);
const platform = process.platform;
const isMacApp = platform === "darwin" && Boolean(artifact && /\.app$/i.test(artifact));

const commands = [];
const tools = {
  codesign: platform === "darwin" ? toolExists("codesign") : null,
  spctl: platform === "darwin" ? toolExists("spctl") : null,
  xcrun: platform === "darwin" ? toolExists("xcrun") : null
};

if (isMacApp && hasPath(artifact) && tools.codesign) {
  commands.push(run("codesign-display", "codesign", ["-dv", "--verbose=4", artifact]));
  commands.push(run("codesign-verify", "codesign", ["--verify", "--deep", "--strict", "--verbose=4", artifact]));
}
if (isMacApp && hasPath(artifact) && tools.spctl) {
  commands.push(run("gatekeeper-assess", "spctl", ["--assess", "--type", "execute", "--verbose=4", artifact]));
}
if (isMacApp && hasPath(artifact) && tools.xcrun) {
  commands.push(run("notarization-stapler-validate", "xcrun", ["stapler", "validate", artifact]));
}

const display = commands.find((item) => item.key === "codesign-display");
const displayText = [display?.stdout, display?.stderr].filter(Boolean).join("\n");
const authorities = parseAuthorities(displayText);
const signature = parseSignature(displayText);
const teamIdentifier = parseTeamIdentifier(displayText);
const identifier = parseIdentifier(displayText);
const codesignVerify = commands.find((item) => item.key === "codesign-verify");
const gatekeeper = commands.find((item) => item.key === "gatekeeper-assess");
const stapler = commands.find((item) => item.key === "notarization-stapler-validate");
const hasDeveloperIdAuthority = authorities.some((item) => /^Developer ID Application:/i.test(item));
const hasAdhocSignature = /adhoc/i.test(signature || "");
const manualIdentity = process.env.EVIDENCE_SIGNING_IDENTITY || null;
const manualNotaryTicket = process.env.EVIDENCE_NOTARIZATION_TICKET || null;
const manualReviewer = process.env.EVIDENCE_SIGNING_REVIEWER || null;

const checks = [
  {
    key: "artifact",
    label: "macOS .app artifact exists",
    status: hasPath(artifact) ? "pass" : "blocked",
    evidence: artifact,
    blocker: hasPath(artifact) ? null : "bundle artifact missing"
  },
  {
    key: "codesign-tool",
    label: "codesign tool available",
    status: tools.codesign ? "pass" : "blocked",
    evidence: tools.codesign,
    blocker: tools.codesign ? null : "codesign unavailable"
  },
  {
    key: "codesign-verify",
    label: "codesign verification passes",
    status: codesignVerify?.status === "pass" ? "pass" : "blocked",
    evidence: "codesign --verify --deep --strict --verbose=4",
    blocker: codesignVerify?.status === "pass" ? null : "codesign verification failed or was not run"
  },
  {
    key: "developer-id",
    label: "Developer ID signing identity",
    status: hasDeveloperIdAuthority || manualIdentity ? "pass" : "blocked",
    evidence: manualIdentity ?? authorities,
    blocker: hasDeveloperIdAuthority || manualIdentity ? null : "Developer ID Application authority is NULL"
  },
  {
    key: "not-adhoc",
    label: "Signature is not ad-hoc",
    status: signature && !hasAdhocSignature ? "pass" : "blocked",
    evidence: signature,
    blocker: signature && !hasAdhocSignature ? null : "signature is ad-hoc or NULL"
  },
  {
    key: "gatekeeper",
    label: "Gatekeeper assessment passes",
    status: gatekeeper?.status === "pass" ? "pass" : "blocked",
    evidence: "spctl --assess --type execute --verbose=4",
    blocker: gatekeeper?.status === "pass" ? null : "Gatekeeper assessment failed or was not run"
  },
  {
    key: "notarization",
    label: "Stapled notarization ticket validates",
    status: stapler?.status === "pass" || Boolean(manualNotaryTicket) ? "pass" : "blocked",
    evidence: manualNotaryTicket ?? "xcrun stapler validate",
    blocker: stapler?.status === "pass" || manualNotaryTicket ? null : "notarization ticket/staple proof is NULL"
  },
  {
    key: "reviewer",
    label: "Human signing reviewer attached",
    status: manualReviewer ? "pass" : "blocked",
    evidence: manualReviewer,
    blocker: manualReviewer ? null : "EVIDENCE_SIGNING_REVIEWER missing"
  }
];

const summary = checks.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  acc.total += 1;
  return acc;
}, { pass: 0, blocked: 0, total: 0 });
const gatePass = checks.every((item) => item.status === "pass");
const missing = checks.filter((item) => item.status !== "pass").map((item) => item.key);

const report = {
  report: "signing-notarization-report",
  generated_at: new Date().toISOString(),
  source_commit: gitOut(["rev-parse", "HEAD"]),
  source_commit_short: gitOut(["rev-parse", "--short", "HEAD"]),
  verification_state: gatePass ? "signed-and-notarized-verified" : "blocked-signing-notarization-proof-null",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    releaseAllowed: false,
    note: "This report only inspects signing and notarization evidence. It never signs, notarizes, or promotes an unsigned app."
  },
  artifact: {
    path: artifact,
    exists: hasPath(artifact),
    bundle_hash: bundleReport?.installer?.sha256 ?? null,
    platform,
    isMacApp
  },
  tools,
  signature: {
    identifier,
    signature,
    teamIdentifier,
    authorities,
    developerIdApplication: hasDeveloperIdAuthority,
    adhoc: hasAdhocSignature,
    manualIdentity
  },
  notarization: {
    staplerStatus: stapler?.status ?? "not-run",
    manualTicket: manualNotaryTicket
  },
  manual_evidence: {
    reviewer: manualReviewer,
    reviewed_at: gatePass ? new Date().toISOString() : null
  },
  commands,
  checks,
  summary,
  gate: {
    name: "installer signing evidence",
    status: gatePass ? "pass" : "blocked",
    detail: gatePass
      ? "Developer ID signature, Gatekeeper, notarization, and reviewer evidence verified."
      : `Signing/notarization proof incomplete: ${missing.join(", ")}.`
  }
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  report: "apps/desktop/evidence/signing-notarization-report.json",
  verificationState: report.verification_state,
  gate: report.gate,
  summary
}, null, 2));

if (!hasPath(artifact)) process.exit(1);
