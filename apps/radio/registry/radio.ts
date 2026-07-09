// Registry module: Radio (12 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] =  [
  {
    "id": "radio",
    "path": "/radio",
    "title": "Radio",
    "description": "Broadcast command surface + online/offline engine over the 1,186-track catalogue.",
    "section": "Radio",
    "category": "engagement",
    "status": "built",
    "layout": "landing",
    "icon": "📻",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": false,
      "contextMenu": false
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/stations",
        "status": "partial",
        "description": "Station lineup (radio-backend)"
      },
      {
        "method": "GET",
        "path": "/api/evidence",
        "status": "partial",
        "description": "Manifest evidence"
      }
    ],
    "seo": {
      "title": "Radio · Radio Vaigyaaniq",
      "description": "Broadcast command surface + online/offline engine over the 1,186-track catalogue.",
      "keywords": [
        "radio"
      ],
      "canonical": "/radio",
      "robots": "index,follow",
      "openGraph": {
        "title": "Radio",
        "description": "Broadcast command surface + online/offline engine over the 1,186-track catalogue.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Radio",
        "description": "Broadcast command surface + online/offline engine over the 1,186-track catalogue."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio",
      "event": "view_radio",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/radio/page.tsx",
      "radio-html/online-offline-radio-engine.html"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/radio/page.tsx",
        "kind": "code"
      },
      {
        "artifact": "radio-html/online-offline-radio-engine.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "engagement",
      "built"
    ],
    "dynamic": false
  },
  {
    "id": "radio.live",
    "path": "/radio/live",
    "title": "Live",
    "description": "Local-fallback playback works; live stream URLs stay NULL until rights-verified.",
    "section": "Radio",
    "category": "playback",
    "status": "partial",
    "layout": "player",
    "icon": "📻",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": true,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "tv",
      "car",
      "watch"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/stations",
        "status": "partial"
      },
      {
        "method": "GET",
        "path": "/api/stream-candidates",
        "status": "partial",
        "description": "Opt-in test streams (rights unverified)"
      }
    ],
    "seo": {
      "title": "Live · Radio Vaigyaaniq",
      "description": "Local-fallback playback works; live stream URLs stay NULL until rights-verified.",
      "keywords": [
        "radio",
        "live"
      ],
      "canonical": "/radio/live",
      "robots": "index,follow",
      "openGraph": {
        "title": "Live",
        "description": "Local-fallback playback works; live stream URLs stay NULL until rights-verified.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Live",
        "description": "Local-fallback playback works; live stream URLs stay NULL until rights-verified."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.live",
      "event": "view_radio_live",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/online-offline-radio-engine.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/online-offline-radio-engine.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "playback",
      "partial"
    ],
    "dynamic": false,
    "contentType": "live-show"
  },
  {
    "id": "radio.now-playing",
    "path": "/radio/now-playing",
    "title": "Now Playing",
    "description": "Now-playing panel: stylised titles, access badges, synced lyrics, story modal.",
    "section": "Radio",
    "category": "playback",
    "status": "built",
    "layout": "player",
    "icon": "📻",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": true,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline",
      "tv",
      "car",
      "watch"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Now Playing · Radio Vaigyaaniq",
      "description": "Now-playing panel: stylised titles, access badges, synced lyrics, story modal.",
      "keywords": [
        "radio",
        "now",
        "playing"
      ],
      "canonical": "/radio/now-playing",
      "robots": "index,follow",
      "openGraph": {
        "title": "Now Playing",
        "description": "Now-playing panel: stylised titles, access badges, synced lyrics, story modal.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Now Playing",
        "description": "Now-playing panel: stylised titles, access badges, synced lyrics, story modal."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.now-playing",
      "event": "view_radio_now_playing",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/assets/js/radio-engine.js"
    ],
    "evidence": [
      {
        "artifact": "radio-html/assets/js/radio-engine.js",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "playback",
      "built"
    ],
    "dynamic": false,
    "contentType": "radio-track"
  },
  {
    "id": "radio.schedule",
    "path": "/radio/schedule",
    "title": "Schedule",
    "description": "Sequence-only program schedule; wall-clock startTime stays NULL (unverified).",
    "section": "Radio",
    "category": "programming",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
    "searchable": true,
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/schedule/:stationSlug",
        "status": "partial"
      }
    ],
    "seo": {
      "title": "Schedule · Radio Vaigyaaniq",
      "description": "Sequence-only program schedule; wall-clock startTime stays NULL (unverified).",
      "keywords": [
        "radio",
        "schedule"
      ],
      "canonical": "/radio/schedule",
      "robots": "index,follow",
      "openGraph": {
        "title": "Schedule",
        "description": "Sequence-only program schedule; wall-clock startTime stays NULL (unverified).",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Schedule",
        "description": "Sequence-only program schedule; wall-clock startTime stays NULL (unverified)."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.schedule",
      "event": "view_radio_schedule",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/data/radio-engine-manifest.json"
    ],
    "evidence": [
      {
        "artifact": "radio-html/data/radio-engine-manifest.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "programming",
      "partial"
    ],
    "dynamic": false,
    "contentType": "live-show"
  },
  {
    "id": "radio.frequencies",
    "path": "/radio/frequencies",
    "title": "Frequencies",
    "description": "No licensed frequency exists; fabricating one would break PHKD.",
    "section": "Radio",
    "category": "engagement",
    "status": "planned",
    "layout": "article",
    "icon": "📻",
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Frequencies · Radio Vaigyaaniq",
      "description": "No licensed frequency exists; fabricating one would break PHKD.",
      "keywords": [
        "radio",
        "frequencies"
      ],
      "canonical": "/radio/frequencies",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Frequencies",
        "description": "No licensed frequency exists; fabricating one would break PHKD.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Frequencies",
        "description": "No licensed frequency exists; fabricating one would break PHKD."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.frequencies",
      "event": "view_radio_frequencies",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "radio",
      "engagement",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "radio.shows",
    "path": "/radio/shows",
    "title": "Shows",
    "description": "7 station lanes act as shows; dedicated show format not built.",
    "section": "Radio",
    "category": "programming",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
    "searchable": true,
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Shows · Radio Vaigyaaniq",
      "description": "7 station lanes act as shows; dedicated show format not built.",
      "keywords": [
        "radio",
        "shows"
      ],
      "canonical": "/radio/shows",
      "robots": "index,follow",
      "openGraph": {
        "title": "Shows",
        "description": "7 station lanes act as shows; dedicated show format not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Shows",
        "description": "7 station lanes act as shows; dedicated show format not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.shows",
      "event": "view_radio_shows",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/Radio_Stations.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/Radio_Stations.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "programming",
      "partial"
    ],
    "dynamic": false,
    "contentType": "live-show"
  },
  {
    "id": "radio.shows.detail",
    "path": "/radio/shows/:slug",
    "title": "Slug",
    "description": "Foundation exists — see implementedBy.",
    "section": "Radio",
    "category": "programming",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Slug · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "radio",
        "shows",
        "slug"
      ],
      "canonical": null,
      "robots": "index,follow",
      "openGraph": {
        "title": "Slug",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Slug",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.shows.detail",
      "event": "view_radio_shows_detail",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/Radio_Stations.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/Radio_Stations.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "programming",
      "partial"
    ],
    "dynamic": true,
    "contentType": "live-show"
  },
  {
    "id": "radio.rj",
    "path": "/radio/rj/:slug",
    "title": "Slug",
    "description": "Four TTS personas (maataa, rishi, samaya, vigyaaniq); human RJ profiles not built.",
    "section": "Radio",
    "category": "programming",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Slug · Radio Vaigyaaniq",
      "description": "Four TTS personas (maataa, rishi, samaya, vigyaaniq); human RJ profiles not built.",
      "keywords": [
        "radio",
        "rj",
        "slug"
      ],
      "canonical": null,
      "robots": "index,follow",
      "openGraph": {
        "title": "Slug",
        "description": "Four TTS personas (maataa, rishi, samaya, vigyaaniq); human RJ profiles not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Slug",
        "description": "Four TTS personas (maataa, rishi, samaya, vigyaaniq); human RJ profiles not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.rj",
      "event": "view_radio_rj",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/assets/js/radio-engine.js#TTS_PERSONAS"
    ],
    "evidence": [
      {
        "artifact": "radio-html/assets/js/radio-engine.js#TTS_PERSONAS",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "programming",
      "partial"
    ],
    "dynamic": true
  },
  {
    "id": "radio.archive",
    "path": "/radio/archive",
    "title": "Archive",
    "description": "Full indexed catalogue with covers, versions, storylines.",
    "section": "Radio",
    "category": "library",
    "status": "built",
    "layout": "article",
    "icon": "📻",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": true,
      "commandPalette": true,
      "quickAccess": true,
      "contextMenu": true
    },
    "platforms": [
      "web",
      "mobile",
      "desktop",
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Archive · Radio Vaigyaaniq",
      "description": "Full indexed catalogue with covers, versions, storylines.",
      "keywords": [
        "radio",
        "archive"
      ],
      "canonical": "/radio/archive",
      "robots": "index,follow",
      "openGraph": {
        "title": "Archive",
        "description": "Full indexed catalogue with covers, versions, storylines.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Archive",
        "description": "Full indexed catalogue with covers, versions, storylines."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.archive",
      "event": "view_radio_archive",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/Radio_Catalogue.html",
      "radio-html/data/radio-content.json"
    ],
    "evidence": [
      {
        "artifact": "radio-html/Radio_Catalogue.html",
        "kind": "surface"
      },
      {
        "artifact": "radio-html/data/radio-content.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "library",
      "built"
    ],
    "dynamic": false,
    "contentType": "radio-track"
  },
  {
    "id": "radio.request",
    "path": "/radio/request",
    "title": "Request",
    "description": "Request intake not built; gift-intent outbox is the nearest primitive.",
    "section": "Radio",
    "category": "engagement",
    "status": "planned",
    "layout": "article",
    "icon": "📻",
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Request · Radio Vaigyaaniq",
      "description": "Request intake not built; gift-intent outbox is the nearest primitive.",
      "keywords": [
        "radio",
        "request"
      ],
      "canonical": "/radio/request",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Request",
        "description": "Request intake not built; gift-intent outbox is the nearest primitive.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Request",
        "description": "Request intake not built; gift-intent outbox is the nearest primitive."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.request",
      "event": "view_radio_request",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "radio",
      "engagement",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "radio.dedicate",
    "path": "/radio/dedicate",
    "title": "Dedicate",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Radio",
    "category": "engagement",
    "status": "planned",
    "layout": "article",
    "icon": "📻",
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Dedicate · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "radio",
        "dedicate"
      ],
      "canonical": "/radio/dedicate",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Dedicate",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Dedicate",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.dedicate",
      "event": "view_radio_dedicate",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "radio",
      "engagement",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "radio.download",
    "path": "/radio/download",
    "title": "Download",
    "description": "Rights-aware offline bundles exist; user-facing download manager not built.",
    "section": "Radio",
    "category": "library",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
    "searchable": true,
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
      "offline"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/offline-bundle",
        "status": "partial",
        "description": "Rights-aware offline bundle"
      }
    ],
    "seo": {
      "title": "Download · Radio Vaigyaaniq",
      "description": "Rights-aware offline bundles exist; user-facing download manager not built.",
      "keywords": [
        "radio",
        "download"
      ],
      "canonical": "/radio/download",
      "robots": "index,follow",
      "openGraph": {
        "title": "Download",
        "description": "Rights-aware offline bundles exist; user-facing download manager not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Download",
        "description": "Rights-aware offline bundles exist; user-facing download manager not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.download",
      "event": "view_radio_download",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/data/offline-cache-manifest.json",
      "apps/radio-backend/server.js#offline-bundle"
    ],
    "evidence": [
      {
        "artifact": "radio-html/data/offline-cache-manifest.json",
        "kind": "data"
      },
      {
        "artifact": "apps/radio-backend/server.js#offline-bundle",
        "kind": "api"
      }
    ],
    "dependsOn": [
      "radio.archive"
    ],
    "tags": [
      "radio",
      "library",
      "partial"
    ],
    "dynamic": false,
    "contentType": "radio-track"
  },
  {
    "id": "radio.programs",
    "path": "/radio/programs/:date/:slug",
    "title": "Program Day",
    "description": "Dynamic per-day station program instances, emitted from real manifest entries via /api/live-status (sequence-only until wall-clock schedules are verified).",
    "section": "Radio",
    "category": "programming",
    "status": "partial",
    "layout": "article",
    "icon": "📻",
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
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [
      {
        "method": "GET",
        "path": "/api/live-status",
        "status": "built",
        "description": "TTL-cached live flags + dynamic route instances"
      }
    ],
    "seo": {
      "title": "Program Day · Radio Vaigyaaniq",
      "description": "Per-day station programs.",
      "keywords": [
        "radio",
        "programs"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Program Day",
        "description": "Per-day station programs.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Program Day",
        "description": "Per-day station programs."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "radio.programs",
      "event": "view_radio_programs",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/server.js#/api/live-status"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/server.js#/api/live-status",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "radio",
      "programming",
      "partial"
    ],
    "dynamic": true,
    "contentType": "live-show"
  }
];
