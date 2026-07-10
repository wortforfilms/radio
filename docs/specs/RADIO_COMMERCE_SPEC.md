# Radio Vaigyaaniq — Commerce Spec (preview / pro / album / purchase records)

How listeners pay and what they get. Money is stored in **minor units** (INR paise,
USD cents), Razorpay-style. Data model lives in `prisma/schema.prisma`; logic in
`packages/shared/src/commerce.ts`; an interactive mock is `Radio_Pricing_Checkout.html`.

## Access tiers
- **Preview (free).** Anyone can hear a snippet (`RadioTrack.previewSeconds`, default 45s)
  of any **published** track. No account required.
- **Pro — per item.** Pay to unlock a **track** or a whole **album** permanently.
- **Pro — all-access pass.** One purchase unlocks every published track in the catalogue,
  perpetual. Coexists with per-item purchases (a user may own singles *and* later buy the pass).

A track is **locked** (not even previewable) until it is rights-verified and promoted
(`published = true`, mirroring `canPlay`). This is the same fail-closed gate as the rest of
the pipeline — nothing is sold or streamed before rights closure.

## Pricing (defaults)
| Item | INR | USD | Minor units |
|---|---|---|---|
| Single track | ₹29.00 | $0.99 | 2900 / 99 |
| All-access pass | ₹299.00 | $9.99 | 29900 / 999 |
| Album | computed (below) | computed | — |

Per-track prices may be overridden on `RadioTrack.priceInr/priceUsd`. Multi-currency is
first-class: both INR and USD are stored, and the checkout flow picks one per order.

## Album discount — "cheaper-than-N-singles"
An album is charged for **(trackCount − freeTracks)** singles, minimum one, where
`Album.freeTracks` defaults to **2**.

```
albumPrice = max(1, trackCount − freeTracks) × singlePrice
```

Example: a 6-track album → billed as 4 singles → ₹116.00 / $3.96, vs ₹174.00 / $5.94
bought individually — a **33% saving**. An album may set `priceInrOverride/priceUsdOverride`
to pin a flat price instead.

## Purchase records (data model)
Every transaction is a `Purchase` row; a successful one grants an `Entitlement`.

`Purchase`: `userId`, `productType` (`track|album|all_access`), `trackId?`/`albumId?`,
`amountMinor`, `currency`, `status` (`created → paid → failed | refunded`), `provider`
(`razorpay`), `providerOrderId`, `providerPaymentId`, `receiptId` (unique), `createdAt`,
`paidAt?`, `refundedAt?`.

`Entitlement`: `userId`, `scope` (`track|album|all_access`), `trackId?`/`albumId?`,
`purchaseId?`, `active`, `grantedAt`, `revokedAt?`. Unique per `(userId, scope, trackId, albumId)`
so the same item can't be double-granted.

## Entitlement resolution
A user can play a track's full version when **the track is published** AND any active
entitlement matches: an `all_access` pass, an `album` entitlement for the track's album, or
a `track` entitlement for the track. Otherwise they get **preview** (if published) or
**locked**. See `canPlayFull()` / `trackAccessState()` in the shared module.

## Refunds
Refunding a `Purchase` sets `status = refunded`, stamps `refundedAt`, and **revokes** the
linked entitlement (`active = false`, `revokedAt`). The user drops back to preview for that
item. All-access refund removes catalogue-wide access but leaves any separately-owned singles.

## Payment flow (Razorpay — Phase 3)
1. Client requests an order for a product → server computes `amountMinor`/`currency` via
   `purchaseAmount()` and creates a `Purchase` (`status: created`) + Razorpay order.
2. Razorpay checkout completes → **webhook with signature verification** marks the purchase
   `paid`, persists `providerPaymentId` + `receiptId`, and grants the `Entitlement`.
3. `npm run radio:payment:proof` verifies receipts/webhooks exist before the monetization
   gate flips. No entitlement is granted on client-side success alone.

### Implementation (Phase 3, built)
- `POST /api/payments/order` — server-prices the product (never trusts the client amount;
  rejects unpublished tracks), creates a `Purchase` (`created`) + Razorpay order, and emits a
  `checkout-session` evidence record. Returns `{ keyId, orderId, amount, currency, purchaseId }`.
- `POST /api/payments/webhook` — verifies `x-razorpay-signature` (HMAC-SHA256, constant-time);
  an invalid signature is rejected and grants nothing. On `payment.captured` / `order.paid` it
  marks the `Purchase` `paid`, persists `providerPaymentId`/`receiptId`, grants the `Entitlement`
  (idempotent), writes an `AuditLog`, and emits `payment-receipt` + `webhook-event` +
  `delivery-proof` evidence.
- `app/api/_payments.ts` — order create, signature verification (webhook + checkout), and the
  evidence appender. No SDK dependency (Node `fetch` + `crypto`).
- Evidence is written to `_radio_index/payment-proof-import.json`; close the gate with
  `EVIDENCE_PAYMENT_IMPORT="$(pwd)/_radio_index/payment-proof-import.json" npm run radio:payment:proof`.
- Env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (you supply).

### Real ₹10 proof import contract
For a low-risk settlement test, create one real Razorpay test/live charge for
₹10.00 and export the provider evidence to JSON or CSV outside generated assets.
The verifier accepts only actual proof rows; HDFC/UPI parser rows are
candidate-only reconciliation hints.

Required rows:
- `gift-intent`: `payerId`, `recipientId`, `amount=1000`, `currency=INR`, `intentCreatedAt`
- `checkout-session`: `checkoutProvider`, `checkoutSessionId`, `payerId`, `amount=1000`, `currency=INR`, `checkoutStatus`
- `payment-receipt`: `paymentReceiptId`, `checkoutProvider`, `amount=1000`, `currency=INR`, `paidAt`, `settlementStatus`
- `webhook-event`: `providerEventId`, `signatureHeader`, `webhookVerified=true`, `receivedAt`
- `delivery-proof`: `recipientId`, `paymentReceiptId`, `deliveredAt`, `fulfillmentId`, `auditCreated=true`

Run:

```bash
npm run radio:remaining:packets
EVIDENCE_PAYMENT_IMPORT="/absolute/path/to/completed-payment-proof.json" npm run radio:payment:proof
```

The payment gate remains blocked when any checkout, receipt, webhook signature,
delivery, or audit row is absent or incomplete. No dummy transaction should ever
be added to `_radio_index/payment-proof-import.json`.

## Files
- `prisma/schema.prisma` — Album, RadioTrack, Purchase, Entitlement (+ User relations).
- `packages/shared/src/commerce.ts` — pricing, album discount, entitlement & canPlayFull logic (unit-checked).
- `Radio_Pricing_Checkout.html` — interactive mock: preview→unlock, album bundle, Pro pass, ₹/$ toggle, purchase ledger with refunds.

---

# Account layer — cart, wallet, account, settings

Models in `prisma/schema.prisma`; logic in `packages/shared/src/commerce.ts` (account
section); interactive mock `Radio_Account.html` (tabs: Account · Cart · Wallet · Settings).

## Account
`User` gains `displayName`, `country` (ISO-2), and `preferredCurrency` (`INR|USD`), plus
relations to `cart`, `wallets`, `walletTxns`, and `settings`. Email/name already existed.

## Cart
One active `Cart` per user (`@unique userId`), with a `currency`. Each `CartItem` records
`productType` (`track|album|all_access`), optional `trackId`/`albumId`, and the `amountMinor`
priced at add-time (re-validated at checkout). Unique per `(cart, productType, track, album)`
so the same item can't be added twice. `cartSubtotal()` sums one currency; `checkoutSummary()`
returns `{ subtotal, walletApplied, due }`.

## Wallet
Prepaid balance is **per currency** — one `Wallet` row per `(userId, currency)`, balance in
minor units, never negative. Every movement is a `WalletTransaction` with `kind`
(`topup|debit|refund|credit|adjustment`), signed `amountMinor`, `balanceAfter`, and a
`reference` (purchaseId / providerPaymentId / note). `applyWallet()` enforces no-overdraw on
debits and returns the new balance + a txn skeleton.

### Checkout with wallet
At checkout the wallet covers `min(balance, subtotal)`; the remaining **due** goes to the
payment provider (Razorpay). A successful provider charge plus the wallet debit settle the
order; entitlements are then granted exactly as in the purchase flow above.

## Settings
`UserSettings` (1:1 with User): `language` (`hi|en`), `preferredCurrency`, `audioQuality`
(`preview|standard|high`), `autoplay`, `theme` (`dark|light`), `emailNotifications`,
`pushNotifications`, `marketingOptIn`. Defaults exported as `DEFAULT_SETTINGS` (Hindi, INR,
standard, dark, email on).

## Files (account layer)
- `prisma/schema.prisma` — Cart, CartItem, Wallet, WalletTransaction, UserSettings (+ User account fields).
- `packages/shared/src/commerce.ts` — buildCartItem, cartSubtotal, checkoutSummary, walletBalance, canAfford, applyWallet, DEFAULT_SETTINGS (unit-checked).
- `Radio_Account.html` — Account / Cart / Wallet / Settings mock with top-ups, ledger, and wallet-applied checkout.
