// Registry module: Podcast (9 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] =  [
  {
    "id": "podcasts",
    "path": "/podcasts",
    "title": "Podcasts",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🎙",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Podcasts · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts"
      ],
      "canonical": "/podcasts",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Podcasts",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Podcasts",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts",
      "event": "view_podcasts",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "hub",
      "planned"
    ],
    "dynamic": false,
    "contentType": "podcast"
  },
  {
    "id": "podcasts.trending",
    "path": "/podcasts/trending",
    "title": "Trending",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "trending",
    "status": "planned",
    "layout": "article",
    "icon": "🎙",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Trending · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "trending"
      ],
      "canonical": "/podcasts/trending",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Trending",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Trending",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.trending",
      "event": "view_podcasts_trending",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "trending",
      "planned"
    ],
    "dynamic": false,
    "contentType": "podcast"
  },
  {
    "id": "podcasts.latest",
    "path": "/podcasts/latest",
    "title": "Latest",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "latest",
    "status": "planned",
    "layout": "article",
    "icon": "🎙",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Latest · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "latest"
      ],
      "canonical": "/podcasts/latest",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Latest",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Latest",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.latest",
      "event": "view_podcasts_latest",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "latest",
      "planned"
    ],
    "dynamic": false,
    "contentType": "podcast"
  },
  {
    "id": "podcasts.categories",
    "path": "/podcasts/categories",
    "title": "Categories",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "categories",
    "status": "planned",
    "layout": "article",
    "icon": "🎙",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Categories · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "categories"
      ],
      "canonical": "/podcasts/categories",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Categories",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Categories",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.categories",
      "event": "view_podcasts_categories",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "categories",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "podcasts.detail",
    "path": "/podcasts/:slug",
    "title": "Slug",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "slug",
    "status": "planned",
    "layout": "player",
    "icon": "🎙",
    "searchable": false,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Slug · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "slug"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Slug",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Slug",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.detail",
      "event": "view_podcasts_detail",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "slug",
      "planned"
    ],
    "dynamic": true,
    "contentType": "podcast"
  },
  {
    "id": "podcasts.transcript",
    "path": "/podcasts/:slug/transcript",
    "title": "Transcript",
    "description": "Transcript tooling exists for tracks; podcast catalogue itself is NULL.",
    "section": "Podcast",
    "category": "slug",
    "status": "partial",
    "layout": "player",
    "icon": "🎙",
    "searchable": false,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Transcript · Radio Vaigyaaniq",
      "description": "Transcript tooling exists for tracks; podcast catalogue itself is NULL.",
      "keywords": [
        "podcast",
        "podcasts",
        "slug",
        "transcript"
      ],
      "canonical": null,
      "robots": "index,follow",
      "openGraph": {
        "title": "Transcript",
        "description": "Transcript tooling exists for tracks; podcast catalogue itself is NULL.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Transcript",
        "description": "Transcript tooling exists for tracks; podcast catalogue itself is NULL."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.transcript",
      "event": "view_podcasts_transcript",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "docs/reports/RADIO_JOCKEY_TRANSCRIPTS.md",
      "radio-html/data/lyrics-prompter-data.json"
    ],
    "evidence": [
      {
        "artifact": "docs/reports/RADIO_JOCKEY_TRANSCRIPTS.md",
        "kind": "doc"
      },
      {
        "artifact": "radio-html/data/lyrics-prompter-data.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "podcast",
      "slug",
      "partial"
    ],
    "dynamic": true,
    "contentType": "transcript"
  },
  {
    "id": "podcasts.chapters",
    "path": "/podcasts/:slug/chapters",
    "title": "Chapters",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "slug",
    "status": "planned",
    "layout": "player",
    "icon": "🎙",
    "searchable": false,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Chapters · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "slug",
        "chapters"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Chapters",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Chapters",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.chapters",
      "event": "view_podcasts_chapters",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "slug",
      "planned"
    ],
    "dynamic": true,
    "contentType": "podcast"
  },
  {
    "id": "podcasts.discussion",
    "path": "/podcasts/:slug/discussion",
    "title": "Discussion",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "slug",
    "status": "planned",
    "layout": "player",
    "icon": "🎙",
    "searchable": false,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Discussion · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "slug",
        "discussion"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Discussion",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Discussion",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.discussion",
      "event": "view_podcasts_discussion",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "slug",
      "planned"
    ],
    "dynamic": true
  },
  {
    "id": "podcasts.bookmark",
    "path": "/podcasts/bookmark",
    "title": "Bookmark",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Podcast",
    "category": "bookmark",
    "status": "planned",
    "layout": "article",
    "icon": "🎙",
    "searchable": false,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "car"
    ],
    "permissions": [
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Bookmark · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "podcast",
        "podcasts",
        "bookmark"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Bookmark",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Bookmark",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "podcasts.bookmark",
      "event": "view_podcasts_bookmark",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "podcast",
      "bookmark",
      "planned"
    ],
    "dynamic": false
  }
];
