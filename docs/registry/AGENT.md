# Radio as an Agent

Generated 2026-07-09T19:47:38.693Z from `registry/agent.ts` — do not edit by hand.

The agent is a fail-closed co-pilot: perception (listener context, manifest,
weather gate) → rule-based cognition (LLM opt-in via `AGENT_LLM_PROVIDER`) →
actions executed by the existing engine. It never fabricates, never bypasses
rights, never hides monetisation, and always discloses itself.

## Policy

- Disclosure: “— announcement by the AI Radio Assistant (rule-based).”
- Personas by daypart: morning → maataa · day → samaya · evening → rishi · night → vigyaaniq
- Stations by daypart: morning → sanatan-devotional/classical-raga · day → folk-regional/hip-hop-rap/electronic-fusion · evening → classical-raga/sufi-qawwali · night → electronic-fusion/cinematic-other
- Upsell only after 3 previews · max 6 announcements/hour

### Constitution

- Never claim anything not present in the manifest/content library (PHKD).
- Never play a track outside its commerce access state.
- Every spoken output ends with the AI disclosure.
- Ads stay blocked without verified inventory.
- Purchases are suggestions routed through the existing checkout — never executed by the agent.
- LLM cognition is opt-in via AGENT_LLM_PROVIDER; absent provider ⇒ rule engine only.

## Capabilities

| id | status | gates | personas |
|---|---|---|---|
| `select-station` | ✅ built | station exists in manifest | — |
| `play-track` | ✅ built | accessState(full|preview) via commerce rules; never plays locked/unpublished-claimed content | — |
| `announce` | ✅ built | text derived from manifest fields only — no fabricated claims; AI disclosure appended; rate-limited (maxAnnouncementsPerHour) | maataa, rishi, samaya, vigyaaniq |
| `recommend` | ✅ built | recommendations limited to real catalogue entries | samaya |
| `suggest-purchase` | ✅ built | only after upsellAfterPreviews previews of the same track; price shown from commerce defaults; checkout via existing /api/payments/order only; disclosed as a suggestion, never auto-purchased | samaya, vigyaaniq |
| `weather-brief` | ✅ built | only when /api/weather returns status ok — never fabricated | samaya |
| `insert-ad` | ⬜ planned | BLOCKED: requires rights-verified ad inventory + ENABLE_ADS=1 (none exists) | — |
| `answer-question` | 🟡 partial | AGENT_LLM_PROVIDER + key configured, else blocked-llm-provider-null; zero retrieved sources ⇒ exact honest fallback, LLM not called; model output must be valid structured JSON or nothing executes; play/recommend ids validated against manifest + commerce access; provider disclosure appended server-side to every spoken text | maataa, rishi, samaya, vigyaaniq |
| `run-quiz` | ⬜ planned | BLOCKED: quiz content type has no real content yet | vigyaaniq |
| `compose-content` | ⬜ planned | BLOCKED: requires generation provider + rights lane for generated output | — |

## API

- `POST /agent/decide` — perception in, validated actions out (radio-backend)
- `GET /agent/capabilities` — this policy document
