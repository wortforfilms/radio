// Registry platform build — derives EVERY subsystem artifact from the typed
// registry (apps/radio/registry/*.ts). No subsystem maintains duplicate config.
//
// Emits:
//   apps/radio/lib/route-registry.json      enriched, backwards-compatible
//     (+ mirrors: apps/{web,desktop}/public/radio-html/data/route-registry.json)
//   apps/radio/public/registry/navigation.json      sidebar/header/footer/palette/…
//   apps/radio/public/registry/search.json          generated search index
//   apps/radio/public/registry/permissions.json     role → routes map
//   apps/radio/public/registry/platform-map.json    platform → routes map
//   apps/radio/public/registry/api-map.json         UI route ↔ API endpoints
//   apps/radio/public/registry/dependency-graph.json nodes/edges/order/cycles
//   apps/radio/public/sitemap.xml robots.txt rss.xml atom.xml feed.json
//   docs/registry/{ROUTES,NAVIGATION,PERMISSIONS,API_MAP,SEARCH_INDEX,SITE_STRUCTURE}.md
//
// Run: npm run radio:registry   (node --experimental-strip-types, Node ≥ 22.6)
// The legacy generator (scripts/build-route-registry.mjs) is preserved; this
// pipeline supersedes it and its output stays a strict superset.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
// Flags enabled for generated navigation/feeds. Premium is a real surface;
// academy/events/labs stay hidden until their sections have real content.
const ENABLED_FLAGS = new Set((process.env.REGISTRY_FLAGS || "premium").split(",").filter(Boolean));
const generatedAt = new Date().toISOString();

const registryModule = await import(pathToFileURL(path.join(ROOT, "apps/radio/registry/index.ts")).href);
const { allRoutes, SECTIONS, validateRegistry } = registryModule;

const problems = validateRegistry();
if (problems.length) {
  console.error(`registry INVALID (${problems.length}):\n${problems.join("\n")}`);
  process.exit(1);
}

const flagVisible = (route) => route.featureFlags.every((flag) => ENABLED_FLAGS.has(flag));
const isPublic = (route) => route.permissions.includes("anonymous") && !route.path.startsWith("/api/");
const indexable = (route) => route.seo.robots === "index,follow" && !route.dynamic;

// ---------------------------------------------------------------------------
// 1. Enriched route-registry.json (backwards-compatible superset)
// ---------------------------------------------------------------------------
const emojiBySection = new Map(SECTIONS.map((section) => [section.name, section.emoji]));
const registry = {
  id: "radio-vaigyaaniq-route-registry",
  generatedAt,
  schemaVersion: 2,
  siteOrigin: SITE_ORIGIN,
  phkd: {
    failClosed: true,
    note: "Statuses are evidence-backed: built/partial cite concrete repo artifacts; planned routes render placeholders and never fabricate content, schedules, or claims."
  },
  counts: {
    sections: SECTIONS.length,
    routes: allRoutes.length,
    built: allRoutes.filter((r) => r.status === "built").length,
    partial: allRoutes.filter((r) => r.status === "partial").length,
    planned: allRoutes.filter((r) => r.status === "planned").length,
    dynamic: allRoutes.filter((r) => r.dynamic).length,
    searchable: allRoutes.filter((r) => r.searchable).length,
    apiReferences: allRoutes.reduce((sum, r) => sum + r.api.length, 0)
  },
  enabledFlags: [...ENABLED_FLAGS],
  sections: SECTIONS,
  routes: allRoutes.map((route) => ({
    // legacy fields (shape preserved for lib/routes.ts + existing tests)
    path: route.path,
    section: route.section,
    emoji: emojiBySection.get(route.section) || route.icon,
    title: route.title,
    status: route.status,
    implementedBy: route.implementedBy,
    description: route.description,
    dynamic: route.dynamic,
    // platform fields (schemaVersion 2)
    id: route.id,
    category: route.category,
    layout: route.layout,
    icon: route.icon,
    searchable: route.searchable,
    navigation: route.navigation,
    platforms: route.platforms,
    permissions: route.permissions,
    featureFlags: route.featureFlags,
    api: route.api,
    seo: route.seo,
    analytics: route.analytics,
    evidence: route.evidence,
    dependsOn: route.dependsOn,
    children: route.children,
    tags: route.tags
  }))
};

// ---------------------------------------------------------------------------
// 2. Navigation (generated; flag-hidden routes excluded)
// ---------------------------------------------------------------------------
const navigable = allRoutes.filter(flagVisible);
const navItem = (route) => ({ id: route.id, title: route.title, path: route.path, icon: route.icon, section: route.section, status: route.status });
const parentChain = (route) => {
  const chain = [];
  const parts = route.path.split("/").filter(Boolean);
  for (let index = 1; index < parts.length; index += 1) {
    const ancestorPath = `/${parts.slice(0, index).join("/")}`;
    const ancestor = allRoutes.find((candidate) => candidate.path === ancestorPath);
    if (ancestor) chain.push(ancestor.id);
  }
  return chain;
};
const navigation = {
  generatedAt,
  enabledFlags: [...ENABLED_FLAGS],
  sidebar: navigable.filter((r) => r.navigation.sidebar).map(navItem),
  header: navigable.filter((r) => r.navigation.header).map(navItem),
  footer: navigable.filter((r) => r.navigation.footer).map(navItem),
  quickAccess: navigable.filter((r) => r.navigation.quickAccess).map(navItem),
  commandPalette: navigable.filter((r) => r.navigation.commandPalette).map(navItem),
  contextMenu: navigable.filter((r) => r.navigation.contextMenu).map((r) => r.id),
  breadcrumbs: Object.fromEntries(navigable.filter((r) => r.navigation.breadcrumbs).map((r) => [r.id, parentChain(r)])),
  hiddenByFlags: allRoutes.filter((r) => !flagVisible(r)).map((r) => ({ id: r.id, featureFlags: r.featureFlags }))
};

// ---------------------------------------------------------------------------
// 3. Search index
// ---------------------------------------------------------------------------
const searchIndex = {
  generatedAt,
  count: 0,
  entries: allRoutes
    .filter((route) => route.searchable && flagVisible(route))
    .map((route) => ({
      id: route.id,
      title: route.title,
      description: route.description,
      keywords: route.seo.keywords,
      section: route.section,
      tags: route.tags,
      url: route.path,
      status: route.status
    }))
};
searchIndex.count = searchIndex.entries.length;

// ---------------------------------------------------------------------------
// 4. Permissions
// ---------------------------------------------------------------------------
const ROLES = ["anonymous", "listener", "student", "researcher", "creator", "moderator", "editor", "admin", "superadmin"];
// simple hierarchy: higher roles inherit lower public/listener access
const INHERITS = {
  anonymous: [], listener: ["anonymous"], student: ["listener", "anonymous"], researcher: ["listener", "anonymous"],
  creator: ["listener", "anonymous"], moderator: ["listener", "anonymous"],
  editor: ["creator", "listener", "anonymous"], admin: ["editor", "moderator", "creator", "listener", "anonymous"],
  superadmin: ["admin", "editor", "moderator", "creator", "listener", "anonymous"]
};
const permissions = {
  generatedAt,
  roles: ROLES,
  inherits: INHERITS,
  byRoute: Object.fromEntries(allRoutes.map((route) => [route.id, route.permissions])),
  byRole: Object.fromEntries(
    ROLES.map((role) => [
      role,
      allRoutes
        .filter((route) => route.permissions.some((needed) => needed === role || INHERITS[role].includes(needed)))
        .map((route) => route.id)
    ])
  )
};

// ---------------------------------------------------------------------------
// 5. Platform map
// ---------------------------------------------------------------------------
const PLATFORMS = ["web", "mobile", "desktop", "tv", "car", "watch", "api", "offline"];
const platformMap = {
  generatedAt,
  platforms: Object.fromEntries(
    PLATFORMS.map((platform) => [
      platform,
      allRoutes.filter((route) => route.platforms.includes(platform)).map((route) => route.id)
    ])
  ),
  navigationByPlatform: Object.fromEntries(
    PLATFORMS.filter((platform) => platform !== "api").map((platform) => [
      platform,
      navigable
        .filter((route) => route.platforms.includes(platform) && (route.navigation.sidebar || route.navigation.header))
        .map(navItem)
    ])
  )
};

// ---------------------------------------------------------------------------
// 6. API map (UI ↔ API, both directions)
// ---------------------------------------------------------------------------
const apiMap = { generatedAt, byRoute: {}, byEndpoint: {} };
for (const route of allRoutes) {
  if (!route.api.length) continue;
  apiMap.byRoute[route.id] = route.api;
  for (const ref of route.api) {
    const key = `${ref.method} ${ref.path}`;
    apiMap.byEndpoint[key] = apiMap.byEndpoint[key] || { status: ref.status, description: ref.description || null, usedBy: [] };
    apiMap.byEndpoint[key].usedBy.push(route.id);
  }
}

// ---------------------------------------------------------------------------
// 7. Dependency graph (edges + topological order; cycles already fail validation)
// ---------------------------------------------------------------------------
const edges = allRoutes.flatMap((route) => route.dependsOn.map((dep) => ({ from: route.id, to: dep })));
const order = [];
{
  const marked = new Set();
  const visit = (id) => {
    if (marked.has(id)) return;
    marked.add(id);
    for (const edge of edges) if (edge.from === id) visit(edge.to);
    order.push(id);
  };
  for (const route of allRoutes) visit(route.id);
}
const dependencyGraph = {
  generatedAt,
  nodes: allRoutes.filter((r) => r.dependsOn.length || edges.some((e) => e.to === r.id)).map((r) => r.id),
  edges,
  topologicalOrder: order.filter((id) => edges.some((e) => e.from === id || e.to === id)),
  cycles: []
};

// ---------------------------------------------------------------------------
// 8. sitemap.xml / robots.txt / feeds (public routes only)
// ---------------------------------------------------------------------------
const publicRoutes = allRoutes.filter((route) => isPublic(route) && indexable(route) && flagVisible(route));
const xmlEscape = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map((route) => `  <url><loc>${SITE_ORIGIN}${xmlEscape(route.path)}</loc><changefreq>${route.status === "built" ? "daily" : "weekly"}</changefreq><priority>${route.path === "/" ? "1.0" : route.status === "built" ? "0.8" : "0.5"}</priority></url>`).join("\n")}
</urlset>
`;
const disallowed = ["/admin", "/cms", "/studio", "/analytics", "/api/", "/profile", "/settings", "/notifications", "/bookmarks", "/history", "/downloads"];
const robots = `# Generated from the route registry — do not edit by hand.
User-agent: *
${disallowed.map((prefix) => `Disallow: ${prefix}`).join("\n")}
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
const feedRoutes = publicRoutes.filter((route) => route.status !== "planned").slice(0, 50);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Radio Vaigyaaniq — Ecosystem</title>
  <link>${SITE_ORIGIN}</link>
  <description>Live sections of the Radio Vaigyaaniq platform (information-architecture feed; statuses evidence-backed).</description>
  <lastBuildDate>${new Date(generatedAt).toUTCString()}</lastBuildDate>
${feedRoutes.map((route) => `  <item><title>${xmlEscape(route.title)}</title><link>${SITE_ORIGIN}${xmlEscape(route.path)}</link><guid isPermaLink="false">${route.id}</guid><description>${xmlEscape(route.description)}</description></item>`).join("\n")}
</channel></rss>
`;
const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Radio Vaigyaaniq — Ecosystem</title>
  <id>${SITE_ORIGIN}/</id>
  <link href="${SITE_ORIGIN}/atom.xml" rel="self"/>
  <updated>${generatedAt}</updated>
${feedRoutes.map((route) => `  <entry><title>${xmlEscape(route.title)}</title><id>${route.id}</id><link href="${SITE_ORIGIN}${xmlEscape(route.path)}"/><updated>${generatedAt}</updated><summary>${xmlEscape(route.description)}</summary></entry>`).join("\n")}
</feed>
`;
const jsonFeed = {
  version: "https://jsonfeed.org/version/1.1",
  title: "Radio Vaigyaaniq — Ecosystem",
  home_page_url: SITE_ORIGIN,
  feed_url: `${SITE_ORIGIN}/feed.json`,
  description: "Live sections of the Radio Vaigyaaniq platform (IA feed; statuses evidence-backed).",
  items: feedRoutes.map((route) => ({ id: route.id, url: `${SITE_ORIGIN}${route.path}`, title: route.title, content_text: route.description, tags: route.tags }))
};

// ---------------------------------------------------------------------------
// 9. Documentation
// ---------------------------------------------------------------------------
const chip = { built: "✅ built", partial: "🟡 partial", planned: "⬜ planned" };
const routesMd = `# Routes\n\nGenerated ${generatedAt} from \`apps/radio/registry\` — do not edit by hand.\n\nTotal **${allRoutes.length}** routes · ${registry.counts.built} built · ${registry.counts.partial} partial · ${registry.counts.planned} planned.\n\n${SECTIONS.map((section) => {
  const rows = allRoutes.filter((route) => route.section === section.name);
  return `## ${section.emoji} ${section.name}\n\n| id | path | status | layout | permissions | flags |\n|---|---|---|---|---|---|\n${rows.map((route) => `| \`${route.id}\` | \`${route.path}\` | ${chip[route.status]} | ${route.layout} | ${route.permissions.join(", ")} | ${route.featureFlags.join(", ") || "—"} |`).join("\n")}\n`;
}).join("\n")}`;
const navigationMd = `# Navigation\n\nGenerated ${generatedAt}. Flag-hidden routes excluded (enabled: ${[...ENABLED_FLAGS].join(", ") || "none"}).\n\n${["sidebar", "header", "footer", "quickAccess", "commandPalette"].map((zone) => `## ${zone}\n\n${navigation[zone].map((item) => `- ${item.icon} [\`${item.id}\`](${item.path}) — ${item.title} (${item.status})`).join("\n")}\n`).join("\n")}\n## Hidden by feature flags\n\n${navigation.hiddenByFlags.map((entry) => `- \`${entry.id}\` (needs: ${entry.featureFlags.join(", ")})`).join("\n")}\n`;
const permissionsMd = `# Permissions\n\nGenerated ${generatedAt}.\n\nRoles: ${ROLES.join(" · ")}\n\n| role | accessible routes |\n|---|---|\n${ROLES.map((role) => `| ${role} | ${permissions.byRole[role].length} |`).join("\n")}\n\n## Non-public routes\n\n| route | requires |\n|---|---|\n${allRoutes.filter((route) => !route.permissions.includes("anonymous")).map((route) => `| \`${route.id}\` | ${route.permissions.join(", ")} |`).join("\n")}\n`;
const apiMapMd = `# API Map\n\nGenerated ${generatedAt}. Statuses are honest — planned endpoints do not exist yet.\n\n| endpoint | status | used by |\n|---|---|---|\n${Object.entries(apiMap.byEndpoint).map(([endpoint, meta]) => `| \`${endpoint}\` | ${chip[meta.status]} | ${meta.usedBy.map((id) => `\`${id}\``).join(", ")} |`).join("\n")}\n`;
const searchIndexMd = `# Search Index\n\nGenerated ${generatedAt}. ${searchIndex.count} searchable public routes → \`registry/search.json\`.\n\n| id | url | section | keywords |\n|---|---|---|---|\n${searchIndex.entries.map((entry) => `| \`${entry.id}\` | ${entry.url} | ${entry.section} | ${entry.keywords.slice(0, 6).join(", ")} |`).join("\n")}\n`;
const tree = allRoutes
  .slice()
  .sort((a, b) => a.path.localeCompare(b.path))
  .map((route) => `${"  ".repeat(Math.max(0, route.path.split("/").filter(Boolean).length - 1))}- \`${route.path}\` (${route.id}, ${route.status})`)
  .join("\n");
const siteStructureMd = `# Site Structure\n\nGenerated ${generatedAt}.\n\n${tree}\n`;

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------
const writes = [
  ["apps/radio/lib/route-registry.json", `${JSON.stringify(registry, null, 2)}\n`],
  ["apps/web/public/radio-html/data/route-registry.json", `${JSON.stringify(registry, null, 2)}\n`],
  ["apps/desktop/public/radio-html/data/route-registry.json", `${JSON.stringify(registry, null, 2)}\n`],
  ["apps/radio/public/registry/navigation.json", `${JSON.stringify(navigation, null, 2)}\n`],
  ["apps/radio/public/registry/search.json", `${JSON.stringify(searchIndex, null, 2)}\n`],
  ["apps/radio/public/registry/permissions.json", `${JSON.stringify(permissions, null, 2)}\n`],
  ["apps/radio/public/registry/platform-map.json", `${JSON.stringify(platformMap, null, 2)}\n`],
  ["apps/radio/public/registry/api-map.json", `${JSON.stringify(apiMap, null, 2)}\n`],
  ["apps/radio/public/registry/dependency-graph.json", `${JSON.stringify(dependencyGraph, null, 2)}\n`],
  ["apps/radio/public/sitemap.xml", sitemap],
  ["apps/radio/public/robots.txt", robots],
  ["apps/radio/public/rss.xml", rss],
  ["apps/radio/public/atom.xml", atom],
  ["apps/radio/public/feed.json", `${JSON.stringify(jsonFeed, null, 2)}\n`],
  ["docs/registry/ROUTES.md", routesMd],
  ["docs/registry/NAVIGATION.md", navigationMd],
  ["docs/registry/PERMISSIONS.md", permissionsMd],
  ["docs/registry/API_MAP.md", apiMapMd],
  ["docs/registry/SEARCH_INDEX.md", searchIndexMd],
  ["docs/registry/SITE_STRUCTURE.md", siteStructureMd]
];
for (const [target, content] of writes) {
  const file = path.join(ROOT, target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

console.log(`registry-platform routes=${allRoutes.length} outputs=${writes.length}`);
console.log(`registry-platform nav: sidebar=${navigation.sidebar.length} header=${navigation.header.length} footer=${navigation.footer.length} palette=${navigation.commandPalette.length} hiddenByFlags=${navigation.hiddenByFlags.length}`);
console.log(`registry-platform search=${searchIndex.count} sitemapUrls=${publicRoutes.length} apiEndpoints=${Object.keys(apiMap.byEndpoint).length} depEdges=${edges.length}`);
