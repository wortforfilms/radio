# Routes

Generated 2026-08-30T17:53:13.400Z from `apps/radio/registry` — do not edit by hand.

Total **197** routes · 6 built · 51 partial · 140 planned.

## 🌐 Public Website

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `public.home` | `/` | ✅ built | landing | — | anonymous | — |
| `public.about` | `/about` | ⬜ planned | landing | — | anonymous | — |
| `public.mission` | `/mission` | ⬜ planned | landing | — | anonymous | — |
| `public.vision` | `/vision` | ⬜ planned | landing | — | anonymous | — |
| `public.science-for-bharat` | `/science-for-bharat` | ⬜ planned | landing | — | anonymous | — |
| `public.contact` | `/contact` | ⬜ planned | landing | — | anonymous | — |
| `public.partners` | `/partners` | ⬜ planned | landing | — | anonymous | — |
| `public.sponsors` | `/sponsors` | ⬜ planned | landing | — | anonymous | — |
| `public.careers` | `/careers` | ⬜ planned | landing | — | anonymous | — |
| `public.press` | `/press` | ⬜ planned | landing | — | anonymous | — |
| `public.privacy` | `/privacy` | ⬜ planned | landing | — | anonymous | — |
| `public.terms` | `/terms` | ⬜ planned | landing | — | anonymous | — |
| `public.accessibility` | `/accessibility` | ⬜ planned | landing | — | anonymous | — |
| `public.donate` | `/donate` | ⬜ planned | landing | — | anonymous | — |

## 📻 Radio

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `radio` | `/radio` | ✅ built | landing | — | anonymous | — |
| `radio.live` | `/radio/live` | 🟡 partial | player | live-show | anonymous | — |
| `radio.now-playing` | `/radio/now-playing` | ✅ built | player | radio-track | anonymous | — |
| `radio.schedule` | `/radio/schedule` | 🟡 partial | article | live-show | anonymous | — |
| `radio.frequencies` | `/radio/frequencies` | ⬜ planned | article | — | anonymous | — |
| `radio.shows` | `/radio/shows` | 🟡 partial | article | live-show | anonymous | — |
| `radio.shows.detail` | `/radio/shows/:slug` | 🟡 partial | article | live-show | anonymous | — |
| `radio.rj` | `/radio/rj/:slug` | 🟡 partial | article | — | anonymous | — |
| `radio.archive` | `/radio/archive` | ✅ built | article | radio-track | anonymous | — |
| `radio.request` | `/radio/request` | ⬜ planned | article | — | anonymous | — |
| `radio.dedicate` | `/radio/dedicate` | ⬜ planned | article | — | anonymous | — |
| `radio.download` | `/radio/download` | 🟡 partial | article | radio-track | anonymous | — |
| `radio.programs` | `/radio/programs/:date/:slug` | 🟡 partial | article | live-show | anonymous | — |

## 🎙 Podcast

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `podcasts` | `/podcasts` | ⬜ planned | landing | podcast | anonymous | — |
| `podcasts.trending` | `/podcasts/trending` | ⬜ planned | article | podcast | anonymous | — |
| `podcasts.latest` | `/podcasts/latest` | ⬜ planned | article | podcast | anonymous | — |
| `podcasts.categories` | `/podcasts/categories` | ⬜ planned | article | — | anonymous | — |
| `podcasts.detail` | `/podcasts/:slug` | ⬜ planned | player | podcast | anonymous | — |
| `podcasts.transcript` | `/podcasts/:slug/transcript` | 🟡 partial | player | transcript | anonymous | — |
| `podcasts.chapters` | `/podcasts/:slug/chapters` | ⬜ planned | player | podcast | anonymous | — |
| `podcasts.discussion` | `/podcasts/:slug/discussion` | ⬜ planned | player | — | anonymous | — |
| `podcasts.bookmark` | `/podcasts/bookmark` | ⬜ planned | article | — | listener | — |

## 🔬 Research Hub

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `research` | `/research` | ⬜ planned | landing | — | anonymous | — |
| `research.publications` | `/research/publications` | ⬜ planned | article | research-paper | anonymous | — |
| `research.papers` | `/research/papers` | ⬜ planned | article | research-paper | anonymous | — |
| `research.datasets` | `/research/datasets` | 🟡 partial | article | dataset | anonymous | — |
| `research.experiments` | `/research/experiments` | ⬜ planned | article | — | anonymous | — |
| `research.projects` | `/research/projects` | ⬜ planned | article | — | anonymous | — |
| `research.labs` | `/research/labs` | ⬜ planned | article | — | anonymous | — |
| `research.authors` | `/research/authors` | ⬜ planned | article | — | anonymous | — |
| `research.citations` | `/research/citations` | ⬜ planned | article | research-paper | anonymous | — |
| `research.downloads` | `/research/downloads` | ⬜ planned | article | dataset | anonymous | — |

## 🛰 Science Categories

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `discover` | `/discover` | ⬜ planned | landing | — | anonymous | — |
| `discover.space` | `/discover/space` | ⬜ planned | article | — | anonymous | — |
| `discover.astronomy` | `/discover/astronomy` | ⬜ planned | article | — | anonymous | — |
| `discover.physics` | `/discover/physics` | ⬜ planned | article | — | anonymous | — |
| `discover.chemistry` | `/discover/chemistry` | ⬜ planned | article | — | anonymous | — |
| `discover.biology` | `/discover/biology` | ⬜ planned | article | — | anonymous | — |
| `discover.mathematics` | `/discover/mathematics` | ⬜ planned | article | — | anonymous | — |
| `discover.medicine` | `/discover/medicine` | ⬜ planned | article | — | anonymous | — |
| `discover.agriculture` | `/discover/agriculture` | ⬜ planned | article | — | anonymous | — |
| `discover.environment` | `/discover/environment` | ⬜ planned | article | — | anonymous | — |
| `discover.climate` | `/discover/climate` | ⬜ planned | article | — | anonymous | — |
| `discover.robotics` | `/discover/robotics` | ⬜ planned | article | — | anonymous | — |
| `discover.ai` | `/discover/ai` | ⬜ planned | article | — | anonymous | — |
| `discover.history-of-science` | `/discover/history-of-science` | ⬜ planned | article | — | anonymous | — |
| `discover.sanskrit-science` | `/discover/sanskrit-science` | 🟡 partial | article | — | anonymous | — |
| `discover.innovation` | `/discover/innovation` | ⬜ planned | article | — | anonymous | — |
| `discover.startups` | `/discover/startups` | ⬜ planned | article | — | anonymous | — |
| `discover.student` | `/discover/student` | ⬜ planned | article | — | anonymous | — |

## 🎓 Academy

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `academy` | `/academy` | ⬜ planned | landing | — | anonymous | academy |
| `academy.courses` | `/academy/courses` | ⬜ planned | article | course | anonymous | academy |
| `academy.course` | `/academy/course/:slug` | ⬜ planned | reader | course | anonymous | academy |
| `academy.lessons` | `/academy/lessons` | ⬜ planned | article | course | anonymous | academy |
| `academy.quizzes` | `/academy/quizzes` | ⬜ planned | article | quiz | anonymous | academy |
| `academy.tests` | `/academy/tests` | ⬜ planned | article | quiz | anonymous | academy |
| `academy.certificates` | `/academy/certificates` | ⬜ planned | article | — | anonymous | academy |
| `academy.my-learning` | `/academy/my-learning` | ⬜ planned | article | — | listener | academy |
| `academy.leaderboard` | `/academy/leaderboard` | ⬜ planned | article | — | anonymous | academy |

## 👥 Community

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `community` | `/community` | ⬜ planned | landing | — | anonymous | — |
| `community.discussions` | `/community/discussions` | ⬜ planned | article | — | anonymous | — |
| `community.questions` | `/community/questions` | ⬜ planned | article | — | anonymous | — |
| `community.polls` | `/community/polls` | ⬜ planned | article | — | anonymous | — |
| `community.events` | `/community/events` | ⬜ planned | article | — | anonymous | — |
| `community.clubs` | `/community/clubs` | ⬜ planned | article | — | anonymous | — |
| `community.challenges` | `/community/challenges` | ⬜ planned | article | — | anonymous | — |
| `community.leaderboard` | `/community/leaderboard` | ⬜ planned | article | — | anonymous | — |
| `community.profile` | `/community/profile/:username` | ⬜ planned | article | — | listener | — |

## 📅 Events

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `events` | `/events` | ⬜ planned | landing | event | anonymous | events |
| `events.live` | `/events/live` | ⬜ planned | article | — | anonymous | events |
| `events.upcoming` | `/events/upcoming` | ⬜ planned | article | event | anonymous | events |
| `events.calendar` | `/events/calendar` | ⬜ planned | article | — | anonymous | events |
| `events.workshops` | `/events/workshops` | ⬜ planned | article | event | anonymous | events |
| `events.webinars` | `/events/webinars` | ⬜ planned | article | event | anonymous | events |
| `events.hackathons` | `/events/hackathons` | ⬜ planned | article | event | anonymous | events |
| `events.science-fairs` | `/events/science-fairs` | ⬜ planned | article | event | anonymous | events |

## 📰 News

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `news` | `/news` | ⬜ planned | article | article | anonymous | — |
| `news.science` | `/news/science` | ⬜ planned | article | article | anonymous | — |
| `news.space` | `/news/space` | ⬜ planned | article | article | anonymous | — |
| `news.technology` | `/news/technology` | ⬜ planned | article | article | anonymous | — |
| `news.agriculture` | `/news/agriculture` | ⬜ planned | article | article | anonymous | — |
| `news.india` | `/news/india` | ⬜ planned | article | article | anonymous | — |
| `news.world` | `/news/world` | ⬜ planned | article | article | anonymous | — |
| `news.videos` | `/news/videos` | ⬜ planned | article | — | anonymous | — |

## 🎥 Media

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `media.videos` | `/videos` | 🟡 partial | player | — | anonymous | — |
| `media.shorts` | `/shorts` | ⬜ planned | player | — | anonymous | — |
| `media.gallery` | `/gallery` | 🟡 partial | landing | — | anonymous | — |
| `media.infographics` | `/infographics` | ⬜ planned | landing | — | anonymous | — |
| `media.animations` | `/animations` | ⬜ planned | landing | — | anonymous | — |
| `media.livestreams` | `/livestreams` | ⬜ planned | player | — | anonymous | — |

## 🤖 AI

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `ai` | `/ai` | ⬜ planned | landing | — | anonymous | labs |
| `ai.rj` | `/ai/rj` | 🟡 partial | article | — | anonymous | — |
| `ai.chat` | `/ai/chat` | 🟡 partial | article | — | anonymous | — |
| `ai.translator` | `/ai/translator` | ⬜ planned | article | — | anonymous | labs |
| `ai.summarizer` | `/ai/summarizer` | ⬜ planned | article | — | anonymous | labs |
| `ai.transcript` | `/ai/transcript` | 🟡 partial | reader | transcript | anonymous | — |
| `ai.recommendations` | `/ai/recommendations` | ⬜ planned | article | — | anonymous | labs |
| `ai.search` | `/ai/search` | 🟡 partial | article | — | anonymous | — |

## 🔍 Search

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `search` | `/search` | 🟡 partial | dashboard | — | anonymous | — |
| `search.radio` | `/search/radio` | 🟡 partial | dashboard | — | anonymous | — |
| `search.podcasts` | `/search/podcasts` | ⬜ planned | dashboard | — | anonymous | — |
| `search.research` | `/search/research` | ⬜ planned | dashboard | — | anonymous | — |
| `search.news` | `/search/news` | ⬜ planned | dashboard | — | anonymous | — |
| `search.people` | `/search/people` | ⬜ planned | dashboard | — | anonymous | — |

## 👤 User

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `user.login` | `/login` | 🟡 partial | landing | — | anonymous | — |
| `user.signup` | `/signup` | 🟡 partial | landing | — | anonymous | — |
| `user.forgot-password` | `/forgot-password` | 🟡 partial | landing | — | anonymous | — |
| `user.verify` | `/verify` | ⬜ planned | landing | — | anonymous | — |
| `user.profile` | `/profile` | 🟡 partial | settings | — | listener | — |
| `user.profile.edit` | `/profile/edit` | ⬜ planned | settings | — | listener | — |
| `user.bookmarks` | `/bookmarks` | ⬜ planned | landing | — | listener | — |
| `user.history` | `/history` | 🟡 partial | landing | — | listener | — |
| `user.downloads` | `/downloads` | 🟡 partial | landing | — | listener | — |
| `user.notifications` | `/notifications` | ⬜ planned | settings | — | listener | — |
| `user.settings` | `/settings` | 🟡 partial | settings | — | listener | — |

## 💎 Premium

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `premium` | `/premium` | 🟡 partial | landing | — | anonymous | premium |
| `premium.plans` | `/premium/plans` | 🟡 partial | article | — | anonymous | premium |
| `premium.payment` | `/premium/payment` | 🟡 partial | article | — | anonymous | premium |
| `premium.history` | `/premium/history` | 🟡 partial | article | — | listener | premium |
| `premium.library` | `/premium/library` | 🟡 partial | article | — | listener | premium |

## 📊 Analytics

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `analytics` | `/analytics` | 🟡 partial | dashboard | — | admin, superadmin | — |
| `analytics.listeners` | `/analytics/listeners` | ⬜ planned | dashboard | — | admin, superadmin | — |
| `analytics.live` | `/analytics/live` | ⬜ planned | dashboard | — | admin, superadmin | — |
| `analytics.streams` | `/analytics/streams` | ⬜ planned | dashboard | — | admin, superadmin | — |
| `analytics.content` | `/analytics/content` | ⬜ planned | dashboard | — | admin, superadmin | — |
| `analytics.geography` | `/analytics/geography` | ⬜ planned | dashboard | — | admin, superadmin | — |
| `analytics.revenue` | `/analytics/revenue` | ⬜ planned | dashboard | — | admin, superadmin | — |

## 🎛 Studio

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `studio` | `/studio` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.live` | `/studio/live` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.record` | `/studio/record` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.upload` | `/studio/upload` | 🟡 partial | studio | — | creator, editor, admin | — |
| `studio.editor` | `/studio/editor` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.script` | `/studio/script` | 🟡 partial | studio | — | creator, editor, admin | — |
| `studio.caller` | `/studio/caller` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.queue` | `/studio/queue` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.automation` | `/studio/automation` | ⬜ planned | studio | — | creator, editor, admin | — |
| `studio.assets` | `/studio/assets` | 🟡 partial | studio | — | creator, editor, admin | — |

## 🗂 Content Management

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `cms` | `/cms` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.dashboard` | `/cms/dashboard` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.articles` | `/cms/articles` | ⬜ planned | admin | — | editor, admin, superadmin | — |
| `cms.shows` | `/cms/shows` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.podcasts` | `/cms/podcasts` | ⬜ planned | admin | — | editor, admin, superadmin | — |
| `cms.research` | `/cms/research` | ⬜ planned | admin | — | editor, admin, superadmin | — |
| `cms.media` | `/cms/media` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.users` | `/cms/users` | ⬜ planned | admin | — | editor, admin, superadmin | — |
| `cms.comments` | `/cms/comments` | ⬜ planned | admin | — | editor, admin, superadmin | — |
| `cms.moderation` | `/cms/moderation` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.workflows` | `/cms/workflows` | 🟡 partial | admin | — | editor, admin, superadmin | — |
| `cms.scheduler` | `/cms/scheduler` | 🟡 partial | admin | — | editor, admin, superadmin | — |

## ⚙ Administration

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `admin` | `/admin` | ✅ built | admin | — | admin, superadmin | — |
| `admin.users` | `/admin/users` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.roles` | `/admin/roles` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.permissions` | `/admin/permissions` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.api` | `/admin/api` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.settings` | `/admin/settings` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.logs` | `/admin/logs` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.audit` | `/admin/audit` | 🟡 partial | admin | — | admin, superadmin | — |
| `admin.security` | `/admin/security` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.storage` | `/admin/storage` | 🟡 partial | admin | — | admin, superadmin | — |
| `admin.backups` | `/admin/backups` | ⬜ planned | admin | — | admin, superadmin | — |
| `admin.integrations` | `/admin/integrations` | 🟡 partial | admin | — | admin, superadmin | — |
| `admin.registry-explorer` | `/admin/registry-explorer` | ✅ built | admin | — | admin, superadmin | — |

## 🔌 API

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `api.auth` | `/api/v1/auth` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.radio` | `/api/v1/radio` | 🟡 partial | fullscreen | — | anonymous | — |
| `api.podcasts` | `/api/v1/podcasts` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.research` | `/api/v1/research` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.news` | `/api/v1/news` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.events` | `/api/v1/events` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.community` | `/api/v1/community` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.search` | `/api/v1/search` | 🟡 partial | fullscreen | — | anonymous | — |
| `api.analytics` | `/api/v1/analytics` | 🟡 partial | fullscreen | — | anonymous | — |
| `api.upload` | `/api/v1/upload` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.notifications` | `/api/v1/notifications` | ⬜ planned | fullscreen | — | anonymous | — |
| `api.payments` | `/api/v1/payments` | 🟡 partial | fullscreen | — | anonymous | — |

## 🌐 Ecosystem Integration

| id | path | status | layout | content type | permissions | flags |
|---|---|---|---|---|---|---|
| `ecosystem` | `/ecosystem` | ⬜ planned | landing | — | anonymous | — |
| `ecosystem.nlm` | `/ecosystem/nlm` | ⬜ planned | article | — | anonymous | — |
| `ecosystem.cic` | `/ecosystem/cic` | ⬜ planned | article | — | anonymous | — |
| `ecosystem.shree-kautilya` | `/ecosystem/shree-kautilya` | ⬜ planned | article | — | anonymous | — |
| `ecosystem.lipi` | `/ecosystem/lipi` | 🟡 partial | article | — | anonymous | — |
| `ecosystem.maataa` | `/ecosystem/maataa` | 🟡 partial | article | — | anonymous | — |
| `ecosystem.corpus` | `/ecosystem/corpus` | 🟡 partial | article | — | anonymous | — |
| `ecosystem.apis` | `/ecosystem/apis` | ⬜ planned | article | — | anonymous | — |
| `ecosystem.developers` | `/ecosystem/developers` | ⬜ planned | article | — | anonymous | — |
