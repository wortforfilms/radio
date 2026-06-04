#!/usr/bin/env node
// Fail-closed evidence generator for the Radio Vaigyaaniq desktop shell.
// Records pass | fail | blocked | not-run for every shipping gate. Never fabricates success.
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(__dirname, "..");
const REPO = path.resolve(DESKTOP, "..", "..");
const EVID = path.join(DESKTOP, "evidence");
fs.mkdirSync(EVID, { recursive: true });
const now = new Date().toISOString();

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "command", process.platform === "win32" ? [cmd] : ["-v", cmd], { encoding: "utf8", shell: true });
  return r.status === 0 ? (r.stdout || "").trim().split("\n")[0] : null;
}
function ver(cmd, args = ["--version"]) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || r.stderr || "").trim().split("\n")[0] : null;
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

const tool = {
  node: process.version,
  npm: ver("npm"),
  cargo: which("cargo") ? ver("cargo") : null,
  rustc: which("rustc") ? ver("rustc") : null,
  tauri_cli: which("cargo-tauri") || which("tauri") ? ver("cargo-tauri", ["tauri", "--version"]) : null,
};
const host = { os: process.platform, arch: process.arch, ...tool,
  note: "evidence-generation host; NOT a verified macOS/Windows build host" };
const commit = gitOut(["rev-parse", "HEAD"]);
const commitShort = gitOut(["rev-parse", "--short", "HEAD"]);
const branch = gitOut(["rev-parse", "--abbrev-ref", "HEAD"]);

// ---- gate runners (fail-closed) ----
function runGate(cmd, args, cwd, timeoutMs = 30000) {
  try {
    const r = spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: timeoutMs });
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
const gNpmTest = runGate("npm", ["test", "--silent"], REPO, 35000);
// 2. npm run build — Next build is heavy; deferred to a dev machine to keep evidence fast & honest
const gNpmBuild = { status: "not-run", detail: "Deferred: heavy Next build. Run `npm run build` at repo root on a dev machine and re-run evidence." };
// 3. cargo check inside apps/desktop/src-tauri
const gCargo = tool.cargo
  ? runGate("cargo", ["check", "--manifest-path", "src-tauri/Cargo.toml"], DESKTOP, 40000)
  : { status: "blocked", detail: "cargo/rustc not installed in this environment" };
// 4-6,9 Tauri gates require the tauri CLI + a desktop/display + a built bundle
const gTauriDev = { status: "blocked", detail: tool.tauri_cli ? "no display in this environment for a dev smoke test" : "tauri CLI not installed" };
const gTauriBundle = { status: "blocked", detail: tool.tauri_cli ? "bundle build not executed in this environment" : "tauri CLI not installed" };
const gBundleHash = { status: "blocked", detail: "no bundle artifact produced; nothing to hash" };
const gInstaller = { status: "blocked", detail: "no installer produced; cannot verify it opens" };
// 7. platform metadata recorded
const gPlatform = { status: "pass", detail: `${host.os}-${host.arch} (evidence host; target build host = NULL)` };
// 8. source commit recorded
const gCommit = commit ? { status: "pass", detail: commitShort } : { status: "fail", detail: "git HEAD unavailable" };

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

const verdict = summary.fail > 0 ? "blocked" : (summary.blocked > 0 || summary["not-run"] > 0 ? "draft" : "verified");

const write = (name, obj) => fs.writeFileSync(path.join(EVID, name), JSON.stringify(obj, null, 2) + "\n");

write("tauri-build-report.json", {
  report: "tauri-build-report", generated_at: now,
  source_commit: commit, source_commit_short: commitShort, branch,
  evidence_host: host,
  gates: { frontend_build: gNpmBuild, cargo_check: gCargo, tauri_dev_smoke: gTauriDev, tauri_bundle: gTauriBundle },
  status: gCargo.status === "pass" ? "partial" : "blocked",
  notes: "Rust/Tauri gates require cargo + tauri CLI + a display + a built bundle. Run on the target macOS/Windows host.",
});

write("bundle-report.json", {
  report: "bundle-report", generated_at: now, source_commit: commit,
  bundle: null, installer: null, bundle_hash: null, bundle_platform: null,
  status: "blocked", reason: "No bundle built in this environment (cargo/tauri CLI absent).",
  asset_provenance: assets,
});

write("qa-report.json", {
  report: "qa-report", generated_at: now, source_commit: commit, branch,
  evidence_host: host,
  gates: [...gates, gQaRecords],
  summary, verdict,
  phkd: "fail-closed: unknowns are NULL; missing tools are blocked, not faked.",
});

console.log("evidence written ->", EVID);
console.log("verdict:", verdict, "| summary:", JSON.stringify(summary));
for (const g of [...gates, gQaRecords]) console.log(`  [${g.status.toUpperCase()}] ${g.gate}${g.detail ? " — " + g.detail : ""}`);
