// Manifest migration runner — explicit, stepwise version upgrades for
// route-registry.json artifacts (v1 → v2 → v3), replacing hand-written fixes.
//
//   node scripts/migrate-manifest.mjs <file> [--out <file>] [--dry-run]
//
// Migrations are additive + conservative: they normalise shape with honest
// minimal defaults and NEVER upgrade statuses or invent evidence. A registry
// migrated from v1 is structurally valid v3 but carries `migrated: true`
// markers; full enrichment still comes from recompiling the typed source.

import fs from "node:fs";

const CURRENT_VERSION = 3;

const MIGRATIONS = {
  // v1 (legacy build-route-registry.mjs output) → v2 (platform fields)
  2: (registry) => {
    const taken = new Set();
    for (const route of registry.routes) {
      if (!route.id) {
        const segments = route.path.split("/").filter(Boolean);
        let id = segments.join(".").replace(/:/g, "") || "public.home";
        while (taken.has(id)) id = `${id}-2`;
        taken.add(id);
        route.id = id;
      }
      route.category = route.category ?? "hub";
      route.layout = route.layout ?? "landing";
      route.icon = route.icon ?? route.emoji ?? "•";
      route.searchable = route.searchable ?? false;
      route.navigation = route.navigation ?? {
        sidebar: false, header: false, footer: false, breadcrumbs: route.path !== "/",
        commandPalette: route.status !== "planned", quickAccess: false, contextMenu: false
      };
      route.platforms = route.platforms ?? ["web"];
      route.permissions = route.permissions ?? ["anonymous"];
      route.featureFlags = route.featureFlags ?? [];
      route.api = route.api ?? [];
      route.seo = route.seo ?? {
        title: `${route.title} · Radio Vaigyaaniq`,
        description: route.description,
        keywords: route.path.split("/").filter(Boolean),
        canonical: null,
        robots: "noindex,nofollow", // conservative: migrated routes stay unindexed
        openGraph: { title: route.title, description: route.description, type: "website", image: null },
        twitter: { card: "summary", title: route.title, description: route.description },
        jsonLd: null
      };
      route.analytics = route.analytics ?? {
        screenName: route.id,
        event: `view_${route.id.replace(/[.\-]/g, "_")}`,
        trackingId: null,
        conversionGoal: null
      };
      route.evidence = route.evidence ?? (route.implementedBy || []).map((artifact) => ({ artifact, kind: "code" }));
      route.dependsOn = route.dependsOn ?? [];
      route.children = route.children ?? [];
      route.tags = route.tags ?? [route.section.toLowerCase().replace(/\s+/g, "-"), route.status];
      route.migrated = true;
    }
    registry.schemaVersion = 2;
    return registry;
  },
  // v2 → v3 (application manifest)
  3: (registry) => {
    for (const route of registry.routes) route.contentType = route.contentType ?? null;
    registry.$schema = registry.$schema ?? "/registry/registry.schema.json";
    registry.counts = {
      ...registry.counts,
      searchable: registry.routes.filter((route) => route.searchable).length,
      apiReferences: registry.routes.reduce((sum, route) => sum + (route.api?.length || 0), 0)
    };
    registry.schemaVersion = 3;
    return registry;
  }
};

const [file] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const outIndex = process.argv.indexOf("--out");
const outFile = outIndex >= 0 ? process.argv[outIndex + 1] : file;
const dryRun = process.argv.includes("--dry-run");

if (!file) {
  console.error("usage: node scripts/migrate-manifest.mjs <route-registry.json> [--out <file>] [--dry-run]");
  process.exit(1);
}

let registry = JSON.parse(fs.readFileSync(file, "utf8"));
const fromVersion = registry.schemaVersion ?? 1;
if (fromVersion > CURRENT_VERSION) {
  console.error(`file is schemaVersion ${fromVersion}, newer than this tool (v${CURRENT_VERSION}).`);
  process.exit(1);
}
const applied = [];
for (let version = fromVersion + 1; version <= CURRENT_VERSION; version += 1) {
  registry = MIGRATIONS[version](registry);
  applied.push(`v${version - 1}→v${version}`);
}
console.log(
  applied.length
    ? `migrated ${file}: ${applied.join(", ")} (${registry.routes.length} routes)${dryRun ? " [dry-run — not written]" : ""}`
    : `${file} already at schemaVersion ${CURRENT_VERSION} — nothing to do`
);
if (applied.length && !dryRun) fs.writeFileSync(outFile, `${JSON.stringify(registry, null, 2)}\n`);
