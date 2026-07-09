# Components

Generated 2026-07-09T20:17:10.220Z from `registry/components.ts` — statuses evidence-backed.

| id | category | status | platforms | renders | implemented by |
|---|---|---|---|---|---|
| `player` | playback | ✅ built | web, mobile, desktop, offline, tv, car, watch | radio-track | `apps/web/public/radio-html/assets/js/radio-engine.js#playProgram` |
| `station-list` | navigation | ✅ built | web, mobile, desktop, tv | live-show | `apps/web/public/radio-html/assets/js/radio-engine.js#renderStations` |
| `schedule-list` | content | ✅ built | web, mobile, desktop | live-show, radio-track | `apps/web/public/radio-html/assets/js/radio-engine.js#renderSchedule` |
| `catalog-grid` | content | ✅ built | web, mobile, desktop | radio-track | `apps/web/public/radio-html/assets/js/radio-engine.js#renderCatalog` |
| `transcript` | content | ✅ built | web, mobile, desktop | transcript | `apps/web/public/radio-html/assets/js/radio-engine.js#loadLyrics` |
| `story-modal` | content | ✅ built | web, mobile, desktop | radio-track | `apps/web/public/radio-html/assets/js/radio-engine.js#openStory` |
| `wallet` | commerce | ✅ built | web, mobile, desktop | — | `apps/web/public/radio-html/assets/js/radio-engine.js#renderWallet` |
| `persona-select` | input | ✅ built | web, desktop | — | `apps/web/public/radio-html/assets/js/radio-engine.js#renderPersonas` |
| `weather-widget` | feedback | ✅ built | web, desktop, car | — | `apps/web/public/radio-html/assets/js/radio-engine.js#renderWeather` |
| `net-status` | feedback | ✅ built | web, mobile, desktop, offline | — | `apps/web/public/radio-html/assets/js/radio-engine.js#bindNetwork` |
| `admin-table` | data | ✅ built | web, desktop | — | `apps/web/public/radio-html/admin-panel.html` |
| `visualizer` | media | 🟡 partial | web, desktop, tv | — | `apps/web/public/radio-html/surfaces (radioVisualizer)` |
| `podcast-card` | content | ⬜ planned | web, mobile, desktop, car | podcast | — |
| `article` | content | ⬜ planned | web, mobile, desktop | article, research-paper | — |
| `chart` | data | ⬜ planned | web, desktop | dataset | — |
| `timeline` | content | ⬜ planned | web, mobile, desktop, tv | event, live-show | — |
| `waveform` | playback | ⬜ planned | web, mobile, desktop | radio-track, podcast | — |
| `quiz` | input | ⬜ planned | web, mobile, desktop | quiz | — |
| `course-card` | content | ⬜ planned | web, mobile, desktop | course | — |

Route → layout → component trees: `registry/component-trees.json`.
