// Registry module: API (12 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "api.auth",
    "path": "/api/v1/auth",
    "title": "Auth",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Auth · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "api",
        "auth"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Auth",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Auth",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.auth",
      "event": "view_api_auth",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.radio",
    "path": "/api/v1/radio",
    "title": "Radio",
    "description": "Stations/schedule/evidence endpoints exist (unversioned); /api/v1 alias planned.",
    "section": "API",
    "category": "api",
    "status": "partial",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/v1/radio",
        "status": "planned",
        "description": "Versioned alias of /api/stations"
      }
    ],
    "seo": {
      "title": "Radio · Radio Vaigyaaniq",
      "description": "Stations/schedule/evidence endpoints exist (unversioned); /api/v1 alias planned.",
      "keywords": [
        "api",
        "radio"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Radio",
        "description": "Stations/schedule/evidence endpoints exist (unversioned); /api/v1 alias planned.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Radio",
        "description": "Stations/schedule/evidence endpoints exist (unversioned); /api/v1 alias planned."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.radio",
      "event": "view_api_radio",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/radio-release",
      "apps/radio-backend/server.js#/api/stations"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/radio-release",
        "kind": "api"
      },
      {
        "artifact": "apps/radio-backend/server.js#/api/stations",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "api",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "api.podcasts",
    "path": "/api/v1/podcasts",
    "title": "Podcasts",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
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
        "api",
        "podcasts"
      ],
      "canonical": null,
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
      "screenName": "api.podcasts",
      "event": "view_api_podcasts",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.research",
    "path": "/api/v1/research",
    "title": "Research",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
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
        "api",
        "research"
      ],
      "canonical": null,
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
      "screenName": "api.research",
      "event": "view_api_research",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.news",
    "path": "/api/v1/news",
    "title": "News",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
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
        "api",
        "news"
      ],
      "canonical": null,
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
      "screenName": "api.news",
      "event": "view_api_news",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.events",
    "path": "/api/v1/events",
    "title": "Events",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Events · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "api",
        "events"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Events",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Events",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.events",
      "event": "view_api_events",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.community",
    "path": "/api/v1/community",
    "title": "Community",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Community · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "api",
        "community"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Community",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Community",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.community",
      "event": "view_api_community",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.search",
    "path": "/api/v1/search",
    "title": "Search",
    "description": "Foundation exists — see implementedBy.",
    "section": "API",
    "category": "api",
    "status": "partial",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/v1/search",
        "status": "planned",
        "description": "Versioned alias of /api/search"
      }
    ],
    "seo": {
      "title": "Search · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "api",
        "search"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Search",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Search",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.search",
      "event": "view_api_search",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/search"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/search",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "api",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "api.analytics",
    "path": "/api/v1/analytics",
    "title": "Analytics",
    "description": "Foundation exists — see implementedBy.",
    "section": "API",
    "category": "api",
    "status": "partial",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/v1/analytics",
        "status": "planned",
        "description": "Versioned alias of /api/analytics"
      }
    ],
    "seo": {
      "title": "Analytics · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "api",
        "analytics"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Analytics",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Analytics",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.analytics",
      "event": "view_api_analytics",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/analytics"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/analytics",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "api",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "api.upload",
    "path": "/api/v1/upload",
    "title": "Upload",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Upload · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "api",
        "upload"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Upload",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Upload",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.upload",
      "event": "view_api_upload",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.notifications",
    "path": "/api/v1/notifications",
    "title": "Notifications",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "API",
    "category": "api",
    "status": "planned",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Notifications · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "api",
        "notifications"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Notifications",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Notifications",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.notifications",
      "event": "view_api_notifications",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "api",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "api.payments",
    "path": "/api/v1/payments",
    "title": "Payments",
    "description": "Order + webhook live (unversioned); /api/v1 alias planned.",
    "section": "API",
    "category": "api",
    "status": "partial",
    "layout": "fullscreen",
    "icon": "🔌",
    "searchable": false,
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
      "api"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "POST",
        "path": "/api/v1/payments",
        "status": "planned",
        "description": "Versioned alias of /api/payments/*"
      }
    ],
    "seo": {
      "title": "Payments · Radio Vaigyaaniq",
      "description": "Order + webhook live (unversioned); /api/v1 alias planned.",
      "keywords": [
        "api",
        "payments"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Payments",
        "description": "Order + webhook live (unversioned); /api/v1 alias planned.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Payments",
        "description": "Order + webhook live (unversioned); /api/v1 alias planned."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "api.payments",
      "event": "view_api_payments",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio/app/api/payments/order",
      "apps/radio/app/api/payments/webhook"
    ],
    "evidence": [
      {
        "artifact": "apps/radio/app/api/payments/order",
        "kind": "api"
      },
      {
        "artifact": "apps/radio/app/api/payments/webhook",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "api",
      "partial"
    ],
    "dynamic": false
  }
];
