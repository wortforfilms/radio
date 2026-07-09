// Registry module: Media (6 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "media.videos",
    "path": "/videos",
    "title": "Videos",
    "description": "Visualizer capture exists; video library not built.",
    "section": "Media",
    "category": "hub",
    "status": "partial",
    "layout": "player",
    "icon": "🎥",
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
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Videos · Radio Vaigyaaniq",
      "description": "Visualizer capture exists; video library not built.",
      "keywords": [
        "media",
        "videos"
      ],
      "canonical": "/videos",
      "robots": "index,follow",
      "openGraph": {
        "title": "Videos",
        "description": "Visualizer capture exists; video library not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Videos",
        "description": "Visualizer capture exists; video library not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.videos",
      "event": "view_media_videos",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html surfaces (visualizer WebM capture)"
    ],
    "evidence": [
      {
        "artifact": "radio-html surfaces (visualizer WebM capture)",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "media.shorts",
    "path": "/shorts",
    "title": "Shorts",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Media",
    "category": "hub",
    "status": "planned",
    "layout": "player",
    "icon": "🎥",
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
      "title": "Shorts · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "media",
        "shorts"
      ],
      "canonical": "/shorts",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Shorts",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Shorts",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.shorts",
      "event": "view_media_shorts",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "media.gallery",
    "path": "/gallery",
    "title": "Gallery",
    "description": "Cover-art gallery exists for the catalogue.",
    "section": "Media",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "🎥",
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
      "desktop"
    ],
    "permissions": [
      "anonymous"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Gallery · Radio Vaigyaaniq",
      "description": "Cover-art gallery exists for the catalogue.",
      "keywords": [
        "media",
        "gallery"
      ],
      "canonical": "/gallery",
      "robots": "index,follow",
      "openGraph": {
        "title": "Gallery",
        "description": "Cover-art gallery exists for the catalogue.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Gallery",
        "description": "Cover-art gallery exists for the catalogue."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.gallery",
      "event": "view_media_gallery",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/Radio_Catalogue.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/Radio_Catalogue.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "media.infographics",
    "path": "/infographics",
    "title": "Infographics",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Media",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🎥",
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
      "title": "Infographics · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "media",
        "infographics"
      ],
      "canonical": "/infographics",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Infographics",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Infographics",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.infographics",
      "event": "view_media_infographics",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "media.animations",
    "path": "/animations",
    "title": "Animations",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Media",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🎥",
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
      "title": "Animations · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "media",
        "animations"
      ],
      "canonical": "/animations",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Animations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Animations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.animations",
      "event": "view_media_animations",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "media.livestreams",
    "path": "/livestreams",
    "title": "Livestreams",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Media",
    "category": "hub",
    "status": "planned",
    "layout": "player",
    "icon": "🎥",
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
      "title": "Livestreams · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "media",
        "livestreams"
      ],
      "canonical": "/livestreams",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Livestreams",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Livestreams",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "media.livestreams",
      "event": "view_media_livestreams",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "media",
      "hub",
      "planned"
    ],
    "dynamic": false
  }
];
