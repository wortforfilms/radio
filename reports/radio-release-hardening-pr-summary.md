# PR summary — chore/radio-release-hardening

Prepared: 2026-07-10 · Base: `5800584` (master) · Repo: wortforfilms/radio

## Branch

`chore/radio-release-hardening`

## Commits

| hash | subject |
|---|---|
| `3d1a07c` | feat(release): fail closed on evidence gates |
| `2e8f7de` | docs(release): clarify blocked evidence lanes |
| `75ec2b1` | chore(radio): refresh release evidence artifacts |

## Files changed

29 files · +2,523 / −159. Concentration: release-evidence data mirrors
(web + desktop `radio-html/data`, 12 files), the release evidence orchestrator
(`scripts/product-factory/radio-release-evidence-orchestrator.mjs`, +141),
runbook/spec/report docs (5), registry artifacts (2), proof-milestone tests (1).

## Commands run (validation, 2026-07-10)

| command | where | result |
|---|---|---|
| `npm run radio:registry` | sandbox (pure node) | pass — 197 routes, 248n/452e graph, registry valid |
| `npm run radio:registry:diff` | sandbox | pass — 0 added / 0 removed / 0 changed / 0 breaking (exit 0) |
| `npm run radio:content` | sandbox | pass — 1,186 tracks, 452 version groups, 1,158 LRC, 16 redactions (timestamp-only regenerations restored to keep this PR reports-only) |
| `npm run radio:seed:dry` | sandbox | pass — 7 stations / 1,186 tracks / 1,186 unique slugs / 0 problems |
| `npx vitest run` | macOS (operator, 2026-07-10) | pass — 46 files / 202 tests (native binding unavailable in sandbox) |
| `npm run radio:release:check` | macOS (operator, 2026-07-10; evidence committed at `75ec2b1`) | **blocked** — see gates |

## Release check result

15/16 command steps pass · 1 fail (`desktop-signing`, 1/8 proofs — Apple
Developer ID required) · 6/6 evidence gates blocked · state `blocked`.

- `shipDecision = NO_SHIP`
- `productionReady = false`
- `releaseAllowed = false`

## Evidence gate table

| gate | status | detail |
|---|---|---|
| Rights | **BLOCKED** | 19/19 records missing source/creator/license/citation/reviewer/reviewedAt; audit unverified; 0 releaseAllowed |
| Payment | **BLOCKED** | 0 checkout sessions · 0 receipts · 0 webhook events · 0 fulfilled gifts · 5 states blocked |
| Signing | **BLOCKED** | 1/8 proofs — missing artifact, codesign-verify, developer-id, not-adhoc, gatekeeper, notarization, reviewer |
| GUI smoke | **BLOCKED** | 1/9 checks · 0 screenshots · 0 reviewers · 0 app-open proof |
| Release review | **BLOCKED** | 23/23 items missing reviewer/reviewedAt/citation/reason; audit unverified |
| Production go-live | **BLOCKED** | 0/9 gates verified → releaseAllowed=false |

Playback gate (downstream of rights): 105 local audio candidates indexed,
0 rights-verified, 0 playable.

## Operator evidence still required (exact)

See `reports/radio-operator-evidence-checklist.md` for the field-level list.
In one line each: (A) 19 rights records with full provenance + verified audit;
(B) one real ₹10 checkout with receipt, signature-verified webhook, delivery
proof and audit row; (C) a signed + notarized artifact with Developer ID,
codesign/Gatekeeper/stapler verification and reviewer; (D) GUI smoke
screenshots (launch, preview gate, navigation) with no-crash proof and error
review; (E) all 23 release-review approvals with reviewer/reviewedAt/citation/
reason and audit verification.

## Final decision

**NO_SHIP** — unchanged, fail-closed.

## PHKD note

No fake rights, payment, signing, live-stream, reviewer, or production claims
were added anywhere in this branch. All gate states derive from real evidence
files; blocked lanes remain blocked; `productionReady`, `releaseAllowed`, and
`shipDecision` were not flipped and cannot flip without verified proofs.
