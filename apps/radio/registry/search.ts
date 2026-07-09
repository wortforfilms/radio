// Registry module: Search (6 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "search",
    "path": "/search",
    "title": "Search",
    "description": "Catalogue + knowledge search exist; unified search page not built.",
    "section": "Search",
    "category": "hub",
    "status": "partial",
    "layout": "dashboard",
    "icon": "🔍",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": true,
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
    "api": [
      {
        "method": "GET",
        "path": "/api/search",
        "status": "partial"
      }
    ],
    "seo": {
      "title": "Search · Radio Vaigyaaniq",
      "description": "Catalogue + knowledge search exist; unified search page not built.",
      "keywords": [
        "search"
      ],
      "canonical": "/search",
      "robots": "index,follow",
      "openGraph": {
        "title": "Search",
        "description": "Catalogue + knowledge search exist; unified search page not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Search",
        "description": "Catalogue + knowledge search exist; unified search page not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "search",
      "event": "view_search",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/search",
      "radio-engine catalog search"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/search",
        "kind": "api"
      },
      {
        "artifact": "radio-engine catalog search",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "search",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "search.radio",
    "path": "/search/radio",
    "title": "Radio",
    "description": "Foundation exists — see implementedBy.",
    "section": "Search",
    "category": "radio",
    "status": "partial",
    "layout": "dashboard",
    "icon": "🔍",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
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
      "title": "Radio · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "search",
        "radio"
      ],
      "canonical": "/search/radio",
      "robots": "index,follow",
      "openGraph": {
        "title": "Radio",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Radio",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "search.radio",
      "event": "view_search_radio",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-engine catalog search"
    ],
    "evidence": [
      {
        "artifact": "radio-engine catalog search",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "search",
      "radio",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "search.podcasts",
    "path": "/search/podcasts",
    "title": "Podcasts",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Search",
    "category": "podcasts",
    "status": "planned",
    "layout": "dashboard",
    "icon": "🔍",
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
      "title": "Podcasts · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "search",
        "podcasts"
      ],
      "canonical": "/search/podcasts",
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
      "screenName": "search.podcasts",
      "event": "view_search_podcasts",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "search",
      "podcasts",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "search.research",
    "path": "/search/research",
    "title": "Research",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Search",
    "category": "research",
    "status": "planned",
    "layout": "dashboard",
    "icon": "🔍",
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
      "title": "Research · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "search",
        "research"
      ],
      "canonical": "/search/research",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Research",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Research",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "search.research",
      "event": "view_search_research",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "search",
      "research",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "search.news",
    "path": "/search/news",
    "title": "News",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Search",
    "category": "news",
    "status": "planned",
    "layout": "dashboard",
    "icon": "🔍",
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
      "title": "News · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "search",
        "news"
      ],
      "canonical": "/search/news",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "News",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
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
      "screenName": "search.news",
      "event": "view_search_news",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "search",
      "news",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "search.people",
    "path": "/search/people",
    "title": "People",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Search",
    "category": "people",
    "status": "planned",
    "layout": "dashboard",
    "icon": "🔍",
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
      "title": "People · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "search",
        "people"
      ],
      "canonical": "/search/people",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "People",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "People",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "search.people",
      "event": "view_search_people",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "search",
      "people",
      "planned"
    ],
    "dynamic": false
  }
];
