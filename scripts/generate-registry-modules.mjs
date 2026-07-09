// ONE-TIME MIGRATION CODEGEN — legacy route-registry.json → typed registry modules.
//
// Reads the legacy registry (built by scripts/build-route-registry.mjs, which is
// preserved untouched) and writes apps/radio/registry/<section>.ts modules with
// deterministic, honest enrichment: stable ids, layout/platform/permission/flag/
// navigation/SEO/analytics/API metadata. Legacy paths, statuses, descriptions and
// evidence are carried over verbatim — nothing is upgraded or fabricated.
//
// ⚠ Re-running OVERWRITES the section modules (hand edits included). After the
// initial migration the TS modules are the source of truth; keep this script only
// as a documented recovery tool.
//
// Usage: node scripts/generate-registry-modules.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_DIR = path.join(ROOT, "apps/radio/registry");
const legacy = JSON.parse(
  fs.readFileSync(path.join(ROOT, "apps/radio/lib/route-registry.json"), "utf8")
);

// section → { module file, id prefix }
const SECTION_MODULES = {
  "Public Website": ["public", "public"],
  Radio: ["radio", "radio"],
  Podcast: ["podcasts", "podcasts"],
  "Research Hub": ["research", "research"],
  "Science Categories": ["discover", "discover"],
  Academy: ["academy", "academy"],
  Community: ["community", "community"],
  Events: ["events", "events"],
  News: ["news", "news"],
  Media: ["media", "media"],
  AI: ["ai", "ai"],
  Search: ["search", "search"],
  User: ["user", "user"],
  Premium: ["premium", "premium"],
  Analytics: ["analytics", "analytics"],
  Studio: ["studio", "studio"],
  "Content Management": ["cms", "cms"],
  Administration: ["admin", "admin"],
  API: ["api", "api"],
  "Ecosystem Integration": ["ecosystem", "ecosystem"]
};

// ---------------------------------------------------------------------------
// Deterministic enrichment rules
// ---------------------------------------------------------------------------
function idFor(route, prefix, taken) {
  let segments = route.path.split("/").filter(Boolean);
  // Drop the section-root segment only when it matches the id prefix
  // (e.g. /radio/live → live), and "v1" for API routes. Top-level routes in
  // aggregate sections (/login → user.login, /about → public.about) keep theirs.
  if (segments[0] === "api") segments = segments.slice(2);
  else if (segments[0] === prefix) segments = segments.slice(1);
  const tail = segments.filter((segment) => !segment.startsWith(":"));
  let id = [prefix, ...tail].join(".") || prefix;
  if (route.path === "/") id = "public.home";
  if (route.dynamic && taken.has(id)) id = `${id}.detail`;
  let candidate = id;
  let n = 2;
  while (taken.has(candidate)) candidate = `${id}-${n++}`;
  taken.add(candidate);
  return candidate;
}

function layoutFor(route) {
  const p = route.path;
  if (p === "/") return "landing";
  if (p.startsWith("/admin") || p.startsWith("/cms")) return "admin";
  if (p.startsWith("/studio")) return "studio";
  if (p.startsWith("/analytics")) return "dashboard";
  if (p === "/radio/live" || p === "/radio/now-playing" || p.startsWith("/podcasts/:")) return "player";
  if (p === "/livestreams" || p === "/videos" || p === "/shorts") return "player";
  if (p === "/settings" || p.startsWith("/profile") || p === "/notifications") return "settings";
  if (p.startsWith("/news") || p.startsWith("/research/p") || p.startsWith("/discover/")) return "article";
  if (p.includes("/transcript") || p === "/academy/course/:slug") return "reader";
  if (p.startsWith("/search")) return "dashboard";
  if (p.startsWith("/api/")) return "fullscreen";
  const depth = p.split("/").filter(Boolean).length;
  return depth <= 1 ? "landing" : "article";
}

function platformsFor(route) {
  const p = route.path;
  if (p.startsWith("/api/")) return ["api"];
  if (p.startsWith("/admin") || p.startsWith("/cms") || p.startsWith("/studio") || p.startsWith("/analytics"))
    return ["web", "desktop"];
  if (p.startsWith("/radio")) {
    const base = ["web", "mobile", "desktop", "offline"];
    // Intended reach for the player surfaces (IA metadata, not a built claim).
    if (p === "/radio/live" || p === "/radio/now-playing") return [...base, "tv", "car", "watch"];
    return base;
  }
  if (p.startsWith("/podcasts")) return ["web", "mobile", "desktop", "offline", "car"];
  return ["web", "mobile", "desktop"];
}

function permissionsFor(route) {
  const p = route.path;
  if (p.startsWith("/admin")) return p === "/admin" ? ["admin", "superadmin"] : ["admin", "superadmin"];
  if (p.startsWith("/cms")) return ["editor", "admin", "superadmin"];
  if (p.startsWith("/studio")) return ["creator", "editor", "admin"];
  if (p.startsWith("/analytics")) return ["admin", "superadmin"];
  if (
    ["/profile", "/profile/edit", "/bookmarks", "/history", "/downloads", "/notifications", "/settings"].includes(p) ||
    p.startsWith("/premium/history") || p.startsWith("/premium/library") ||
    p === "/academy/my-learning" || p === "/podcasts/bookmark"
  )
    return ["listener"];
  if (p.startsWith("/community/profile")) return ["listener"];
  return ["anonymous"];
}

function flagsFor(route) {
  const p = route.path;
  const flags = [];
  if (p.startsWith("/premium")) flags.push("premium");
  if (p.startsWith("/academy")) flags.push("academy");
  if (p.startsWith("/events")) flags.push("events");
  if (p.startsWith("/ai") && route.status === "planned") flags.push("labs");
  return flags;
}

function categoryFor(route) {
  const p = route.path;
  if (["/privacy", "/terms", "/accessibility"].includes(p)) return "legal";
  if (p.startsWith("/radio")) {
    if (["/radio/live", "/radio/now-playing"].includes(p)) return "playback";
    if (["/radio/schedule", "/radio/shows", "/radio/shows/:slug", "/radio/rj/:slug"].includes(p)) return "programming";
    if (["/radio/archive", "/radio/download"].includes(p)) return "library";
    return "engagement";
  }
  if (p.startsWith("/premium") || p === "/donate") return "commerce";
  if (p.startsWith("/api/")) return "api";
  if (p.startsWith("/admin") || p.startsWith("/cms")) return "operations";
  const seg = p.split("/").filter(Boolean);
  return seg.length > 1 ? seg[1].replace(/:/g, "") : "hub";
}

function navigationFor(route) {
  const depth = route.path.split("/").filter(Boolean).length;
  const isSectionRoot = depth <= 1 && route.path !== "/";
  const isLegal = ["/privacy", "/terms", "/accessibility"].includes(route.path);
  const operational = /^\/(admin|cms|studio|analytics|api)\b/.test(route.path);
  return {
    sidebar: isSectionRoot && !operational,
    header: isSectionRoot && !operational && !isLegal,
    footer: isLegal || ["/about", "/contact", "/donate", "/press", "/careers"].includes(route.path),
    breadcrumbs: route.path !== "/",
    commandPalette: route.status !== "planned",
    quickAccess: ["/radio/live", "/radio/now-playing", "/radio/archive", "/search", "/premium"].includes(route.path),
    contextMenu: route.path.startsWith("/radio/") || route.path.startsWith("/podcasts/")
  };
}

function searchableFor(route) {
  return !/^\/(admin|cms|api)\b/.test(route.path) && !route.dynamic;
}

function keywordsFor(route) {
  return [
    ...new Set(
      [route.section.toLowerCase(), ...route.path.split("/").filter(Boolean).map((s) => s.replace(/^:/, ""))]
        .flatMap((token) => token.split("-"))
        .filter((token) => token && token !== "v1")
    )
  ];
}

// Real, existing endpoints only (status partial/built); v1 aliases stay planned.
const API_REFS = {
  "/radio": [
    { method: "GET", path: "/api/stations", status: "partial", description: "Station lineup (radio-backend)" },
    { method: "GET", path: "/api/evidence", status: "partial", description: "Manifest evidence" }
  ],
  "/radio/live": [
    { method: "GET", path: "/api/stations", status: "partial" },
    { method: "GET", path: "/api/stream-candidates", status: "partial", description: "Opt-in test streams (rights unverified)" }
  ],
  "/radio/schedule": [{ method: "GET", path: "/api/schedule/:stationSlug", status: "partial" }],
  "/radio/download": [{ method: "GET", path: "/api/offline-bundle", status: "partial", description: "Rights-aware offline bundle" }],
  "/premium/payment": [
    { method: "POST", path: "/api/payments/order", status: "partial", description: "Server-priced Razorpay order" },
    { method: "POST", path: "/api/payments/webhook", status: "partial", description: "HMAC-verified capture → entitlement" }
  ],
  "/premium/library": [{ method: "GET", path: "/api/entitlements/:userId", status: "partial" }],
  "/search": [{ method: "GET", path: "/api/search", status: "partial" }],
  "/analytics": [{ method: "GET", path: "/api/analytics", status: "partial" }],
  "/admin": [
    { method: "POST", path: "/admin/login", status: "built" },
    { method: "GET", path: "/admin/state", status: "built" },
    { method: "POST", path: "/admin/rights-proof", status: "built" },
    { method: "GET", path: "/admin/cache-status", status: "built" }
  ],
  "/api/v1/radio": [{ method: "GET", path: "/api/v1/radio", status: "planned", description: "Versioned alias of /api/stations" }],
  "/api/v1/payments": [{ method: "POST", path: "/api/v1/payments", status: "planned", description: "Versioned alias of /api/payments/*" }],
  "/api/v1/search": [{ method: "GET", path: "/api/v1/search", status: "planned", description: "Versioned alias of /api/search" }],
  "/api/v1/analytics": [{ method: "GET", path: "/api/v1/analytics", status: "planned", description: "Versioned alias of /api/analytics" }]
};

// Route-id dependencies (path-keyed here; converted to ids after assignment).
const DEPENDS_ON = {
  "/premium/payment": ["/login", "/profile", "/premium/plans"],
  "/premium/history": ["/login", "/premium/payment"],
  "/premium/library": ["/login", "/premium/payment"],
  "/academy/my-learning": ["/login"],
  "/academy/certificates": ["/login", "/academy/tests"],
  "/community/profile/:username": ["/login"],
  "/profile/edit": ["/profile"],
  "/profile": ["/login"],
  "/bookmarks": ["/login"],
  "/history": ["/login"],
  "/downloads": ["/login", "/radio/download"],
  "/notifications": ["/login"],
  "/settings": ["/login"],
  "/radio/download": ["/radio/archive"],
  "/radio/request": ["/login"],
  "/radio/dedicate": ["/login"],
  "/studio/queue": ["/studio/upload"],
  "/cms/scheduler": ["/cms/shows"]
};

function evidenceFor(route) {
  return route.implementedBy.map((artifact) => ({
    artifact,
    kind: artifact.includes("api") || artifact.startsWith("apps/radio-backend")
      ? "api"
      : artifact.endsWith(".md")
        ? "doc"
        : artifact.includes("data/") || artifact.endsWith(".json")
          ? "data"
          : artifact.includes("radio-html")
            ? "surface"
            : "code"
  }));
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
const taken = new Set();
const idByPath = new Map();
const enriched = legacy.routes.map((route) => {
  const [, prefix] = SECTION_MODULES[route.section];
  const id = idFor(route, prefix, taken);
  idByPath.set(route.path, id);
  return { route, id };
});

const byModule = new Map();
for (const { route, id } of enriched) {
  const [moduleName] = SECTION_MODULES[route.section];
  const isPublic = permissionsFor(route)[0] === "anonymous" && !route.path.startsWith("/api/");
  const definition = {
    id,
    path: route.path,
    title: route.title,
    description: route.description,
    section: route.section,
    category: categoryFor(route),
    status: route.status,
    layout: layoutFor(route),
    icon: route.emoji,
    searchable: searchableFor(route) && isPublic,
    navigation: navigationFor(route),
    platforms: platformsFor(route),
    permissions: permissionsFor(route),
    featureFlags: flagsFor(route),
    api: API_REFS[route.path] || [],
    seo: {
      title: `${route.title} · Radio Vaigyaaniq`,
      description: route.description,
      keywords: keywordsFor(route),
      canonical: isPublic && !route.dynamic ? route.path : null,
      robots: isPublic && route.status !== "planned" ? "index,follow" : "noindex,nofollow",
      openGraph: {
        title: route.title,
        description: route.description,
        type: route.path.startsWith("/news") || route.path.startsWith("/research") ? "article" : "website",
        image: null
      },
      twitter: { card: "summary", title: route.title, description: route.description },
      jsonLd: null
    },
    analytics: {
      screenName: id,
      event: `view_${id.replace(/[.\-]/g, "_")}`,
      trackingId: null, // no analytics provider configured — stays null (honest)
      conversionGoal: route.path === "/premium/payment" ? "purchase" : route.path === "/donate" ? "donation" : null
    },
    implementedBy: route.implementedBy,
    evidence: evidenceFor(route),
    dependsOn: (DEPENDS_ON[route.path] || []).map((depPath) => idByPath.get(depPath)).filter(Boolean),
    tags: [...new Set([route.section.toLowerCase().replace(/\s+/g, "-"), categoryFor(route), route.status])],
    dynamic: route.dynamic
  };
  if (!byModule.has(moduleName)) byModule.set(moduleName, []);
  byModule.get(moduleName).push(definition);
}

fs.mkdirSync(REGISTRY_DIR, { recursive: true });
for (const [moduleName, defs] of byModule) {
  const body = `// Registry module: ${defs[0].section} (${defs.length} routes).
// Source of truth — edit here; ids are PERMANENT (never reuse or rename).
// Generated initially by scripts/generate-registry-modules.mjs from the legacy
// registry; statuses/evidence carried over verbatim (PHKD: evidence-backed).
import type { RouteDefinition } from "./types.ts";

export const routes: RouteDefinition[] = ${JSON.stringify(defs, null, 2)};
`;
  fs.writeFileSync(path.join(REGISTRY_DIR, `${moduleName}.ts`), body);
}

console.log(
  `registry-modules generated=${byModule.size} routes=${enriched.length} ids-unique=${taken.size === enriched.length}`
);
