#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);
const importPath = process.env.EVIDENCE_RIGHTS_IMPORT || process.env.RIGHTS_IMPORT_PATH || null;
const rightsEvidencePath = path.join(webRoot, "data", "rights-evidence.json");
const rightsWorkbenchPath = path.join(webRoot, "data", "rights-review-workbench.json");
const playbackGatePath = path.join(webRoot, "data", "playback-gate.json");
const milestonePath = path.join(webRoot, "data", "milestone-completion.json");

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
const asBool = (input) => input === true || /^(true|1|yes|verified|pass)$/i.test(String(input || ""));
const normalize = (input) => String(input || "").trim();

async function parseCsv(text) {
  try {
    const { parse } = await import("csv-parse/sync");
    return parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch {
    const [head = "", ...lines] = text.split(/\r?\n/).filter(Boolean);
    const headers = head.split(",").map((item) => item.trim());
    return lines.map((line) => {
      const cells = line.split(",").map((item) => item.trim());
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    });
  }
}

async function loadProofRecords(file) {
  if (!file) return { status: "not-run", path: null, records: [], error: null };
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute)) return { status: "blocked", path: absolute, records: [], error: "rights import file does not exist" };
  try {
    const text = fs.readFileSync(absolute, "utf8");
    if (/\.csv$/i.test(absolute)) return { status: "loaded", path: absolute, records: await parseCsv(text), error: null };
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : (parsed.records || parsed.claims || parsed.rights || []);
    return { status: "loaded", path: absolute, records: Array.isArray(records) ? records : [], error: null };
  } catch (error) {
    return { status: "blocked", path: absolute, records: [], error: String(error.message || error) };
  }
}

function proofKey(record) {
  return normalize(value(record, ["id", "key", "assetId", "recordId"]));
}

function proofPath(record) {
  return normalize(value(record, ["path", "assetPath", "file", "filePath"]));
}

const rightsEvidence = readJson(rightsEvidencePath, { records: [], requirements: [] });
const rightsWorkbench = readJson(rightsWorkbenchPath, { reviewQueue: [] });
const playbackGate = readJson(playbackGatePath, { counts: {}, records: [] });
const milestoneCompletion = readJson(milestonePath, { milestones: [], counts: {} });
const importResult = await loadProofRecords(importPath);
const proofsById = new Map();
const proofsByPath = new Map();
for (const proof of importResult.records) {
  const id = proofKey(proof);
  const file = proofPath(proof);
  if (id) proofsById.set(id, proof);
  if (file) proofsByPath.set(file, proof);
}

function evaluate(record) {
  const proof = proofsById.get(record.id) || proofsByPath.get(record.path) || null;
  const proofChecksum = normalize(value(proof, ["checksum", "sha256", "assetSha256"]));
  const localChecksum = normalize(record.checksum);
  const rightsStatus = normalize(value(proof, ["rightsStatus", "rights_status"]));
  const checks = [
    {
      key: "source",
      label: "Source attached",
      pass: Boolean(value(proof, ["source", "externalSource", "sourceUrl", "sourceURI"]))
    },
    {
      key: "creator",
      label: "Creator attached",
      pass: Boolean(value(proof, ["creator", "artist", "author", "owner"]))
    },
    {
      key: "license",
      label: "License attached",
      pass: Boolean(value(proof, ["license", "licenseType", "licenseUrl"]))
    },
    {
      key: "rightsStatus",
      label: "Rights status is verified",
      pass: rightsStatus === "verified"
    },
    {
      key: "checksum",
      label: "Checksum recorded and not contradicted",
      pass: Boolean(localChecksum) && (!proofChecksum || proofChecksum === localChecksum)
    },
    {
      key: "citation",
      label: "Citation attached",
      pass: Boolean(value(proof, ["citation", "sourceCitation", "evidenceCitation", "contractRef"]))
    },
    {
      key: "reviewer",
      label: "Reviewer attached",
      pass: Boolean(value(proof, ["reviewer", "reviewedBy"]))
    },
    {
      key: "reviewedAt",
      label: "Reviewed timestamp attached",
      pass: Boolean(value(proof, ["reviewedAt", "reviewed_at", "reviewDate"]))
    },
    {
      key: "auditVerified",
      label: "AuditLog verified",
      pass: asBool(value(proof, ["auditVerified", "auditLogVerified", "AuditLog.verified"]))
    },
    {
      key: "releaseAllowed",
      label: "releaseAllowed explicitly true",
      pass: asBool(value(proof, ["releaseAllowed", "release_allowed"]))
    }
  ];
  const missing = checks.filter((item) => !item.pass).map((item) => item.key);
  return {
    id: record.id,
    path: record.path,
    group: record.group,
    status: missing.length === 0 ? "closed" : "blocked",
    proofAttached: Boolean(proof),
    releaseAllowed: missing.length === 0,
    existingReleaseAllowed: record.releaseAllowed === true,
    rightsStatus: rightsStatus || record.rightsStatus || "NULL",
    license: value(proof, ["license", "licenseType", "licenseUrl"]) || record.license || null,
    reviewer: value(proof, ["reviewer", "reviewedBy"]) || record.reviewer || null,
    reviewedAt: value(proof, ["reviewedAt", "reviewed_at", "reviewDate"]) || record.reviewedAt || null,
    checksum: localChecksum || null,
    proofChecksum: proofChecksum || null,
    checks: checks.map((item) => ({ key: item.key, label: item.label, status: item.pass ? "pass" : "blocked" })),
    missing,
    blocker: missing.length === 0 ? null : `missing ${missing.join(", ")}`
  };
}

const closureRecords = (rightsEvidence.records || []).map(evaluate);
const unmatchedProofs = importResult.records.filter((proof) => {
  const id = proofKey(proof);
  const file = proofPath(proof);
  return (!id || !rightsEvidence.records.some((record) => record.id === id))
    && (!file || !rightsEvidence.records.some((record) => record.path === file));
});
const closed = closureRecords.filter((record) => record.status === "closed");
const blocked = closureRecords.filter((record) => record.status !== "closed");
const countMissing = (key) => closureRecords.filter((record) => record.missing.includes(key)).length;
const summary = {
  records: closureRecords.length,
  importedProofs: importResult.records.length,
  matchedProofs: closureRecords.filter((record) => record.proofAttached).length,
  unmatchedProofs: unmatchedProofs.length,
  closed: closed.length,
  blocked: blocked.length,
  releaseAllowed: closed.length,
  missingSource: countMissing("source"),
  missingCreator: countMissing("creator"),
  missingLicense: countMissing("license"),
  missingCitation: countMissing("citation"),
  missingReviewer: countMissing("reviewer"),
  missingReviewedAt: countMissing("reviewedAt"),
  auditUnverified: countMissing("auditVerified"),
  checksumIssues: countMissing("checksum")
};
const gatePass = closureRecords.length > 0 && blocked.length === 0;
const report = {
  id: "radio-vaigyaaniq-rights-closure-report",
  title: "Radio Vaigyaaniq Rights Evidence Closure",
  generatedAt: today,
  verificationState: gatePass
    ? "rights-closed-verified"
    : importResult.records.length > 0
      ? "blocked-rights-proof-incomplete"
      : "blocked-rights-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Rights closure requires source, creator, license, verified rightsStatus, citation, reviewer, reviewedAt, checksum, AuditLog.verified, and explicit releaseAllowed=true for every record."
  },
  import: {
    path: importResult.path,
    status: importResult.status,
    records: importResult.records.length,
    error: importResult.error,
    acceptedFormats: ["json", "csv"],
    env: "EVIDENCE_RIGHTS_IMPORT"
  },
  requiredEvidence: [
    "source",
    "creator",
    "license",
    "rightsStatus=verified",
    "checksum",
    "citation",
    "reviewer",
    "reviewedAt",
    "AuditLog.verified",
    "releaseAllowed=true"
  ],
  summary,
  gate: {
    name: "Rights Evidence Closure",
    status: gatePass ? "pass" : "blocked",
    detail: gatePass
      ? "Every rights record has complete closure proof."
      : `Rights closure blocked: ${blocked.length} record(s) lack complete proof.`
  },
  records: closureRecords,
  unmatchedProofs
};

rightsEvidence.generatedAt = today;
rightsEvidence.verificationState = gatePass ? "rights-closed-verified" : "draft-rights-closure-blocked";
rightsEvidence.counts = {
  ...(rightsEvidence.counts || {}),
  releaseAllowed: closed.length,
  verifiedRights: closed.length,
  blocked: blocked.length,
  closureProofs: importResult.records.length,
  closureMatchedProofs: summary.matchedProofs
};
rightsEvidence.closureGate = report.gate;
rightsEvidence.closureCounts = summary;
rightsEvidence.closureReport = "/radio-html/data/rights-closure-report.json";
rightsEvidence.records = (rightsEvidence.records || []).map((record) => {
  const closure = closureRecords.find((item) => item.id === record.id);
  return {
    ...record,
    closureStatus: closure?.status ?? "blocked",
    closureMissing: closure?.missing ?? [],
    releaseAllowed: closure?.releaseAllowed === true,
    blocker: closure?.blocker || record.blocker
  };
});

rightsWorkbench.generatedAt = today;
rightsWorkbench.verificationState = gatePass ? "rights-closed-verified" : "draft-rights-closure-blocked";
rightsWorkbench.counts = {
  ...(rightsWorkbench.counts || {}),
  releaseAllowed: closed.length,
  blocked: blocked.length,
  closureProofs: importResult.records.length,
  closureMatchedProofs: summary.matchedProofs
};
rightsWorkbench.closureGate = report.gate;
rightsWorkbench.closureReport = "/radio-html/data/rights-closure-report.json";
rightsWorkbench.reviewQueue = (rightsWorkbench.reviewQueue || []).map((item) => {
  const closure = closureRecords.find((record) => record.id === item.key);
  return {
    ...item,
    status: closure?.status === "closed" ? "closed" : "blocked",
    missing: closure?.missing ?? item.missing,
    blocker: closure?.blocker || item.blocker
  };
});

playbackGate.generatedAt = today;
playbackGate.verificationState = gatePass ? "rights-closed-playback-still-source-gated" : "draft-rights-closure-blocked";
playbackGate.counts = {
  ...(playbackGate.counts || {}),
  rightsClosed: closed.length,
  rightsBlocked: blocked.length,
  releaseAllowed: closed.length
};
playbackGate.rightsClosureGate = report.gate;
playbackGate.rightsClosureReport = "/radio-html/data/rights-closure-report.json";
playbackGate.gateRules = Array.from(new Set([
  ...(playbackGate.gateRules || []),
  "rights closure must pass for every playable record"
]));
playbackGate.records = (playbackGate.records || []).map((record) => ({
  ...record,
  canPlay: false,
  status: record.status === "blocked" ? "blocked" : record.status,
  blocker: gatePass ? record.blocker : "rights closure is blocked"
}));

milestoneCompletion.generatedAt = today;
milestoneCompletion.milestones = (milestoneCompletion.milestones || []).map((item) => item.key === "rights-evidence-closure"
  ? {
      ...item,
      status: gatePass ? "verified" : "implemented-draft",
      evidence: "/radio-html/data/rights-closure-report.json",
      blocker: gatePass ? null : report.gate.detail
    }
  : item);
milestoneCompletion.counts = {
  ...(milestoneCompletion.counts || {}),
  rightsClosureClosed: closed.length,
  rightsClosureBlocked: blocked.length
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "rights-closure-report.json"), report);
  writeJson(path.join(root, "data", "rights-evidence.json"), rightsEvidence);
  writeJson(path.join(root, "data", "rights-review-workbench.json"), rightsWorkbench);
  writeJson(path.join(root, "data", "playback-gate.json"), playbackGate);
  writeJson(path.join(root, "data", "milestone-completion.json"), milestoneCompletion);
}

console.log(JSON.stringify({
  report: "radio-rights-closure",
  gate: report.gate,
  summary: report.summary,
  import: report.import
}, null, 2));

if (importResult.status === "blocked") process.exit(1);
