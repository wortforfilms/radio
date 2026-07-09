// Registry module: Academy (9 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "academy",
    "path": "/academy",
    "title": "Academy",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Academy · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy"
      ],
      "canonical": "/academy",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Academy",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Academy",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy",
      "event": "view_academy",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.courses",
    "path": "/academy/courses",
    "title": "Courses",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "courses",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Courses · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "courses"
      ],
      "canonical": "/academy/courses",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Courses",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Courses",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.courses",
      "event": "view_academy_courses",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "courses",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.course",
    "path": "/academy/course/:slug",
    "title": "Slug",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "course",
    "status": "planned",
    "layout": "reader",
    "icon": "🎓",
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
      "anonymous"
    ],
    "featureFlags": [
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Slug · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "course",
        "slug"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Slug",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Slug",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.course",
      "event": "view_academy_course",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "course",
      "planned"
    ],
    "dynamic": true
  },
  {
    "id": "academy.lessons",
    "path": "/academy/lessons",
    "title": "Lessons",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "lessons",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Lessons · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "lessons"
      ],
      "canonical": "/academy/lessons",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Lessons",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Lessons",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.lessons",
      "event": "view_academy_lessons",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "lessons",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.quizzes",
    "path": "/academy/quizzes",
    "title": "Quizzes",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "quizzes",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Quizzes · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "quizzes"
      ],
      "canonical": "/academy/quizzes",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Quizzes",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Quizzes",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.quizzes",
      "event": "view_academy_quizzes",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "quizzes",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.tests",
    "path": "/academy/tests",
    "title": "Tests",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "tests",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Tests · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "tests"
      ],
      "canonical": "/academy/tests",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Tests",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Tests",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.tests",
      "event": "view_academy_tests",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "tests",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.certificates",
    "path": "/academy/certificates",
    "title": "Certificates",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "certificates",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Certificates · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "certificates"
      ],
      "canonical": "/academy/certificates",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Certificates",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Certificates",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.certificates",
      "event": "view_academy_certificates",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login",
      "academy.tests"
    ],
    "tags": [
      "academy",
      "certificates",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.my-learning",
    "path": "/academy/my-learning",
    "title": "My Learning",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "my-learning",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
    "featureFlags": [
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "My Learning · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "my",
        "learning"
      ],
      "canonical": null,
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "My Learning",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "My Learning",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.my-learning",
      "event": "view_academy_my_learning",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [
      "user.login"
    ],
    "tags": [
      "academy",
      "my-learning",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "academy.leaderboard",
    "path": "/academy/leaderboard",
    "title": "Leaderboard",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Academy",
    "category": "leaderboard",
    "status": "planned",
    "layout": "article",
    "icon": "🎓",
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
      "academy"
    ],
    "api": [],
    "seo": {
      "title": "Leaderboard · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "academy",
        "leaderboard"
      ],
      "canonical": "/academy/leaderboard",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Leaderboard",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Leaderboard",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "academy.leaderboard",
      "event": "view_academy_leaderboard",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "academy",
      "leaderboard",
      "planned"
    ],
    "dynamic": false
  }
];
