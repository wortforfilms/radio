import type { NextRequest } from "next/server";
import { prisma } from "../../../../lib/db";
import { purchaseAmount, type Currency, type ProductType } from "../../../../lib/commerce";
import { createRazorpayOrder, paymentsConfigured, RZP_KEY_ID, appendPaymentEvidence } from "../../../../lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (messages: string[], status = 400) =>
  Response.json({ error: "PHKD_FAIL_CLOSED", messages }, { status });

const VALID: ProductType[] = ["track", "album", "all_access"];

export async function POST(request: NextRequest) {
  if (!paymentsConfigured) {
    return fail(["Razorpay not configured (set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)."], 503);
  }
  const body = await request.json().catch(() => null);
  if (!body) return fail(["invalid JSON body"]);

  const userId: string | undefined = body.userId;
  const productType: ProductType | undefined = body.productType;
  const trackId: string | undefined = body.trackId;
  const albumId: string | undefined = body.albumId;
  const currency: Currency = body.currency === "USD" ? "USD" : "INR";

  if (!userId) return fail(["userId required"]);
  if (!productType || !VALID.includes(productType)) return fail(["valid productType required (track|album|all_access)"]);

  let track: Awaited<ReturnType<typeof prisma.radioTrack.findUnique>> = null;
  let album: Awaited<ReturnType<typeof prisma.album.findUnique>> = null;

  if (productType === "track") {
    if (!trackId) return fail(["trackId required for a track purchase"]);
    track = await prisma.radioTrack.findUnique({ where: { id: trackId } });
    if (!track) return fail(["track not found"], 404);
    if (track.published !== true) return fail(["track is not published — rights not closed"], 409);
  } else if (productType === "album") {
    if (!albumId) return fail(["albumId required for an album purchase"]);
    album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return fail(["album not found"], 404);
  }

  const { minor } = purchaseAmount(productType, currency, {
    track: track
      ? { id: track.id, albumId: track.albumId, priceInr: track.priceInr, priceUsd: track.priceUsd, published: track.published }
      : undefined,
    album: album
      ? { id: album.id, trackCount: album.trackCount, freeTracks: album.freeTracks, priceInrOverride: album.priceInrOverride, priceUsdOverride: album.priceUsdOverride }
      : undefined,
  });
  if (minor <= 0) return fail(["computed amount is zero"]);

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      productType,
      trackId: trackId ?? null,
      albumId: albumId ?? null,
      amountMinor: minor,
      currency,
      status: "created",
      provider: "razorpay",
    },
  });

  let order;
  try {
    order = await createRazorpayOrder({
      amountMinor: minor,
      currency,
      receipt: `rcpt_${purchase.id}`,
      notes: { purchaseId: purchase.id, userId, productType },
    });
  } catch (error) {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "failed" } });
    return fail([`order creation failed: ${String((error as Error).message)}`], 502);
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { providerOrderId: order.id, receiptId: order.receipt },
  });

  appendPaymentEvidence({
    kind: "checkout-session",
    checkoutProvider: "razorpay",
    checkoutSessionId: order.id,
    payerId: userId,
    amount: minor,
    currency,
    checkoutStatus: "open",
    purchaseId: purchase.id,
  });

  return Response.json({
    phkd: { policy: "fail_closed", note: "Order created. No entitlement until a signature-verified webhook confirms capture." },
    keyId: RZP_KEY_ID,
    orderId: order.id,
    amount: minor,
    currency,
    purchaseId: purchase.id,
  });
}
