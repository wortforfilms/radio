#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);

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

function toCsv(columns, records) {
  return [
    columns.join(","),
    ...records.map((record) => columns.map((column) => csvCell(record[column])).join(","))
  ].join("\n") + "\n";
}

function nullProofCount(columns, records) {
  return records.reduce((total, record) => (
    total + columns.filter((column) => record[column] === null || record[column] === false).length
  ), 0);
}

function renderPacketSurface(title, dataFile, csvFile, eyebrow = "Proof Packet") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - ${title}</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail">
      <div class="surface-mark">RV</div>
      <nav>
        <a href="./index.html">Index</a>
        <a href="./payment-proof-report.html">Pay</a>
        <a href="./installer-signing-proof.html">Sign</a>
        <a href="./release-review-board.html">Review</a>
        <a href="./release-orchestration.html">Ship</a>
      </nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          <p id="surfaceNote">Loading fail-closed proof packet...</p>
          <div class="surface-actions">
            <a href="../data/${dataFile}">Packet JSON</a>
            <a href="../data/${csvFile}">Import CSV</a>
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
    fetch("../data/${dataFile}").then((response) => response.json()).then((data) => {
      document.getElementById("surfaceNote").textContent = data.phkd.note;
      document.getElementById("surfaceState").textContent = data.verificationState;
      document.getElementById("surfaceShip").textContent = data.shipDecision;
      const counts = data.counts || {};
      document.getElementById("metrics").innerHTML = Object.entries(counts).map(([key, value]) =>
        '<article class="surface-card"><span class="surface-label">' + key + '</span><b>' + value + '</b></article>'
      ).join("");
      document.getElementById("required").textContent = JSON.stringify(data.requiredEvidence, null, 2);
      document.getElementById("rawData").textContent = JSON.stringify((data.records || []).slice(0, 8), null, 2);
    });
  </script>
</body>
</html>
`;
}

function renderSummarySurface() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - Remaining Proof Packets</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail">
      <div class="surface-mark">RV</div>
      <nav>
        <a href="./index.html">Index</a>
        <a href="./payment-proof-packet.html">Payment</a>
        <a href="./signing-proof-packet.html">Signing</a>
        <a href="./release-review-packet.html">Review</a>
        <a href="./release-orchestration.html">Ship</a>
      </nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div>
          <p class="eyebrow">Remaining Gates</p>
          <h1>Remaining Proof Packets</h1>
          <p id="surfaceNote">Loading remaining proof packet summary...</p>
          <div class="surface-actions">
            <a href="../data/remaining-proof-packets.json">Summary JSON</a>
            <a href="./evidence-refresh-command.html">Refresh Command</a>
          </div>
        </div>
        <div class="status-chip">
          <span>State</span>
          <b id="surfaceState">BLOCKED</b>
          <small id="surfaceShip">NO_SHIP</small>
        </div>
      </section>
      <section class="surface-grid three" id="metrics"></section>
      <section class="surface-grid three" id="packetLinks"></section>
      <section class="surface-card">
        <h2>Packet Summary</h2>
        <pre id="rawData">Loading...</pre>
      </section>
    </section>
  </main>
  <script>
    fetch("../data/remaining-proof-packets.json").then((response) => response.json()).then((data) => {
      document.getElementById("surfaceNote").textContent = data.phkd.note;
      document.getElementById("surfaceState").textContent = data.verificationState;
      document.getElementById("surfaceShip").textContent = data.shipDecision;
      document.getElementById("metrics").innerHTML = Object.entries(data.counts || {}).map(([key, value]) =>
        '<article class="surface-card"><span class="surface-label">' + key + '</span><b>' + value + '</b></article>'
      ).join("");
      document.getElementById("packetLinks").innerHTML = (data.packets || []).map((packet) =>
        '<a class="surface-card" href="..' + packet.data + '"><span class="surface-label">' + packet.key + '</span><b>' + packet.rows + ' rows</b><p>' + packet.csv + '</p></a>'
      ).join("");
      document.getElementById("rawData").textContent = JSON.stringify(data, null, 2);
    });
  </script>
</body>
</html>
`;
}

const paymentReport = readJson(path.join(webRoot, "data", "payment-proof-report.json"), { states: [], summary: {} });
const signingProof = readJson(path.join(webRoot, "data", "installer-signing-proof.json"), { slots: [], counts: {} });
const releaseReview = readJson(path.join(webRoot, "data", "release-review-board.json"), { queue: [], counts: {} });

const paymentColumns = [
  "kind",
  "stateKey",
  "payerId",
  "recipientId",
  "amount",
  "currency",
  "checkoutProvider",
  "checkoutSessionId",
  "checkoutStatus",
  "paymentReceiptId",
  "providerEventId",
  "signatureHeader",
  "webhookVerified",
  "deliveredAt",
  "fulfillmentId",
  "auditCreated",
  "providerDashboardCitation",
  "reason"
];
const paymentRequiredEvidence = [
  "payerId",
  "recipientId",
  "checkoutProvider",
  "checkoutSessionId",
  "paymentReceiptId",
  "amount",
  "currency",
  "webhook signature verification",
  "deliveredAt",
  "AuditLog.created"
];
const paymentRecords = (paymentReport.states || []).map((state) => ({
  kind: state.key,
  stateKey: state.key,
  payerId: null,
  recipientId: null,
  amount: null,
  currency: null,
  checkoutProvider: null,
  checkoutSessionId: null,
  checkoutStatus: null,
  paymentReceiptId: null,
  providerEventId: null,
  signatureHeader: null,
  webhookVerified: false,
  deliveredAt: null,
  fulfillmentId: null,
  auditCreated: false,
  providerDashboardCitation: null,
  reason: null,
  currentStatus: state.status || "blocked",
  missing: state.missing || []
}));
const paymentPacket = {
  id: "radio-payment-proof-packet",
  title: "Radio Vaigyaaniq Payment Proof Packet",
  generatedAt: today,
  verificationState: "draft-payment-proof-packet-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This packet prepares payment proof intake rows. Blank or false fields do not prove checkout, receipt, webhook, settlement, or fulfillment."
  },
  importEnv: "EVIDENCE_PAYMENT_IMPORT",
  verifier: "npm run radio:payment:proof",
  paths: {
    json: "/radio-html/data/payment-proof-packet.json",
    csv: "/radio-html/data/payment-proof-import-packet.csv",
    report: "/radio-html/data/payment-proof-report.json"
  },
  usage: [
    "Fill one row per payment state with provider evidence.",
    "Do not use HDFC email candidates as receipts; they remain candidate-only reconciliation hints.",
    "Run EVIDENCE_PAYMENT_IMPORT=/absolute/path/to/completed-payment-proof.json npm run radio:payment:proof.",
    "The verifier remains blocked until checkout, receipt, webhook, and fulfillment proof pass."
  ],
  requiredEvidence: paymentRequiredEvidence,
  csvHeader: paymentColumns.join(","),
  counts: {
    states: paymentRecords.length,
    rowsPrepared: paymentRecords.length,
    nullProofFields: nullProofCount(paymentColumns, paymentRecords),
    verifiedStates: 0,
    releaseAllowed: 0,
    blocked: paymentReport.summary?.blockedStates ?? paymentRecords.length
  },
  records: paymentRecords
};

const signingColumns = [
  "key",
  "platform",
  "format",
  "artifactPath",
  "sha256",
  "buildCommand",
  "signingIdentity",
  "signatureVerification",
  "notarizationTicket",
  "gatekeeperAssessment",
  "reviewer",
  "reviewedAt",
  "auditVerified",
  "releaseAllowed",
  "reason"
];
const signingRequiredEvidence = [
  "artifactPath",
  "sha256",
  "buildCommand",
  "signingIdentity",
  "signatureVerification",
  "notarizationTicket",
  "Gatekeeper assessment when macOS",
  "reviewer",
  "reviewedAt",
  "AuditLog.verified"
];
const signingRecords = (signingProof.slots || []).map((slot) => ({
  key: slot.key,
  platform: slot.platform || null,
  format: slot.format || null,
  artifactPath: slot.artifactPath || null,
  sha256: slot.sha256 || null,
  buildCommand: null,
  signingIdentity: null,
  signatureVerification: null,
  notarizationTicket: null,
  gatekeeperAssessment: null,
  reviewer: null,
  reviewedAt: null,
  auditVerified: false,
  releaseAllowed: false,
  reason: null,
  currentStatus: slot.status || "blocked"
}));
const signingPacket = {
  id: "radio-signing-proof-packet",
  title: "Radio Vaigyaaniq Signing Proof Packet",
  generatedAt: today,
  verificationState: "draft-signing-proof-packet-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This packet prepares installer signing and notarization proof rows. Local artifact hashes are not Developer ID, notarization, or Gatekeeper proof."
  },
  importEnv: "EVIDENCE_SIGNING_IMPORT",
  verifier: "apps/desktop npm run evidence:signing",
  paths: {
    json: "/radio-html/data/signing-proof-packet.json",
    csv: "/radio-html/data/signing-proof-import-template.csv",
    report: "/radio-html/data/signing-notarization-evidence.json"
  },
  usage: [
    "Fill signing identity, signature verification, notarization ticket, Gatekeeper assessment, reviewer, reviewedAt, and audit proof.",
    "Keep releaseAllowed=false until every platform artifact is signed and verified.",
    "Signing packet rows are intake only; the existing signing verifier remains the authority."
  ],
  requiredEvidence: signingRequiredEvidence,
  csvHeader: signingColumns.join(","),
  counts: {
    artifactSlots: signingRecords.length,
    rowsPrepared: signingRecords.length,
    nullProofFields: nullProofCount(signingColumns, signingRecords),
    signedArtifacts: 0,
    notarizedArtifacts: 0,
    releaseAllowed: 0,
    blocked: signingProof.counts?.blocked ?? signingRecords.length
  },
  records: signingRecords
};

const reviewColumns = [
  "key",
  "scope",
  "label",
  "reviewer",
  "reviewedAt",
  "citation",
  "reason",
  "decision",
  "auditVerified",
  "releaseAllowed"
];
const reviewRequiredEvidence = [
  "reviewer",
  "reviewedAt",
  "citation",
  "reason",
  "decision=approved",
  "AuditLog.verified"
];
const reviewRecords = (releaseReview.queue || []).map((item) => ({
  key: item.key,
  scope: item.scope || null,
  label: item.label || null,
  reviewer: null,
  reviewedAt: null,
  citation: null,
  reason: null,
  decision: null,
  auditVerified: false,
  releaseAllowed: false,
  currentStatus: item.status || "unreviewed",
  missing: item.missing || reviewRequiredEvidence
}));
const reviewPacket = {
  id: "radio-release-review-packet",
  title: "Radio Vaigyaaniq Release Review Packet",
  generatedAt: today,
  verificationState: "draft-release-review-packet-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This packet prepares human release review rows. Review rows cannot override rights, payment, signing, or production gates."
  },
  importEnv: "EVIDENCE_RELEASE_REVIEW_IMPORT",
  verifier: "npm run radio:release:review",
  paths: {
    json: "/radio-html/data/release-review-packet.json",
    csv: "/radio-html/data/release-review-import-template.csv",
    report: "/radio-html/data/release-review-report.json"
  },
  usage: [
    "Fill reviewer, reviewedAt, citation, reason, decision, and auditVerified for every row.",
    "Use decision=approved only after source evidence has been independently reviewed.",
    "Run EVIDENCE_RELEASE_REVIEW_IMPORT=/absolute/path/to/completed-release-review.json npm run radio:release:review."
  ],
  requiredEvidence: reviewRequiredEvidence,
  csvHeader: reviewColumns.join(","),
  counts: {
    reviewItems: reviewRecords.length,
    rowsPrepared: reviewRecords.length,
    nullProofFields: nullProofCount(reviewColumns, reviewRecords),
    verified: 0,
    reviewerAssignments: 0,
    releaseAllowed: 0,
    blocked: releaseReview.counts?.blocked ?? reviewRecords.length
  },
  records: reviewRecords
};

const summary = {
  id: "radio-remaining-proof-packets",
  title: "Radio Vaigyaaniq Remaining Proof Packets",
  generatedAt: today,
  verificationState: "draft-packets-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Remaining packets prepare intake rows only. They do not create external rights, payment, signing, or release approval proof."
  },
  counts: {
    packets: 3,
    rowsPrepared: paymentPacket.counts.rowsPrepared + signingPacket.counts.rowsPrepared + reviewPacket.counts.rowsPrepared,
    nullProofFields: paymentPacket.counts.nullProofFields + signingPacket.counts.nullProofFields + reviewPacket.counts.nullProofFields,
    releaseAllowed: 0,
    blockedLanes: 3
  },
  packets: [
    { key: "payment", data: paymentPacket.paths.json, csv: paymentPacket.paths.csv, rows: paymentPacket.counts.rowsPrepared },
    { key: "signing", data: signingPacket.paths.json, csv: signingPacket.paths.csv, rows: signingPacket.counts.rowsPrepared },
    { key: "release-review", data: reviewPacket.paths.json, csv: reviewPacket.paths.csv, rows: reviewPacket.counts.rowsPrepared }
  ]
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "payment-proof-packet.json"), paymentPacket);
  writeFile(path.join(root, "data", "payment-proof-import-packet.csv"), toCsv(paymentColumns, paymentRecords));
  writeFile(path.join(root, "surfaces", "payment-proof-packet.html"), renderPacketSurface("Payment Proof Packet", "payment-proof-packet.json", "payment-proof-import-packet.csv", "Payment Gate"));

  writeJson(path.join(root, "data", "signing-proof-packet.json"), signingPacket);
  writeFile(path.join(root, "data", "signing-proof-import-template.csv"), toCsv(signingColumns, signingRecords));
  writeFile(path.join(root, "surfaces", "signing-proof-packet.html"), renderPacketSurface("Signing Proof Packet", "signing-proof-packet.json", "signing-proof-import-template.csv", "Signing Gate"));

  writeJson(path.join(root, "data", "release-review-packet.json"), reviewPacket);
  writeFile(path.join(root, "data", "release-review-import-template.csv"), toCsv(reviewColumns, reviewRecords));
  writeFile(path.join(root, "surfaces", "release-review-packet.html"), renderPacketSurface("Release Review Packet", "release-review-packet.json", "release-review-import-template.csv", "Review Gate"));

  writeJson(path.join(root, "data", "remaining-proof-packets.json"), summary);
  writeFile(path.join(root, "surfaces", "remaining-proof-packets.html"), renderSummarySurface());
}

console.log(JSON.stringify({
  report: "radio-remaining-proof-packets",
  counts: summary.counts,
  packets: summary.packets,
  verificationState: summary.verificationState
}, null, 2));
