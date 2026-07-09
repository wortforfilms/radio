# Vaigyaaniq Radio Platform

Registry-first, fail-closed radio ecosystem: a 1,186-track rights-aware catalogue,
an online/offline engine, a typed application manifest that generates every
subsystem, and an autonomous (but honest) radio agent.

## Map

| Piece | Where | One-liner |
|---|---|---|
| Registry (source of truth) | `apps/radio/registry` (`@vaigyaaniq/registry-core` shim) | 197 routes, components, layouts, tokens, content types, workflows, apps, agent policy — typed, frozen ids |
| Compiler + plugins | `scripts/registry-compiler.mjs`, `scripts/registry-plugins/` | canonical compiled manifest → 14 plugins → ~57 generated artifacts (nav, search, SEO, OpenAPI, SDK, UI manifests, env configs, IaC, docs) |
| Engine | `apps/web/public/radio-html/` (mirrored to desktop) | rights-enforced player, offline sync + outbox, TTS personas (8 languages), agent co-pilot, low-bandwidth mode |
| Backend | `apps/radio-backend` | Next.js proxy, admin lane, manifest API, agent orchestrator + LLM cognition, learning loop, rights automation, live-status lane |
| Standalone app | `apps/radio` | Next 16 catch-all renderer over the registry |
| Explorer | `apps/radio/public/registry/explorer.html` (`apps/explorer` server) | graph visualisation, impact preview, proposal lane |

## Daily commands

```bash
npm run radio:registry          # compile + validate + regenerate (incremental)
npm run radio:registry:diff     # release diff vs git HEAD (exit 2 on breaking)
npm run radio:content           # lyrics/LRC/storylines content pass
npm run radio:seed:dry          # catalogue → db validation
npx vitest run                  # full test suite
npm run radio:backend:start     # backend :4000 (engine: ?api=http://localhost:4000)
```

Scheduled jobs (cron): weekly learning `0 3 * * 1 node apps/radio-backend/learning.js`,
daily rights expiry `0 2 * * * node apps/radio-backend/rights-ledger.js`.

## Honesty gates (PHKD, everywhere)

Built/partial claims cite repo artifacts; planned claims nothing. Playback obeys
commerce access states; publication requires a verified rights proof (daily
expiry auto-revert). The agent answers only from cited sources, always discloses
itself, never auto-purchases, and every provider (LLM, content-gen, weather,
geo, payments, rights registry) is an env-gated seam that fails closed. Secrets
live in env/secret managers only — never in the registry.

## Docs

`apps/radio/registry/README.md` (developer guide) · `docs/registry/` (generated:
ROUTES, NAVIGATION, PERMISSIONS, API_MAP, COMPONENTS, CONTENT_WORKFLOWS, AGENT,
SEARCH_INDEX, SITE_STRUCTURE) · `RADIO_RELEASE_ROADMAP.md` (ship gates).
