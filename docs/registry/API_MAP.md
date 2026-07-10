# API Map

Generated 2026-07-10T04:13:03.194Z. Statuses are honest — planned endpoints do not exist yet. OpenAPI: `registry/openapi.json` · SDK: `apps/radio/lib/sdk.ts`.

| endpoint | status | used by |
|---|---|---|
| `GET /api/stations` | 🟡 partial | `radio`, `radio.live` |
| `GET /api/evidence` | 🟡 partial | `radio` |
| `GET /api/stream-candidates` | 🟡 partial | `radio.live` |
| `GET /api/schedule/:stationSlug` | 🟡 partial | `radio.schedule` |
| `GET /api/offline-bundle` | 🟡 partial | `radio.download` |
| `GET /api/live-status` | ✅ built | `radio.programs` |
| `GET /api/search` | 🟡 partial | `search` |
| `POST /api/payments/order` | 🟡 partial | `premium.payment` |
| `POST /api/payments/webhook` | 🟡 partial | `premium.payment` |
| `GET /api/entitlements/:userId` | 🟡 partial | `premium.library` |
| `GET /api/analytics` | 🟡 partial | `analytics` |
| `POST /admin/login` | ✅ built | `admin` |
| `GET /admin/state` | ✅ built | `admin` |
| `POST /admin/rights-proof` | ✅ built | `admin` |
| `GET /admin/cache-status` | ✅ built | `admin` |
| `GET /manifest` | ✅ built | `admin.registry-explorer` |
| `GET /api/v1/radio` | ⬜ planned | `api.radio` |
| `GET /api/v1/search` | ⬜ planned | `api.search` |
| `GET /api/v1/analytics` | ⬜ planned | `api.analytics` |
| `POST /api/v1/payments` | ⬜ planned | `api.payments` |
