#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const orchestratorPath = path.join(root, "scripts/product-factory/radio-release-evidence-orchestrator.mjs");
const reportPath = path.join(root, "apps/web/public/radio-html/data/release-orchestration-run.json");
const statusPath = path.resolve(root, process.env.RADIO_RELEASE_STATUS_PATH || "_radio_index/release-gate-status.json");

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function appendGithubOutputs(status) {
  if (!process.env.GITHUB_OUTPUT) return;
  const lines = [
    `status_path=${path.relative(root, statusPath)}`,
    `overall=${status.overall}`,
    `shipDecision=${status.shipDecision}`,
    `productionReady=${String(status.productionReady)}`,
    `releaseAllowed=${String(status.releaseAllowed)}`,
    "status<<JSON",
    JSON.stringify(status),
    "JSON"
  ];
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
}

function summarize(report, orchestrationExitCode) {
  const counts = report?.counts || {};
  const gateSummary = report?.gateSummary || report?.evidenceDashboard?.gates || [];
  const failedSteps = (report?.steps || []).filter((step) => step.status !== "pass");
  const blockedGates = gateSummary.filter((gate) => gate.status !== "pass");
  const productionReady = report?.productionReady === true;
  const releaseAllowed = report?.releaseAllowed === true;
  const shipDecision = report?.shipDecision === "SHIP" ? "SHIP" : "NO_SHIP";
  const overall = orchestrationExitCode === 0
    && failedSteps.length === 0
    && blockedGates.length === 0
    && productionReady
    && releaseAllowed
    && shipDecision === "SHIP"
    ? "PASS"
    : "FAIL";

  return {
    id: "radio-vaigyaaniq-release-gate-ci-status",
    generatedAt: new Date().toISOString(),
    sourceReport: "apps/web/public/radio-html/data/release-orchestration-run.json",
    verificationState: report?.verificationState || "blocked-missing-release-report",
    shipDecision,
    productionReady,
    releaseAllowed,
    commandSteps: {
      passed: Number(counts.pass || 0),
      failed: Number(counts.fail || failedSteps.length),
      total: Number(counts.steps || (report?.steps || []).length),
      failedKeys: failedSteps.map((step) => step.key)
    },
    evidenceGates: {
      passed: Number(counts.gatesPass || gateSummary.filter((gate) => gate.status === "pass").length),
      blocked: Number(counts.gatesBlocked || blockedGates.length),
      total: Number(counts.gates || gateSummary.length),
      details: Object.fromEntries(gateSummary.map((gate) => [
        gate.key,
        {
          status: gate.status,
          evidencePath: gate.evidencePath,
          verificationState: gate.verificationState,
          requiredEvidence: gate.requiredEvidence || [],
          missing: gate.missing || []
        }
      ]))
    },
    realWorldBlockers: report?.realWorldBlockers || [],
    overall,
    exitCode: overall === "PASS" ? 0 : 1
  };
}

const result = spawnSync(process.execPath, [orchestratorPath, ...process.argv.slice(2)], {
  cwd: root,
  env: process.env,
  encoding: "utf8",
  stdio: "inherit"
});

const report = readJson(reportPath, null);
const status = summarize(report, result.status ?? 1);
fs.mkdirSync(path.dirname(statusPath), { recursive: true });
fs.writeFileSync(statusPath, `${JSON.stringify(status, null, 2)}\n`);
appendGithubOutputs(status);

console.log(JSON.stringify({
  report: path.relative(root, reportPath),
  status: path.relative(root, statusPath),
  overall: status.overall,
  verificationState: status.verificationState,
  shipDecision: status.shipDecision,
  productionReady: status.productionReady,
  releaseAllowed: status.releaseAllowed,
  commandSteps: status.commandSteps,
  evidenceGates: {
    passed: status.evidenceGates.passed,
    blocked: status.evidenceGates.blocked,
    total: status.evidenceGates.total
  }
}, null, 2));

process.exit(status.exitCode);
