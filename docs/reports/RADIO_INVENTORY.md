# Radio Vaigyaaniq — Types, Utils, Features, Services, Pricing
Generated: 2026-07-08 · Sources: `packages/*`, `apps/web`, `apps/radio`, `/radio` landing

## 1. Types

### Commerce (`packages/shared/src/commerce.ts`, vendored in `apps/radio/lib/commerce.ts`)
- `Currency` = "INR" | "USD"
- `ProductType` = "track" | "album" | "all_access"
- `PurchaseStatus` = "created" | "paid" | "failed" | "refunded"
- `WalletKind` = "topup" | "debit" | "refund" | "credit" | "adjustment"
- Interfaces: `Money`, `TrackLike`, `AlbumLike`, `EntitlementLike`, `CartItemLike`, `WalletLike`, `UserSettingsLike`

### Radio UI (`apps/web/app/components/radio/radioTypes.ts`)
- `RadioTrack`, `RadioStation`, `RadioCatalog`, `RadioMediaStation`, `RadioMediaMap`, `RadioAudioImportManifest`, `RadioRuntimeData`, `SamayaState`
- `TtsPersonaKey` = "maataa" | "rishi" | "samaya" | "vigyaaniq" · `TtsPersona`

### Payments (`apps/web/app/api/_payments.ts` = `apps/radio/lib/payments.ts`)
- `RazorpayOrder`

### Runtime / infra (`packages/runtime`, `packages/search`)
- `AuditAction`, `AuditInput` (audit.ts)
- `MediaStorageProviderKind`, `MediaStorageConfig` (storage.ts)
- `SearchFilters` (search)

### Other shared domain modules (`packages/shared/src/`)
ayodhya-modules, ayodhya-project-templates, device-runtime, extracted-wireframes, governance, hkd-hero-banners, hkd3d, iso15924-scripts, lipi-civilization-matrix, persistence-scopes, phkd, radio-storyboard, reference-corpus, sanskrit-dictionary, sprint-completion, taxonomy, universal-dictionary, universe-skeletons, universes, world-religious-atlas

## 2. Utils

### Commerce helpers (`commerce.ts`)
`trackPriceMinor`, `albumPriceMinor`, `albumFullPriceMinor`, `albumSavings`, `formatMoney`, `hasTrackAccess`, `canPlayFull`, `previewSeconds`, `trackAccessState`, `purchaseAmount`, `buildCartItem`, `cartSubtotal`, `checkoutSummary`, `walletBalance`, `canAfford`, `applyWallet`

### Payment utils (`_payments.ts` / `lib/payments.ts`)
`createRazorpayOrder`, `verifyWebhookSignature` (HMAC-SHA256), `verifyPaymentSignature`, `appendPaymentEvidence`, `paymentsConfigured`

### API helpers (`apps/web/app/api/_lib.ts`)
`ok`, `list`, `create`, `searchParams`, `searchRoute`, `graphRoute`, `analyticsRoute`

### Runtime utils (`packages/runtime/src/`)
- audit: `validateAuditInput`, `audit`
- importers: `importJsonNodes`, `importCsvNodes`, `importMarkdownDocument`, `importHkdDocument`
- exporters: `exportJson`, `exportCsv`, `exportGraphMl`, `exportMarkdown`, `exportHkd`
- storage: `resolveMediaStorageConfig`, `assertMediaStorageSeparated`, `storageArchitecture`, `mediaStoragePolicy`
- metrics: `getObservatoryMetrics` · db: `prisma` singleton

### Graph & search (`packages/graph`, `packages/search`)
`createVerifiedEdge`, `getExplorerGraph`, `traceLineage`, `searchKnowledge`

## 3. Features (from `/radio` landing modules)
| Code | Feature |
|---|---|
| STN | Stations — multi-station/multi-language lineup (Sanaatana Vaigyaniq, Kabir Clubbing, Ameerpur, Gurukul) |
| ONB | Track Onboarding — intake → metadata/credits → rights closure → station assignment (fail-closed canPlay) |
| PAY | Pricing & Checkout — preview free, per-track/album unlock, all-access, ₹/$, purchase ledger |
| ACCT | Account & Wallet — cart, per-currency wallet, top-ups, ledger, settings |
| CAT | Catalogue — 1,186-track cover-art gallery, live search, preview badges |
| STAT | Completion Status — release-roadmap matrix (Phases 0–7) |
| VIZ | 3D Visualizer — mic/files, shader scenes, particles, WebM capture |
| LRC | Synced Lyrics — LRC timing, Hindi lines, transcript import, HKD export |
| TTS | Persona TTS — Maataa, Rishi, Samaya, Vigyaaniq voices |
| ACT | Gift Loop — like/save/gift intent (local until evidence) |
| SB / APP / SURF | Storyboard, Full App HTML, all HTML surfaces |
| FLOW / ASCII / TREE / JSON | Runtimes+workflows, wireframes, future structure, scaffold JSON |
| HKD / HTML | HKD evidence export, original dashboard archive |

Operator flow: Tune → Announce → Visualize → Scribe → Package → Export.
Evidence posture (PHKD fail-closed): audio draft until verified; gift = intent only; lyrics = draft cues; generated media ≠ production-ready.

## 4. Services

### API routes — apps/web (`app/api/*`)
payments/order, payments/webhook, radio-release, analytics, assistant, audit(+[action]), civilizations, device, export, governance, guru-maataa, hkd3d, import, knowledge-graph, lipi, pitra, rishi, rishika, sanskrit-dictionary, search, subjects, texts, timeline, universal-dictionary

### API routes — apps/radio (standalone)
payments/order, payments/webhook (self-contained, no @shared dep)

### CLI/evidence services (`scripts/`, npm run …)
suno-sync, promote-verified-tracks (`radio:promote`), `radio:rights:proof`, `radio:rights:closure`, `radio:verified:list`, `radio:payment:proof`, `radio:release:review`, `radio:release:check` (orchestrator, 16 gates), `radio:hdfc:test`, media-storage-audit, import-radio-tracks-to-db, lyrics-prompter builders, universe hero-banner/soundtrack generators

### Integrations
- Razorpay (order + webhook, HMAC verified, no SDK)
- hdfc-upi-parser (settlement reconciliation, Python)

## 5. Pricing (source of truth: `commerce.ts`, minor units)
| Item | INR | USD |
|---|---|---|
| Single track (`DEFAULT_SINGLE_PRICE`) | ₹29.00 | $0.99 |
| All-access pass (`ALL_ACCESS_PRICE`) | ₹299.00 | $9.99 |
| Album | cheaper-than-N-singles bundle via `albumPriceMinor` (+ `albumSavings`) |  |

- Free tier: `DEFAULT_FREE_TRACKS` = 2 · preview `DEFAULT_PREVIEW_SECONDS` = 45s per track
- Track/album price overrides supported per record (`TrackLike.priceMinor`)
- Wallet: per-currency balance, top-up/debit/refund/credit/adjustment; `applyWallet` at checkout
- Server-priced orders only (client never sets amount); entitlement granted on verified webhook
