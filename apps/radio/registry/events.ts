// Registry module: Events (8 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] =  [
  {
    "id": "events",
    "path": "/events",
    "title": "Events",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Events · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events"
      ],
      "canonical": "/events",
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
      "screenName": "events",
      "event": "view_events",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "hub",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  },
  {
    "id": "events.live",
    "path": "/events/live",
    "title": "Live",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "live",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Live · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "live"
      ],
      "canonical": "/events/live",
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
      "screenName": "events.live",
      "event": "view_events_live",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "live",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "events.upcoming",
    "path": "/events/upcoming",
    "title": "Upcoming",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "upcoming",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Upcoming · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "upcoming"
      ],
      "canonical": "/events/upcoming",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Upcoming",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Upcoming",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.upcoming",
      "event": "view_events_upcoming",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "upcoming",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  },
  {
    "id": "events.calendar",
    "path": "/events/calendar",
    "title": "Calendar",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "calendar",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Calendar · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "calendar"
      ],
      "canonical": "/events/calendar",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Calendar",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Calendar",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.calendar",
      "event": "view_events_calendar",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "calendar",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "events.workshops",
    "path": "/events/workshops",
    "title": "Workshops",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "workshops",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Workshops · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "workshops"
      ],
      "canonical": "/events/workshops",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Workshops",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Workshops",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.workshops",
      "event": "view_events_workshops",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "workshops",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  },
  {
    "id": "events.webinars",
    "path": "/events/webinars",
    "title": "Webinars",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "webinars",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Webinars · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "webinars"
      ],
      "canonical": "/events/webinars",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Webinars",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Webinars",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.webinars",
      "event": "view_events_webinars",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "webinars",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  },
  {
    "id": "events.hackathons",
    "path": "/events/hackathons",
    "title": "Hackathons",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "hackathons",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Hackathons · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "hackathons"
      ],
      "canonical": "/events/hackathons",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Hackathons",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Hackathons",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.hackathons",
      "event": "view_events_hackathons",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "hackathons",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  },
  {
    "id": "events.science-fairs",
    "path": "/events/science-fairs",
    "title": "Science Fairs",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Events",
    "category": "science-fairs",
    "status": "planned",
    "layout": "article",
    "icon": "📅",
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
    "featureFlags": [
      "events"
    ],
    "api": [],
    "seo": {
      "title": "Science Fairs · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "events",
        "science",
        "fairs"
      ],
      "canonical": "/events/science-fairs",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Science Fairs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Science Fairs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "events.science-fairs",
      "event": "view_events_science_fairs",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "events",
      "science-fairs",
      "planned"
    ],
    "dynamic": false,
    "contentType": "event"
  }
];
