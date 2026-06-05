#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);
const importPath = process.env.EVIDENCE_RELEASE_REVIEW_IMPORT || process.env.RELEASE_REVIEW_IMPORT_PATH || null;
const boardPath = path.join(webRoot, "data", "release-review-board.json");
const workflowPath = path.join(webRoot, "data", "release-review.json");
const milestonePath = path.join(webRoot, "data", "milestone-completion.json");
const readinessPath = path.join(webRoot, "data", "tauri-readiness.json");

const readJson = (file, fallback = null) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const value = (record, keys) => {
  for (const key of keys) {
    const current = record?.[key];
    if (current !== undefined && current !== null && String(current).trim() !== "") return current;
  }
  return null;
};
const normalize = (input) => String(input || "").trim();
const asBool = (input) => input === true || /^(true|1|yes|verified|pass|approved)$/i.test(String(input || ""));

async function parseCsv(text) {
  try {
    const { parse } = await import("csv-parse/sync");
    return parse(text, { columns: true, skip_empty_lines: true, trim: true });
  } catch {
    const [head = "", ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = head.split(",").map((item) => item.trim());
    return lines.map((line) => {
      const cells = line.split(",").map((item) => item.trim());
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    });
  }
}

async function loadReviewRecords(file) {
  if (!file) return { status: "not-run", path: null, records: [], error: null };
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute)) return { status: "blocked", path: absolute, records: [], error: "release review import file does not exist" };
  try {
    const text = fs.readFileSync(absolute, "utf8");
    if (/\.csv$/i.test(absolute)) return { status: "loaded", path: absolute, records: await parseCsv(text), error: null };
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : (parsed.records || parsed.reviews || parsed.approvals || []);
    return { status: "loaded", path: absolute, records: Array.isArray(records) ? records : [], error: null };
  } catch (error) {
    return { status: "blocked", path: absolute, records: [], error: String(error.message || error) };
  }
}

function reviewKey(record) {
  return normalize(value(record, ["key", "id", "reviewId", "itemKey", "recordId"]));
}

function reviewScope(record) {
  return normalize(value(record, ["scope", "lane", "reviewScope"]));
}

function decision(record) {
  return normalize(value(record, ["decision", "status", "reviewStatus", "result"])).toLowerCase();
}

function isRejected(record) {
  return /^(rejected|reject|failed|fail|blocked|denied)$/i.test(decision(record));
}

function isApproved(record) {
  return /^(approved|approve|verified|pass|passed)$/i.test(decision(record));
}

function hasReviewProof(record) {
  return Boolean(value(record, ["reviewer", "reviewedBy"]))
    && Boolean(value(record, ["reviewedAt", "reviewed_at", "reviewDate"]))
    && Boolean(value(record, ["citation", "sourceCitation", "evidenceCitation"]))
    && Boolean(value(record, ["reason", "reviewReason", "approvalReason"]))
    && asBool(value(record, ["auditVerified", "auditLogVerified", "AuditLog.verified"]));
}

const board = readJson(boardPath, { counts: {}, lanes: [], queue: [] });
const workflow = readJson(workflowPath, { counts: {}, workflow: [], queue: [] });
const milestoneCompletion = readJson(milestonePath, { counts: {}, milestones: [] });
const readiness = readJson(readinessPath, { noShipDashboard: {}, checklist: [] });
const importResult = await loadReviewRecords(importPath);
const reviewsByKey = new Map();
const laneReviews = new Map();

for (const review of importResult.records) {
  const key = reviewKey(review);
  const scope = reviewScope(review);
  if (key) reviewsByKey.set(key, review);
  if (scope && !laneReviews.has(scope)) laneReviews.set(scope, review);
}

function evaluateQueueItem(item) {
  const review = reviewsByKey.get(item.key) || null;
  const checks = [
    { key: "reviewer", pass: Boolean(value(review, ["reviewer", "reviewedBy"])) },
    { key: "reviewedAt", pass: Boolean(value(review, ["reviewedAt", "reviewed_at", "reviewDate"])) },
    { key: "citation", pass: Boolean(value(review, ["citation", "sourceCitation", "evidenceCitation"])) },
    { key: "reason", pass: Boolean(value(review, ["reason", "reviewReason", "approvalReason"])) },
    { key: "AuditLog.verified", pass: asBool(value(review, ["auditVerified", "auditLogVerified", "AuditLog.verified"])) },
    { key: "decision", pass: isApproved(review) || isRejected(review) }
  ];
  const missing = checks.filter((check) => !check.pass).map((check) => check.key);
  const status = !review
    ? "unreviewed"
    : isRejected(review) && hasReviewProof(review)
      ? "rejected"
      : isApproved(review) && hasReviewProof(review)
        ? "verified"
        : "blocked";
  return {
    ...item,
    status,
    proofAttached: Boolean(review),
    reviewer: value(review, ["reviewer", "reviewedBy"]),
    reviewedAt: value(review, ["reviewedAt", "reviewed_at", "reviewDate"]),
    citation: value(review, ["citation", "sourceCitation", "evidenceCitation"]),
    reason: value(review, ["reason", "reviewReason", "approvalReason"]),
    decision: decision(review) || null,
    missing,
    blocker: status === "verified" ? null : status === "rejected" ? "review rejected" : `missing ${missing.join(", ")}`
  };
}

const evaluatedQueue = (board.queue || workflow.queue || []).map(evaluateQueueItem);
const verified = evaluatedQueue.filter((item) => item.status === "verified").length;
const rejected = evaluatedQueue.filter((item) => item.status === "rejected").length;
const blocked = evaluatedQueue.filter((item) => item.status !== "verified").length;
const laneAssignments = (board.lanes || []).map((lane) => {
  const proof = laneReviews.get(lane.key) || reviewsByKey.get(lane.key) || null;
  const scopeItems = evaluatedQueue.filter((item) => item.scope === lane.key);
  const scopeVerified = scopeItems.length > 0 && scopeItems.every((item) => item.status === "verified");
  return {
    ...lane,
    reviewer: value(proof, ["reviewer", "reviewedBy"]) || lane.reviewer || null,
    reviewedAt: value(proof, ["reviewedAt", "reviewed_at", "reviewDate"]) || null,
    citation: value(proof, ["citation", "sourceCitation", "evidenceCitation"]) || null,
    status: scopeVerified ? "verified" : proof && hasReviewProof(proof) ? "assigned" : "blocked",
    blocker: scopeVerified ? null : "item-level release review proof incomplete"
  };
});
const reviewerAssignments = laneAssignments.filter((lane) => lane.reviewer).length;
const missingCount = (key) => evaluatedQueue.filter((item) => item.missing.includes(key)).length;
const gatePass = evaluatedQueue.length > 0 && blocked === 0 && rejected === 0;
const summary = {
  reviewItems: evaluatedQueue.length,
  importedReviews: importResult.records.length,
  matchedReviews: evaluatedQueue.filter((item) => item.proofAttached).length,
  verified,
  rejected,
  blocked,
  reviewerAssignments,
  missingReviewer: missingCount("reviewer"),
  missingReviewedAt: missingCount("reviewedAt"),
  missingCitation: missingCount("citation"),
  missingReason: missingCount("reason"),
  auditUnverified: missingCount("AuditLog.verified"),
  productionReady: false,
  releaseAllowed: false
};

const report = {
  id: "radio-release-review-report",
  title: "Radio Vaigyaaniq Release Review Report",
  generatedAt: today,
  verificationState: gatePass
    ? "release-review-verified"
    : importResult.records.length > 0
      ? "blocked-release-review-incomplete"
      : "blocked-release-review-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Release review requires named reviewer, reviewedAt, citation, reason, decision, and AuditLog.verified for each queued item. Review proof does not override rights, payment, or signing gates."
  },
  import: {
    path: importResult.path,
    status: importResult.status,
    records: importResult.records.length,
    error: importResult.error,
    acceptedFormats: ["json", "csv"],
    env: "EVIDENCE_RELEASE_REVIEW_IMPORT"
  },
  requiredEvidence: ["reviewer", "reviewedAt", "citation", "reason", "decision=approved", "AuditLog.verified"],
  summary,
  gate: {
    name: "Release Review",
    status: gatePass ? "pass" : "blocked",
    detail: gatePass
      ? "Every release review item is approved with audit proof."
      : `Release review blocked: ${blocked} item(s) lack complete approval proof.`
  },
  lanes: laneAssignments,
  queue: evaluatedQueue,
  rawReviews: importResult.records
};

board.generatedAt = today;
board.verificationState = report.verificationState;
board.counts = {
  reviewItems: evaluatedQueue.length,
  unreviewed: evaluatedQueue.filter((item) => item.status === "unreviewed").length,
  verified,
  rejected,
  blocked,
  reviewerAssignments
};
board.lanes = laneAssignments;
board.queue = evaluatedQueue;
board.reviewReport = "/radio-html/data/release-review-report.json";

workflow.generatedAt = today;
workflow.verificationState = gatePass ? "release-review-verified" : "draft-release-review-blocked";
workflow.counts = {
  reviewItems: evaluatedQueue.length,
  unreviewed: board.counts.unreviewed,
  verified,
  rejected,
  blocked
};
workflow.workflow = (workflow.workflow || []).map((step) => ({
  ...step,
  status: step.key === "release-approval" ? (gatePass ? "verified" : "blocked") : step.status
}));
workflow.queue = evaluatedQueue;
workflow.reviewReport = "/radio-html/data/release-review-report.json";

milestoneCompletion.generatedAt = today;
milestoneCompletion.counts = {
  ...(milestoneCompletion.counts || {}),
  releaseReviewVerified: verified,
  releaseReviewBlocked: blocked,
  productionReady: 0,
  shipDecision: "NO_SHIP"
};
milestoneCompletion.milestones = (milestoneCompletion.milestones || []).map((item) => item.key === "release-review-board"
  ? {
      ...item,
      status: gatePass ? "verified" : "implemented-draft",
      evidence: "/radio-html/data/release-review-report.json",
      blocker: gatePass ? null : "human approval evidence incomplete"
    }
  : item);

readiness.generatedAt = today;
readiness.noShipDashboard = {
  ...(readiness.noShipDashboard || {}),
  releaseReview: gatePass,
  productionReady: false,
  decision: "NO_SHIP"
};
readiness.checklist = (readiness.checklist || []).map((item) => item.key === "release-review"
  ? { ...item, status: gatePass ? "draft-ready" : "blocked", evidence: "/radio-html/data/release-review-report.json" }
  : item);
readiness.counts = {
  draftReady: (readiness.checklist || []).filter((item) => ["draft-ready", "pass", "verified"].includes(item.status)).length,
  blocked: (readiness.checklist || []).filter((item) => item.status === "blocked").length,
  notRun: (readiness.checklist || []).filter((item) => item.status === "not-run").length
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "release-review-report.json"), report);
  writeJson(path.join(root, "data", "release-review-board.json"), board);
  writeJson(path.join(root, "data", "release-review.json"), workflow);
  writeJson(path.join(root, "data", "milestone-completion.json"), milestoneCompletion);
  writeJson(path.join(root, "data", "tauri-readiness.json"), readiness);
}

console.log(JSON.stringify({
  report: "radio-release-review",
  gate: report.gate,
  summary
}, null, 2));
