import type { NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import { verifyWebhookSignature, appendPaymentEvidence } from "../../_payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Razorpay webhook. Fail-closed: an invalid signature is rejected and grants nothing.
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(raw, signature)) {
    return Response.json(
      { error: "PHKD_FAIL_CLOSED", message: "invalid or missing webhook signature" },
      { status: 400 },
    );
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const type: string | undefined = event?.event;
  const payment = event?.payload?.payment?.entity;
  const eventId: string = event?.id || payment?.id || `evt_${Date.now()}`;

  // Record the verified webhook event (evidence), regardless of type.
  appendPaymentEvidence({
    kind: "webhook-event",
    providerEventId: eventId,
    signatureHeader: signature,
    webhookVerified: true,
    receivedAt: new Date().toISOString(),
    eventType: type ?? null,
  });

  if ((type === "payment.captured" || type === "order.paid") && payment?.order_id) {
    const purchase = await prisma.purchase.findFirst({
      where: { providerOrderId: payment.order_id },
    });

    if (purchase && purchase.status !== "paid") {
      const receiptId: string = payment.id || purchase.receiptId || `pay_${eventId}`;
      const updated = await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "paid",
          paidAt: new Date(),
          providerPaymentId: payment.id ?? null,
          receiptId,
        },
      });

      // Grant the entitlement (idempotent — unique on (userId, scope, trackId, albumId)).
      try {
        const ent = await prisma.entitlement.create({
          data: {
            userId: purchase.userId,
            scope: purchase.productType,
            trackId: purchase.trackId,
            albumId: purchase.albumId,
            purchaseId: purchase.id,
            active: true,
          },
        });
        appendPaymentEvidence({
          kind: "delivery-proof",
          recipientId: purchase.userId,
          paymentReceiptId: receiptId,
          deliveredAt: new Date().toISOString(),
          fulfillmentId: ent.id,
          auditCreated: true,
        });
      } catch {
        // already entitled — safe to ignore
      }

      appendPaymentEvidence({
        kind: "payment-receipt",
        paymentReceiptId: receiptId,
        checkoutProvider: "razorpay",
        amount: updated.amountMinor,
        currency: updated.currency,
        paidAt: new Date().toISOString(),
        settlementStatus: "captured",
        purchaseId: purchase.id,
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "payment.captured",
            entityType: "Purchase",
            entityId: purchase.id,
            userId: purchase.userId,
            after: JSON.stringify({ receiptId, amountMinor: updated.amountMinor, currency: updated.currency }),
            citation: `razorpay:${eventId}`,
          },
        });
      } catch {
        /* audit is best-effort */
      }
    }
  }

  return Response.json({ received: true });
}
