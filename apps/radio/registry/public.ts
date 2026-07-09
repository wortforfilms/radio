// Registry module: Public Website (14 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "public.home",
    "path": "/",
    "title": "Home",
    "description": "Standalone landing — surfaces, tools, payment API.",
    "section": "Public Website",
    "category": "hub",
    "status": "built",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": false,
      "header": false,
      "footer": false,
      "breadcrumbs": false,
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
      "title": "Home · Radio Vaigyaaniq",
      "description": "Standalone landing — surfaces, tools, payment API.",
      "keywords": [
        "public website"
      ],
      "canonical": "/",
      "robots": "index,follow",
      "openGraph": {
        "title": "Home",
        "description": "Standalone landing — surfaces, tools, payment API.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Home",
        "description": "Standalone landing — surfaces, tools, payment API."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.home",
      "event": "view_public_home",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/radio/app/page.tsx"
    ],
    "evidence": [
      {
        "artifact": "apps/radio/app/page.tsx",
        "kind": "code"
      }
    ],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "built"
    ],
    "dynamic": false
  },
  {
    "id": "public.about",
    "path": "/about",
    "title": "About",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": true,
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
      "title": "About · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "about"
      ],
      "canonical": "/about",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "About",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "About",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.about",
      "event": "view_public_about",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.mission",
    "path": "/mission",
    "title": "Mission",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
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
      "title": "Mission · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "mission"
      ],
      "canonical": "/mission",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Mission",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Mission",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.mission",
      "event": "view_public_mission",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.vision",
    "path": "/vision",
    "title": "Vision",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
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
      "title": "Vision · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "vision"
      ],
      "canonical": "/vision",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Vision",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Vision",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.vision",
      "event": "view_public_vision",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.science-for-bharat",
    "path": "/science-for-bharat",
    "title": "Science For Bharat",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
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
      "title": "Science For Bharat · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "science",
        "for",
        "bharat"
      ],
      "canonical": "/science-for-bharat",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Science For Bharat",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Science For Bharat",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.science-for-bharat",
      "event": "view_public_science_for_bharat",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.contact",
    "path": "/contact",
    "title": "Contact",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": true,
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
      "title": "Contact · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "contact"
      ],
      "canonical": "/contact",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Contact",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Contact",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.contact",
      "event": "view_public_contact",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.partners",
    "path": "/partners",
    "title": "Partners",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
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
      "title": "Partners · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "partners"
      ],
      "canonical": "/partners",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Partners",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Partners",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.partners",
      "event": "view_public_partners",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.sponsors",
    "path": "/sponsors",
    "title": "Sponsors",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
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
      "title": "Sponsors · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "sponsors"
      ],
      "canonical": "/sponsors",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Sponsors",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Sponsors",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.sponsors",
      "event": "view_public_sponsors",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.careers",
    "path": "/careers",
    "title": "Careers",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": true,
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
      "title": "Careers · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "careers"
      ],
      "canonical": "/careers",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Careers",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Careers",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.careers",
      "event": "view_public_careers",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.press",
    "path": "/press",
    "title": "Press",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": true,
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
      "title": "Press · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "press"
      ],
      "canonical": "/press",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Press",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Press",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.press",
      "event": "view_public_press",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.privacy",
    "path": "/privacy",
    "title": "Privacy",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "legal",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": false,
      "footer": true,
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
      "title": "Privacy · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "privacy"
      ],
      "canonical": "/privacy",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Privacy",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Privacy",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.privacy",
      "event": "view_public_privacy",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "legal",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.terms",
    "path": "/terms",
    "title": "Terms",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "legal",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": false,
      "footer": true,
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
      "title": "Terms · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "terms"
      ],
      "canonical": "/terms",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Terms",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Terms",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.terms",
      "event": "view_public_terms",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "legal",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.accessibility",
    "path": "/accessibility",
    "title": "Accessibility",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "legal",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": false,
      "footer": true,
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
      "title": "Accessibility · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "accessibility"
      ],
      "canonical": "/accessibility",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Accessibility",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Accessibility",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.accessibility",
      "event": "view_public_accessibility",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "legal",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "public.donate",
    "path": "/donate",
    "title": "Donate",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Public Website",
    "category": "commerce",
    "status": "planned",
    "layout": "landing",
    "icon": "🌐",
    "searchable": true,
    "navigation": {
      "sidebar": true,
      "header": true,
      "footer": true,
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
      "title": "Donate · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "public website",
        "donate"
      ],
      "canonical": "/donate",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Donate",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Donate",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "public.donate",
      "event": "view_public_donate",
      "trackingId": null,
      "conversionGoal": "donation"
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "public-website",
      "commerce",
      "planned"
    ],
    "dynamic": false
  }
];
