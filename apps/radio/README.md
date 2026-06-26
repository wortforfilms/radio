# Radio Vaigyaaniq — Standalone App

Phase 6 extraction: Radio runs independently of the Vaishviq monorepo umbrella. No
governance/knowledge-runtime chrome — just the Radio shell, the static surfaces, and the
commerce/payment backend.

## What moved / what's vendored
- **Layout & landing** — `app/layout.tsx` + `app/page.tsx` (minimal shell; links to the static surfaces and tools). No governance topbar.
- **Commerce logic** — `lib/commerce.ts` is a self-contained copy of `packages/shared/src/commerce.ts` (no `@shared` monorepo dependency).
- **Payments** — `lib/payments.ts` + `app/api/payments/{order,webhook}/route.ts` (Razorpay order + signature-verified webhook; same fail-closed behaviour as the monorepo).
- **Data model** — `prisma/schema.prisma` carries only the commerce/account models (User, Album, RadioTrack, Purchase, Entitlement, Cart/CartItem, Wallet/WalletTransaction, UserSettings) — none of the knowledge-graph models.
- **Surfaces** — the static `radio-html/*` pages (Full App, Surfaces, Onboarding, Pricing, Account, Status) are synced from `apps/web/public/radio-html` (see below).

## Run (dev)
```bash
cd apps/radio
npm install
cp .env.example .env        # add RAZORPAY_* keys for live payments
npm run assets:sync         # symlink radio-html surfaces (use --copy for a real copy)
npx prisma generate && npx prisma migrate dev --name init
npm run dev                 # http://localhost:3000
```

> **Version reconciliation:** deps are pinned to match the monorepo (Next 16.2.6, React 18.3,
> Prisma 5). If `npm install` complains, align versions with the root `package.json` / lockfile.

## Assets
`npm run assets:sync` symlinks `public/radio-html` → `../web/public/radio-html` (no
duplication). For a self-contained deploy artifact, run `npm run assets:sync -- --copy`. The
large promoted media (`assets/audio/*.mp3`, `assets/covers/*.jpeg`) is git-ignored.

## Deploy
`next.config.mjs` sets `output: "standalone"`, so `npm run build` emits a self-contained
server in `.next/standalone`. Options:
- **Node host:** `npm run build && node .next/standalone/server.js` (copy `public/` + `.next/static`).
- **Container:** add a `Dockerfile` on `node:20-slim` that builds then runs the standalone server.
- **Vercel:** deploy the `apps/radio` directory as the project root.

Point the Razorpay webhook at `https://<host>/api/payments/webhook`.

## Fail-closed posture (unchanged)
Tracks are preview-only until rights-verified (`published`) **and** the user holds an
entitlement. Entitlements are granted only by the signature-verified webhook — never on
client-side success.
