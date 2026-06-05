#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const writeText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
};

const countFiles = (dir) => {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith("._") || item.name === "__pycache__") continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) count += countFiles(full);
    if (item.isFile()) count += 1;
  }
  return count;
};

const nullField = (key, description, aliases = []) => ({
  key,
  required: true,
  value: null,
  aliases,
  description
});

const proofStates = [
  {
    key: "gift-intent",
    label: "Gift Intent",
    fields: [
      nullField("payerId", "Internal payer/user id.", ["payer_id", "fromUserId"]),
      nullField("recipientId", "Internal recipient/user id.", ["recipient_id", "toUserId"]),
      nullField("amount", "Positive numeric gift amount."),
      nullField("currency", "ISO currency code, expected INR for UPI lanes."),
      nullField("intentCreatedAt", "Timestamp when gift intent was created.", ["createdAt"])
    ]
  },
  {
    key: "checkout-session",
    label: "Checkout Session",
    fields: [
      nullField("checkoutProvider", "Provider name, such as Razorpay/Stripe/UPI provider."),
      nullField("checkoutSessionId", "Provider checkout/session id.", ["sessionId"]),
      nullField("payerId", "Internal payer/user id."),
      nullField("amount", "Positive numeric checkout amount."),
      nullField("currency", "ISO currency code."),
      nullField("checkoutStatus", "Provider checkout status: open, complete, paid, or succeeded.")
    ]
  },
  {
    key: "payment-receipt",
    label: "Payment Receipt",
    fields: [
      nullField("paymentReceiptId", "Provider payment, receipt, capture, or transaction id.", ["receiptId", "transactionId"]),
      nullField("checkoutProvider", "Provider that issued the receipt."),
      nullField("amount", "Receipt amount."),
      nullField("currency", "Receipt currency."),
      nullField("paidAt", "Provider paid/captured timestamp."),
      nullField("settlementStatus", "Paid, captured, settled, or succeeded status.")
    ]
  },
  {
    key: "webhook-event",
    label: "Webhook Event",
    fields: [
      nullField("providerEventId", "Provider webhook event id.", ["eventId"]),
      nullField("signatureHeader", "Raw provider signature header."),
      nullField("webhookVerified", "Boolean result of local signature verification."),
      nullField("receivedAt", "Webhook receipt timestamp.")
    ]
  },
  {
    key: "delivery-proof",
    label: "Delivery Proof",
    fields: [
      nullField("recipientId", "Internal gift recipient/user id."),
      nullField("paymentReceiptId", "Receipt id linked to this fulfillment."),
      nullField("deliveredAt", "Timestamp when gift was delivered/fulfilled."),
      nullField("fulfillmentId", "Internal fulfillment id."),
      nullField("AuditLog.created", "Boolean audit record creation evidence.")
    ]
  }
];

const paymentTemplate = {
  id: "radio-payment-proof-import-templates",
  title: "Radio Vaigyaaniq Payment Proof Import Templates",
  generatedAt: today,
  verificationState: "draft-templates-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Templates define accepted JSON/CSV proof shape only. They do not create receipt, webhook, fulfillment, or audit proof."
  },
  importEnv: "EVIDENCE_PAYMENT_IMPORT",
  acceptedFormats: ["json", "csv"],
  csvHeader: "kind,payerId,recipientId,checkoutProvider,checkoutSessionId,paymentReceiptId,amount,currency,paidAt,settlementStatus,providerEventId,signatureHeader,webhookVerified,receivedAt,deliveredAt,fulfillmentId,AuditLog.created",
  counts: {
    templates: proofStates.length,
    requiredFields: proofStates.reduce((sum, item) => sum + item.fields.length, 0),
    exampleRowsWithValues: 0,
    blocked: proofStates.length
  },
  templates: proofStates.map((state) => ({
    ...state,
    jsonObject: Object.fromEntries(state.fields.map((field) => [field.key, field.value])),
    status: "template-only"
  }))
};

const hdfcAdapter = {
  id: "hdfc-upi-parser-proof-adapter",
  title: "HDFC UPI Parser Evidence Adapter",
  generatedAt: today,
  verificationState: "draft-candidate-adapter",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Parsed HDFC/UPI email rows are candidate reconciliation records only. They cannot satisfy payment receipt or settlement gates."
  },
  sourcePackage: "integrations/hdfc-upi-parser",
  adapterEntrypoint: "integrations/hdfc-upi-parser/hdfc_upi_parser/services/proof_adapter.py",
  counts: {
    adapters: 1,
    candidateRowsImported: 0,
    verifiedReceipts: 0,
    verifiedWebhooks: 0,
    fulfilledGifts: 0,
    blocked: 4
  },
  mapping: [
    ["amount", "amount", "candidate amount only"],
    ["utr", "utr", "bank reference, not settlement proof by itself"],
    ["vpa", "payerVpa", "candidate sender VPA"],
    ["sender_name", "senderName", "candidate sender display name"],
    ["transaction_date", "transactionDate", "candidate email timestamp"],
    ["extracted_order_id", "extractedOrderId", "candidate reconciliation hint"],
    ["paymentReceiptId", null, "NULL until provider receipt exists"],
    ["signatureHeader", null, "NULL until provider webhook exists"],
    ["AuditLog.created", false, "false until audit evidence exists"]
  ],
  blockedClaims: [
    "verified settlement",
    "verified receipt",
    "verified webhook",
    "paid order mutation"
  ]
};

const webhookProof = {
  id: "radio-webhook-signature-proof",
  title: "Webhook Signature Proof Lane",
  generatedAt: today,
  verificationState: "blocked-webhook-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Webhook proof requires provider event id, raw payload hash, signature header, secret reference, verification result, receivedAt, and audit evidence."
  },
  counts: {
    configuredProviders: 0,
    webhookEvents: 0,
    verifiedSignatures: 0,
    auditRecords: 0,
    blocked: 6
  },
  requiredEvidence: [
    "checkoutProvider",
    "providerEventId",
    "payloadSha256",
    "signatureHeader",
    "signingSecretRef",
    "webhookVerified",
    "receivedAt",
    "AuditLog.created"
  ],
  verifierContract: {
    algorithm: "HMAC-SHA256 or provider documented verifier",
    payloadMutationAllowed: false,
    secretValueStoredInRepo: false,
    status: "blocked",
    blocker: "provider signing secret and webhook payload evidence are NULL"
  }
};

const receiptProof = {
  id: "radio-receipt-settlement-proof",
  title: "Receipt + Settlement Proof Gate",
  generatedAt: today,
  verificationState: "blocked-receipt-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Receipt proof requires provider-issued receipt/capture evidence and settlement status. Bank email parse or UI gift intent is insufficient."
  },
  counts: {
    receiptRecords: 0,
    settlementRecords: 0,
    reconciledUtrs: 0,
    verifiedReceipts: 0,
    blocked: 5
  },
  statusMapping: [
    { providerStatus: "paid", normalizedStatus: "paid", accepted: true },
    { providerStatus: "captured", normalizedStatus: "paid", accepted: true },
    { providerStatus: "settled", normalizedStatus: "settled", accepted: true },
    { providerStatus: "succeeded", normalizedStatus: "paid", accepted: true },
    { providerStatus: "created/open/pending/failed/refunded", normalizedStatus: "blocked", accepted: false }
  ],
  requiredEvidence: [
    "paymentReceiptId",
    "checkoutProvider",
    "amount",
    "currency",
    "paidAt",
    "settlementStatus",
    "providerDashboardCitation",
    "AuditLog.created"
  ]
};

const rightsClosure = readJson(path.join(webRoot, "data", "rights-closure-report.json"), { summary: { records: 0, blocked: 0 } });
const rightsTemplates = {
  id: "radio-rights-proof-import-templates",
  title: "Rights Proof Import Templates",
  generatedAt: today,
  verificationState: "draft-rights-templates-no-proof",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Templates do not close rights. Each asset still needs source, creator, license, citation, reviewer, reviewedAt, and audit verification."
  },
  importEnv: "EVIDENCE_RIGHTS_IMPORT",
  acceptedFormats: ["json", "csv"],
  csvHeader: "id,path,source,creator,license,rightsStatus,citation,reviewer,reviewedAt,auditVerified,releaseAllowed,checksum",
  counts: {
    templates: 4,
    rightsRecords: rightsClosure.summary?.records ?? 0,
    closed: rightsClosure.summary?.closed ?? 0,
    blocked: rightsClosure.summary?.blocked ?? 0
  },
  templates: [
    { key: "asset-rights-proof", required: ["id", "path", "source", "creator", "license", "rightsStatus", "citation"] },
    { key: "review-proof", required: ["reviewer", "reviewedAt", "reason"] },
    { key: "audit-proof", required: ["auditVerified", "AuditLog.verified"] },
    { key: "release-allowance", required: ["releaseAllowed", "checksum"] }
  ]
};
const rightsPacket = readJson(path.join(webRoot, "data", "rights-closure-packet.json"), {
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
    note: "Run npm run radio:rights:packet to prepare per-asset JSON/CSV proof rows. Packet rows do not close rights until independently filled and verified."
  },
  importEnv: "EVIDENCE_RIGHTS_IMPORT",
  counts: {
    records: rightsClosure.summary?.records ?? 0,
    rowsPrepared: 0,
    releaseAllowed: 0,
    blocked: rightsClosure.summary?.blocked ?? 0,
    closed: rightsClosure.summary?.closed ?? 0
  },
  requiredEvidence: rightsTemplates.templates.flatMap((template) => template.required),
  records: []
});

const releaseReview = readJson(path.join(webRoot, "data", "release-review.json"), { counts: {}, queue: [], reviewerRequirements: [] });
const releaseReviewBoard = {
  id: "radio-release-review-board",
  title: "Release Review Board",
  generatedAt: today,
  verificationState: "blocked-reviewer-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Review board assignments are draft queues only. Release approval requires named reviewer, reviewedAt, citation, reason, and AuditLog.verified."
  },
  counts: {
    reviewItems: releaseReview.counts?.reviewItems ?? 0,
    unreviewed: releaseReview.counts?.unreviewed ?? 0,
    verified: releaseReview.counts?.verified ?? 0,
    blocked: releaseReview.counts?.blocked ?? 0,
    reviewerAssignments: 0
  },
  lanes: [
    { key: "rights", label: "Rights reviewer", reviewer: null, status: "blocked" },
    { key: "payment", label: "Payment reviewer", reviewer: null, status: "blocked" },
    { key: "installer", label: "Installer reviewer", reviewer: null, status: "blocked" },
    { key: "release", label: "Release approver", reviewer: null, status: "blocked" }
  ],
  reviewerRequirements: releaseReview.reviewerRequirements ?? [],
  queue: releaseReview.queue ?? []
};

const installerPipeline = readJson(path.join(webRoot, "data", "installer-pipeline.json"), { counts: {}, records: [] });
const signingProof = {
  id: "radio-installer-signing-proof",
  title: "Installer Signing Evidence Slots",
  generatedAt: today,
  verificationState: "blocked-signing-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Signing slots describe required evidence. They do not sign, notarize, upload, or distribute installers."
  },
  counts: {
    artifactSlots: installerPipeline.counts?.artifactSlots ?? 0,
    signedArtifacts: installerPipeline.counts?.signedArtifacts ?? 0,
    notarizedArtifacts: installerPipeline.counts?.notarizedArtifacts ?? 0,
    signingBlockedChecks: installerPipeline.counts?.signingBlockedChecks ?? 0,
    blocked: installerPipeline.counts?.blocked ?? 0
  },
  requiredEvidence: [
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
  ],
  slots: (installerPipeline.records ?? []).map((record) => ({
    key: record.key,
    platform: record.platform,
    format: record.format,
    artifactPath: record.path ?? null,
    sha256: record.checksum ?? null,
    signingIdentity: null,
    signatureVerification: null,
    notarizationTicket: null,
    status: record.status === "draft-ready-unsigned" ? "blocked-unsigned-local-artifact" : "blocked"
  }))
};

const refreshCommand = {
  id: "radio-evidence-refresh-command",
  title: "One-Command Evidence Refresh",
  generatedAt: today,
  verificationState: "draft-command-expanded",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "The command refreshes local evidence only. It does not create external rights, payment, signing, or release approval proof."
  },
  command: "npm run radio:release:check",
  counts: {
    configuredCommands: 14,
    optionalBrowserChecks: 2,
    externalProofCreated: 0,
    productionReady: 0,
    blockedEvidenceLanes: 6
  },
  steps: [
    ["core-data", "node scripts/product-factory/complete-radio-milestones.mjs"],
    ["next-milestones", "node scripts/product-factory/complete-radio-next-milestones.mjs"],
    ["desktop-signing", "cd apps/desktop && npm run evidence:signing"],
    ["sync-gui-evidence", "node scripts/product-factory/sync-radio-gui-smoke-evidence.mjs"],
    ["sync-signing-evidence", "node scripts/product-factory/sync-radio-signing-evidence.mjs"],
    ["proof-milestones", "node scripts/product-factory/complete-radio-proof-milestones.mjs"],
    ["payment-proof", "node scripts/product-factory/verify-radio-payment-proof.mjs"],
    ["rights-packet", "node scripts/product-factory/prepare-radio-rights-closure-packet.mjs"],
    ["rights-closure", "node scripts/product-factory/verify-radio-rights-closure.mjs"],
    ["release-review", "node scripts/product-factory/verify-radio-release-review.mjs"],
    ["hdfc-parser-tests", "npm run radio:hdfc:test"],
    ["tests", "npm test"],
    ["build", "npm run build"],
    ["browser-evidence", "RADIO_RELEASE_BROWSER_URL=http://127.0.0.1:3000 npm run radio:release:check"]
  ].map(([key, command]) => ({ key, command, status: key === "browser-evidence" ? "optional" : "configured" }))
};

const hdfcScaffoldPath = path.join(webRoot, "data", "hdfc-upi-parser-scaffold.json");
const hdfcScaffold = readJson(hdfcScaffoldPath, null);
if (hdfcScaffold) {
  const integrationRoot = path.resolve("integrations/hdfc-upi-parser");
  hdfcScaffold.generatedAt = today;
  hdfcScaffold.counts = {
    ...(hdfcScaffold.counts || {}),
    packageFiles: countFiles(integrationRoot),
    implementedServiceContracts: countFiles(path.join(integrationRoot, "hdfc_upi_parser", "services")) - 1,
    tests: countFiles(path.join(integrationRoot, "tests"))
  };
  hdfcScaffold.entrypoints = [
    ...(hdfcScaffold.entrypoints || []).filter((item) => item.path !== "integrations/hdfc-upi-parser/hdfc_upi_parser/services/proof_adapter.py"),
    {
      kind: "proof-adapter",
      path: "integrations/hdfc-upi-parser/hdfc_upi_parser/services/proof_adapter.py",
      status: "candidate-only"
    }
  ];
}

const dataFrames = {
  "payment-proof-import-templates.json": paymentTemplate,
  "hdfc-upi-parser-adapter.json": hdfcAdapter,
  "webhook-signature-proof.json": webhookProof,
  "receipt-settlement-proof.json": receiptProof,
  "rights-proof-import-templates.json": rightsTemplates,
  "rights-closure-packet.json": rightsPacket,
  "release-review-board.json": releaseReviewBoard,
  "installer-signing-proof.json": signingProof,
  "evidence-refresh-command.json": refreshCommand
};

const surfaceSpec = [
  ["payment-proof-import-templates.html", "Payment Proof Import Templates", "Template Contract", "payment-proof-import-templates.json"],
  ["hdfc-upi-parser-adapter.html", "HDFC Parser Evidence Adapter", "Candidate Adapter", "hdfc-upi-parser-adapter.json"],
  ["webhook-signature-proof.html", "Webhook Signature Proof", "Webhook Gate", "webhook-signature-proof.json"],
  ["receipt-settlement-proof.html", "Receipt + Settlement Proof", "Receipt Gate", "receipt-settlement-proof.json"],
  ["rights-proof-import-templates.html", "Rights Proof Import Templates", "Rights Gate", "rights-proof-import-templates.json"],
  ["rights-closure-packet.html", "Rights Closure Packet", "Rights Gate", "rights-closure-packet.json"],
  ["release-review-board.html", "Release Review Board", "Review Gate", "release-review-board.json"],
  ["installer-signing-proof.html", "Installer Signing Proof", "Signing Gate", "installer-signing-proof.json"],
  ["evidence-refresh-command.html", "Evidence Refresh Command", "Command Gate", "evidence-refresh-command.json"]
];

function renderSurface(file, title, eyebrow, dataFile) {
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
        <a href="./rights-closure.html">Rights</a>
        <a href="./release-orchestration.html">Ship</a>
      </nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          <p id="surfaceNote">Loading fail-closed evidence lane...</p>
          <div class="surface-actions">
            <a href="../data/${dataFile}">Data JSON</a>
            <a href="./no-ship-dashboard.html">No-Ship</a>
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
        <span class="surface-label">Evidence Details</span>
        <h2>Records</h2>
        <section class="runtime-lane" id="records"></section>
      </section>
    </section>
  </main>
  <script>
    const valueText = (value) => value === null || value === undefined || value === "" ? "NULL" : Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);
    const row = (label, body, status = "blocked") => \`<article class="runtime-row"><span>\${status}</span><div><b>\${label}</b><p>\${body}</p></div><small class="surface-state-pill">\${status}</small></article>\`;
    fetch("../data/${dataFile}").then((response) => response.json()).then((data) => {
      document.getElementById("surfaceState").textContent = data.verificationState || "blocked";
      document.getElementById("surfaceShip").textContent = data.shipDecision || "NO_SHIP";
      document.getElementById("surfaceNote").textContent = data.phkd?.note || "Unknown values remain NULL.";
      document.getElementById("metrics").innerHTML = Object.entries(data.counts || {}).map(([key, value]) => \`<article class="surface-card"><span class="surface-label">\${key}</span><b>\${valueText(value)}</b><p>Local evidence counter.</p></article>\`).join("");
      const records = data.templates || data.requiredEvidence || data.mapping || data.lanes || data.slots || data.steps || data.blockedClaims || [];
      document.getElementById("records").innerHTML = records.map((item) => {
        if (Array.isArray(item)) return row(item[0], item.slice(1).map(valueText).join(" · "), "mapping");
        if (typeof item === "string") return row(item, "Required evidence is currently NULL.", "required");
        return row(item.label || item.key || item.title || "record", valueText(item.fields || item.required || item.command || item.blocker || item.status || item), item.status || "draft");
      }).join("");
    });
  </script>
</body>
</html>
`;
}

for (const root of [webRoot, desktopRoot]) {
  if (hdfcScaffold) writeJson(path.join(root, "data", "hdfc-upi-parser-scaffold.json"), hdfcScaffold);
  for (const [file, data] of Object.entries(dataFrames)) {
    writeJson(path.join(root, "data", file), data);
  }
  for (const [file, title, eyebrow, dataFile] of surfaceSpec) {
    writeText(path.join(root, "surfaces", file), renderSurface(file, title, eyebrow, dataFile));
  }
}

const releaseOrchestrationPath = path.join(webRoot, "data", "release-orchestration.json");
const releaseOrchestration = readJson(releaseOrchestrationPath, { counts: {}, steps: [] });
releaseOrchestration.generatedAt = today;
releaseOrchestration.counts = refreshCommand.counts;
releaseOrchestration.steps = refreshCommand.steps.map((step) => ({
  ...step,
  description: step.key === "browser-evidence" ? "Optional browser checks when a local server is available." : "Configured local evidence refresh step."
}));
for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "release-orchestration.json"), releaseOrchestration);
}

console.log(JSON.stringify({
  report: "radio-proof-milestones",
  dataFrames: Object.keys(dataFrames).length,
  surfaces: surfaceSpec.length,
  shipDecision: "NO_SHIP"
}, null, 2));
