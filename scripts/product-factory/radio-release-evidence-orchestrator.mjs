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

function readJson(file, fallback = null) {
  const absolutePath = path.resolve(file);
  if (!fs.existsSync(absolutePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    return {
      readError: String(error.message || error),
      verificationState: "blocked-invalid-json",
      gate: {
        name: path.basename(file),
        status: "blocked",
        detail: `Evidence JSON could not be parsed: ${String(error.message || error)}`
      }
    };
  }
}

function normalizeGateStatus(payload) {
  const status = payload?.gate?.status || payload?.status || payload?.verificationState || payload?.verification_state;
  if (status === "pass" || status === "verified" || /verified$/i.test(String(status || ""))) return "pass";
  if (!payload) return "missing";
  return "blocked";
}

function summarizeGate(source) {
  const payload = readJson(source.path, null);
  const status = normalizeGateStatus(payload);
  const phkd = payload?.phkd || {};
  return {
    key: source.key,
    label: source.label,
    evidencePath: source.path,
    status,
    verificationState: payload?.verificationState || payload?.verification_state || "missing",
    detail: payload?.gate?.detail || payload?.phkd?.note || "Evidence file missing or gate summary unavailable.",
    productionReady: phkd.productionReady === true || payload?.productionReady === true,
    releaseAllowed: phkd.releaseAllowed === true || payload?.releaseAllowed === true,
    shipDecision: payload?.shipDecision || "NO_SHIP",
    counts: payload?.counts || null,
    summary: payload?.summary || null,
    requiredEvidence: payload?.requiredEvidence || source.requiredEvidence,
    missing: payload?.summary ? Object.entries(payload.summary)
      .filter(([key, value]) => /missing|blocked|auditUnverified/i.test(key) && Number(value) > 0)
      .map(([key, value]) => ({ key, count: value }))
      : []
  };
}

const steps = [
  runStep("core-data", nodeBin, ["scripts/product-factory/complete-radio-milestones.mjs"]),
  runStep("next-milestones", nodeBin, ["scripts/product-factory/complete-radio-next-milestones.mjs"]),
  runStep("playback-gate", nodeBin, ["scripts/product-factory/prepare-radio-playback-gate.mjs"]),
  runStep("desktop-signing", "npm", ["run", "evidence:signing"], { cwd: "apps/desktop" }),
  runStep("sync-gui-evidence", nodeBin, ["scripts/product-factory/sync-radio-gui-smoke-evidence.mjs"]),
  runStep("sync-signing-evidence", nodeBin, ["scripts/product-factory/sync-radio-signing-evidence.mjs"]),
  runStep("proof-milestones", nodeBin, ["scripts/product-factory/complete-radio-proof-milestones.mjs"]),
  runStep("payment-proof", nodeBin, ["scripts/product-factory/verify-radio-payment-proof.mjs"]),
  runStep("rights-packet", nodeBin, ["scripts/product-factory/prepare-radio-rights-closure-packet.mjs"]),
  runStep("rights-closure", nodeBin, ["scripts/product-factory/verify-radio-rights-closure.mjs"]),
  runStep("release-review", nodeBin, ["scripts/product-factory/verify-radio-release-review.mjs"]),
  runStep("remaining-packets", nodeBin, ["scripts/product-factory/prepare-radio-remaining-proof-packets.mjs"]),
  runStep("customer-release", nodeBin, ["scripts/product-factory/prepare-radio-customer-release-milestone.mjs"]),
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
const gateSources = [
  {
    key: "rights",
    label: "Rights gate",
    path: "apps/web/public/radio-html/data/rights-closure-report.json",
    requiredEvidence: ["source", "creator", "license", "citation", "reviewer", "reviewedAt", "AuditLog.verified", "releaseAllowed=true"]
  },
  {
    key: "payment",
    label: "Payment gate",
    path: "apps/web/public/radio-html/data/payment-proof-report.json",
    requiredEvidence: ["checkout session", "payment receipt", "webhook signature verification", "delivery proof", "AuditLog.created"]
  },
  {
    key: "signing",
    label: "Signing gate",
    path: "apps/web/public/radio-html/data/signing-notarization-evidence.json",
    requiredEvidence: ["artifact", "codesign verification", "Developer ID", "not ad-hoc", "Gatekeeper", "notarization", "reviewer"]
  },
  {
    key: "gui-smoke",
    label: "GUI smoke proof",
    path: "apps/web/public/radio-html/data/gui-smoke-evidence.json",
    requiredEvidence: ["manual screenshot", "reviewer", "first paint", "navigation", "no crash", "visible NO_SHIP", "visible audio gate", "error review"]
  },
  {
    key: "release-review",
    label: "Release review",
    path: "apps/web/public/radio-html/data/release-review-report.json",
    requiredEvidence: ["reviewer", "reviewedAt", "citation", "reason", "decision=approved", "AuditLog.verified"]
  },
  {
    key: "customer-release",
    label: "Customer release",
    path: "apps/web/public/radio-html/data/customer-release-milestone.json",
    requiredEvidence: ["rights", "playable audio", "payment receipt", "webhook", "signing", "notarization", "GUI smoke", "release review", "packaging"]
  }
];
const gateSummary = gateSources.map(summarizeGate);
const blockedGates = gateSummary.filter((gate) => gate.status !== "pass");
const productionReady = failed.length === 0
  && blockedGates.length === 0
  && gateSummary.length > 0
  && gateSummary.every((gate) => gate.productionReady === true);
const releaseAllowed = productionReady && gateSummary.every((gate) => gate.releaseAllowed === true);
const shipDecision = productionReady && releaseAllowed ? "SHIP" : "NO_SHIP";
const realWorldBlockers = blockedGates.map((gate) => ({
  key: gate.key,
  label: gate.label,
  evidencePath: gate.evidencePath,
  detail: gate.detail,
  requiredEvidence: gate.requiredEvidence,
  missing: gate.missing
}));
const report = {
  id: "radio-vaigyaaniq-release-evidence-orchestration-run",
  generatedAt: new Date().toISOString(),
  verificationState: failed.length || blockedGates.length ? "blocked" : "draft-verified-local",
  shipDecision,
  productionReady,
  releaseAllowed,
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady,
    releaseAllowed,
    note: "This report verifies local commands only. It does not verify rights, payment settlement, installer signing, release approval, external telemetry, or production readiness."
  },
  counts: {
    steps: steps.length,
    pass: steps.filter((step) => step.status === "pass").length,
    fail: failed.length,
    browserChecks: browserUrl ? 2 : 0,
    gates: gateSummary.length,
    gatesPass: gateSummary.filter((gate) => gate.status === "pass").length,
    gatesBlocked: blockedGates.length,
    productionReady: productionReady ? 1 : 0,
    releaseAllowed: releaseAllowed ? 1 : 0
  },
  browserUrl,
  evidenceDashboard: {
    commandSteps: {
      total: steps.length,
      pass: steps.filter((step) => step.status === "pass").length,
      fail: failed.length
    },
    gates: gateSummary,
    gateCounts: {
      total: gateSummary.length,
      pass: gateSummary.filter((gate) => gate.status === "pass").length,
      blocked: blockedGates.length
    },
    productionReady,
    releaseAllowed,
    shipDecision,
    realWorldBlockers
  },
  gateSummary,
  realWorldBlockers,
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
  verificationState: report.verificationState,
  shipDecision: report.shipDecision
}, null, 2));

if (failed.length) process.exit(1);
