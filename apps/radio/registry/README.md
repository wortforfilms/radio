# Route Registry Platform — Developer Guide

The typed registry under this directory is the **single source of truth** for the
entire Radio Vaigyaaniq ecosystem (and future products: NLM, CIC Communicator,
Shree Kautilya, Lipi, Maataa UI, Corpus). Navigation, search, sitemaps, feeds,
permissions, platform maps, API docs, analytics config, and route documentation
are all **generated** from it — no subsystem maintains duplicate configuration.

## Layout

```
registry/
  types.ts          strong types (no `any`): RouteDefinition, SEO, Evidence, …
  index.ts          combines + validates everything; O(1) maps; computed children
  public.ts radio.ts podcasts.ts research.ts discover.ts academy.ts
  community.ts events.ts news.ts media.ts ai.ts search.ts user.ts
  premium.ts analytics.ts studio.ts cms.ts admin.ts api.ts ecosystem.ts
  components.ts     UI component registry (evidence-backed statuses)
  layouts.ts        layout → region → component trees
  tokens.ts         design tokens (extracted from existing surfaces)
  content-types.ts  content schemas (routes reference these via contentType)
  workflows.ts      editorial lifecycle + PHKD rights-closure lane
  apps.ts           multi-app workspace (Radio, NLM, CIC, Lipi, Corpus, …)
```

## Plugin pipeline (schemaVersion 3)

`npm run radio:registry` runs `scripts/build-registry-platform.mjs`, which
validates the manifest and executes plugins from `scripts/registry-plugins/`:
core (enriched JSON + mirrors + `registry.schema.json`), navigation, search,
permissions, platform (platform map + `ui-manifest.<platform>.json` for
web/mobile/desktop/tv/car/watch), api (`api-map.json`, honest `openapi.json`,
typed client `lib/sdk.ts`), seo (sitemap/robots/rss/atom/json feed +
dependency graph), components (`components.json`, `component-trees.json`),
tokens (colors/spacing/typography/icons/motion + `tokens.css`), content
(`content-types.json`, `cms-schemas.json`, `workflows.json`), workspace
(`workspace.json`), docs (8 generated Markdown files). Adding a subsystem
means adding ONE plugin that consumes the same context.

Each module exports `routes: RouteDefinition[]` and is pure data (type-only
imports), so Node can execute the registry directly with type stripping.

## Rules

1. **Ids are permanent.** `radio.live`, `academy.course`, `admin.users` — never
   rename or reuse. Subsystems reference routes by id, never by URL string.
2. **Statuses are evidence-backed (PHKD).** `built`/`partial` require
   `evidence[]` + `implementedBy[]` pointing at real repo artifacts; `planned`
   routes must claim nothing. Validation fails the build otherwise.
3. **All changes are additive.** Never remove evidence, URLs, tests, the legacy
   generator (`scripts/build-route-registry.mjs`), or the matcher API in
   `lib/routes.ts`.
4. **Never author `children` or navigation lists by hand** — both are computed.

## Workflows

```bash
npm run radio:registry          # validate + regenerate every derived artifact
npm run radio:registry:migrate  # ⚠ recovery only: regenerates modules from JSON,
                                #   OVERWRITING hand edits
npx vitest run tests/registry-platform.test.ts tests/route-registry.test.ts
```

Environment: `SITE_ORIGIN` (absolute URLs in sitemap/feeds; defaults to
localhost — no fabricated domain), `REGISTRY_FLAGS` (comma list of enabled
feature flags for generated navigation; default `premium`).

## Adding a route

1. Pick the section module; append a `RouteDefinition` with a new permanent id.
2. Set honest `status` + `evidence`; declare `layout`, `platforms`,
   `permissions`, `featureFlags`, `api`, `dependsOn` (ids).
3. `npm run radio:registry` — validation runs first and fails loudly on
   duplicate ids/paths, bad metadata, missing evidence, or dependency cycles.
4. Commit the module change together with the regenerated artifacts.

## Generated artifacts (do not edit)

`lib/route-registry.json` (schemaVersion 2, backwards-compatible superset,
mirrored to web + desktop `radio-html/data/`) · `public/registry/{navigation,
search,permissions,platform-map,api-map,dependency-graph}.json` ·
`public/{sitemap.xml,robots.txt,rss.xml,atom.xml,feed.json}` ·
`docs/registry/*.md`.

## Architectural decisions

- **TS modules as source, JSON as runtime.** The Next app and static surfaces
  consume generated JSON — zero runtime cost, no bundler coupling, and the same
  artifacts serve web, desktop, and future platforms. The build validates before
  writing, so invalid metadata can never ship.
- **O(1) lookups.** `byId`/`byPath` maps are precomputed in `index.ts` and in
  `lib/routes.ts`; dynamic `:param` patterns are the only (short) linear scan.
  The design holds at thousands of routes.
- **Backwards compatibility by superset.** schemaVersion 2 keeps every legacy
  field; the legacy generator, matcher, URLs, and tests all continue to work.
- **Honesty is enforced, not hoped for.** Evidence rules, flag-hidden
  navigation, planned-only API aliases, and null analytics tracking ids are
  validation rules — the registry cannot claim what the repo does not contain.
