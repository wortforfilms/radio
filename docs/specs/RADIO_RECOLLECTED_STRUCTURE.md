# Radio Vaigyaaniq - Recollected Structure

Generated from the live workspace on 2026-06-26.

This document consolidates the current Radio Vaigyaaniq workspace into a single operating map: folders, apps, pages, surfaces, evidence lanes, release gates, blockers, and the next completion path.

## 1. Operating Truth

| Layer | Current State |
|---|---|
| Product posture | Local draft runtime |
| Release posture | NO_SHIP |
| Production ready | No |
| Release allowed | 0 |
| Customer release ready | 0 |
| Main reason | Proof lanes are present but still blocked by NULL evidence |
| PHKD rule | Fail closed: unknown values remain NULL; unverifiable claims are not promoted |

The code, surfaces, and local evidence machinery are largely scaffolded and passing local checks. The customer release is blocked by evidence gaps, not by lack of UI or data-frame structure.

## 2. Top-Level Workspace Map

| Path | Purpose |
|---|---|
| `_radio_index/` | Source catalog, Suno backup, Stardust exports, lyrics, covers, release docs, proof inputs |
| `_non_suno/` | Non-Suno and reference audio separated from release catalog |
| `apps/web/` | Next.js customer/runtime/admin web application |
| `apps/desktop/` | Tauri desktop shell with mirrored radio-html assets and evidence |
| `apps/radio/` | Emerging radio app workspace |
| `apps/hkd3d-viewer/` | HKD3D viewer scaffold |
| `apps/hkd3d-designer/` | HKD3D designer scaffold |
| `apps/hkd3d-scene/` | HKD3D scene scaffold |
| `packages/shared/` | Shared schemas, data registries, runtime contracts |
| `packages/runtime/` | Runtime helpers |
| `packages/graph/` | Graph package scaffold |
| `packages/search/` | Search package scaffold |
| `integrations/hdfc-upi-parser/` | HDFC UPI parser and proof integration |
| `hkd3d/` | HKD3D evidence-first asset scaffold |
| `lipi/` | Lipi civilization/script records |
| `prisma/` | Persistence schema and migrations |
| `scripts/` | Automation, proof generation, promotion, Suno sync |
| `scripts/product-factory/` | Radio proof, release, milestone, and surface generators |
| `tests/` | Vitest suite and integration tests |

## 3. Current Surface Counts

| Surface Class | Count |
|---|---:|
| Next.js page definitions | 29 |
| Web standalone HTML files | 66 |
| Web data JSON frames | 44 |
| Desktop standalone HTML files | 63 |
| Desktop data JSON frames | 43 |

Note: `Radio_Vaigyaaniq_All_Html_Links.json` still reports 41 HTML links. The filesystem is newer than that catalog and should be regenerated.

## 4. Main Application Routes

### Core Routes

- `/`
- `/admin`
- `/dashboard`
- `/dictionary`
- `/governance`
- `/hkd-banners`
- `/lineage`
- `/projects/new`
- `/sprints`
- `/wireframes`

### Radio Routes

- `/radio`
- `/radio/frame`
- `/radio/runtime`
- `/radio/storyboard`

### Device Runtime Routes

- `/device`
- `/device/runtime`
- `/device/topology`
- `/device/evidence`

### Ayodhya Runtime Routes

- `/ayodhya`
- `/ayodhya/scripts`
- `/ayodhya/storyboards`
- `/ayodhya/images`
- `/ayodhya/videos`
- `/ayodhya/voice`
- `/ayodhya/lipsync`
- `/ayodhya/assets`
- `/ayodhya/characters`
- `/ayodhya/hkd3d`
- `/ayodhya/locations`
- `/ayodhya/bhakti`
- `/ayodhya/ramayana`
- `/ayodhya/phkd`
- `/ayodhya/studio`
- `/ayodhya/status`

### HKD3D Routes

- `/hkd3d`
- `/hkd3d/characters/[character]`
- `/hkd3d/stages/[stage]`

Character pages:

- `/hkd3d/characters/ram`
- `/hkd3d/characters/sita`
- `/hkd3d/characters/lakshman`
- `/hkd3d/characters/hanuman`
- `/hkd3d/characters/bharat`
- `/hkd3d/characters/shatrughna`
- `/hkd3d/characters/valmiki`
- `/hkd3d/characters/vishwamitra`

Stage pages:

- `/hkd3d/stages/base-human-model`
- `/hkd3d/stages/texture-system`
- `/hkd3d/stages/rig-system`
- `/hkd3d/stages/blendshapes`
- `/hkd3d/stages/animation-library`
- `/hkd3d/stages/facial-runtime`
- `/hkd3d/stages/lighting-runtime`
- `/hkd3d/stages/clothing-system`
- `/hkd3d/stages/hair-system`
- `/hkd3d/stages/export-runtime`

### Lipi Routes

- `/lipi`
- `/lipi/civilization`
- `/lipi/religion`
- `/lipi/language`
- `/lipi/script`
- `/lipi/glyph-atlas`
- `/lipi/ipa`
- `/lipi/timeline`
- `/lipi/manuscript`
- `/lipi/inscription`
- `/lipi/evidence`
- `/lipi/knowledge-graph`

### Universe Routes

- `/universes`
- `/universes/universal-knowledge-lineage-explorer`
- `/universes/pitra-universe`
- `/universes/guru-maataa-universe`
- `/universes/rishi-universe`
- `/universes/rishika-universe`
- `/universes/parampara-universe`
- `/universes/civilization-universe`
- `/universes/knowledge-universe`
- `/universes/subject-universe`
- `/universes/text-universe`
- `/universes/timeline-universe`
- `/universes/geography-universe`
- `/universes/knowledge-graph-universe`
- `/universes/education-universe`
- `/universes/research-universe`
- `/universes/community-universe`
- `/universes/media-universe`
- `/universes/ai-universe`
- `/universes/observatory-universe`
- `/universes/future-knowledge-universe`
- `/universes/governance-universe`
- `/universes/universal-command-center`

### Scope Routes

- `/scopes`
- `/scopes/all`
- `/scopes/pitra`
- `/scopes/guru-maataa`
- `/scopes/rishi`
- `/scopes/rishika`
- `/scopes/civilizations`
- `/scopes/subjects`
- `/scopes/texts`
- `/scopes/timeline`
- `/scopes/locations`
- `/scopes/institutions`
- `/scopes/discoveries`
- `/scopes/innovations`
- `/scopes/media`
- `/scopes/research`
- `/scopes/courses`
- `/scopes/lineages`
- `/scopes/relationships`
- `/scopes/audit`
- `/scopes/sanskrit-dictionary`
- Universe scope routes mirror the 22 universe slugs.

## 5. Standalone Radio HTML Surfaces

Primary archive:

- `/radio-html/index.html`
- `/radio-html/all-html.html`
- `/radio-html/Radio_Account.html`
- `/radio-html/Radio_Catalogue.html`
- `/radio-html/Radio_Completion_Status.html`
- `/radio-html/Radio_Pricing_Checkout.html`
- `/radio-html/Radio_Stations.html`
- `/radio-html/Radio_Vaigyaaniq_App_Prototype.html`
- `/radio-html/Radio_Vaigyaaniq_Full_App.html`
- `/radio-html/Radio_Vaigyaaniq_Maataa.html`
- `/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html`
- `/radio-html/Track_Onboarding.html`

Catalog, route, and asset surfaces:

- `/radio-html/routes/index.html`
- `/radio-html/routes/html-vs-real-route-matrix.html`
- `/radio-html/structure/index.html`
- `/radio-html/assets/index.html`
- `/radio-html/assets/evidence.html`

Proof and runtime surfaces:

- `/radio-html/surfaces/index.html`
- `/radio-html/surfaces/landing.html`
- `/radio-html/surfaces/image-landing.html`
- `/radio-html/surfaces/runtime.html`
- `/radio-html/surfaces/runtimes-workflows.html`
- `/radio-html/surfaces/runtime-data.html`
- `/radio-html/surfaces/audio-import.html`
- `/radio-html/surfaces/visual-qa.html`
- `/radio-html/surfaces/tauri-readiness.html`
- `/radio-html/surfaces/production-freeze.html`
- `/radio-html/surfaces/ascii-wireframes.html`
- `/radio-html/surfaces/visualizer.html`
- `/radio-html/surfaces/lyrics.html`
- `/radio-html/surfaces/tts.html`
- `/radio-html/surfaces/social-gift.html`
- `/radio-html/surfaces/storyboard.html`
- `/radio-html/surfaces/evidence-export.html`
- `/radio-html/surfaces/scaffold.html`
- `/radio-html/surfaces/rights-evidence.html`
- `/radio-html/surfaces/gift-payment-evidence.html`
- `/radio-html/surfaces/installer-evidence.html`
- `/radio-html/surfaces/release-review.html`
- `/radio-html/surfaces/no-ship-dashboard.html`
- `/radio-html/surfaces/rights-review.html`
- `/radio-html/surfaces/playback-gate.html`
- `/radio-html/surfaces/payment-proof.html`
- `/radio-html/surfaces/installer-pipeline.html`
- `/radio-html/surfaces/release-orchestration.html`
- `/radio-html/surfaces/desktop-alpha.html`
- `/radio-html/surfaces/device-runtime.html`
- `/radio-html/surfaces/customer-release.html`
- `/radio-html/surfaces/payment-proof-report.html`
- `/radio-html/surfaces/payment-proof-packet.html`
- `/radio-html/surfaces/payment-proof-import-templates.html`
- `/radio-html/surfaces/receipt-settlement-proof.html`
- `/radio-html/surfaces/webhook-signature-proof.html`
- `/radio-html/surfaces/release-review-board.html`
- `/radio-html/surfaces/release-review-packet.html`
- `/radio-html/surfaces/remaining-proof-packets.html`
- `/radio-html/surfaces/rights-closure.html`
- `/radio-html/surfaces/rights-closure-packet.html`
- `/radio-html/surfaces/rights-proof-import-templates.html`
- `/radio-html/surfaces/installer-signing-proof.html`
- `/radio-html/surfaces/signing-notarization-evidence.html`
- `/radio-html/surfaces/signing-proof-packet.html`
- `/radio-html/surfaces/evidence-refresh-command.html`

## 6. Evidence/Data Frames

Important current data frames:

- `apps/web/public/radio-html/data/milestone-completion.json`
- `apps/web/public/radio-html/data/customer-release-milestone.json`
- `apps/web/public/radio-html/data/release-orchestration-run.json`
- `apps/web/public/radio-html/data/playback-gate.json`
- `apps/web/public/radio-html/data/audio-import-manifest.json`
- `apps/web/public/radio-html/data/suno-library-catalog.json`
- `apps/web/public/radio-html/data/promotion-report.json`
- `apps/web/public/radio-html/data/rights-closure-report.json`
- `apps/web/public/radio-html/data/rights-closure-packet.json`
- `apps/web/public/radio-html/data/payment-proof-report.json`
- `apps/web/public/radio-html/data/payment-proof-packet.json`
- `apps/web/public/radio-html/data/release-review-report.json`
- `apps/web/public/radio-html/data/release-review-packet.json`
- `apps/web/public/radio-html/data/signing-notarization-evidence.json`
- `apps/web/public/radio-html/data/signing-proof-packet.json`
- `apps/web/public/radio-html/data/gui-smoke-evidence.json`
- `apps/web/public/radio-html/data/tauri-readiness.json`
- `apps/web/public/radio-html/data/installer-pipeline.json`
- `apps/web/public/radio-html/data/desktop-alpha-bundle.json`
- `apps/web/public/radio-html/data/device-runtime-evidence.json`
- `apps/web/public/radio-html/data/product-surface-matrix.json`
- `apps/web/public/radio-html/data/visual-qa.json`
- `apps/web/public/radio-html/data/visual-qa-validation-run.json`

## 7. Status Matrix

| Gate | Status | Ready | Blocked | Notes |
|---|---|---:|---:|---|
| Milestones | draft | 9 implemented draft | 9 evidence blocked | `productionReady = 0` |
| Customer release | blocked | 2 draft-pass | 8 blocked | `NO_SHIP` |
| Playback | blocked | 0 playable | 105 blocked | Rights proof not mapped/closed |
| Rights closure | blocked | 0 closed | 19 blocked | Missing source, creator, license, citation, reviewer, reviewedAt |
| Payment proof | blocked | 0 receipts | 5 states | Missing checkout, receipt, webhook, delivery proof |
| Release review | blocked | 0 verified | 23 blocked | Missing reviewer, reviewedAt, citation, reason |
| Signing/notarization | blocked | 2 checks passed | 6 blocked | No Developer ID/notarization proof |
| GUI smoke | blocked | 1 check passed | 8 blocked | No screenshot/reviewer/app-open proof |
| Device runtime | blocked | 4 routes present | 6 blocked capabilities | Hardware and telemetry proof NULL |
| Visual QA | draft validated | 25 pass | 0 blocked | Existing evidence validation only |
| Tauri readiness | draft blocked | 8 draft-ready | 11 blocked | Signing and proof gates open |

## 8. Audio and Catalog State

| Artifact | Current Count | State |
|---|---:|---|
| `suno-library-catalog.json` tracks | 1186 | Cataloged with local audio |
| `suno-library-catalog.json` with audio | 1186 | Present |
| `audio-import-manifest.json` imports | 105 | Stardust final package indexed |
| Local audio files indexed for playback gate | 105 | Present |
| Checksums present | 105 | Present |
| Playable audio | 0 | Blocked |
| Rights closed | 0 | Blocked |
| Release allowed | 0 | Blocked |
| `_radio_index/verified_v1.csv` rows | 1186 data rows | Exists, but not mapped to 105 Stardust records |

## 9. Known Mismatch To Fix

The verified list exists and contains Suno UUIDs. The active playback manifest contains 105 Stardust records with ids like `stardust-final-*` and no matching `sunoId`.

Current dry-run result:

```text
Eligible (verified): 0
Promoted: 0
Not verified: 105
```

This means the verified list cannot yet promote the active playback records. The next technical completion task is an ID bridge between:

- `_radio_index/verified_v1.csv`
- `apps/web/public/radio-html/data/suno-library-catalog.json`
- `apps/web/public/radio-html/data/audio-import-manifest.json`
- `_radio_index/stardust_import_final/stardust_import.csv`

## 10. Orchestration Status

Last recorded full release orchestration:

- Generated: `2026-06-25T14:08:13.974Z`
- Steps: 16
- Pass: 16
- Fail: 0
- Browser checks: 0

Passed orchestration steps:

- core-data
- next-milestones
- playback-gate
- desktop-signing
- sync-gui-evidence
- sync-signing-evidence
- proof-milestones
- payment-proof
- rights-packet
- rights-closure
- release-review
- remaining-packets
- customer-release
- hdfc-parser-tests
- tests
- build

Important: several commands pass as generators/verifiers while still producing blocked gate outputs. A passing command is not the same as production readiness.

## 11. Main Workflows

### Catalog and Playback Workflow

1. Sync or import Suno catalog.
2. Build or refresh Suno catalog data.
3. Build Stardust/audio import manifest.
4. Attach rights evidence.
5. Map verified rights to active playback records.
6. Promote verified records.
7. Run playback gate.
8. Keep unverified records `canPlay = false`.

### Rights Closure Workflow

1. Prepare rights closure packet.
2. Import proof records.
3. Match proof to release records.
4. Require source, creator, license, citation, reviewer, reviewedAt.
5. Mark closed only when audit is verified.

### Gift/Payment Proof Workflow

1. Capture gift intent.
2. Create checkout session.
3. Verify payment receipt.
4. Verify webhook signature.
5. Verify delivery/fulfillment.
6. Preserve audit trail.

### Release Review Workflow

1. Generate release review packet.
2. Assign reviewers.
3. Capture reviewedAt, reason, citation.
4. Mark verified or rejected.
5. Promote release only when all required reviews are complete.

### Desktop/Tauri Workflow

1. Build local desktop app.
2. Mirror radio-html assets/data.
3. Run GUI smoke proof.
4. Capture app-open and screenshot proof.
5. Sign installer.
6. Notarize.
7. Verify Gatekeeper/codesign.
8. Keep app as draft until proof closes.

## 12. Customer Release Blockers

| Blocker | Required Evidence |
|---|---|
| Playable audio blocked | Verified rights mapped to active 105 audio records |
| Rights closure blocked | Complete source, creator, license, citation, reviewer, reviewedAt |
| Payment proof blocked | Receipts, webhook signatures, delivery proof |
| Signing blocked | Developer ID, non-adhoc signature, notarization, Gatekeeper check |
| GUI smoke blocked | Screenshot, reviewer, first paint, navigation, no-crash, no-ship visible, audio gate visible |
| Release review blocked | Human approval evidence for 23 items |
| Device runtime blocked | Hardware, permissions, telemetry hash, reviewer evidence |
| Catalog link stale | Regenerate all-html links catalog from current 66 HTML files |

## 13. Recommended Next Batch

Priority order:

1. Build verified-list bridge for the 105 active playback records.
2. Rerun promotion dry-run and confirm `eligible > 0`.
3. Run live promotion only after dry-run confirms matched eligibility.
4. Rerun `npm run radio:playback:gate`.
5. Rerun `npm run radio:release:check`.
6. Regenerate `Radio_Vaigyaaniq_All_Html_Links.json` so it reflects 66 live HTML files.
7. Run GUI smoke and capture screenshots/reviewer proof.
8. Close signing/notarization proof lane.
9. Import payment receipts/webhook/delivery proof.
10. Run final customer release gate.

## 14. Canonical Commands

```bash
node scripts/promote-verified-tracks.mjs --dry-run --verified-list _radio_index/verified_v1.csv
npm run radio:promote -- --verified-list _radio_index/verified_v1.csv
npm run radio:playback:gate
npm run radio:release:check
```

Use these only after the verified-list bridge maps the CSV to the active playback records.

## 15. Current Final Decision

```text
shipDecision: NO_SHIP
productionReady: false
releaseAllowed: 0
playableAudio: 0
```

The project is structurally coherent, deeply scaffolded, and locally verifiable. The honest next phase is proof closure and ID mapping, not more UI expansion.
