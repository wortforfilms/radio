// Registry module: User (11 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "user.login",
    "path": "/login",
    "title": "Login",
    "description": "Session login (scrypt-verified, bearer sessions) wired into the engine account widget.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "👤",
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
      "title": "Login · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "login"
      ],
      "canonical": "/login",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Login",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Login",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.login",
      "event": "view_user_login",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/auth.js",
      "apps/radio-backend/server.js#/auth/login",
      "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/auth.js",
        "kind": "code"
      },
      {
        "artifact": "apps/radio-backend/server.js#/auth/login",
        "kind": "api"
      },
      {
        "artifact": "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.signup",
    "path": "/signup",
    "title": "Signup",
    "description": "Account registration with salted scrypt hashes.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "👤",
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
      "title": "Signup · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "signup"
      ],
      "canonical": "/signup",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Signup",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Signup",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.signup",
      "event": "view_user_signup",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/auth.js",
      "apps/radio-backend/server.js#/auth/register",
      "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/auth.js",
        "kind": "code"
      },
      {
        "artifact": "apps/radio-backend/server.js#/auth/register",
        "kind": "api"
      },
      {
        "artifact": "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.forgot-password",
    "path": "/forgot-password",
    "title": "Forgot Password",
    "description": "Reset flow: token issued (operator relay until EMAIL_PROVIDER configured), reset revokes all sessions.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "👤",
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
      "title": "Forgot Password · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "forgot",
        "password"
      ],
      "canonical": "/forgot-password",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Forgot Password",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Forgot Password",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.forgot-password",
      "event": "view_user_forgot_password",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/auth.js",
      "apps/radio-backend/server.js#/auth/forgot + /auth/reset"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/auth.js",
        "kind": "code"
      },
      {
        "artifact": "apps/radio-backend/server.js#/auth/forgot + /auth/reset",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.verify",
    "path": "/verify",
    "title": "Verify",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "User",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "👤",
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
      "title": "Verify · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "verify"
      ],
      "canonical": "/verify",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Verify",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Verify",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.verify",
      "event": "view_user_verify",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "user",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "user.profile",
    "path": "/profile",
    "title": "Profile",
    "description": "Authenticated profile from the session store.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "settings",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Profile · Radio Vaigyaaniq",
      "description": "User/UserSettings models exist; profile UI not built.",
      "keywords": [
        "user",
        "profile"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Profile",
        "description": "User/UserSettings models exist; profile UI not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Profile",
        "description": "User/UserSettings models exist; profile UI not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.profile",
      "event": "view_user_profile",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/server.js#/user/profile",
      "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/server.js#/user/profile",
        "kind": "api"
      },
      {
        "artifact": "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount",
        "kind": "code"
      }
    ],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.profile.edit",
    "path": "/profile/edit",
    "title": "Edit",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "User",
    "category": "edit",
    "status": "planned",
    "layout": "settings",
    "icon": "👤",
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
      "mobile",
      "desktop"
    ],
    "permissions": [
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Edit · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "profile",
        "edit"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Edit",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Edit",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.profile.edit",
      "event": "view_user_profile_edit",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.profile"
    ],
    "tags": [
      "user",
      "edit",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "user.bookmarks",
    "path": "/bookmarks",
    "title": "Bookmarks",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "User",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Bookmarks · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
        "bookmarks"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Bookmarks",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Bookmarks",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.bookmarks",
      "event": "view_user_bookmarks",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "user",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "user.history",
    "path": "/history",
    "title": "History",
    "description": "Real listening/action history from the synced evidence outbox.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "History · Radio Vaigyaaniq",
      "description": "Play events queue offline and sync as evidence; history UI not built.",
      "keywords": [
        "user",
        "history"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "History",
        "description": "Play events queue offline and sync as evidence; history UI not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "History",
        "description": "Play events queue offline and sync as evidence; history UI not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.history",
      "event": "view_user_history",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/server.js#/user/history"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/server.js#/user/history",
        "kind": "api"
      }
    ],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.downloads",
    "path": "/downloads",
    "title": "Downloads",
    "description": "Foundation exists — see implementedBy.",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "landing",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Downloads · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "user",
        "downloads"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Downloads",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Downloads",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.downloads",
      "event": "view_user_downloads",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/data/offline-cache-manifest.json"
    ],
    "evidence": [
      {
        "artifact": "radio-html/data/offline-cache-manifest.json",
        "kind": "data"
      }
    ],
    "dependsOn": [
      "user.login",
      "radio.download"
    ],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "user.notifications",
    "path": "/notifications",
    "title": "Notifications",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "User",
    "category": "hub",
    "status": "planned",
    "layout": "settings",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Notifications · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "user",
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
      "screenName": "user.notifications",
      "event": "view_user_notifications",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "user",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "user.settings",
    "path": "/settings",
    "title": "Settings",
    "description": "Persisted per-account settings (language, currency, persona, low-bandwidth).",
    "section": "User",
    "category": "hub",
    "status": "partial",
    "layout": "settings",
    "icon": "👤",
    "searchable": false,
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
      "listener"
    ],
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Settings · Radio Vaigyaaniq",
      "description": "Settings model + account surface mock exist.",
      "keywords": [
        "user",
        "settings"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Settings",
        "description": "Settings model + account surface mock exist.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Settings",
        "description": "Settings model + account surface mock exist."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "user.settings",
      "event": "view_user_settings",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio-backend/auth.js#updateSettings",
      "apps/radio-backend/server.js#/user/settings",
      "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount"
    ],
    "evidence": [
      {
        "artifact": "apps/radio-backend/auth.js#updateSettings",
        "kind": "code"
      },
      {
        "artifact": "apps/radio-backend/server.js#/user/settings",
        "kind": "api"
      },
      {
        "artifact": "apps/web/public/radio-html/assets/js/radio-engine.js#renderAccount",
        "kind": "code"
      }
    ],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "user",
      "hub",
      "partial"
    ],
    "dynamic": false
  }
];
