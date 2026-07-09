import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

type Compiled = {
  id: string;
  schemaVersion: number;
  sourceHash: string;
  counts: Record<string, number>;
  routes: Array<{ id: string; contentType: string | null }>;
  componentTrees: Array<{ route: string; layout: string; regions: Array<{ components: Array<{ id: string }> }> }>;
  graph: {
    nodes: Array<{ id: string; kind: string }>;
    edges: Array<{ from: string; to: string; rel: string }>;
    impact: Record<string, string[]>;
    orphans: { components: string[]; contentTypes: string[]; workflows: string[] };
  };
  indexes: {
    byPath: Record<string, string>;
    byContentType: Record<string, string[]>;
    componentUsage: Record<string, string[]>;
  };
};

const compiled = readJson<Compiled>("apps/radio/lib/compiled-manifest.json");

describe("manifest compiler", () => {
  it("produces the canonical compiled manifest with lookup indexes", () => {
    expect(compiled.id).toBe("radio-vaigyaaniq-compiled-manifest");
    expect(compiled.schemaVersion).toBe(3);
    expect(compiled.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(compiled.counts.routes).toBe(compiled.routes.length);
    // normalized defaults: contentType is always present (null when unset)
    expect(compiled.routes.every((route) => "contentType" in route)).toBe(true);
    // O(1) index integrity
    expect(Object.keys(compiled.indexes.byPath).length).toBe(compiled.routes.length);
    expect(compiled.indexes.byPath["/radio/live"]).toBe("radio.live");
    expect(compiled.indexes.byContentType["radio-track"]).toContain("radio.archive");
    expect(compiled.indexes.componentUsage["player"].length).toBeGreaterThan(0);
    // flattened layouts: one tree per route
    expect(compiled.componentTrees.length).toBe(compiled.routes.length);
  });

  it("builds a typed graph with impact analysis and no orphans", () => {
    const nodeIds = new Set(compiled.graph.nodes.map((node) => node.id));
    expect(compiled.graph.edges.every((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))).toBe(true);
    expect(compiled.graph.edges.some((edge) => edge.rel === "uses-layout")).toBe(true);
    expect(compiled.graph.edges.some((edge) => edge.rel === "governed-by")).toBe(true);
    // radio.live impact: owned by the radio app
    expect(compiled.graph.impact["route:radio.live"]).toContain("app:radio");
    // orphan detection is active and clean
    expect(compiled.graph.orphans.components).toEqual([]);
    expect(compiled.graph.orphans.contentTypes).toEqual([]);
  });

  it("freezes identifiers via ids.lock.json", () => {
    const lock = readJson<{ ids: Record<string, string[]> }>("apps/radio/registry/ids.lock.json");
    const lockedRoutes = new Set(lock.ids.routes);
    for (const route of compiled.routes) expect(lockedRoutes.has(route.id)).toBe(true);
    const compiler = read("scripts/registry-compiler.mjs");
    expect(compiler).toContain("FROZEN IDENTIFIERS REMOVED");
  });
});

describe("infrastructure tooling", () => {
  it("supports incremental builds with plugin dependency tracking", () => {
    const runner = read("scripts/build-registry-platform.mjs");
    expect(runner).toContain("PLUGIN_SOURCES");
    expect(runner).toContain("registry-buildcache");
    expect(runner).toContain("compileManifest");
    expect(runner).toContain("skipped (inputs unchanged)");
    // tokens plugin only depends on tokens.ts
    expect(runner).toMatch(/tokens: \["tokens\.ts"\]/);
    // cache is machine-local
    expect(read(".gitignore")).toContain(".registry-buildcache.json");
  });

  it("ships the registry explorer and registers it honestly", () => {
    const explorer = read("apps/radio/public/registry/explorer.html");
    expect(explorer).toContain("compiled-manifest.json");
    expect(explorer).toContain("Registry Explorer");
    for (const category of ["routes", "components", "layouts", "tokens", "content-types", "workflows", "apps", "graph"]) {
      expect(explorer).toContain(category);
    }
    const route = compiled.routes.find((candidate) => candidate.id === "admin.registry-explorer");
    expect(route).toBeTruthy();
  });

  it("provides diff tooling that flags breaking changes", () => {
    const diff = read("scripts/registry-diff.mjs");
    expect(diff).toContain("route-removed");
    expect(diff).toContain("path-changed");
    expect(diff).toContain("permission-tightened");
    expect(diff).toContain("api-removed");
    expect(diff).toContain("process.exitCode = 2");
  });

  it("provides stepwise version migrations (v1 → v2 → v3)", () => {
    const migrate = read("scripts/migrate-manifest.mjs");
    expect(migrate).toContain("CURRENT_VERSION = 3");
    expect(migrate).toContain("2: (registry)");
    expect(migrate).toContain("3: (registry)");
    // conservative: migrated routes stay unindexed, statuses never upgraded
    expect(migrate).toContain('"noindex,nofollow"');
    expect(migrate).toContain("NEVER upgrade statuses");
  });

  it("exposes a read-only manifest API serving generated artifacts only", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.get("/manifest"');
    expect(server).toContain('app.get("/manifest/routes"');
    expect(server).toContain('app.get("/manifest/routes/:id"');
    expect(server).toContain("/manifest/components");
    expect(server).toContain("/manifest/workflows");
    expect(server).toContain("/manifest/platforms");
    // compile-time philosophy: server reads generated JSON, never registry sources
    expect(server).toContain("compiled-manifest.json");
    expect(server).not.toContain("registry/index.ts");
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    expect(pkg.scripts["radio:registry:diff"]).toContain("registry-diff.mjs");
    expect(pkg.scripts["radio:registry:upgrade"]).toContain("migrate-manifest.mjs");
    expect(pkg.scripts["radio:registry:force"]).toContain("--force");
  });
});
