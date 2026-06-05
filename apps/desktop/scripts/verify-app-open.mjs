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
const reportPath = path.join(EVID, "app-open-report.json");
const attemptOpen = process.env.EVIDENCE_ATTEMPT_OPEN === "1";
const manualScreenshot = process.env.EVIDENCE_APP_OPEN_SCREENSHOT || null;
const manualReviewer = process.env.EVIDENCE_APP_OPEN_REVIEWER || null;

function gitOut(args) {
  const r = spawnSync("git", ["-c", "safe.directory=*", ...args], { cwd: REPO, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

function resolveArtifact(artifact) {
  if (!artifact) return null;
  return path.resolve(DESKTOP, artifact);
}

function hasFile(file) {
  return Boolean(file && fs.existsSync(file));
}

function readPlistValue(plist, key) {
  const match = plist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`));
  return match?.[1] ?? null;
}

const bundleReport = fs.existsSync(bundleReportPath) ? JSON.parse(fs.readFileSync(bundleReportPath, "utf8")) : null;
const artifactPath = resolveArtifact(bundleReport?.installer?.artifact);
const infoPlist = artifactPath ? path.join(artifactPath, "Contents", "Info.plist") : null;
const executableName = hasFile(infoPlist) ? readPlistValue(fs.readFileSync(infoPlist, "utf8"), "CFBundleExecutable") : null;
const executablePath = artifactPath && executableName ? path.join(artifactPath, "Contents", "MacOS", executableName) : null;
const bundleStructureOk = hasFile(artifactPath) && hasFile(infoPlist) && hasFile(executablePath);

let openResult = null;
if (attemptOpen && artifactPath) {
  const result = spawnSync("open", ["-n", artifactPath], { encoding: "utf8", timeout: 15000 });
  openResult = {
    command: `open -n ${artifactPath}`,
    exitCode: result.status,
    stdout: result.stdout?.trim() || "",
    stderr: result.stderr?.trim() || "",
    launchRequestAccepted: result.status === 0
  };
}

const manualProofOk = hasFile(manualScreenshot) && Boolean(manualReviewer);
const gateStatus = manualProofOk ? "pass" : bundleStructureOk ? "not-run" : "blocked";
const report = {
  report: "app-open-report",
  generated_at: new Date().toISOString(),
  source_commit: gitOut(["rev-parse", "HEAD"]),
  source_commit_short: gitOut(["rev-parse", "--short", "HEAD"]),
  verification_state: manualProofOk ? "manual-open-verified" : bundleStructureOk ? "bundle-structure-verified-open-proof-null" : "blocked",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    releaseAllowed: false,
    note: "A successful open command is not treated as proof that the GUI opened correctly. Manual screenshot/log proof is required for pass."
  },
  app: {
    artifact: bundleReport?.installer?.artifact ?? null,
    artifact_path: artifactPath,
    bundle_hash: bundleReport?.installer?.sha256 ?? null,
    exists: hasFile(artifactPath),
    info_plist: infoPlist,
    info_plist_exists: hasFile(infoPlist),
    executable: executablePath,
    executable_exists: hasFile(executablePath),
    bundle_structure_ok: bundleStructureOk
  },
  open_attempt: openResult,
  manual_evidence: {
    screenshot: manualScreenshot,
    screenshot_exists: hasFile(manualScreenshot),
    reviewer: manualReviewer,
    reviewed_at: manualProofOk ? new Date().toISOString() : null
  },
  gate: {
    name: "installer opens successfully",
    status: gateStatus,
    detail: manualProofOk
      ? "Manual screenshot/reviewer evidence attached."
      : bundleStructureOk
        ? "App bundle structure is valid, but GUI open proof is NULL."
        : "App bundle structure is missing or incomplete."
  }
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  report: "apps/desktop/evidence/app-open-report.json",
  verificationState: report.verification_state,
  gate: report.gate
}, null, 2));

if (gateStatus === "blocked") process.exit(1);
