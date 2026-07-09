// Registry module: Premium (5 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "premium",
    "path": "/premium",
    "title": "Premium",
    "description": "₹29 track / ₹299 all-access model + checkout surface; live payments await Razorpay keys.",
    "section": "Premium",
    "category": "commerce",
    "status": "partial",
    "layout": "landing",
    "icon": "💎",
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
    "featureFlags": [
      "premium"
    ],
    "api": [],
    "seo": {
      "title": "Premium · Radio Vaigyaaniq",
      "description": "₹29 track / ₹299 all-access model + checkout surface; live payments await Razorpay keys.",
      "keywords": [
        "premium"
      ],
      "canonical": "/premium",
      "robots": "index,follow",
      "openGraph": {
        "title": "Premium",
        "description": "₹29 track / ₹299 all-access model + checkout surface; live payments await Razorpay keys.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Premium",
        "description": "₹29 track / ₹299 all-access model + checkout surface; live payments await Razorpay keys."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "premium",
      "event": "view_premium",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/Radio_Pricing_Checkout.html",
      "packages/shared/src/commerce.ts"
    ],
    "evidence": [
      {
        "artifact": "radio-html/Radio_Pricing_Checkout.html",
        "kind": "surface"
      },
      {
        "artifact": "packages/shared/src/commerce.ts",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "premium",
      "commerce",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "premium.plans",
    "path": "/premium/plans",
    "title": "Plans",
    "description": "Foundation exists — see implementedBy.",
    "section": "Premium",
    "category": "commerce",
    "status": "partial",
    "layout": "article",
    "icon": "💎",
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
    "featureFlags": [
      "premium"
    ],
    "api": [],
    "seo": {
      "title": "Plans · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "premium",
        "plans"
      ],
      "canonical": "/premium/plans",
      "robots": "index,follow",
      "openGraph": {
        "title": "Plans",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Plans",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "premium.plans",
      "event": "view_premium_plans",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "packages/shared/src/commerce.ts"
    ],
    "evidence": [
      {
        "artifact": "packages/shared/src/commerce.ts",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "premium",
      "commerce",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "premium.payment",
    "path": "/premium/payment",
    "title": "Payment",
    "description": "Server-priced Razorpay orders + HMAC-verified webhooks built; needs keys + one real txn.",
    "section": "Premium",
    "category": "commerce",
    "status": "partial",
    "layout": "article",
    "icon": "💎",
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
    "featureFlags": [
      "premium"
    ],
    "api": [
      {
        "method": "POST",
        "path": "/api/payments/order",
        "status": "partial",
        "description": "Server-priced Razorpay order"
      },
      {
        "method": "POST",
        "path": "/api/payments/webhook",
        "status": "partial",
        "description": "HMAC-verified capture → entitlement"
      }
    ],
    "seo": {
      "title": "Payment · Radio Vaigyaaniq",
      "description": "Server-priced Razorpay orders + HMAC-verified webhooks built; needs keys + one real txn.",
      "keywords": [
        "premium",
        "payment"
      ],
      "canonical": "/premium/payment",
      "robots": "index,follow",
      "openGraph": {
        "title": "Payment",
        "description": "Server-priced Razorpay orders + HMAC-verified webhooks built; needs keys + one real txn.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Payment",
        "description": "Server-priced Razorpay orders + HMAC-verified webhooks built; needs keys + one real txn."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "premium.payment",
      "event": "view_premium_payment",
      "trackingId": null,
      "conversionGoal": "purchase"
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
    "dependsOn": [
      "user.login",
      "user.profile",
      "premium.plans"
    ],
    "tags": [
      "premium",
      "commerce",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "premium.history",
    "path": "/premium/history",
    "title": "History",
    "description": "Foundation exists — see implementedBy.",
    "section": "Premium",
    "category": "commerce",
    "status": "partial",
    "layout": "article",
    "icon": "💎",
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
      "mobile",
      "desktop"
    ],
    "permissions": [
      "listener"
    ],
    "featureFlags": [
      "premium"
    ],
    "api": [],
    "seo": {
      "title": "History · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "premium",
        "history"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "History",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "History",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "premium.history",
      "event": "view_premium_history",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "prisma/schema.prisma#Purchase"
    ],
    "evidence": [
      {
        "artifact": "prisma/schema.prisma#Purchase",
        "kind": "code"
      }
    ],
    "dependsOn": [
      "user.login",
      "premium.payment"
    ],
    "tags": [
      "premium",
      "commerce",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "premium.library",
    "path": "/premium/library",
    "title": "Library",
    "description": "Foundation exists — see implementedBy.",
    "section": "Premium",
    "category": "commerce",
    "status": "partial",
    "layout": "article",
    "icon": "💎",
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
      "mobile",
      "desktop"
    ],
    "permissions": [
      "listener"
    ],
    "featureFlags": [
      "premium"
    ],
    "api": [
      {
        "method": "GET",
        "path": "/api/entitlements/:userId",
        "status": "partial"
      }
    ],
    "seo": {
      "title": "Library · Radio Vaigyaaniq",
      "description": "Foundation exists — see implementedBy.",
      "keywords": [
        "premium",
        "library"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Library",
        "description": "Foundation exists — see implementedBy.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Library",
        "description": "Foundation exists — see implementedBy."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "premium.library",
      "event": "view_premium_library",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "prisma/schema.prisma#Entitlement"
    ],
    "evidence": [
      {
        "artifact": "prisma/schema.prisma#Entitlement",
        "kind": "code"
      }
    ],
    "dependsOn": [
      "user.login",
      "premium.payment"
    ],
    "tags": [
      "premium",
      "commerce",
      "partial"
    ],
    "dynamic": false
  }
];
