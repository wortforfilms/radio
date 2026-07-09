// Registry module: News (8 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "news",
    "path": "/news",
    "title": "News",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "hub",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
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
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "News · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news"
      ],
      "canonical": "/news",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "News",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "News",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news",
      "event": "view_news",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.science",
    "path": "/news/science",
    "title": "Science",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "science",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Science · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "science"
      ],
      "canonical": "/news/science",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Science",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Science",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.science",
      "event": "view_news_science",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "science",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.space",
    "path": "/news/space",
    "title": "Space",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "space",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Space · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "space"
      ],
      "canonical": "/news/space",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Space",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Space",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.space",
      "event": "view_news_space",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "space",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.technology",
    "path": "/news/technology",
    "title": "Technology",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "technology",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Technology · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "technology"
      ],
      "canonical": "/news/technology",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Technology",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Technology",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.technology",
      "event": "view_news_technology",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "technology",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.agriculture",
    "path": "/news/agriculture",
    "title": "Agriculture",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "agriculture",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Agriculture · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "agriculture"
      ],
      "canonical": "/news/agriculture",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Agriculture",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Agriculture",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.agriculture",
      "event": "view_news_agriculture",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "agriculture",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.india",
    "path": "/news/india",
    "title": "India",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "india",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "India · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "india"
      ],
      "canonical": "/news/india",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "India",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "India",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.india",
      "event": "view_news_india",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "india",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.world",
    "path": "/news/world",
    "title": "World",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "world",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "World · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "world"
      ],
      "canonical": "/news/world",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "World",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "World",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.world",
      "event": "view_news_world",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "world",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "news.videos",
    "path": "/news/videos",
    "title": "Videos",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "News",
    "category": "videos",
    "status": "planned",
    "layout": "article",
    "icon": "📰",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": false,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Videos · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "news",
        "videos"
      ],
      "canonical": "/news/videos",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Videos",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Videos",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "news.videos",
      "event": "view_news_videos",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "news",
      "videos",
      "planned"
    ],
    "dynamic": false
  }
];
