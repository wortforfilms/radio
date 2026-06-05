import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const runVerify = !process.argv.includes("--no-verify");
const browserUrl = process.env.RADIO_RELEASE_BROWSER_URL ?? null;
const nodeBin = process.env.RADIO_RELEASE_NODE_BIN ?? process.execPath;
const useExistingBrowserEvidence = process.env.RADIO_RELEASE_USE_EXISTING_BROWSER_EVIDENCE === "1";
const reportPath = path.resolve("apps/web/public/radio-html/data/release-orchestration-run.json");
const desktopReportPath = path.resolve("apps/desktop/public/radio-html/data/release-orchestration-run.json");

function runStep(key, command, args, options = {}) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    stdio: "pipe",
    encoding: "utf8",
    cwd: options.cwd ? path.resolve(options.cwd) : undefined,
    env: { ...process.env, ...options.env }
  });
  const finishedAt = new Date().toISOString();
  return {
    key,
    command: [command, ...args].join(" "),
    status: result.status === 0 ? "pass" : "fail",
    exitCode: result.status,
    startedAt,
    finishedAt,
    stdout: result.stdout.slice(-4000),
    stderr: result.stderr.slice(-4000)
  };
}

function readEvidenceStep(key, evidencePath, validate) {
  const startedAt = new Date().toISOString();
  const absolutePath = path.resolve(evidencePath);
  let payload = null;
  let error = null;
  if (!fs.existsSync(absolutePath)) {
    error = `Missing evidence file: ${evidencePath}`;
  } else {
    try {
      payload = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
      error = validate(payload);
    } catch (parseError) {
      error = parseError.message;
    }
  }
  const finishedAt = new Date().toISOString();
  return {
    key,
    command: `read ${evidencePath}`,
    status: error ? "fail" : "pass",
    exitCode: error ? 1 : 0,
    startedAt,
    finishedAt,
    stdout: payload ? JSON.stringify({
      evidencePath,
      counts: payload.counts ?? null,
      verificationState: payload.verificationState ?? null
    }, null, 2) : "",
    stderr: error ?? ""
  };
}

const steps = [
  runStep("core-data", nodeBin, ["scripts/product-factory/complete-radio-milestones.mjs"]),
  runStep("next-milestones", nodeBin, ["scripts/product-factory/complete-radio-next-milestones.mjs"]),
  runStep("desktop-signing", "npm", ["run", "evidence:signing"], { cwd: "apps/desktop" }),
  runStep("sync-gui-evidence", nodeBin, ["scripts/product-factory/sync-radio-gui-smoke-evidence.mjs"]),
  runStep("sync-signing-evidence", nodeBin, ["scripts/product-factory/sync-radio-signing-evidence.mjs"]),
  runStep("proof-milestones", nodeBin, ["scripts/product-factory/complete-radio-proof-milestones.mjs"]),
  runStep("payment-proof", nodeBin, ["scripts/product-factory/verify-radio-payment-proof.mjs"]),
  runStep("rights-closure", nodeBin, ["scripts/product-factory/verify-radio-rights-closure.mjs"]),
  runStep("hdfc-parser-tests", "npm", ["run", "radio:hdfc:test"])
];

if (runVerify) {
  steps.push(runStep("tests", "npm", ["test"]));
  steps.push(runStep("build", "npm", ["run", "build"]));
}

if (browserUrl) {
  const env = { RADIO_VISUAL_QA_BASE_URL: browserUrl, GOVERNANCE_EVIDENCE_URL: `${browserUrl.replace(/\/$/, "")}/governance` };
  if (useExistingBrowserEvidence) {
    steps.push(readEvidenceStep(
      "governance-playwright-existing",
      "apps/web/public/radio-html/qa/governance/governance-playwright-report.json",
      (payload) => {
        const assertionsPass = Object.values(payload.assertions ?? {}).every(Boolean);
        if (!assertionsPass) return "Governance Playwright assertions are not all true.";
        if ((payload.counts?.failedLinks ?? 1) !== 0) return "Governance Playwright has failed links.";
        if ((payload.counts?.brokenDesktopImages ?? 1) !== 0 || (payload.counts?.brokenMobileImages ?? 1) !== 0) return "Governance Playwright has broken images.";
        return null;
      }
    ));
    steps.push(readEvidenceStep(
      "visual-qa-playwright-existing",
      "apps/web/public/radio-html/data/visual-qa.json",
      (payload) => {
        if ((payload.counts?.blocked ?? 1) !== 0) return "Visual QA has blocked targets.";
        if ((payload.counts?.pass ?? 0) !== (payload.counts?.targets ?? -1)) return "Visual QA pass count does not match target count.";
        if ((payload.counts?.capturedScreenshots ?? 0) !== (payload.counts?.targets ?? -1)) return "Visual QA screenshot count does not match target count.";
        return null;
      }
    ));
  } else {
    steps.push(runStep("governance-playwright", nodeBin, ["scripts/product-factory/governance-playwright-evidence.mjs"], { env }));
    steps.push(runStep("visual-qa-playwright", nodeBin, ["scripts/product-factory/capture-radio-visual-qa.mjs"], { env }));
  }
}

const failed = steps.filter((step) => step.status !== "pass");
const report = {
  id: "radio-vaigyaaniq-release-evidence-orchestration-run",
  generatedAt: new Date().toISOString(),
  verificationState: failed.length ? "blocked" : "draft-verified-local",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This report verifies local commands only. It does not verify rights, payment settlement, installer signing, release approval, external telemetry, or production readiness."
  },
  counts: {
    steps: steps.length,
    pass: steps.filter((step) => step.status === "pass").length,
    fail: failed.length,
    browserChecks: browserUrl ? 2 : 0
  },
  browserUrl,
  steps
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (fs.existsSync(path.dirname(desktopReportPath))) {
  fs.writeFileSync(desktopReportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify({
  report: "/radio-html/data/release-orchestration-run.json",
  counts: report.counts,
  verificationState: report.verificationState
}, null, 2));

if (failed.length) process.exit(1);
