// Registry platform build — PLUGIN PIPELINE (schemaVersion 3).
//
//   registry (typed modules)
//     ↓ validate
//     ↓ plugins: core → navigation → search → permissions → platform → api
//                → seo → components → tokens → content → workspace → docs
//     ↓ generated outputs (JSON, XML, CSS, TS SDK, Markdown)
//
// Every plugin consumes the same immutable context and returns files to write;
// later plugins can read earlier plugins' data via ctx.artifacts. Adding a
// subsystem = adding one plugin — nothing else changes.
//
// Run: npm run radio:registry   (node --experimental-strip-types, Node ≥ 22.6)
// The legacy generator (scripts/build-route-registry.mjs) remains preserved.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const ENABLED_FLAGS = new Set((process.env.REGISTRY_FLAGS || "premium").split(",").filter(Boolean));
const generatedAt = new Date().toISOString();

const registry = await import(pathToFileURL(path.join(ROOT, "apps/radio/registry/index.ts")).href);

const problems = registry.validateRegistry();
if (problems.length) {
  console.error(`registry INVALID (${problems.length}):\n${problems.join("\n")}`);
  process.exit(1);
}

const ctx = {
  ROOT,
  SITE_ORIGIN,
  ENABLED_FLAGS,
  generatedAt,
  registry,
  // helpers shared by plugins
  flagVisible: (route) => route.featureFlags.every((flag) => ENABLED_FLAGS.has(flag)),
  isPublic: (route) => route.permissions.includes("anonymous") && !route.path.startsWith("/api/"),
  indexable: (route) => route.seo.robots === "index,follow" && !route.dynamic,
  navItem: (route) => ({
    id: route.id,
    title: route.title,
    path: route.path,
    icon: route.icon,
    section: route.section,
    status: route.status
  }),
  xmlEscape: (value) =>
    String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]),
  // artifacts published by earlier plugins for later ones (docs, ui manifests)
  artifacts: {}
};

const PLUGINS = [
  "core",
  "navigation",
  "search",
  "permissions",
  "platform",
  "api",
  "seo",
  "components",
  "tokens",
  "content",
  "workspace",
  "docs"
];

let fileCount = 0;
for (const pluginName of PLUGINS) {
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

console.log(
  `registry-platform routes=${registry.allRoutes.length} components=${registry.components.length} contentTypes=${registry.contentTypes.length} plugins=${PLUGINS.length} outputs=${fileCount}`
);
