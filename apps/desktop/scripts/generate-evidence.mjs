#!/usr/bin/env node
// Fail-closed evidence generator for the Radio Vaigyaaniq desktop shell.
// Records pass | fail | blocked | not-run for every shipping gate. Never fabricates success.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(__dirname, "..");
const REPO = path.resolve(DESKTOP, "..", "..");
const EVID = path.join(DESKTOP, "evidence");
fs.mkdirSync(EVID, { recursive: true });
const now = new Date().toISOString();
const cargoTargetDir = process.env.CARGO_TARGET_DIR || path.join(os.tmpdir(), "radio-vaigyaaniq-desktop-target");
const buildEnv = { ...process.env, COPYFILE_DISABLE: "1", CARGO_TARGET_DIR: cargoTargetDir };

function removeAppleDouble(dir) {
  let removed = 0;
  if (!fs.existsSync(dir)) return removed;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.name.startsWith("._")) {
      fs.rmSync(p, { force: true, recursive: true });
      removed += 1;
    } else if (entry.isDirectory()) {
      removed += removeAppleDouble(p);
    }
  }
  return removed;
}

const appleDoubleRemoved = removeAppleDouble(DESKTOP);

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "command", process.platform === "win32" ? [cmd] : ["-v", cmd], { encoding: "utf8", shell: true });
  return r.status === 0 ? (r.stdout || "").trim().split("\n")[0] : null;
}
function ver(cmd, args = ["--version"]) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || r.stderr || "").trim().split("\n")[0] : null;
}
function cmdOut(cmd, args = ["--version"], cwd = DESKTOP) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env: buildEnv });
  return r.status === 0 ? (r.stdout || r.stderr || "").trim().split("\n")[0] : null;
}
function detectTauriCli() {
  const cargoSubcommand = cmdOut("cargo", ["tauri", "--version"]);
  if (cargoSubcommand) return { command: "cargo tauri", version: cargoSubcommand };
  const cargoTauri = cmdOut("cargo-tauri", ["tauri", "--version"]);
  if (cargoTauri) return { command: "cargo-tauri tauri", version: cargoTauri };
  const standalone = cmdOut("tauri", ["--version"]);
  if (standalone) return { command: "tauri", version: standalone };
  return null;
}
function sha256File(p) {
  const h = createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}
function gitOut(args) {
  const r = spawnSync("git", ["-c", "safe.directory=*", ...args], { cwd: REPO, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

const tauriCli = detectTauriCli();
const tool = {
  node: process.version,
  npm: ver("npm"),
  cargo: which("cargo") ? ver("cargo") : null,
  rustc: which("rustc") ? ver("rustc") : null,
  tauri_cli: tauriCli?.version ?? null,
  tauri_command: tauriCli?.command ?? null,
};
const host = { os: process.platform, arch: process.arch, appleDoubleRemoved, cargoTargetDir, ...tool,
  note: "evidence-generation host; NOT a verified macOS/Windows build host" };
const commit = gitOut(["rev-parse", "HEAD"]);
const commitShort = gitOut(["rev-parse", "--short", "HEAD"]);
const branch = gitOut(["rev-parse", "--abbrev-ref", "HEAD"]);

// ---- gate runners (fail-closed) ----
function runGate(cmd, args, cwd, timeoutMs = 30000) {
  try {
    const r = spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: timeoutMs, env: buildEnv });
    if (r.error && r.error.code === "ENOENT") return { status: "blocked", detail: `${cmd} not found` };
    if (r.error && r.error.code === "ETIMEDOUT") return { status: "not-run", detail: `timeout after ${timeoutMs}ms` };
    if (r.status === 0) return { status: "pass", detail: (r.stdout || "").trim().split("\n").slice(-3).join(" | ").slice(0, 300) };
    const out = (r.stderr || r.stdout || "");
    // environment/native-binding/cross-platform issues are BLOCKED, not a code FAIL
    if (/Cannot find native binding|MODULE_NOT_FOUND|Cannot find module|native binding|ELIFECYCLE.*ENOENT/i.test(out)) {
      return { status: "blocked", detail: ("environment: " + out.trim().split("\n").find(l => /native binding|Cannot find module/i.test(l)) || "missing native binding").slice(0, 300) };
    }
    return { status: "fail", detail: (out.trim().split("\n").slice(-4).join(" | ")).slice(0, 400) };
  } catch (e) { return { status: "blocked", detail: String(e).slice(0, 200) }; }
}

// 1. npm test (repo-level vitest)
const gNpmTest = runGate("npm", ["test", "--silent"], REPO, 60000);
// 2. npm run build (repo-level Next build)
const SKIP_ROOT_BUILD = process.env.EVIDENCE_SKIP_ROOT_BUILD === "1";
const ROOT_BUILD_TIMEOUT = Number(process.env.EVIDENCE_ROOT_BUILD_TIMEOUT_MS || 3 * 60 * 1000);
const gNpmBuild = SKIP_ROOT_BUILD
  ? { status: "not-run", detail: "EVIDENCE_SKIP_ROOT_BUILD=1; root build not invoked." }
  : runGate("npm", ["run", "build"], REPO, ROOT_BUILD_TIMEOUT);
// 3. cargo check inside apps/desktop/src-tauri
const gCargo = tool.cargo
  ? runGate("cargo", ["check", "--manifest-path", "src-tauri/Cargo.toml"], DESKTOP, 120000)
  : { status: "blocked", detail: "cargo/rustc not installed in this environment" };
// 4. Tauri dev smoke test still needs a display; left honest.
const gTauriDev = { status: "blocked", detail: tool.tauri_cli ? "no display in this environment for a dev smoke test" : "tauri CLI not installed" };

// ---- 5-6,9: Tauri bundle build + artifact hashing ----
// Actually invokes `tauri build` (via `npm run build`) when the CLI is present,
// then walks target/release/bundle and sha256-hashes every produced artifact.
const BUNDLE_DIR = path.join(cargoTargetDir, "release", "bundle");
const INSTALLER_EXT = /\.(dmg|app\.tar\.gz|app\.tar\.gz\.sig|exe|msi|AppImage|deb|rpm)$/i;

function walkBundle(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith("._") || e.name === ".DS_Store") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/\.app$/i.test(e.name)) acc.push({ path: p, appDir: true }); // record .app as a unit
      else walkBundle(p, acc);
    } else if (e.isFile()) acc.push({ path: p, appDir: false });
  }
  return acc;
}
function dirBytes(dir) {
  let t = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) t += dirBytes(p);
    else if (e.isFile()) t += fs.statSync(p).size;
  }
  return t;
}
function listFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith("._") || e.name === ".DS_Store") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, acc);
    else if (e.isFile()) acc.push(p);
  }
  return acc;
}
function sha256Dir(dir) {
  const h = createHash("sha256");
  for (const file of listFiles(dir).sort()) {
    const rel = path.relative(dir, file);
    h.update(rel);
    h.update("\0");
    h.update(sha256File(file));
    h.update("\0");
  }
  return h.digest("hex");
}
function collectArtifacts() {
  const out = [];
  for (const f of walkBundle(BUNDLE_DIR)) {
    const rel = path.relative(DESKTOP, f.path);
    if (f.appDir) out.push({ artifact: rel, type: "app", bytes: dirBytes(f.path), sha256: sha256Dir(f.path), note: "directory bundle (.app); sha256 is a deterministic manifest hash of relative file paths and file hashes" });
    else out.push({ artifact: rel, type: INSTALLER_EXT.test(f.path) ? "installer" : "support", bytes: fs.statSync(f.path).size, sha256: sha256File(f.path) });
  }
  return out;
}

const SKIP_BUILD = process.env.EVIDENCE_SKIP_BUILD === "1";
const BUILD_TIMEOUT = Number(process.env.EVIDENCE_BUILD_TIMEOUT_MS || 30 * 60 * 1000); // 30 min default
const tauriBuildCommand = "npm run build";
let buildLogTail = null;
let gTauriBundle;
if (!tool.tauri_cli) {
  gTauriBundle = { status: "blocked", detail: "tauri CLI not installed" };
} else if (SKIP_BUILD) {
  gTauriBundle = { status: "not-run", detail: "EVIDENCE_SKIP_BUILD=1 — build not invoked; scanned existing artifacts only" };
} else {
  const r = spawnSync("npm", ["run", "build"], { cwd: DESKTOP, encoding: "utf8", timeout: BUILD_TIMEOUT, maxBuffer: 64 * 1024 * 1024, env: buildEnv });
  const out = (r.stdout || "") + "\n" + (r.stderr || "");
  buildLogTail = out.trim().split("\n").slice(-12).join("\n");
  try { fs.writeFileSync(path.join(EVID, "tauri-build.log"), out); } catch {}
  if (r.error && r.error.code === "ETIMEDOUT") gTauriBundle = { status: "not-run", detail: `tauri build timed out after ${BUILD_TIMEOUT}ms` };
  else if (r.status === 0) gTauriBundle = { status: "__scan__" }; // resolved after artifact scan
  else if (/Cannot find native binding|MODULE_NOT_FOUND|Cannot find module|native binding/i.test(out))
    gTauriBundle = { status: "blocked", detail: ("environment: " + (out.split("\n").find(l => /native binding|Cannot find module/i.test(l)) || "missing native binding")).slice(0, 300) };
  else gTauriBundle = { status: "fail", detail: out.trim().split("\n").slice(-4).join(" | ").slice(0, 400) };
}

// scan artifacts (freshly built, or any pre-existing bundle)
const artifacts = fs.existsSync(BUNDLE_DIR) ? collectArtifacts() : [];
const installers = artifacts.filter(a => a.type === "installer" || a.type === "app");
const hashed = artifacts.filter(a => a.sha256);

if (gTauriBundle.status === "__scan__")
  gTauriBundle = installers.length > 0
    ? { status: "pass", detail: `tauri build ok; ${installers.length} installer artifact(s) under target/release/bundle` }
    : { status: "fail", detail: "tauri build exited 0 but no installer artifacts found under target/release/bundle" };

const gBundleHash = hashed.length > 0
  ? { status: "pass", detail: `${hashed.length} artifact(s) sha256-hashed (primary ${installers.find(i => i.sha256)?.sha256?.slice(0, 12) ?? "n/a"}…)` }
  : { status: "blocked", detail: "no bundle artifact produced; nothing to hash" };

const appOpenReportPath = path.join(EVID, "app-open-report.json");
const appOpenReport = fs.existsSync(appOpenReportPath) ? JSON.parse(fs.readFileSync(appOpenReportPath, "utf8")) : null;
const gInstaller = appOpenReport?.gate
  ? {
      status: appOpenReport.gate.status,
      detail: `${appOpenReport.gate.detail} Evidence: apps/desktop/evidence/app-open-report.json`
    }
  : installers.length > 0
    ? { status: "not-run", detail: `installer built (${installers[0].artifact}); automated open not performed — verify by launching it` }
    : { status: "blocked", detail: "no installer produced; cannot verify it opens" };
// 7. platform metadata recorded
const gPlatform = { status: "pass", detail: `${host.os}-${host.arch} (evidence host; target build host = NULL)` };
// 8. source commit recorded
const gCommit = commit ? { status: "pass", detail: commitShort } : { status: "fail", detail: "git HEAD unavailable" };

function readJson(relativePath, fallback) {
  const file = path.join(REPO, relativePath);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

const rightsEvidence = readJson("apps/web/public/radio-html/data/rights-evidence.json", { counts: { blocked: 0, releaseAllowed: 0 } });
const giftPaymentEvidence = readJson("apps/web/public/radio-html/data/gift-payment-evidence.json", { counts: { blocked: 0, paymentReceipts: 0 } });
const releaseReviewEvidence = readJson("apps/web/public/radio-html/data/release-review.json", { counts: { blocked: 0, verified: 0 } });
const releaseBlockers = [
  {
    gate: "installer signing evidence",
    status: "blocked",
    detail: "signing identity, signature verification, and notarization evidence are NULL"
  },
  {
    gate: "audio rights evidence",
    status: rightsEvidence.counts?.blocked > 0 || rightsEvidence.counts?.releaseAllowed === 0 ? "blocked" : "pass",
    detail: `releaseAllowed=${rightsEvidence.counts?.releaseAllowed ?? "NULL"} blocked=${rightsEvidence.counts?.blocked ?? "NULL"}`
  },
  {
    gate: "gift/payment proof",
    status: giftPaymentEvidence.counts?.blocked > 0 || giftPaymentEvidence.counts?.paymentReceipts === 0 ? "blocked" : "pass",
    detail: `paymentReceipts=${giftPaymentEvidence.counts?.paymentReceipts ?? "NULL"} blocked=${giftPaymentEvidence.counts?.blocked ?? "NULL"}`
  },
  {
    gate: "human release review",
    status: releaseReviewEvidence.counts?.blocked > 0 || releaseReviewEvidence.counts?.verified === 0 ? "blocked" : "pass",
    detail: `verified=${releaseReviewEvidence.counts?.verified ?? "NULL"} blocked=${releaseReviewEvidence.counts?.blocked ?? "NULL"}`
  }
];

// asset provenance (copied radio-html)
const radioDir = path.join(DESKTOP, "public", "radio-html");
const assets = [];
if (fs.existsSync(radioDir)) {
  for (const f of fs.readdirSync(radioDir)) {
    if (f.startsWith("._") || f === ".DS_Store") continue;
    const p = path.join(radioDir, f);
    if (fs.statSync(p).isFile()) assets.push({ file: `radio-html/${f}`, sha256: sha256File(p), bytes: fs.statSync(p).size });
  }
}

const gates = [
  { gate: "npm test", ...gNpmTest },
  { gate: "npm run build", ...gNpmBuild },
  { gate: "cargo check (apps/desktop/src-tauri)", ...gCargo },
  { gate: "tauri dev smoke test", ...gTauriDev },
  { gate: "tauri bundle build", ...gTauriBundle },
  { gate: "bundle hash recorded", ...gBundleHash },
  { gate: "platform metadata recorded", ...gPlatform },
  { gate: "source commit recorded", ...gCommit },
  { gate: "installer opens successfully", ...gInstaller },
];
const summary = { pass: 0, fail: 0, blocked: 0, "not-run": 0, total: gates.length + 1 };
for (const g of gates) summary[g.status] = (summary[g.status] || 0) + 1;
// gate 10: this QA report records every gate
const gQaRecords = { gate: "QA report records every gate", status: "pass", detail: `${gates.length + 1} gates recorded` };
summary.pass += 1;

const releaseBlockerSummary = { pass: 0, blocked: 0, total: releaseBlockers.length };
for (const blocker of releaseBlockers) releaseBlockerSummary[blocker.status] = (releaseBlockerSummary[blocker.status] || 0) + 1;
const verdict = summary.fail > 0 ? "blocked" : (summary.blocked > 0 || summary["not-run"] > 0 ? "draft" : "verified");
const shipDecision = verdict === "verified" && releaseBlockerSummary.blocked === 0 ? "READY_FOR_RELEASE_REVIEW" : "NO_SHIP";

const write = (name, obj) => fs.writeFileSync(path.join(EVID, name), JSON.stringify(obj, null, 2) + "\n");

write("tauri-build-report.json", {
  report: "tauri-build-report", generated_at: now,
  source_commit: commit, source_commit_short: commitShort, branch,
  evidence_host: host,
  gates: { frontend_build: gNpmBuild, cargo_check: gCargo, tauri_dev_smoke: gTauriDev, tauri_bundle: gTauriBundle },
  release_blockers: releaseBlockers,
  ship_decision: shipDecision,
  status: gCargo.status === "pass" ? "partial" : "blocked",
  notes: "Rust/Tauri gates require cargo + tauri CLI + a display + a built bundle. Run on the target macOS/Windows host.",
});

const primaryInstaller = installers.find(i => i.sha256) || installers[0] || null;
write("bundle-report.json", {
  report: "bundle-report", generated_at: now, source_commit: commit,
  bundle_dir: BUNDLE_DIR,
  bundle_platform: artifacts.length > 0 ? `${host.os}-${host.arch}` : null,
  build_command: tauriBuildCommand,
  tauri_bundles: process.env.TAURI_BUNDLES ?? (process.platform === "darwin" ? "app" : process.platform === "win32" ? "msi,nsis" : process.platform === "linux" ? "deb,appimage" : "all"),
  build_invoked: !!tool.tauri_cli && !SKIP_BUILD,
  build_status: gTauriBundle.status,
  build_log_tail: buildLogTail,
  artifacts,                       // each: { artifact, type, bytes, sha256 }
  installer: primaryInstaller ? { artifact: primaryInstaller.artifact, bytes: primaryInstaller.bytes, sha256: primaryInstaller.sha256 ?? null } : null,
  bundle_hash: primaryInstaller?.sha256 ?? null,
  status: artifacts.length > 0 ? "built" : "blocked",
  reason: artifacts.length > 0 ? null
    : (tool.tauri_cli ? (SKIP_BUILD ? "Build skipped (EVIDENCE_SKIP_BUILD=1); no pre-existing artifacts." : "tauri build invoked but produced no artifacts — see build_log_tail / evidence/tauri-build.log.")
                      : "No bundle built (tauri CLI absent in this environment)."),
  asset_provenance: assets,
});

write("qa-report.json", {
  report: "qa-report", generated_at: now, source_commit: commit, branch,
  evidence_host: host,
  gates: [...gates, gQaRecords],
  release_blockers: releaseBlockers,
  summary,
  release_blocker_summary: releaseBlockerSummary,
  verdict,
  ship_decision: shipDecision,
  phkd: "fail-closed: unknowns are NULL; missing tools are blocked, not faked.",
});

console.log("evidence written ->", EVID);
console.log("verdict:", verdict, "| ship:", shipDecision, "| summary:", JSON.stringify(summary), "| release blockers:", JSON.stringify(releaseBlockerSummary));
for (const g of [...gates, gQaRecords]) console.log(`  [${g.status.toUpperCase()}] ${g.gate}${g.detail ? " — " + g.detail : ""}`);
for (const g of releaseBlockers) console.log(`  [${g.status.toUpperCase()}] ${g.gate}${g.detail ? " — " + g.detail : ""}`);
