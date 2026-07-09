import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SECTIONS,
  allRoutes,
  byId,
  byPath,
  getRoute,
  resolvePath,
  validateRegistry,
} from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("typed registry modules", () => {
  it("passes full validation (ids, paths, metadata, evidence, cycles)", () => {
    expect(validateRegistry()).toEqual([]);
    expect(allRoutes.length).toBeGreaterThanOrEqual(190);
    expect(SECTIONS.length).toBe(20);
    expect(byId.size).toBe(allRoutes.length); // unique ids
    expect(byPath.size).toBe(allRoutes.length); // unique paths
  });

  it("assigns stable canonical ids", () => {
    for (const [id, routePath] of [
      ["radio.live", "/radio/live"],
      ["radio.schedule", "/radio/schedule"],
      ["radio.archive", "/radio/archive"],
      ["podcasts", "/podcasts"],
      ["academy.course", "/academy/course/:slug"],
      ["research.datasets", "/research/datasets"],
      ["community.profile", "/community/profile/:username"],
      ["analytics", "/analytics"],
      ["admin.users", "/admin/users"],
      ["user.login", "/login"],
      ["public.home", "/"],
    ] as const) {
      expect(getRoute(id)?.path).toBe(routePath);
    }
  });

  it("resolves paths in O(1) with dynamic params", () => {
    expect(resolvePath("/radio/live")?.route.id).toBe("radio.live");
    const dynamic = resolvePath("/community/profile/hemant");
    expect(dynamic?.route.id).toBe("community.profile");
    expect(dynamic?.params).toEqual({ username: "hemant" });
    expect(resolvePath("/no/such/route")).toBeNull();
  });

  it("keeps statuses evidence-backed and layouts/platforms/permissions sane", () => {
    for (const route of allRoutes) {
      if (route.status !== "planned") expect(route.evidence.length).toBeGreaterThan(0);
      else expect(route.implementedBy).toEqual([]);
    }
    expect(getRoute("radio.live")?.layout).toBe("player");
    expect(getRoute("admin")?.layout).toBe("admin");
    expect(getRoute("analytics")?.layout).toBe("dashboard");
    expect(getRoute("api.auth")?.platforms).toEqual(["api"]);
    expect(getRoute("admin.users")?.permissions).toContain("admin");
    expect(getRoute("user.settings")?.permissions).toContain("listener");
    expect(getRoute("public.privacy")?.permissions).toEqual(["anonymous"]);
    // dependency graph is meaningful and acyclic (validateRegistry covers cycles)
    expect(getRoute("premium.payment")?.dependsOn).toEqual(["user.login", "user.profile", "premium.plans"]);
  });
});

describe("generated build outputs", () => {
  const registry = readJson<{
    schemaVersion: number;
    counts: Record<string, number>;
    routes: Array<Record<string, unknown>>;
  }>("apps/radio/lib/route-registry.json");

  it("emits a backwards-compatible enriched route-registry.json + mirrors", () => {
    expect(registry.schemaVersion).toBeGreaterThanOrEqual(2);
    expect(registry.counts.routes).toBe(allRoutes.length);
    // legacy fields preserved on every route (old consumers keep working)
    for (const legacyField of ["path", "section", "emoji", "title", "status", "implementedBy", "description", "dynamic"]) {
      expect(registry.routes.every((route) => legacyField in route)).toBe(true);
    }
    // platform fields present
    for (const platformField of ["id", "layout", "platforms", "permissions", "seo", "analytics", "navigation", "children"]) {
      expect(registry.routes.every((route) => platformField in route)).toBe(true);
    }
    const web = readJson<{ counts: Record<string, number> }>("apps/web/public/radio-html/data/route-registry.json");
    const desktop = readJson<{ counts: Record<string, number> }>("apps/desktop/public/radio-html/data/route-registry.json");
    expect(web.counts.routes).toBe(allRoutes.length);
    expect(desktop.counts.routes).toBe(allRoutes.length);
  });

  it("generates navigation excluding flag-hidden routes", () => {
    const navigation = readJson<{
      enabledFlags: string[];
      sidebar: Array<{ id: string }>;
      commandPalette: Array<{ id: string; status: string }>;
      breadcrumbs: Record<string, string[]>;
      hiddenByFlags: Array<{ id: string; featureFlags: string[] }>;
    }>("apps/radio/public/registry/navigation.json");
    expect(navigation.sidebar.length).toBeGreaterThan(10);
    // planned routes never reach the command palette
    expect(navigation.commandPalette.every((item) => item.status !== "planned")).toBe(true);
    // flag-gated academy routes are hidden with default flags
    if (!navigation.enabledFlags.includes("academy")) {
      expect(navigation.sidebar.some((item) => item.id === "academy")).toBe(false);
      expect(navigation.hiddenByFlags.some((entry) => entry.id === "academy")).toBe(true);
    }
    // breadcrumbs reference valid ids only
    for (const chain of Object.values(navigation.breadcrumbs)) {
      for (const ancestor of chain) expect(byId.has(ancestor)).toBe(true);
    }
  });

  it("generates search, permissions, platform and API maps with integrity", () => {
    const search = readJson<{ count: number; entries: Array<{ id: string; url: string; keywords: string[] }> }>(
      "apps/radio/public/registry/search.json"
    );
    expect(search.count).toBe(search.entries.length);
    expect(search.entries.every((entry) => byId.has(entry.id) && entry.keywords.length > 0)).toBe(true);
    // admin/cms/api routes never leak into search
    expect(search.entries.every((entry) => !/^\/(admin|cms|api)\b/.test(entry.url))).toBe(true);

    const permissions = readJson<{ roles: string[]; byRole: Record<string, string[]>; byRoute: Record<string, string[]> }>(
      "apps/radio/public/registry/permissions.json"
    );
    expect(permissions.roles).toContain("superadmin");
    expect(Object.keys(permissions.byRoute).length).toBe(allRoutes.length);
    // anonymous must not see admin routes; superadmin sees more than anonymous
    expect(permissions.byRole.anonymous).not.toContain("admin.users");
    expect(permissions.byRole.superadmin.length).toBeGreaterThan(permissions.byRole.anonymous.length);

    const platformMap = readJson<{ platforms: Record<string, string[]> }>(
      "apps/radio/public/registry/platform-map.json"
    );
    expect(platformMap.platforms.api).toContain("api.payments");
    expect(platformMap.platforms.tv).toContain("radio.live");
    for (const ids of Object.values(platformMap.platforms)) for (const id of ids) expect(byId.has(id)).toBe(true);

    const apiMap = readJson<{ byRoute: Record<string, unknown[]>; byEndpoint: Record<string, { usedBy: string[] }> }>(
      "apps/radio/public/registry/api-map.json"
    );
    expect(apiMap.byRoute["premium.payment"]).toBeTruthy();
    expect(apiMap.byEndpoint["POST /api/payments/order"].usedBy).toContain("premium.payment");

    const graph = readJson<{ edges: Array<{ from: string; to: string }>; cycles: unknown[] }>(
      "apps/radio/public/registry/dependency-graph.json"
    );
    expect(graph.cycles).toEqual([]);
    for (const edge of graph.edges) {
      expect(byId.has(edge.from)).toBe(true);
      expect(byId.has(edge.to)).toBe(true);
    }
  });

  it("generates sitemap/robots/feeds for public routes only", () => {
    const sitemap = read("apps/radio/public/sitemap.xml");
    expect(sitemap).toContain("<loc>");
    expect(sitemap).not.toContain("/admin");
    expect(sitemap).not.toContain("/api/v1");
    const robots = read("apps/radio/public/robots.txt");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap:");
    const rss = read("apps/radio/public/rss.xml");
    expect(rss).toContain("<rss");
    expect(read("apps/radio/public/atom.xml")).toContain("<feed");
    const feed = readJson<{ items: Array<{ id: string }> }>("apps/radio/public/feed.json");
    expect(feed.items.every((item) => byId.has(item.id))).toBe(true);
  });

  it("generates all six documentation files", () => {
    for (const doc of ["ROUTES", "NAVIGATION", "PERMISSIONS", "API_MAP", "SEARCH_INDEX", "SITE_STRUCTURE"]) {
      const content = read(`docs/registry/${doc}.md`);
      expect(content).toContain("Generated");
      expect(content.length).toBeGreaterThan(400);
    }
  });

  it("preserves the legacy generator and npm scripts", () => {
    expect(fs.existsSync(path.join(repoRoot, "scripts/build-route-registry.mjs"))).toBe(true);
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    expect(pkg.scripts["radio:routes"]).toBe("node scripts/build-route-registry.mjs");
    expect(pkg.scripts["radio:registry"]).toContain("build-registry-platform.mjs");
    expect(pkg.scripts["radio:registry:migrate"]).toContain("generate-registry-modules.mjs");
  });
});
