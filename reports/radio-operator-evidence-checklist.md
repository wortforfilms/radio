# Operator evidence checklist — Radio Vaigyaaniq release

Prepared: 2026-07-10 · Companion to `reports/radio-release-hardening-pr-summary.md`.
Every item below requires REAL evidence. Nothing here can be satisfied by the
codebase itself — these are the human/operator lanes that flip NO_SHIP → SHIP.
Import lanes and verifiers already exist for each (see runbooks).

## A. Rights evidence — 19 records (rights-closure lane)

For EACH of the 19 blocked records, supply and import
(`docs/runbooks/RIGHTS_CLOSURE_RUNBOOK.md` → `npm run radio:rights:closure`):

- [ ] `source` — where the asset originated (platform, account, export)
- [ ] `creator` — the human/legal creator or commissioning entity
- [ ] `license` — the licence text or grant covering release use
- [ ] `citation` — verifiable pointer to the licence/agreement
- [ ] `reviewer` — named human reviewer (registered: Hemant, Producer)
- [ ] `reviewedAt` — ISO timestamp of the actual review
- [ ] audit verification — `AuditLog.verified` row written by the verifier
- [ ] `releaseAllowed=true` appears ONLY as verifier output after all of the
      above pass — never hand-edited

Downstream effect when complete: playback gate unblocks (105 candidates →
playable per verified record); generated-content publication also depends on
this lane.

## B. Payment evidence — one real transaction (payment-proof lane)

- [ ] Real ₹10 checkout/session via `POST /api/payments/order`
      (Razorpay keys in the Next.js app `.env` — never committed)
- [ ] Payment receipt (providerPaymentId + receiptId persisted on Purchase)
- [ ] Webhook event received at `POST /api/payments/webhook`
- [ ] Webhook signature verified (HMAC-SHA256 — already enforced in code;
      the evidence must show a verified event, not a bypass)
- [ ] Delivery proof (entitlement granted + content delivered)
- [ ] Audit row for the transaction
- Import: `EVIDENCE_PAYMENT_IMPORT=… npm run radio:payment:proof`

## C. Signing evidence — desktop artifact (signing lane)

- [ ] Signed artifact (`cd apps/desktop && npm run build`)
- [ ] Artifact checksum recorded
- [ ] Apple Developer ID proof (macOS) or Windows code-signing cert proof
- [ ] `codesign --verify` output (not ad-hoc: `not-adhoc` check)
- [ ] Gatekeeper verification (`spctl --assess`)
- [ ] Notarization + stapler verification where applicable
      (`xcrun notarytool` / `xcrun stapler validate`)
- [ ] Named reviewer for the signing evidence
- Verify: `npm run evidence:signing` in `apps/desktop` (currently 1/8)

## D. GUI smoke evidence (gui-smoke lane, currently 1/9)

- [ ] App launch screenshot (real window, timestamped)
- [ ] Preview gate screenshot (45s preview stop + buy prompt visible)
- [ ] No-crash proof (session log covering the smoke run)
- [ ] Navigation proof (station switch + catalogue + account surfaces)
- [ ] Error review (console/log review signed by a reviewer)
- Verify: `npm run evidence:gui-smoke` in `apps/desktop`

## E. Release review — 23 approvals (release-review lane)

For EACH of the 23 board items:

- [ ] approval decision
- [ ] `reviewer` (named)
- [ ] `reviewedAt` (ISO timestamp)
- [ ] `citation` (what was inspected)
- [ ] `reason` (why it passes)
- [ ] audit verification row
- Import: `EVIDENCE_RELEASE_REVIEW_IMPORT=… npm run radio:release:review`
- Note: 20 approvals were pre-recorded earlier for board items whose
  substance existed; the verifier still requires the full field set +
  audit verification for all 23, including the 3 that depend on lanes
  B (payment) and C (installer) above.

## Sequence that unblocks go-live

A (rights) → B (payment) → C (signing) → D (GUI smoke) → E (review) →
`npm run radio:release:check` → 6/6 gates verified → `releaseAllowed:true`,
`productionReady:true`, `shipDecision:SHIP`.

## PHKD

Do not hand-edit any gate file, decision field, or verifier output. Blocked
means blocked until the verifier sees real proof.
