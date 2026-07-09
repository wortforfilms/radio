// Registry module: Research Hub (10 routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = [
  {
    "id": "research",
    "path": "/research",
    "title": "Research",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "hub",
    "status": "planned",
    "layout": "landing",
    "icon": "🔬",
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
      "title": "Research · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research"
      ],
      "canonical": "/research",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Research",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
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
      "screenName": "research",
      "event": "view_research",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "hub",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.publications",
    "path": "/research/publications",
    "title": "Publications",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "publications",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Publications · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "publications"
      ],
      "canonical": "/research/publications",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Publications",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Publications",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.publications",
      "event": "view_research_publications",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "publications",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.papers",
    "path": "/research/papers",
    "title": "Papers",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "papers",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Papers · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "papers"
      ],
      "canonical": "/research/papers",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Papers",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Papers",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.papers",
      "event": "view_research_papers",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "papers",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.datasets",
    "path": "/research/datasets",
    "title": "Datasets",
    "description": "HKD/CSV/GraphML exports of the knowledge graph exist; dataset portal not built.",
    "section": "Research Hub",
    "category": "datasets",
    "status": "partial",
    "layout": "article",
    "icon": "🔬",
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
      "title": "Datasets · Radio Vaigyaaniq",
      "description": "HKD/CSV/GraphML exports of the knowledge graph exist; dataset portal not built.",
      "keywords": [
        "research hub",
        "research",
        "datasets"
      ],
      "canonical": "/research/datasets",
      "robots": "index,follow",
      "openGraph": {
        "title": "Datasets",
        "description": "HKD/CSV/GraphML exports of the knowledge graph exist; dataset portal not built.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Datasets",
        "description": "HKD/CSV/GraphML exports of the knowledge graph exist; dataset portal not built."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.datasets",
      "event": "view_research_datasets",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [
      "apps/web/app/api/export"
    ],
    "evidence": [
      {
        "artifact": "apps/web/app/api/export",
        "kind": "api"
      }
    ],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "datasets",
      "partial"
    ],
    "dynamic": false
  },
  {
    "id": "research.experiments",
    "path": "/research/experiments",
    "title": "Experiments",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "experiments",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Experiments · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "experiments"
      ],
      "canonical": "/research/experiments",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Experiments",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Experiments",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.experiments",
      "event": "view_research_experiments",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "experiments",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.projects",
    "path": "/research/projects",
    "title": "Projects",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "projects",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Projects · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "projects"
      ],
      "canonical": "/research/projects",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Projects",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Projects",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.projects",
      "event": "view_research_projects",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "projects",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.labs",
    "path": "/research/labs",
    "title": "Labs",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "labs",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Labs · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "labs"
      ],
      "canonical": "/research/labs",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Labs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Labs",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.labs",
      "event": "view_research_labs",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "labs",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.authors",
    "path": "/research/authors",
    "title": "Authors",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "authors",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Authors · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "authors"
      ],
      "canonical": "/research/authors",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Authors",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Authors",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.authors",
      "event": "view_research_authors",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "authors",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.citations",
    "path": "/research/citations",
    "title": "Citations",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "citations",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Citations · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "citations"
      ],
      "canonical": "/research/citations",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Citations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Citations",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.citations",
      "event": "view_research_citations",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "citations",
      "planned"
    ],
    "dynamic": false
  },
  {
    "id": "research.downloads",
    "path": "/research/downloads",
    "title": "Downloads",
    "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
    "section": "Research Hub",
    "category": "downloads",
    "status": "planned",
    "layout": "article",
    "icon": "🔬",
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
    "featureFlags": [],
    "api": [],
    "seo": {
      "title": "Downloads · Radio Vaigyaaniq",
      "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
      "keywords": [
        "research hub",
        "research",
        "downloads"
      ],
      "canonical": "/research/downloads",
      "robots": "noindex,nofollow",
      "openGraph": {
        "title": "Downloads",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content.",
        "type": "article",
        "image": null
      },
      "twitter": {
        "card": "summary",
        "title": "Downloads",
        "description": "Not built yet. Renders a fail-closed placeholder; no fabricated content."
      },
      "jsonLd": null
    },
    "analytics": {
      "screenName": "research.downloads",
      "event": "view_research_downloads",
      "trackingId": null,
      "conversionGoal": null
    },
    "implementedBy": [],
    "evidence": [],
    "dependsOn": [],
    "tags": [
      "research-hub",
      "downloads",
      "planned"
    ],
    "dynamic": false
  }
];
