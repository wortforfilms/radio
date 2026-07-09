// Registry module: AI (8 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] =  [
  {
    "id": "ai",
    "path": "/ai",
    "title": "Ai",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "AI",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🤖",
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
      "labs"
    ],
    "api": [],
    "seo": {
      "title": "Ai · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "ai"
      ],
      "canonical": "/ai",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Ai",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Ai",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai",
      "event": "view_ai",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "ai",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "ai.rj",
    "path": "/ai/rj",
    "title": "Rj",
    "description": "Persona TTS announcements (Web Speech API); generative RJ not built.",
    "section": "AI",
    "category": "rj",
    "status": "partial",
    "layout": "article",
    "icon": "🤖",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Rj · Radio Vaigyaaniq",
      "description": "Persona TTS announcements (Web Speech API); generative RJ not built.",
      "keywords": [
        "ai",
        "rj"
      ],
      "canonical": "/ai/rj",
      "robots": "index,follow",
      "openGraph": {
        "title": "Rj",
        "description": "Persona TTS announcements (Web Speech API); generative RJ not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Rj",
        "description": "Persona TTS announcements (Web Speech API); generative RJ not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.rj",
      "event": "view_ai_rj",
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
      "ai",
      "rj",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "ai.chat",
    "path": "/ai/chat",
    "title": "Chat",
    "description": "Assistant API route exists in the umbrella app.",
    "section": "AI",
    "category": "chat",
    "status": "partial",
    "layout": "article",
    "icon": "🤖",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Chat · Radio Vaigyaaniq",
      "description": "Assistant API route exists in the umbrella app.",
      "keywords": [
        "ai",
        "chat"
      ],
      "canonical": "/ai/chat",
      "robots": "index,follow",
      "openGraph": {
        "title": "Chat",
        "description": "Assistant API route exists in the umbrella app.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Chat",
        "description": "Assistant API route exists in the umbrella app."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.chat",
      "event": "view_ai_chat",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/assistant"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/assistant",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "ai",
      "chat",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "ai.translator",
    "path": "/ai/translator",
    "title": "Translator",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "AI",
    "category": "translator",
    "status": "planned",
    "layout": "article",
    "icon": "🤖",
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
      "labs"
    ],
    "api": [],
    "seo": {
      "title": "Translator · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "ai",
        "translator"
      ],
      "canonical": "/ai/translator",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Translator",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Translator",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.translator",
      "event": "view_ai_translator",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "ai",
      "translator",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "ai.summarizer",
    "path": "/ai/summarizer",
    "title": "Summarizer",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "AI",
    "category": "summarizer",
    "status": "planned",
    "layout": "article",
    "icon": "🤖",
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
      "labs"
    ],
    "api": [],
    "seo": {
      "title": "Summarizer · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "ai",
        "summarizer"
      ],
      "canonical": "/ai/summarizer",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Summarizer",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Summarizer",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.summarizer",
      "event": "view_ai_summarizer",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "ai",
      "summarizer",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "ai.transcript",
    "path": "/ai/transcript",
    "title": "Transcript",
    "description": "Draft lyric/transcript cue data exists (timing unverified).",
    "section": "AI",
    "category": "transcript",
    "status": "partial",
    "layout": "reader",
    "icon": "🤖",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Transcript · Radio Vaigyaaniq",
      "description": "Draft lyric/transcript cue data exists (timing unverified).",
      "keywords": [
        "ai",
        "transcript"
      ],
      "canonical": "/ai/transcript",
      "robots": "index,follow",
      "openGraph": {
        "title": "Transcript",
        "description": "Draft lyric/transcript cue data exists (timing unverified).",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Transcript",
        "description": "Draft lyric/transcript cue data exists (timing unverified)."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.transcript",
      "event": "view_ai_transcript",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "radio-html/data/lyrics-prompter-data.json"
    ],
    "evidence": [
      {
        "artifact": "radio-html/data/lyrics-prompter-data.json",
        "kind": "data"
      }
    ],
    "dependsOn": [],
    "tags": [
      "ai",
      "transcript",
      "partial"
    ],
    "dynamic": false,
    "contentType": "transcript"
  },
  {
    "id": "ai.recommendations",
    "path": "/ai/recommendations",
    "title": "Recommendations",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "AI",
    "category": "recommendations",
    "status": "planned",
    "layout": "article",
    "icon": "🤖",
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
      "labs"
    ],
    "api": [],
    "seo": {
      "title": "Recommendations · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "ai",
        "recommendations"
      ],
      "canonical": "/ai/recommendations",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Recommendations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Recommendations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.recommendations",
      "event": "view_ai_recommendations",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "ai",
      "recommendations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "ai.search",
    "path": "/ai/search",
    "title": "Search",
    "description": "Knowledge search API exists; AI ranking not built.",
    "section": "AI",
    "category": "search",
    "status": "partial",
    "layout": "article",
    "icon": "🤖",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Search · Radio Vaigyaaniq",
      "description": "Knowledge search API exists; AI ranking not built.",
      "keywords": [
        "ai",
        "search"
      ],
      "canonical": "/ai/search",
      "robots": "index,follow",
      "openGraph": {
        "title": "Search",
        "description": "Knowledge search API exists; AI ranking not built.",
        "type": "website",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Search",
        "description": "Knowledge search API exists; AI ranking not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "ai.search",
      "event": "view_ai_search",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/search"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/search",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "ai",
      "search",
      "partial"
    ],
    "dynamic": false
  }
];
