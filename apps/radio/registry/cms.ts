// Registry module: Content Management (12 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "cms",
    "path": "/cms",
    "title": "Cms",
    "description": "Admin panel (CRUD overlays, rights proofs) + kanban board exist.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Cms · Radio Vaigyaaniq",
      "description": "Admin panel (CRUD overlays, rights proofs) + kanban board exist.",
      "keywords": [
        "content management",
        "cms"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Cms",
        "description": "Admin panel (CRUD overlays, rights proofs) + kanban board exist.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Cms",
        "description": "Admin panel (CRUD overlays, rights proofs) + kanban board exist."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms",
      "event": "view_cms",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/admin-panel.html",
      "radio-html/admin-kanban.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/admin-panel.html",
        "kind": "surface"
      },
      {
        "artifact": "radio-html/admin-kanban.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.dashboard",
    "path": "/cms/dashboard",
    "title": "Dashboard",
    "description": "Foundation exists — see implementedBy.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Dashboard · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "content management",
        "cms",
        "dashboard"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Dashboard",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Dashboard",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.dashboard",
      "event": "view_cms_dashboard",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/admin-panel.html"
    ],
    "evidence": [
      {
        "artifact": "radio-html/admin-panel.html",
        "kind": "surface"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.articles",
    "path": "/cms/articles",
    "title": "Articles",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Content Management",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Articles · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "content management",
        "cms",
        "articles"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Articles",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Articles",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.articles",
      "event": "view_cms_articles",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "cms.shows",
    "path": "/cms/shows",
    "title": "Shows",
    "description": "Foundation exists — see implementedBy.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Shows · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "content management",
        "cms",
        "shows"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Shows",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Shows",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.shows",
      "event": "view_cms_shows",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/server.js#/admin/stations"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/server.js#/admin/stations",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.podcasts",
    "path": "/cms/podcasts",
    "title": "Podcasts",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Content Management",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Podcasts · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "content management",
        "cms",
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
      "screenName": "cms.podcasts",
      "event": "view_cms_podcasts",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "cms.research",
    "path": "/cms/research",
    "title": "Research",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Content Management",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Research · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "content management",
        "cms",
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
      "screenName": "cms.research",
      "event": "view_cms_research",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "cms.media",
    "path": "/cms/media",
    "title": "Media",
    "description": "Foundation exists — see implementedBy.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Media · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "content management",
        "cms",
        "media"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Media",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Media",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.media",
      "event": "view_cms_media",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "scripts/media-storage-audit.mjs",
      "docs/runbooks/RADIO_MEDIA_STORAGE.md"
    ],
    "evidence": [
      {
        "artifact": "scripts/media-storage-audit.mjs",
        "kind": "code"
      },
      {
        "artifact": "docs/runbooks/RADIO_MEDIA_STORAGE.md",
        "kind": "doc"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.users",
    "path": "/cms/users",
    "title": "Users",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Content Management",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Users · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "content management",
        "cms",
        "users"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Users",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Users",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.users",
      "event": "view_cms_users",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "cms.comments",
    "path": "/cms/comments",
    "title": "Comments",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Content Management",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Comments · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "content management",
        "cms",
        "comments"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Comments",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Comments",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.comments",
      "event": "view_cms_comments",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "cms.moderation",
    "path": "/cms/moderation",
    "title": "Moderation",
    "description": "Lyric sanitisation pipeline exists; general moderation not built.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Moderation · Radio Vaigyaaniq",
      "description": "Lyric sanitisation pipeline exists; general moderation not built.",
      "keywords": [
        "content management",
        "cms",
        "moderation"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Moderation",
        "description": "Lyric sanitisation pipeline exists; general moderation not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Moderation",
        "description": "Lyric sanitisation pipeline exists; general moderation not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.moderation",
      "event": "view_cms_moderation",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "scripts/lib/radio-content-lib.mjs#sanitize"
    ],
    "evidence": [
      {
        "artifact": "scripts/lib/radio-content-lib.mjs#sanitize",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.workflows",
    "path": "/cms/workflows",
    "title": "Workflows",
    "description": "Foundation exists — see implementedBy.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Workflows · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "content management",
        "cms",
        "workflows"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Workflows",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Workflows",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.workflows",
      "event": "view_cms_workflows",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "docs/runbooks/RIGHTS_CLOSURE_RUNBOOK.md",
      "docs/runbooks/PHASE_4_5_RUNBOOK.md"
    ],
    "evidence": [
      {
        "artifact": "docs/runbooks/RIGHTS_CLOSURE_RUNBOOK.md",
        "kind": "doc"
      },
      {
        "artifact": "docs/runbooks/PHASE_4_5_RUNBOOK.md",
        "kind": "doc"
      }
    ],
    "dependsOn": [],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "cms.scheduler",
    "path": "/cms/scheduler",
    "title": "Scheduler",
    "description": "Program overlays (draft startTime) exist; scheduler UI not built.",
    "section": "Content Management",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "🗂",
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
      "editor",
      "admin",
      "superadmin"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Scheduler · Radio Vaigyaaniq",
      "description": "Program overlays (draft startTime) exist; scheduler UI not built.",
      "keywords": [
        "content management",
        "cms",
        "scheduler"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Scheduler",
        "description": "Program overlays (draft startTime) exist; scheduler UI not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Scheduler",
        "description": "Program overlays (draft startTime) exist; scheduler UI not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "cms.scheduler",
      "event": "view_cms_scheduler",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/server.js#/admin/programs"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/server.js#/admin/programs",
        "kind": "api"
      }
    ],
    "dependsOn": [
      "cms.shows"
    ],
    "tags": [
      "content-management",
      "operations",
      "partial"
    ],
    "dynamic": false
  }
];
