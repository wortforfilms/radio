# Radio Vaigyaaniq — Product Blueprint

A multi-station, multi-language radio built on the P.H.K.D. / VESAHE catalogue (1,186
tracks). Stations turn one library into distinct listening worlds; languages make each
reachable to its audience. Everything stays **fail-closed** — preview-by-default, full
playback only after rights + entitlement.

## Vision
One app, many stations. Each station is a curated frequency with its own identity, themes,
and languages, drawing tracks from the shared catalogue. Free preview snippets hook
listeners; Pro (per-track / album / all-access) unlocks full play. Provenance and rights are
first-class, not an afterthought.

## Launch lineup (4 stations)
| Station | Identity | Themes (auto-mapped) | Languages |
|---|---|---|---|
| **Sanaatana Vaigyaniq** | Science of the eternal — chants, cosmos, Vedic frequency | Sanatan & Vedic, Classical & Raag | Sanskrit, Hindi |
| **Kabir Clubbing** | Mystic verse meets the dancefloor — Bhakti, fusion, beat | Bhakti & Katha, Rap & Fusion, Naagin & Mystic | Hindi, Braj |
| **Ameerpur** | Haryanvi maati — street, folk, full desi | Haryanvi Folk, Desh/Patriotic, Love & Virah | Haryanvi, Hindi |
| **Gurukul** | Learn by listening — shlokas, stories, spoken word, kids | Other / Misc, spoken word | Sanskrit, Hindi, English |

Future frequencies (model already supports): Virah (ghazal), Naagin Mystic, Desh Tiranga,
Raag Shastriya — split out from the launch buckets as the catalogue grows.

## Content & language model
- **Auto-assignment by theme** — the catalogue's 9 themes map to stations via
  `data/stations.json > themeToStation`. `scripts/assign-stations.mjs` reads the catalogue +
  credits, assigns each track a station + inferred language, and writes
  `data/station-tracks.json`.
- **Two language layers** (per your choice):
  1. **Content tags + UI localization** — every track/station carries content languages
     (Sanskrit, Hindi, Haryanvi, Braj, Sufi/Urdu, English); the app UI is localizable (hi/en
     first).
  2. **Per-language station variants** — each station exposes language sub-channels (e.g.
     `gurukul-hi`, `gurukul-en`, `gurukul-sa`) defined in `stations.json > variants`; a
     listener picks a language and hears only that slice.

## Data model
- **`Station`** (Prisma) — slug, name, tagline, themes[], languages[], accent, cover,
  sortOrder, active.
- **`RadioTrack`** gains `theme` + `language`; a station's tracks = tracks whose theme is in
  the station's themes (plus optional manual overrides later). No heavy join needed for v1.
- Source of truth for the UI/script is `data/stations.json` (+ generated
  `data/station-tracks.json`); the Prisma model backs the eventual API.

## Surfaces
- **Stations** (`Radio_Stations.html`) — station picker → per-station cover grid, language
  filter chips, preview play. Wired into `/radio` and the standalone app.
- Catalogue, Onboarding, Pricing, Account, Status (already shipped) sit alongside.

## Monetization (already built)
Preview free → Pro unlock (track ₹29/$0.99, album cheaper-than-N, all-access ₹299/$9.99) via
the Razorpay order + signature-verified webhook. Stations are a discovery layer on top of the
same entitlement model — an "all-access" pass unlocks every station; album/track buys unlock
within them.

## Roadmap fit
Stations are a **Phase 1/8 product layer**, independent of the ship gates:
- Phases 0–6 (build, rights, payments, signing, review, extraction) are done/`[me]`-complete.
- Phase 7 go-live still gates on your cert + one real payment + final sign-off.
- Stations ship as soon as `assign-stations.mjs` runs and the surface is opened — they use the
  already-promoted, preview-ready audio.

## Build order
1. `data/stations.json` (done) — station definitions + theme map.
2. `npm run radio:stations` → `data/station-tracks.json` (auto-assignment + counts).
3. Open **Stations** surface → browse by station + language.
4. (Later) back the model with the `Station` Prisma table + an API for dynamic programming.

## Next extensions
Scheduling/programming (dayparts per station), persona DJ intros per station/language,
live "now playing", per-station all-access bundles, and listener favourites per station.
