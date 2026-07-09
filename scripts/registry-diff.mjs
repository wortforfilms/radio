// Registry diff — release tooling.
//
//   node scripts/registry-diff.mjs                       # git HEAD vs working tree
//   node scripts/registry-diff.mjs --git v1.0.0          # git ref vs working tree
//   node scripts/registry-diff.mjs old.json new.json     # two files
//   node scripts/registry-diff.mjs ... --json            # machine-readable output
//
// Reports: added/removed routes, path changes (BREAKING), status changes,
// permission changes (tightening = BREAKING), API changes (removal = BREAKING),
// SEO robots changes, feature-flag changes, contentType changes.
// Exit code 2 when breaking changes are present (CI-friendly).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_FILE = "apps/radio/lib/route-registry.json";
const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const asJson = process.argv.includes("--json");
const gitRefIndex = process.argv.indexOf("--git");
const gitRef = gitRefIndex >= 0 ? process.argv[gitRefIndex + 1] || "HEAD" : args.length < 2 ? "HEAD" : null;

function loadOld() {
  if (args.length >= 2) return JSON.parse(fs.readFileSync(args[0], "utf8"));
  const raw = execFileSync("git", ["show", `${gitRef}:${REGISTRY_FILE}`], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(raw.toString("utf8"));
}
function loadNew() {
  const file = args.length >= 2 ? args[1] : path.join(ROOT, REGISTRY_FILE);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const oldReg = loadOld();
const newReg = loadNew();
const keyOf = (route) => route.id || route.path; // v1 registries have no ids
const oldByKey = new Map(oldReg.routes.map((route) => [keyOf(route), route]));
const newByKey = new Map(newReg.routes.map((route) => [keyOf(route), route]));

const diff = {
  from: { schemaVersion: oldReg.schemaVersion ?? 1, generatedAt: oldReg.generatedAt, routes: oldReg.routes.length },
  to: { schemaVersion: newReg.schemaVersion ?? 1, generatedAt: newReg.generatedAt, routes: newReg.routes.length },
  added: [],
  removed: [],
  changed: [],
  breaking: []
};

for (const [key, route] of newByKey) if (!oldByKey.has(key)) diff.added.push({ id: key, path: route.path, status: route.status });
for (const [key, route] of oldByKey) {
  if (!newByKey.has(key)) {
    diff.removed.push({ id: key, path: route.path });
    diff.breaking.push({ kind: "route-removed", id: key, detail: route.path });
  }
}

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
for (const [key, next] of newByKey) {
  const prev = oldByKey.get(key);
  if (!prev) continue;
  const changes = [];
  if (prev.path !== next.path) {
    changes.push({ field: "path", from: prev.path, to: next.path });
    diff.breaking.push({ kind: "path-changed", id: key, detail: `${prev.path} → ${next.path}` });
  }
  if (prev.status !== next.status) changes.push({ field: "status", from: prev.status, to: next.status });
  if (!same(prev.permissions, next.permissions)) {
    changes.push({ field: "permissions", from: prev.permissions, to: next.permissions });
    const wasPublic = (prev.permissions || ["anonymous"]).includes("anonymous");
    const isPublic = (next.permissions || ["anonymous"]).includes("anonymous");
    if (wasPublic && !isPublic) diff.breaking.push({ kind: "permission-tightened", id: key, detail: `${prev.permissions} → ${next.permissions}` });
  }
  if (!same(prev.api, next.api)) {
    changes.push({ field: "api", from: prev.api, to: next.api });
    const nextEndpoints = new Set((next.api || []).map((ref) => `${ref.method} ${ref.path}`));
    for (const ref of prev.api || []) {
      if (!nextEndpoints.has(`${ref.method} ${ref.path}`)) {
        diff.breaking.push({ kind: "api-removed", id: key, detail: `${ref.method} ${ref.path}` });
      }
    }
  }
  if (prev.seo?.robots !== next.seo?.robots) changes.push({ field: "seo.robots", from: prev.seo?.robots, to: next.seo?.robots });
  if (!same(prev.featureFlags, next.featureFlags)) changes.push({ field: "featureFlags", from: prev.featureFlags, to: next.featureFlags });
  if ((prev.contentType ?? null) !== (next.contentType ?? null)) changes.push({ field: "contentType", from: prev.contentType ?? null, to: next.contentType ?? null });
  if (prev.layout !== next.layout) changes.push({ field: "layout", from: prev.layout, to: next.layout });
  if (changes.length) diff.changed.push({ id: key, changes });
}

if (asJson) {
  console.log(JSON.stringify(diff, null, 2));
} else {
  console.log(`registry diff: v${diff.from.schemaVersion} (${diff.from.routes} routes) → v${diff.to.schemaVersion} (${diff.to.routes} routes)`);
  console.log(`added: ${diff.added.length}${diff.added.length ? " — " + diff.added.map((entry) => entry.id).join(", ") : ""}`);
  console.log(`removed: ${diff.removed.length}${diff.removed.length ? " — " + diff.removed.map((entry) => entry.id).join(", ") : ""}`);
  console.log(`changed: ${diff.changed.length}`);
  for (const entry of diff.changed.slice(0, 30)) {
    console.log(`  ${entry.id}: ${entry.changes.map((change) => `${change.field} ${JSON.stringify(change.from)}→${JSON.stringify(change.to)}`).join("; ")}`);
  }
  if (diff.changed.length > 30) console.log(`  … ${diff.changed.length - 30} more`);
  console.log(`BREAKING: ${diff.breaking.length}`);
  for (const entry of diff.breaking) console.log(`  ⚠ ${entry.kind} ${entry.id}: ${entry.detail}`);
}
if (diff.breaking.length) process.exitCode = 2;
