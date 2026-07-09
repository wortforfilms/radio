// Registry module: Analytics (7 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "analytics",
    "path": "/analytics",
    "title": "Analytics",
    "description": "Observatory metrics API exists; analytics UI not built.",
    "section": "Analytics",
    "category": "hub",
    "status": "partial",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/analytics",
        "status": "partial"
      }
    ],
    "seo": {
      "title": "Analytics · Radio Vaigyaaniq",
      "description": "Observatory metrics API exists; analytics UI not built.",
      "keywords": [
        "analytics"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Analytics",
        "description": "Observatory metrics API exists; analytics UI not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Analytics",
        "description": "Observatory metrics API exists; analytics UI not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics",
      "event": "view_analytics",
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
      "analytics",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.listeners",
    "path": "/analytics/listeners",
    "title": "Listeners",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "listeners",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Listeners · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "listeners"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Listeners",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Listeners",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.listeners",
      "event": "view_analytics_listeners",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "listeners",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.live",
    "path": "/analytics/live",
    "title": "Live",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "live",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Live · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "live"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Live",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Live",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.live",
      "event": "view_analytics_live",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "live",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.streams",
    "path": "/analytics/streams",
    "title": "Streams",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "streams",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Streams · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "streams"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Streams",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Streams",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.streams",
      "event": "view_analytics_streams",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "streams",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.content",
    "path": "/analytics/content",
    "title": "Content",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "content",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Content · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "content"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Content",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Content",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.content",
      "event": "view_analytics_content",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "content",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.geography",
    "path": "/analytics/geography",
    "title": "Geography",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "geography",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Geography · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "geography"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Geography",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Geography",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.geography",
      "event": "view_analytics_geography",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "geography",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "analytics.revenue",
    "path": "/analytics/revenue",
    "title": "Revenue",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Analytics",
    "category": "revenue",
    "status": "planned",
    "layout": "dashboard",
    "icon": "📊",
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
      "web",
      "desktop"
    ],
    "permissions": [
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Revenue · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "analytics",
        "revenue"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Revenue",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Revenue",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "analytics.revenue",
      "event": "view_analytics_revenue",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "analytics",
      "revenue",
      "planned"
    ],
    "dynamic": false
  }
];
