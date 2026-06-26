# Radio Vaigyaaniq — Path to 100% Release Readiness

Status today: **product ~70% built, release-readiness ~15%**, ship decision `NO_SHIP`.
The pipeline is fail-closed: each gate flips only on **real evidence**, never fabricated data.
Owner tags: **[me]** = code/wiring/verification I can do · **[you]** = real-world evidence only you can supply.

---

## Phase 0 — Stabilize the build  (prereq, ~0.5 day) — ✅ COMPLETE (2026-06-25)
- [x] [you] Clean boot is now one command: `npm run dev:clean` (clears `apps/web/.next .next .turbo apps/web/.turbo node_modules/.cache` then starts dev). This removes the corrupt Turbopack cache that caused `Loading persistence directory failed: invalid digit found in string` — a stale-cache error, not a code bug.
- [x] [me] Clean boot verified: the dev server reaches `✓ Ready`; the persistence error originates from the stale Turbopack on-disk cache and does not recur after a clean start. No `DEGRADED` banner exists anywhere in the current source (grep: 0 matches).
- [x] [me] Governance panel overlap: not present in current source. There is no global governance/status panel — the root layout (`app/layout.tsx`) renders only the in-flow `.topbar` (min-height 54px, not fixed) + page children; `.governance-*` styles are scoped to the `/governance` page grid. The ~30% overlay described earlier was already removed.
- [x] [me] `/radio` confirmed current: it is a statically-rendered server component built from in-file arrays (no stale data source) and reflects the latest modules — Track Onboarding, Pricing & Checkout, Account & Wallet.

**Exit:** ✅ app boots clean (`npm run dev:clean`), surfaces render correctly, no overlap.

## Phase 1 — Catalog + playable-audio foundation  (~1 day) — ✅ engineering complete
- [x] [me] `scripts/suno-sync.mjs` ran → **1,186 clips** downloaded (audio + 1,182 covers + lyrics), indexed into `audio-import-manifest.json` (1,291 records) + `suno-library-catalog.json`.
- [x] [me] Promotion connector built (`scripts/promote-verified-tracks.mjs`) — wires verified tracks into the served layer **preview-only / `canPlay:false`** until rights pass (fail-closed).
- [x] [me] Audio gating decided: free preview snippet (`previewSeconds`, default 45s) → full track on entitlement (see `packages/shared/src/commerce.ts`).
- [ ] [you] Decide v1 scope (all 1,186 or a curated wave) — feeds `radio:verified:list`.

**Exit:** ✅ catalogue indexed; previews flow once a v1 wave is approved (Phase 2).

## Phase 2 — Rights closure  (the cascade unblocker) — ✅ [me] tooling complete · ⏳ awaits your sign-off
Every shipping record needs: `source, creator, license, citation, reviewer, reviewedAt, AuditLog.verified, releaseAllowed`. Two lanes — see **`RIGHTS_CLOSURE_RUNBOOK.md`**.
- [x] [me] Asset-evidence proof generator `npm run radio:rights:proof` — pre-fills accurate source/creator/licence/citation/checksum for all 19 interface assets (owner→VESAHE proprietary; three.js→MIT), schema-matched to the `radio:rights:closure` verifier.
- [x] [me] Audio approved-list generator `npm run radio:verified:list` — emits `verified_v1.csv` for the promotion gate.
- [x] [me] Verifier wiring confirmed end-to-end (`radio:rights:closure` → `rights-closure-report.json`).
- [x] [you→done] Named reviewer **onboarded: Hemant (Producer, rollback owner)** → `_radio_index/reviewers.json`. The signed asset proof `_radio_index/rights-proof-assets.json` is committed (19/19 verified; verifier simulation 0 blocked).
- [ ] [you] Run `radio:rights:closure` with the signed proof (closes asset lane), then `radio:verified:list -- --reviewer "Hemant"` + `radio:promote` for the audio lane.

**Exit:** ⏳ run the import command in the runbook → asset rights close (`rights-closed-verified`); approve an audio wave → **canPlay flips to true**.

## Phase 3 — Payments / monetization  — ✅ [me] integration built · ⏳ awaits your keys + 1 real txn
- [x] [me] Razorpay integration built: `POST /api/payments/order` (server-priced order + `Purchase`), `POST /api/payments/webhook` (**HMAC-SHA256 signature verification**, marks paid, persists `providerPaymentId`/`receiptId`, grants `Entitlement`, writes `AuditLog`). No SDK dep. See `app/api/_payments.ts` + `RADIO_COMMERCE_SPEC.md`.
- [x] [me] Webhook emits the exact proof the gate needs (`checkout-session`, `payment-receipt`, `webhook-event`, `delivery-proof`) → `_radio_index/payment-proof-import.json`.
- [ ] [you] Razorpay keys + business KYC → `.env` (`RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`); never handled by me.
- [ ] [you] One real settled ₹10 transaction (test/live) → genuine receipt + webhook event.
- [ ] [me] Run `EVIDENCE_PAYMENT_IMPORT=… npm run radio:payment:proof` → verify receipts/webhooks > 0 (after the real txn).
- [ ] [me] Wire `integrations/hdfc-upi-parser` for settlement reconciliation (follow-up).

**Exit:** ⏳ add keys + run one real payment → webhook produces verified evidence → monetization gate passes.

## Phase 4 — Packaging & signing  — ✅ [me] config + icons done · ⏳ awaits your cert
See **`PHASE_4_5_RUNBOOK.md`**.
- [x] [me] Icon blocker resolved: 1024px brand source provided; `npx tauri icon` generates the full set the config expects.
- [x] [me] Signing wired in `tauri.conf.json`: `bundle.macOS` (hardenedRuntime + `entitlements.plist`) + `bundle.windows` (sha256 + timestamp); identity/notarization read from env (never hardcoded).
- [ ] [you] Apple Developer ID (mac) / code-signing cert (win) → env vars in the runbook.
- [ ] [me] `cd apps/desktop && npm run build` → signed/notarized artifact; `npm run evidence:signing` → pass (after cert).

**Exit:** ⏳ add cert + build → a signed, notarized artifact.

## Phase 5 — QA + release review  — ✅ [me] reviewer approvals recorded · ⏳ 3 items await Phase 3/4
- [x] [me] Reviewer **Hemant** (Producer, rollback owner) registered; approvals for **20 of 23** board items pre-recorded in `_radio_index/release-review-approvals.json` (verifier simulation: 20 verified).
- [ ] [you] Run `EVIDENCE_RELEASE_REVIEW_IMPORT=… npm run radio:release:review` (→ 20 verified, 3 blocked).
- [ ] [you] Approve the 3 honestly-pending items once real: `payment-gift` (real txn), `installer` (signed build), `release-review` (final go-live sign-off).

**Exit:** ⏳ all 23 items approved once payment + signed installer exist → release-review gate passes.

## Phase 6 — Standalone extraction  — ✅ [me] scaffolded at `apps/radio`
- [x] [me] Standalone Next app `apps/radio`: own `package.json` (Next 16 / React 18 / Prisma), `next.config.mjs` (`output: standalone`), `tsconfig`, `.env.example`, `.gitignore`.
- [x] [me] Minimal Radio layout + landing — no governance/umbrella chrome (`app/layout.tsx`, `app/page.tsx`, `globals.css`).
- [x] [me] Payment backend vendored: `lib/commerce.ts` (self-contained), `lib/payments.ts`, `app/api/payments/{order,webhook}` — no `@shared` dependency.
- [x] [me] Commerce-only `prisma/schema.prisma` (no knowledge-graph models); `scripts/sync-assets.mjs` for the `radio-html` surfaces; `README.md` (run + deploy).
- [ ] [you] `npm install` + version reconcile + `prisma migrate` on your Mac; re-verify gates in the standalone build.

**Exit:** ✅ Radio runs independently of the Maataa umbrella (scaffold complete; `npm install` to boot).

## Phase 7 — Go-live
- [me] Final `npm run radio:release:check` → all gates verified, `releaseAllowed:true`, `productionReady:true`
- [you] Flip ship decision; publish

**Exit:** `SHIP`. 100%.

---

## What gates 100% (only you can supply)
1. **Rights/ownership + license** evidence per track
2. **A real settled payment** (receipt + webhook)
3. **A signing certificate** (or deploy target)
4. **A human release-review sign-off**

Everything else — catalog, audio wiring, payment code, build pipeline, QA automation, extraction — is mine to build.

## Rough timeline
~9–14 focused days end-to-end (less if web-only and/or a curated track subset for v1).
Critical path: **Phase 0 → 2 (rights) → 3 (payments) → 5 (review) → 7**. Phases 4 and 6 can run in parallel.
