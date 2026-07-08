# Radio Vaigyaaniq Engine Backend

Thin backend for the online/offline radio engine. Business logic (server-side pricing,
Razorpay orders, webhook signature verification, rights gates) lives in the Next.js app
(`apps/web/app/api/`); this server never duplicates it. It adds:

- a **proxy** for `/api/payments/*`, `/api/radio-release`, `/api/search`, `/api/analytics`
  → forwarded to `NEXT_API_BASE` (GET responses cached ~30s)
- **rights-aware offline bundles** (`/api/offline-bundle?userId=`): free tracks → full
  audio, verified entitlements → full audio, everything else → preview clip or a 45s
  playback clamp
- **entitlements/wallets** (`/api/entitlements/:userId`) read from the single shared
  Prisma database (fail-closed to none if `DATABASE_URL`/client is missing)
- **offline outbox sync** (`POST /api/sync`): play counts + gift intents appended as
  JSONL evidence

Live streams, ads, weather, and commercial release rights stay fail-closed until evidence exists.

## Run

```bash
# 1. Next.js app (business API) — repo root
npm run dev            # serves apps/web on :3000

# 2. Backend
cd apps/radio-backend
cp .env.example .env   # then fill values (see below)
npm install
npm start              # :4000
```

Open the engine against it: `online-offline-radio-engine.html?api=http://localhost:4000`

## Environment

| Var | Purpose |
|---|---|
| `NEXT_API_BASE` | Next.js app that owns payments/rights (default `http://localhost:3000`) |
| `DATABASE_URL` | Shared Prisma db for entitlements/wallets, e.g. `file:../../prisma/dev.db` |
| `WEATHER_API_KEY`, `WEATHER_CITY`, `WEATHER_UNITS` | Enables the weather gate (OpenWeatherMap) |
| `ENABLE_TEST_STREAMS` | `1` exposes candidate public streams (rights NOT verified) |
| `ENABLE_ADS` | `1` allows rights-verified ad inventory only (default blocked) |
| `RADIO_ENGINE_MANIFEST`, `RADIO_STREAM_CANDIDATES` | Data file overrides |
| `SYNC_EVENTS_FILE` | Offline outbox evidence sink (JSONL) |

Razorpay keys (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`)
belong in the **Next.js app env (repo root `.env`)**, never here — orders and webhooks
are proxied, not handled.

## Endpoints

- `GET /health` · `GET /api/evidence`
- `GET /api/stations` · `GET /api/schedule/:stationSlug`
- `GET /api/ads` (blocked) · `GET /api/weather` (blocked without key) · `GET /api/stream-candidates`
- `GET /api/entitlements/:userId` · `GET /api/offline-bundle?userId=`
- `POST /api/sync`
- proxied: `POST /api/payments/order`, `POST /api/payments/webhook`, `GET /api/radio-release|search|analytics`

## PHKD gates (fail-closed)

Ads blocked without verified inventory + `ENABLE_ADS=1` · weather blocked without
`WEATHER_API_KEY` · live streams `null` until real stream URLs are rights-verified ·
no entitlement without a signature-verified webhook · commercial rights remain
unverified and are never claimed.

## Admin lane

`/admin/*` routes power `radio-html/admin-panel.html` (web + desktop mirror):
stations, programs, tracks, ads, rights proofs, offline cache status + re-sync.

```bash
# enable: set ADMIN_PASSWORD in .env, restart, then open
open "http://localhost:3000/radio-html/admin-panel.html?api=http://localhost:4000"
```

Fail-closed rules: every edit is a draft overlay in `admin-data.json`; apply with
`npm run radio:engine:manifest`. A track publishes ONLY when (a) admin sets
`published:true` intent AND (b) a rights proof uploaded via the panel has been
verified by the rights-closure lane (`npm run radio:rights:closure`) — admin
intent alone never publishes. Ads always stay `releaseAllowed:false` here.
Auth is MVP password → sha256 bearer token; `requireAdmin()` is the single
seam to swap in OAuth/sessions later.

## Content & seeding (repo root)

```bash
npm run radio:content    # sanitised lyrics + LRC + stylised titles + versions + storylines, mirrored to desktop
npm run radio:seed:dry   # validate catalogue (unique ids/slugs) without DB writes
npm run radio:seed       # idempotent upserts into the root Prisma db (Station + RadioTrack)
cd apps/radio-backend && npm run prisma:seed   # backend stations/programs/ads db
```

## Prisma

`prisma/schema.prisma` stays available for isolated experiments, but the recommended
setup points `DATABASE_URL` at the repo-root database so entitlements come from the
single source of truth.
