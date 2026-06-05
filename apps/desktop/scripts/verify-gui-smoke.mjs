#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(__dirname, "..");
const REPO = path.resolve(DESKTOP, "..", "..");
const EVID = path.join(DESKTOP, "evidence");
const appOpenReportPath = path.join(EVID, "app-open-report.json");
const bundleReportPath = path.join(EVID, "bundle-report.json");
const reportPath = path.join(EVID, "gui-smoke-report.json");

fs.mkdirSync(EVID, { recursive: true });

const boolEnv = (key) => /^(1|true|yes|pass)$/i.test(process.env[key] || "");
const envText = (key) => {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : null;
};
const readJson = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
const resolveEvidencePath = (value) => {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.resolve(REPO, value);
};
const hasFile = (file) => Boolean(file && fs.existsSync(file) && fs.statSync(file).isFile());
const sha256File = (file) => {
  if (!hasFile(file)) return null;
  const h = createHash("sha256");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
};
const gitOut = (args) => {
  const r = spawnSync("git", ["-c", "safe.directory=*", ...args], { cwd: REPO, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};
const check = (key, label, passed, evidence, blocker) => ({
  key,
  label,
  status: passed ? "pass" : "blocked",
  evidence: evidence ?? null,
  blocker: passed ? null : blocker
});

const appOpenReport = readJson(appOpenReportPath);
const bundleReport = readJson(bundleReportPath);
const screenshotInput = envText("EVIDENCE_GUI_SMOKE_SCREENSHOT") || envText("EVIDENCE_APP_OPEN_SCREENSHOT");
const screenshotPath = resolveEvidencePath(screenshotInput);
const reviewer = envText("EVIDENCE_GUI_SMOKE_REVIEWER") || envText("EVIDENCE_APP_OPEN_REVIEWER");
const notes = envText("EVIDENCE_GUI_SMOKE_NOTES");
const route = envText("EVIDENCE_GUI_SMOKE_ROUTE") || "radio-html/surfaces/landing.html";
const bundleStructureOk = appOpenReport?.app?.bundle_structure_ok === true || Boolean(bundleReport?.installer?.artifact);

const checks = [
  check("bundle-structure", "App bundle structure exists", bundleStructureOk, appOpenReportPath, "app bundle structure proof missing"),
  check("manual-screenshot", "Desktop GUI screenshot attached", hasFile(screenshotPath), screenshotPath, "EVIDENCE_GUI_SMOKE_SCREENSHOT missing or file does not exist"),
  check("reviewer", "Human reviewer attached", Boolean(reviewer), reviewer, "EVIDENCE_GUI_SMOKE_REVIEWER missing"),
  check("first-paint", "First paint visible", boolEnv("EVIDENCE_GUI_SMOKE_FIRST_PAINT"), route, "EVIDENCE_GUI_SMOKE_FIRST_PAINT must be true"),
  check("navigation", "Primary navigation responds", boolEnv("EVIDENCE_GUI_SMOKE_NAVIGATION"), route, "EVIDENCE_GUI_SMOKE_NAVIGATION must be true"),
  check("no-crash", "No crash or blank screen observed", boolEnv("EVIDENCE_GUI_SMOKE_NO_CRASH"), route, "EVIDENCE_GUI_SMOKE_NO_CRASH must be true"),
  check("no-ship-visible", "NO_SHIP state visible", boolEnv("EVIDENCE_GUI_SMOKE_NO_SHIP"), route, "EVIDENCE_GUI_SMOKE_NO_SHIP must be true"),
  check("audio-gate-visible", "Audio rights/playback gate visible", boolEnv("EVIDENCE_GUI_SMOKE_AUDIO_GATE"), route, "EVIDENCE_GUI_SMOKE_AUDIO_GATE must be true"),
  check("error-review", "Renderer console/errors reviewed", boolEnv("EVIDENCE_GUI_SMOKE_ERROR_REVIEW"), envText("EVIDENCE_GUI_SMOKE_LOG"), "EVIDENCE_GUI_SMOKE_ERROR_REVIEW must be true")
];

const summary = checks.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] || 0) + 1;
  acc.total += 1;
  return acc;
}, { pass: 0, blocked: 0, total: 0 });
const gatePass = checks.every((item) => item.status === "pass");
const missing = checks.filter((item) => item.status !== "pass").map((item) => item.key);

const report = {
  report: "gui-smoke-report",
  generated_at: new Date().toISOString(),
  source_commit: gitOut(["rev-parse", "HEAD"]),
  source_commit_short: gitOut(["rev-parse", "--short", "HEAD"]),
  verification_state: gatePass ? "manual-gui-smoke-verified" : "blocked-gui-proof-null",
  phkd: {
    rule: "fail_closed",
    productionReady: false,
    releaseAllowed: false,
    note: "GUI smoke passes only when screenshot, reviewer, and every checklist confirmation are attached. Missing proof stays blocked."
  },
  app: {
    artifact: appOpenReport?.app?.artifact ?? bundleReport?.installer?.artifact ?? null,
    artifact_path: appOpenReport?.app?.artifact_path ?? null,
    bundle_hash: appOpenReport?.app?.bundle_hash ?? bundleReport?.installer?.sha256 ?? null,
    bundle_structure_ok: bundleStructureOk,
    open_attempt: appOpenReport?.open_attempt ?? null
  },
  manual_evidence: {
    route,
    screenshot: screenshotInput,
    screenshot_path: screenshotPath,
    screenshot_exists: hasFile(screenshotPath),
    screenshot_sha256: sha256File(screenshotPath),
    reviewer,
    reviewed_at: gatePass ? new Date().toISOString() : null,
    notes
  },
  checks,
  summary,
  gate: {
    name: "GUI smoke proof",
    status: gatePass ? "pass" : "blocked",
    detail: gatePass
      ? "Manual GUI smoke screenshot, reviewer, and checklist proof attached."
      : `GUI smoke proof incomplete: ${missing.join(", ")}.`
  }
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  report: "apps/desktop/evidence/gui-smoke-report.json",
  verificationState: report.verification_state,
  gate: report.gate,
  summary
}, null, 2));

if (!bundleStructureOk) process.exit(1);
