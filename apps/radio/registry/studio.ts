// Registry module: Studio (10 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "studio",
    "path": "/studio",
    "title": "Studio",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "hub",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Studio · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Studio",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Studio",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio",
      "event": "view_studio",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.live",
    "path": "/studio/live",
    "title": "Live",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "live",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Live · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
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
      "screenName": "studio.live",
      "event": "view_studio_live",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "live",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.record",
    "path": "/studio/record",
    "title": "Record",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "record",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Record · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
        "record"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Record",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Record",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.record",
      "event": "view_studio_record",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "record",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.upload",
    "path": "/studio/upload",
    "title": "Upload",
    "description": "Track onboarding SOP + surface exist (fail-closed canPlay).",
    "section": "Studio",
    "category": "upload",
    "status": "partial",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Upload · Radio Vaigyaaniq",
      "description": "Track onboarding SOP + surface exist (fail-closed canPlay).",
      "keywords": [
        "studio",
        "upload"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Upload",
        "description": "Track onboarding SOP + surface exist (fail-closed canPlay).",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Upload",
        "description": "Track onboarding SOP + surface exist (fail-closed canPlay)."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.upload",
      "event": "view_studio_upload",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "docs/runbooks/RADIO_TRACK_ONBOARDING_SOP.md",
      "radio-html/Track_Onboarding.html"
    ],
    "evidence": [
      {
        "artifact": "docs/runbooks/RADIO_TRACK_ONBOARDING_SOP.md",
        "kind": "doc"
      },
      {
        "artifact": "radio-html/Track_Onboarding.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "studio",
      "upload",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "studio.editor",
    "path": "/studio/editor",
    "title": "Editor",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "editor",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Editor · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
        "editor"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Editor",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Editor",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.editor",
      "event": "view_studio_editor",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "editor",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.script",
    "path": "/studio/script",
    "title": "Script",
    "description": "Lyrics prompter surface exists.",
    "section": "Studio",
    "category": "script",
    "status": "partial",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Script · Radio Vaigyaaniq",
      "description": "Lyrics prompter surface exists.",
      "keywords": [
        "studio",
        "script"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Script",
        "description": "Lyrics prompter surface exists.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Script",
        "description": "Lyrics prompter surface exists."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.script",
      "event": "view_studio_script",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/lyrics-prompter.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/lyrics-prompter.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "studio",
      "script",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "studio.caller",
    "path": "/studio/caller",
    "title": "Caller",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "caller",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Caller · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
        "caller"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Caller",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Caller",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.caller",
      "event": "view_studio_caller",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "caller",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.queue",
    "path": "/studio/queue",
    "title": "Queue",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "queue",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Queue · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
        "queue"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Queue",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Queue",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.queue",
      "event": "view_studio_queue",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "studio.upload"
    ],
    "tags": [
      "studio",
      "queue",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.automation",
    "path": "/studio/automation",
    "title": "Automation",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Studio",
    "category": "automation",
    "status": "planned",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Automation · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "studio",
        "automation"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Automation",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Automation",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.automation",
      "event": "view_studio_automation",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "studio",
      "automation",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "studio.assets",
    "path": "/studio/assets",
    "title": "Assets",
    "description": "Foundation exists — see implementedBy.",
    "section": "Studio",
    "category": "assets",
    "status": "partial",
    "layout": "studio",
    "icon": "🎛",
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
      "creator",
      "editor",
      "admin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Assets · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "studio",
        "assets"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Assets",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Assets",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "studio.assets",
      "event": "view_studio_assets",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json"
    ],
    "evidence": [
      {
        "artifact": "radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "studio",
      "assets",
      "partial"
    ],
    "dynamic": false
  }
];
