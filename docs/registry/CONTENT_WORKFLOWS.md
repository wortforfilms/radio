# Content Types & Workflows

Generated 2026-07-09T20:22:28.676Z.

## Content types

| id | status | workflow | fields |
|---|---|---|---|
| `radio-track` | ✅ built | rights-closure | 13 |
| `transcript` | 🟡 partial | editorial | 5 |
| `live-show` | 🟡 partial | editorial | 5 |
| `podcast` | ⬜ planned | editorial | 8 |
| `research-paper` | ⬜ planned | editorial | 6 |
| `dataset` | ⬜ planned | editorial | 5 |
| `article` | ⬜ planned | editorial | 5 |
| `event` | ⬜ planned | editorial | 5 |
| `course` | ⬜ planned | editorial | 4 |
| `quiz` | ⬜ planned | editorial | 3 |

## Workflow: Editorial

Standard content lifecycle for podcasts, articles, events, courses.

States: draft → review → approved → scheduled → published → archived

| from | to | requires | roles |
|---|---|---|---|
| draft | review | content-complete | creator, editor |
| review | approved | reviewer-signoff | editor, moderator |
| review | draft | — | editor, moderator |
| approved | scheduled | publish-window-set | editor |
| approved | published | — | editor, admin |
| scheduled | published | publish-window-reached | editor, admin |
| published | archived | — | editor, admin |
| archived | draft | — | admin |

## Workflow: Rights Closure (PHKD)

Fail-closed track lane: no publish without a verified rights proof + entitlement gates.

States: draft → rights-review → rights-verified → published → archived

| from | to | requires | roles |
|---|---|---|---|
| draft | rights-review | rights-proof-uploaded | editor, admin |
| rights-review | rights-verified | radio:rights:closure verifier pass | admin |
| rights-verified | published | admin publish intent; verified rights proof (enforced by manifest builder) | admin, superadmin |
| published | archived | — | admin |
