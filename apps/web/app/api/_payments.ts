// Razorpay payment helpers (Phase 3). No SDK dependency — uses Node fetch + crypto.
// Fail-closed: nothing here grants access; entitlements are only granted by the
// signature-verified webhook in app/api/payments/webhook/route.ts.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const RZP_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";
export const paymentsConfigured = Boolean(RZP_KEY_ID && RZP_KEY_SECRET);

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/** Create a Razorpay order. amountMinor is in paise/cents. */
export async function createRazorpayOrder(input: {
  amountMinor: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes || {},
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`razorpay order failed ${res.status}: ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

function safeEqualHex(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Verify a Razorpay webhook: HMAC-SHA256(rawBody, webhookSecret) === x-razorpay-signature. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!RZP_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", RZP_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Verify a Razorpay Checkout success signature: HMAC-SHA256(order_id|payment_id, keySecret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!RZP_KEY_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", RZP_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

// Evidence consumed by `npm run radio:payment:proof` (EVIDENCE_PAYMENT_IMPORT).
// Lives under _radio_index (git-ignored). Each record carries a `kind` the verifier matches.
const EVIDENCE_PATH = path.resolve(process.cwd(), "_radio_index/payment-proof-import.json");

export function appendPaymentEvidence(record: Record<string, unknown>): void {
  let data: { records: Array<Record<string, unknown>> } = { records: [] };
  try {
    if (fs.existsSync(EVIDENCE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8"));
      if (Array.isArray(parsed?.records)) data.records = parsed.records;
    }
  } catch {
    /* start fresh on parse error */
  }
  data.records.push({ ...record, recordedAt: new Date().toISOString() });
  fs.mkdirSync(path.dirname(EVIDENCE_PATH), { recursive: true });
  fs.writeFileSync(EVIDENCE_PATH, `${JSON.stringify(data, null, 2)}\n`);
}
