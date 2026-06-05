#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);
const rightsEvidencePath = path.join(webRoot, "data", "rights-evidence.json");
const rightsReportPath = path.join(webRoot, "data", "rights-closure-report.json");

const columns = [
  "id",
  "path",
  "checksum",
  "source",
  "creator",
  "license",
  "rightsStatus",
  "citation",
  "reviewer",
  "reviewedAt",
  "auditVerified",
  "releaseAllowed",
  "reason",
  "contractRef"
];

const requiredEvidence = [
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
];

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function writeJson(file, value) {
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(records) {
  return [
    columns.join(","),
    ...records.map((record) => columns.map((column) => csvCell(record[column])).join(","))
  ].join("\n") + "\n";
}

function renderSurface() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - Rights Closure Packet</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail">
      <div class="surface-mark">RV</div>
      <nav>
        <a href="./index.html">Index</a>
        <a href="./rights-closure.html">Rights</a>
        <a href="./rights-proof-import-templates.html">Templates</a>
        <a href="./release-orchestration.html">Ship</a>
      </nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div>
          <p class="eyebrow">Rights Gate</p>
          <h1>Rights Closure Packet</h1>
          <p id="surfaceNote">Loading per-asset closure packet...</p>
          <div class="surface-actions">
            <a href="../data/rights-closure-packet.json">Packet JSON</a>
            <a href="../data/rights-closure-import-template.csv">Import CSV</a>
          </div>
        </div>
        <div class="status-chip">
          <span>State</span>
          <b id="surfaceState">BLOCKED</b>
          <small id="surfaceShip">NO_SHIP</small>
        </div>
      </section>
      <section class="surface-grid three" id="metrics"></section>
      <section class="surface-card">
        <h2>Required Proof</h2>
        <pre id="required">Loading...</pre>
      </section>
      <section class="surface-card">
        <h2>Packet Rows</h2>
        <pre id="rawData">Loading...</pre>
      </section>
    </section>
  </main>
  <script>
    fetch("../data/rights-closure-packet.json").then((response) => response.json()).then((data) => {
      document.getElementById("surfaceNote").textContent = data.phkd.note;
      document.getElementById("surfaceState").textContent = data.verificationState;
      document.getElementById("surfaceShip").textContent = data.shipDecision;
      const counts = data.counts || {};
      document.getElementById("metrics").innerHTML = Object.entries(counts).map(([key, value]) =>
        '<article class="surface-card"><span class="surface-label">' + key + '</span><b>' + value + '</b></article>'
      ).join("");
      document.getElementById("required").textContent = JSON.stringify(data.requiredEvidence, null, 2);
      document.getElementById("rawData").textContent = JSON.stringify(data.records.slice(0, 6), null, 2);
    });
  </script>
</body>
</html>
`;
}

const rightsEvidence = readJson(rightsEvidencePath, { records: [] });
const rightsReport = readJson(rightsReportPath, { summary: {} });
const records = (rightsEvidence.records || []).map((record) => ({
  id: record.id,
  path: record.path,
  checksum: record.checksum || null,
  source: null,
  creator: null,
  license: null,
  rightsStatus: null,
  citation: null,
  reviewer: null,
  reviewedAt: null,
  auditVerified: false,
  releaseAllowed: false,
  reason: null,
  contractRef: null,
  existingStatus: record.status || null,
  existingRightsStatus: record.rightsStatus || null,
  existingLicense: record.license || null,
  closureStatus: record.closureStatus || "blocked",
  closureMissing: record.closureMissing || requiredEvidence
}));

const packet = {
  id: "radio-rights-closure-packet",
  title: "Radio Vaigyaaniq Rights Closure Packet",
  generatedAt: today,
  verificationState: "draft-rights-closure-packet-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This packet is a fillable proof intake artifact. Blank or false values are intentional NULL placeholders and do not close rights."
  },
  importEnv: "EVIDENCE_RIGHTS_IMPORT",
  verifier: "npm run radio:rights:closure",
  paths: {
    json: "/radio-html/data/rights-closure-packet.json",
    csv: "/radio-html/data/rights-closure-import-template.csv",
    report: "/radio-html/data/rights-closure-report.json"
  },
  usage: [
    "Fill source, creator, license, rightsStatus=verified, citation, reviewer, reviewedAt, auditVerified=true, releaseAllowed=true, and checksum for each row.",
    "Save the completed JSON or CSV outside generated assets.",
    "Run EVIDENCE_RIGHTS_IMPORT=/absolute/path/to/completed-rights-proof.json npm run radio:rights:closure.",
    "The verifier remains blocked until every row passes."
  ],
  requiredEvidence,
  csvHeader: columns.join(","),
  counts: {
    records: records.length,
    rowsPrepared: records.length,
    nullProofFields: records.reduce((total, record) => total + columns.filter((column) => record[column] === null || record[column] === false).length, 0),
    releaseAllowed: 0,
    blocked: rightsReport.summary?.blocked ?? records.length,
    closed: rightsReport.summary?.closed ?? 0
  },
  records
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "rights-closure-packet.json"), packet);
  writeFile(path.join(root, "data", "rights-closure-import-template.csv"), toCsv(records));
  writeFile(path.join(root, "surfaces", "rights-closure-packet.html"), renderSurface());
}

console.log(JSON.stringify({
  report: "radio-rights-closure-packet",
  paths: packet.paths,
  counts: packet.counts,
  verificationState: packet.verificationState
}, null, 2));
