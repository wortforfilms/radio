// Registry platform build — COMPILER + INCREMENTAL PLUGIN PIPELINE.
//
//   registry (typed modules)
//     ↓ compiler (scripts/registry-compiler.mjs)
//     ↓ canonical compiled manifest  → lib/compiled-manifest.json (+ public copy)
//     ↓ plugins (only those whose inputs changed — dependency-tracked)
//     ↓ generated artifacts
//
// Incremental: per-source-file hashes live in apps/radio/.registry-buildcache.json.
// tokens.ts change → tokens plugin (+ its dependents) only; OpenAPI/CMS untouched.
// Flags: --force (run everything) · --update-lock (accept intentional id changes).
//
// Run: npm run radio:registry   (node --experimental-strip-types, Node ≥ 22.6)

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compileManifest } from "./registry-compiler.mjs";

const ROOT = process.cwd();
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const ENABLED_FLAGS = new Set((process.env.REGISTRY_FLAGS || "premium").split(",").filter(Boolean));
const force = process.argv.includes("--force");
const updateLock = process.argv.includes("--update-lock");
const generatedAt = new Date().toISOString();
const CACHE_PATH = path.join(ROOT, "apps/radio/.registry-buildcache.json");
const REGISTRY_DIR = path.join(ROOT, "apps/radio/registry");

// ---------------------------------------------------------------------------
// Plugin dependency model
//   sources: registry files (base = the 20 route section modules + types/index)
//   uses:    upstream plugins whose ctx.artifacts they consume
// ---------------------------------------------------------------------------
const BASE = ["<routes>", "types.ts", "index.ts"];
const PLUGIN_SOURCES = {
  core: [...BASE, "components.ts", "content-types.ts", "workflows.ts", "apps.ts"],
  navigation: BASE,
  search: BASE,
  permissions: BASE,
  platform: [...BASE, "layouts.ts", "tokens.ts"],
  api: BASE,
  seo: BASE,
  components: [...BASE, "components.ts", "layouts.ts"],
  tokens: ["tokens.ts"],
  content: [...BASE, "content-types.ts", "workflows.ts"],
  workspace: [...BASE, "apps.ts"],
  docs: [...BASE, "components.ts", "content-types.ts", "workflows.ts"]
};
const PLUGIN_USES = {
  docs: ["core", "navigation", "search", "permissions", "api"]
};
const PLUGIN_ORDER = ["core", "navigation", "search", "permissions", "platform", "api", "seo", "components", "tokens", "content", "workspace", "docs"];

// ---------------------------------------------------------------------------
// 1. Compile
// ---------------------------------------------------------------------------
let compiled;
try {
  ({ compiled } = await compileManifest(ROOT, { updateLock }));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Determine affected plugins (per-file hashing + env + plugin code)
// ---------------------------------------------------------------------------
const routeModules = fs
  .readdirSync(REGISTRY_DIR)
  .filter((file) => file.endsWith(".ts") && !file.startsWith("._"))
  .filter((file) => !["types.ts", "index.ts", "components.ts", "layouts.ts", "tokens.ts", "content-types.ts", "workflows.ts", "apps.ts"].includes(file));
const hashFile = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 16);
const hashes = { "<env>": crypto.createHash("sha256").update(`${SITE_ORIGIN}|${[...ENABLED_FLAGS].sort().join(",")}`).digest("hex").slice(0, 16) };
hashes["<routes>"] = crypto.createHash("sha256").update(routeModules.map((file) => hashFile(path.join(REGISTRY_DIR, file))).join("|")).digest("hex").slice(0, 16);
for (const file of ["types.ts", "index.ts", "components.ts", "layouts.ts", "tokens.ts", "content-types.ts", "workflows.ts", "apps.ts"]) {
  hashes[file] = hashFile(path.join(REGISTRY_DIR, file));
}
for (const plugin of PLUGIN_ORDER) {
  hashes[`plugin:${plugin}`] = hashFile(path.join(ROOT, `scripts/registry-plugins/${plugin}.mjs`));
}
hashes["compiler"] = hashFile(path.join(ROOT, "scripts/registry-compiler.mjs"));
hashes["runner"] = hashFile(path.join(ROOT, "scripts/build-registry-platform.mjs"));

const previous = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")).hashes || {} : {};
const changed = new Set(Object.keys(hashes).filter((key) => previous[key] !== hashes[key]));
const globalChange = force || changed.has("<env>") || changed.has("types.ts") || changed.has("index.ts") || changed.has("compiler") || changed.has("runner");

const affected = new Set();
for (const plugin of PLUGIN_ORDER) {
  const sourcesChanged = (PLUGIN_SOURCES[plugin] || []).some((source) => changed.has(source));
  if (globalChange || sourcesChanged || changed.has(`plugin:${plugin}`)) affected.add(plugin);
}
// closure: a plugin that consumes another's artifacts runs when its upstream runs,
// and pulls its upstreams in so ctx.artifacts is always populated.
let grew = true;
while (grew) {
  grew = false;
  for (const [consumer, upstreams] of Object.entries(PLUGIN_USES)) {
    if (upstreams.some((upstream) => affected.has(upstream)) && !affected.has(consumer)) {
      affected.add(consumer);
      grew = true;
    }
    if (affected.has(consumer)) {
      for (const upstream of upstreams) {
        if (!affected.has(upstream)) {
          affected.add(upstream);
          grew = true;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Run plugins against the canonical compiled manifest
// ---------------------------------------------------------------------------
const ctx = {
  ROOT,
  SITE_ORIGIN,
  ENABLED_FLAGS,
  generatedAt,
  compiled,
  // registry-shaped views over the compiled manifest (plugins consume compiled data)
  registry: {
    allRoutes: compiled.routes,
    SECTIONS: compiled.sections,
    components: compiled.components,
    layouts: compiled.layouts,
    tokens: compiled.tokens,
    contentTypes: compiled.contentTypes,
    workflows: compiled.workflows,
    workspaceApps: compiled.workspaceApps,
    byId: new Map(compiled.routes.map((route) => [route.id, route])),
    byPath: new Map(compiled.routes.map((route) => [route.path, route]))
  },
  flagVisible: (route) => route.featureFlags.every((flag) => ENABLED_FLAGS.has(flag)),
  isPublic: (route) => route.permissions.includes("anonymous") && !route.path.startsWith("/api/"),
  indexable: (route) => route.seo.robots === "index,follow" && !route.dynamic,
  navItem: (route) => ({ id: route.id, title: route.title, path: route.path, icon: route.icon, section: route.section, status: route.status }),
  xmlEscape: (value) => String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]),
  artifacts: {}
};

// the compiled manifest itself is always (re)written — it is the canonical object
const compiledJson = `${JSON.stringify(compiled, null, 2)}\n`;
const alwaysWrites = [
  ["apps/radio/lib/compiled-manifest.json", compiledJson],
  ["apps/radio/public/registry/compiled-manifest.json", compiledJson],
  ["apps/radio/public/registry/manifest-graph.json", `${JSON.stringify({ generatedAt, ...compiled.graph }, null, 2)}\n`]
];
for (const [target, content] of alwaysWrites) {
  const file = path.join(ROOT, target);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

let fileCount = alwaysWrites.length;
const skipped = [];
for (const pluginName of PLUGIN_ORDER) {
  if (!affected.has(pluginName)) {
    skipped.push(pluginName);
    continue;
  }
  const plugin = await import(pathToFileURL(path.join(ROOT, `scripts/registry-plugins/${pluginName}.mjs`)).href);
  const files = await plugin.generate(ctx);
  for (const [target, content] of files) {
    const file = path.join(ROOT, target);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    fileCount += 1;
  }
  console.log(`plugin:${pluginName} files=${files.length}`);
}
if (skipped.length) console.log(`skipped (inputs unchanged): ${skipped.join(", ")}`);

fs.writeFileSync(CACHE_PATH, `${JSON.stringify({ updatedAt: generatedAt, hashes }, null, 2)}\n`);

if (compiled.graph.orphans.components.length || compiled.graph.orphans.contentTypes.length) {
  console.warn(`orphans: components=${JSON.stringify(compiled.graph.orphans.components)} contentTypes=${JSON.stringify(compiled.graph.orphans.contentTypes)}`);
}
console.log(
  `registry-platform routes=${compiled.counts.routes} graph=${compiled.counts.graphNodes}n/${compiled.counts.graphEdges}e plugins=${affected.size}/${PLUGIN_ORDER.length} outputs=${fileCount}`
);
