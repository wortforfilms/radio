# Folder Report — for_radio
Generated: 2026-07-08 · **Status section updated 2026-07-10** · Total size: ~36 GB (excl. node_modules/.git)

## Release status (from `radio:release:check`, macOS run 2026-07-10)
- **15/16 command steps pass**, state **blocked** (NO_SHIP)
- Only command failure at last run: **desktop-signing** (1/8 proofs — needs
  signed artifact, codesign verification, Apple Developer ID, non-ad-hoc
  signature, Gatekeeper assessment, notarization, and reviewer proof)
- Build blocker fixed: root config now allows `.ts` extension imports and keeps
  self-governed desktop/radio app tsconfigs out of the root sweep.
- Gate-level blockers (evidence, not code): rights closure 19/19 blocked,
  payment proof 0 receipts/webhooks, release review 23/23 unapproved, GUI smoke
  1/9, customer release 0/9 verified → `releaseAllowed:false`
- Tests: 46 files / 202 passing · registry diff: 197 routes, 0 breaking
- Git: master/hardening branch at `5800584`+ (registry platform, agent phases
  0–10, SPA shell, accounts/auth, 458 preview clips, uniques target, storage +
  docs sanitation, build fix);
  all commits local — push to `wortforfilms/radio` pending

## Top-level documents
| File | Purpose |
|---|---|
| docs/runbooks/RADIO_RELEASE_ROADMAP.md | Master plan, Phases 0–7 (0/1/6 done; 2/3/4/5 await user evidence) |
| docs/runbooks/RIGHTS_CLOSURE_RUNBOOK.md | Rights lane commands (asset + audio) |
| docs/runbooks/PHASE_4_5_RUNBOOK.md | Packaging/signing + QA review steps |
| docs/specs/RADIO_COMMERCE_SPEC.md | Razorpay payments spec |
| docs/runbooks/RADIO_TRACK_ONBOARDING_SOP.md | Track ingestion SOP |
| docs/runbooks/RADIO_MEDIA_STORAGE.md | Media storage layout |
| docs/reports/RADIO_JOCKEY_TRANSCRIPTS.md | RJ transcript notes |
| docs/specs/RADIO_RECOLLECTED_STRUCTURE.md | Recovered app structure |
| docs/specs/RADIO_VAIGYAANIQ_BLUEPRINT.md | Product blueprint |
| docs/specs/IMPLEMENTATION_STRUCTURE.md / AGENTS.md | Repo layout + agent notes |
| package.json / tsconfig / vitest.config.ts / .env(.example) | Build config |

## Directories
| Dir | Size | Files | Contents |
|---|---|---|---|
| apps/ | 18 GB | 18,859 | `desktop` 11G (Tauri + radio-html surfaces), `web` 6.9G (Next.js), `radio` 3.2M (standalone Phase-6 scaffold), 3× hkd3d apps |
| _radio_index/ | 18 GB | 8,805 | Catalog + evidence hub: `suno_backup` 13G, `stardust_import*` ~4.7G, covers/lyrics/stations/playlists, Radio_Music_Catalog.xlsx, reviewers.json, rights-proof-assets.json (19/19 signed), release-review-approvals.json (20/23) |
| _non_suno/ | 126 MB | 20 | External/reference audio (incl. commercial tracks — **not rights-cleared**, e.g. Céline Dion rips, WhatsApp audio, ElevenLabs TTS) |
| integrations/ | 23 MB | 141 | hdfc-upi-parser (settlement reconciliation; needs Python ≥3.11) |
| scripts/ | 6.7 MB | 40 | suno-sync, promote-verified-tracks, rights/payment/release evidence orchestrators (product-factory/), media audit |
| prisma/ | 8.4 MB | 7 | schema + migrations + dev.db |
| packages/ | 5.5 MB | 35 | shared (commerce), runtime (storage), graph, search |
| hkd3d/ | 5.3 MB | 20 | 3D character assets (models/rig/blendshapes/animations) |
| tests/ | 4.5 MB | 27 | vitest suites (radio import, media storage, hkd3d, lipi, etc.) |
| lipi/ | 1.7 MB | 11 | civilizations script data |
| proposals/ | 384 KB | 1 | PRASAR_BHARATI_RADIO_VAIGYAANIQ_PROPOSAL.md |

## Media inventory (repo-wide, excl. node_modules)
- **5,643 mp3** · 3,546 jpeg + 1,733 jpg + 340 png (covers/art)
- Catalog: 1,186 Suno clips synced (audio + 1,182 covers + lyrics), indexed in audio-import-manifest (1,291 records)

## Notes / risks
- 13 GB `suno_backup` + ~4.7 GB of four overlapping `stardust_import*` folders — dedupe candidates (~1.9 GB likely redundant among final/deduped/import copies).
- `_non_suno` contains copyrighted commercial audio; keep out of any release/promotion path (pipeline is fail-closed, but worth flagging).
- `.~lock.Radio_Music_Catalog.xlsx#` — stale LibreOffice lock file, safe to delete.
- Pending user actions for ship: rights-closure run, Razorpay keys + 1 real txn, signing cert, final review sign-off.
