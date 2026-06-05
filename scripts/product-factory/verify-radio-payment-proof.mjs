#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toISOString().slice(0, 10);
const importPath = process.env.EVIDENCE_PAYMENT_IMPORT || process.env.PAYMENT_IMPORT_PATH || null;
const giftPaymentPath = path.join(webRoot, "data", "gift-payment-evidence.json");
const paymentLanePath = path.join(webRoot, "data", "payment-proof-lane.json");
const milestonePath = path.join(webRoot, "data", "milestone-completion.json");
const hdfcParserPath = path.join(webRoot, "data", "hdfc-upi-parser-scaffold.json");

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
const asBool = (input) => input === true || /^(true|1|yes|verified|pass|paid|succeeded|fulfilled)$/i.test(String(input || ""));
const numberOk = (input) => Number.isFinite(Number(input)) && Number(input) > 0;

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

async function loadProofRecords(file) {
  if (!file) return { status: "not-run", path: null, records: [], error: null };
  const absolute = path.resolve(file);
  if (!fs.existsSync(absolute)) return { status: "blocked", path: absolute, records: [], error: "payment proof file does not exist" };
  try {
    const text = fs.readFileSync(absolute, "utf8");
    if (/\.csv$/i.test(absolute)) return { status: "loaded", path: absolute, records: await parseCsv(text), error: null };
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : (parsed.records || parsed.payments || parsed.receipts || parsed.events || []);
    return { status: "loaded", path: absolute, records: Array.isArray(records) ? records : [], error: null };
  } catch (error) {
    return { status: "blocked", path: absolute, records: [], error: String(error.message || error) };
  }
}

function proofKind(record) {
  return normalize(value(record, ["kind", "type", "state", "eventType", "paymentState"])).toLowerCase();
}

function matchesKind(record, stateKey) {
  const kind = proofKind(record);
  if (!kind) return false;
  if (stateKey === "gift-intent") return /gift.*intent|intent/.test(kind);
  if (stateKey === "checkout-session") return /checkout.*session|checkout/.test(kind);
  if (stateKey === "payment-receipt") return /payment.*receipt|receipt|paid|payment/.test(kind);
  if (stateKey === "delivery-proof") return /delivery|fulfillment|fulfilled/.test(kind);
  if (stateKey === "webhook-event") return /webhook/.test(kind);
  return kind === stateKey;
}

const baseGift = readJson(giftPaymentPath, { counts: {}, states: [], requiredEvidence: [] });
const basePayment = readJson(paymentLanePath, { counts: {}, records: [] });
const milestoneCompletion = readJson(milestonePath, { counts: {}, milestones: [] });
const hdfcParser = readJson(hdfcParserPath, null);
const importResult = await loadProofRecords(importPath);
const records = importResult.records;

const states = [
  {
    key: "gift-intent",
    label: "Gift intent",
    required: [
      ["payerId", ["payerId", "payer_id", "fromUserId"]],
      ["recipientId", ["recipientId", "recipient_id", "toUserId"]],
      ["amount", ["amount", "totalAmount"]],
      ["currency", ["currency"]],
      ["intentCreatedAt", ["intentCreatedAt", "createdAt", "created_at"]]
    ]
  },
  {
    key: "checkout-session",
    label: "Checkout session",
    required: [
      ["checkoutProvider", ["checkoutProvider", "provider"]],
      ["checkoutSessionId", ["checkoutSessionId", "checkout_session_id", "sessionId"]],
      ["payerId", ["payerId", "payer_id", "fromUserId"]],
      ["amount", ["amount", "totalAmount"]],
      ["currency", ["currency"]],
      ["checkoutStatus", ["checkoutStatus", "status"]]
    ]
  },
  {
    key: "payment-receipt",
    label: "Payment receipt",
    required: [
      ["paymentReceiptId", ["paymentReceiptId", "receiptId", "paymentIntentId", "transactionId"]],
      ["checkoutProvider", ["checkoutProvider", "provider"]],
      ["amount", ["amount", "totalAmount"]],
      ["currency", ["currency"]],
      ["paidAt", ["paidAt", "paymentDate", "createdAt"]],
      ["settlementStatus", ["settlementStatus", "status"]]
    ]
  },
  {
    key: "webhook-event",
    label: "Webhook event",
    required: [
      ["providerEventId", ["providerEventId", "eventId", "webhookEventId"]],
      ["signatureHeader", ["signatureHeader", "webhookSignature", "signature"]],
      ["webhookVerified", ["webhookVerified", "signatureVerified", "AuditLog.webhookVerified"]],
      ["receivedAt", ["receivedAt", "createdAt"]]
    ]
  },
  {
    key: "delivery-proof",
    label: "Delivery proof",
    required: [
      ["recipientId", ["recipientId", "recipient_id", "toUserId"]],
      ["paymentReceiptId", ["paymentReceiptId", "receiptId", "paymentIntentId", "transactionId"]],
      ["deliveredAt", ["deliveredAt", "fulfilledAt", "deliveryDate"]],
      ["fulfillmentId", ["fulfillmentId", "deliveryId"]],
      ["AuditLog.created", ["auditCreated", "auditLogCreated", "AuditLog.created"]]
    ]
  }
];

function evaluateState(state) {
  const proof = records.find((record) => matchesKind(record, state.key)) || null;
  const checks = state.required.map(([key, aliases]) => {
    const raw = value(proof, aliases);
    let pass = Boolean(raw);
    if (key === "amount") pass = numberOk(raw);
    if (key === "checkoutStatus") pass = /^(open|complete|completed|paid|succeeded)$/i.test(String(raw || ""));
    if (key === "settlementStatus") pass = /^(paid|succeeded|settled|captured)$/i.test(String(raw || ""));
    if (key === "webhookVerified" || key === "AuditLog.created") pass = asBool(raw);
    return { key, label: key, status: pass ? "pass" : "blocked", evidence: raw ?? null };
  });
  const missing = checks.filter((check) => check.status !== "pass").map((check) => check.key);
  return {
    key: state.key,
    label: state.label,
    status: missing.length === 0 ? "verified" : (state.key === "gift-intent" && !proof ? "draft" : "blocked"),
    proofAttached: Boolean(proof),
    checks,
    missing,
    blocker: missing.length === 0 ? null : `missing ${missing.join(", ")}`,
    evidence: proof ? {
      id: value(proof, ["id", "key", "eventId", "receiptId", "transactionId"]),
      provider: value(proof, ["checkoutProvider", "provider"]),
      amount: value(proof, ["amount", "totalAmount"]),
      currency: value(proof, ["currency"]),
      createdAt: value(proof, ["createdAt", "created_at", "paidAt", "deliveredAt"])
    } : null
  };
}

const evaluated = states.map(evaluateState);
const giftIntents = evaluated.filter((item) => item.key === "gift-intent" && item.proofAttached).length;
const checkoutSessions = evaluated.filter((item) => item.key === "checkout-session" && item.status === "verified").length;
const paymentReceipts = evaluated.filter((item) => item.key === "payment-receipt" && item.status === "verified").length;
const webhookEvents = evaluated.filter((item) => item.key === "webhook-event" && item.status === "verified").length;
const fulfilledGifts = evaluated.filter((item) => item.key === "delivery-proof" && item.status === "verified").length;
const blocked = evaluated.filter((item) => item.status !== "verified").length;
const gatePass = checkoutSessions > 0 && paymentReceipts > 0 && webhookEvents > 0 && fulfilledGifts > 0 && blocked === 0;
const summary = {
  importedProofs: records.length,
  giftIntents,
  checkoutSessions,
  paymentReceipts,
  webhookEvents,
  fulfilledGifts,
  verifiedStates: evaluated.filter((item) => item.status === "verified").length,
  blockedStates: blocked,
  missingPayerId: evaluated.filter((item) => item.missing.includes("payerId")).length,
  missingRecipientId: evaluated.filter((item) => item.missing.includes("recipientId")).length,
  missingCheckoutSession: evaluated.filter((item) => item.missing.includes("checkoutSessionId")).length,
  missingPaymentReceipt: evaluated.filter((item) => item.missing.includes("paymentReceiptId")).length,
  missingWebhookSignature: evaluated.filter((item) => item.missing.includes("signatureHeader")).length,
  missingDeliveryProof: evaluated.filter((item) => item.missing.includes("deliveredAt")).length,
  auditUnverified: evaluated.filter((item) => item.missing.includes("AuditLog.created") || item.missing.includes("webhookVerified")).length
};

const report = {
  id: "radio-vaigyaaniq-payment-proof-report",
  title: "Radio Vaigyaaniq Gift / Payment Proof Report",
  generatedAt: today,
  verificationState: gatePass ? "payment-proof-verified" : records.length > 0 ? "blocked-payment-proof-incomplete" : "blocked-payment-proof-null",
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Payment proof requires checkout session, receipt, webhook signature verification, fulfillment proof, and audit evidence. No payment or fulfillment claim is made without imported proof."
  },
  import: {
    path: importResult.path,
    status: importResult.status,
    records: records.length,
    error: importResult.error,
    acceptedFormats: ["json", "csv"],
    env: "EVIDENCE_PAYMENT_IMPORT"
  },
  requiredEvidence: [
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
  ],
  parserIntegrations: hdfcParser ? [
    {
      id: hdfcParser.id,
      title: hdfcParser.title,
      path: hdfcParser.path,
      status: "candidate-only",
      verificationState: hdfcParser.verificationState,
      note: "Email parser candidates do not satisfy checkout, receipt, webhook, fulfillment, or audit proof."
    }
  ] : [],
  summary,
  gate: {
    name: "Gift / Payment Proof",
    status: gatePass ? "pass" : "blocked",
    detail: gatePass ? "Payment receipt, webhook, and fulfillment proof verified." : `Gift/payment proof blocked: ${blocked} state(s) lack complete proof.`
  },
  states: evaluated,
  rawProofs: records
};

const counts = {
  giftIntents,
  checkoutSessions,
  paymentReceipts,
  fulfilledGifts,
  webhookEvents,
  blocked
};
const shared = {
  generatedAt: today,
  verificationState: gatePass ? "payment-proof-verified" : "draft-payment-proof-blocked",
  counts,
  proofGate: report.gate,
  proofReport: "/radio-html/data/payment-proof-report.json",
  parserIntegrations: report.parserIntegrations
};

const giftPayment = {
  ...baseGift,
  ...shared,
  states: evaluated.map((item) => ({
    key: item.key,
    label: item.label,
    status: item.status,
    evidence: item.evidence,
    blocker: item.blocker
  })),
  requiredEvidence: report.requiredEvidence,
  note: "Gift button remains local intent only until payment proof report passes."
};

const paymentLane = {
  ...basePayment,
  ...shared,
  webhookVerifier: {
    provider: records.find((record) => value(record, ["checkoutProvider", "provider"])) ? value(records.find((record) => value(record, ["checkoutProvider", "provider"])), ["checkoutProvider", "provider"]) : null,
    endpoint: "/api/radio-release?view=payment-proof",
    signatureHeader: evaluated.find((item) => item.key === "webhook-event")?.checks.find((check) => check.key === "signatureHeader")?.evidence ?? null,
    status: webhookEvents > 0 ? "verified" : "blocked",
    blocker: webhookEvents > 0 ? null : "checkout provider, signing secret, and receipt evidence are NULL"
  },
  records: evaluated
};

milestoneCompletion.generatedAt = today;
milestoneCompletion.milestones = (milestoneCompletion.milestones || []).map((item) => item.key === "gift-payment-proof-lane"
  ? {
      ...item,
      status: gatePass ? "verified" : "implemented-draft",
      evidence: "/radio-html/data/payment-proof-report.json",
      blocker: gatePass ? null : report.gate.detail
    }
  : item);
milestoneCompletion.counts = {
  ...(milestoneCompletion.counts || {}),
  paymentProofReceipts: paymentReceipts,
  paymentProofBlocked: blocked
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "payment-proof-report.json"), report);
  writeJson(path.join(root, "data", "gift-payment-evidence.json"), giftPayment);
  writeJson(path.join(root, "data", "payment-proof-lane.json"), paymentLane);
  writeJson(path.join(root, "data", "milestone-completion.json"), milestoneCompletion);
}

console.log(JSON.stringify({
  report: "radio-payment-proof",
  gate: report.gate,
  summary: report.summary,
  import: report.import
}, null, 2));

if (importResult.status === "blocked") process.exit(1);
