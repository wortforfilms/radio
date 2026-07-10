// Registry module: Administration (12 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] =  [
  {
    "id": "admin",
    "path": "/admin",
    "title": "Admin",
    "description": "Fail-closed admin lane: ADMIN_PASSWORD auth, CRUD overlays, rights proofs, cache status.",
    "section": "Administration",
    "category": "operations",
    "status": "built",
    "layout": "admin",
    "icon": "⚙",
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
        "method": "POST",
        "path": "/admin/login",
        "status": "built"
      },
      {
        "method": "GET",
        "path": "/admin/state",
        "status": "built"
      },
      {
        "method": "POST",
        "path": "/admin/rights-proof",
        "status": "built"
      },
      {
        "method": "GET",
        "path": "/admin/cache-status",
        "status": "built"
      }
    ],
    "seo": {
      "title": "Admin · Radio Vaigyaaniq",
      "description": "Fail-closed admin lane: ADMIN_PASSWORD auth, CRUD overlays, rights proofs, cache status.",
      "keywords": [
        "administration",
        "admin"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Admin",
        "description": "Fail-closed admin lane: ADMIN_PASSWORD auth, CRUD overlays, rights proofs, cache status.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Admin",
        "description": "Fail-closed admin lane: ADMIN_PASSWORD auth, CRUD overlays, rights proofs, cache status."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin",
      "event": "view_admin",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/admin-panel.html",
      "apps/radio-backend/server.js#/admin"
    ],
    "evidence": [
      {
        "artifact": "radio-html/admin-panel.html",
        "kind": "surface"
      },
      {
        "artifact": "apps/radio-backend/server.js#/admin",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "built"
    ],
    "dynamic": false
  },
  {
    "id": "admin.users",
    "path": "/admin/users",
    "title": "Users",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Users · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
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
      "screenName": "admin.users",
      "event": "view_admin_users",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.roles",
    "path": "/admin/roles",
    "title": "Roles",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Roles · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "roles"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Roles",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Roles",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.roles",
      "event": "view_admin_roles",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.permissions",
    "path": "/admin/permissions",
    "title": "Permissions",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Permissions · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "permissions"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Permissions",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Permissions",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.permissions",
      "event": "view_admin_permissions",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.api",
    "path": "/admin/api",
    "title": "Api",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Api · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "api"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Api",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Api",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.api",
      "event": "view_admin_api",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.settings",
    "path": "/admin/settings",
    "title": "Settings",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Settings · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "settings"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Settings",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Settings",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.settings",
      "event": "view_admin_settings",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.logs",
    "path": "/admin/logs",
    "title": "Logs",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Logs · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "logs"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Logs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Logs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.logs",
      "event": "view_admin_logs",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.audit",
    "path": "/admin/audit",
    "title": "Audit",
    "description": "AuditLog model + API exist.",
    "section": "Administration",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "⚙",
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
    "api": [],
    "seo": {
      "title": "Audit · Radio Vaigyaaniq",
      "description": "AuditLog model + API exist.",
      "keywords": [
        "administration",
        "admin",
        "audit"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Audit",
        "description": "AuditLog model + API exist.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Audit",
        "description": "AuditLog model + API exist."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.audit",
      "event": "view_admin_audit",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "packages/runtime/src/audit.ts",
      "apps/web/app/api/audit"
    ],
    "evidence": [
      {
        "artifact": "packages/runtime/src/audit.ts",
        "kind": "code"
      },
      {
        "artifact": "apps/web/app/api/audit",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "admin.security",
    "path": "/admin/security",
    "title": "Security",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Security · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "security"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Security",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Security",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.security",
      "event": "view_admin_security",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.storage",
    "path": "/admin/storage",
    "title": "Storage",
    "description": "Foundation exists — see implementedBy.",
    "section": "Administration",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "⚙",
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
    "api": [],
    "seo": {
      "title": "Storage · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "administration",
        "admin",
        "storage"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Storage",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Storage",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.storage",
      "event": "view_admin_storage",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "packages/runtime/src/storage.ts",
      "docs/runbooks/RADIO_MEDIA_STORAGE.md"
    ],
    "evidence": [
      {
        "artifact": "packages/runtime/src/storage.ts",
        "kind": "code"
      },
      {
        "artifact": "docs/runbooks/RADIO_MEDIA_STORAGE.md",
        "kind": "doc"
      }
    ],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "admin.backups",
    "path": "/admin/backups",
    "title": "Backups",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Administration",
    "category": "operations",
    "status": "planned",
    "layout": "admin",
    "icon": "⚙",
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
      "title": "Backups · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "administration",
        "admin",
        "backups"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Backups",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Backups",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.backups",
      "event": "view_admin_backups",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "admin.integrations",
    "path": "/admin/integrations",
    "title": "Integrations",
    "description": "Foundation exists — see implementedBy.",
    "section": "Administration",
    "category": "operations",
    "status": "partial",
    "layout": "admin",
    "icon": "⚙",
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
    "api": [],
    "seo": {
      "title": "Integrations · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "administration",
        "admin",
        "integrations"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Integrations",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Integrations",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.integrations",
      "event": "view_admin_integrations",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "integrations/hdfc-upi-parser"
    ],
    "evidence": [
      {
        "artifact": "integrations/hdfc-upi-parser",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "admin.registry-explorer",
    "path": "/admin/registry-explorer",
    "title": "Registry Explorer",
    "description": "Developer UI over the compiled manifest: routes, components, tokens, workflows, permissions, graph impact and orphan analysis.",
    "section": "Administration",
    "category": "operations",
    "status": "built",
    "layout": "admin",
    "icon": "⚙",
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
        "path": "/manifest",
        "status": "built",
        "description": "Read-only compiled manifest API (radio-backend)"
      }
    ],
    "seo": {
      "title": "Registry Explorer · Radio Vaigyaaniq",
      "description": "Developer UI over the compiled manifest.",
      "keywords": [
        "administration",
        "registry",
        "explorer"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Registry Explorer",
        "description": "Developer UI over the compiled manifest.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Registry Explorer",
        "description": "Developer UI over the compiled manifest."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "admin.registry-explorer",
      "event": "view_admin_registry_explorer",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio/public/registry/explorer.html",
      "apps/radio/lib/compiled-manifest.json"
    ],
    "evidence": [
      {
        "artifact": "apps/radio/public/registry/explorer.html",
        "kind": "surface"
      },
      {
        "artifact": "apps/radio/lib/compiled-manifest.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "administration",
      "operations",
      "built"
    ],
    "dynamic": false
  }
];
