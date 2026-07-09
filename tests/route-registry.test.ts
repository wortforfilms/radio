import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

type RegistryRoute = {
  path: string;
  section: string;
  emoji: string;
  title: string;
  status: "built" | "partial" | "planned";
  implementedBy: string[];
  description: string;
  dynamic: boolean;
};

type Registry = {
  id: string;
  phkd: { failClosed: boolean; note: string };
  counts: Record<string, number>;
  sections: Array<{ name: string; emoji: string }>;
  routes: RegistryRoute[];
};

const registry = readJson<Registry>("apps/radio/lib/route-registry.json");

describe("route registry", () => {
  it("covers the full production IA with unique, well-formed routes", () => {
    expect(registry.counts.sections).toBe(20);
    expect(registry.routes.length).toBeGreaterThanOrEqual(190);
    expect(registry.counts.routes).toBe(registry.routes.length);
    const paths = registry.routes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((p) => p.startsWith("/"))).toBe(true);
    // spot-check every section root exists
    for (const anchor of [
      "/", "/radio", "/podcasts", "/research", "/discover", "/academy", "/community",
      "/events", "/news", "/videos", "/ai", "/search", "/login", "/premium",
      "/analytics", "/studio", "/cms", "/admin", "/api/v1/auth", "/ecosystem"
    ]) {
      expect(paths).toContain(anchor);
    }
    // dynamic flag matches :param usage
    expect(registry.routes.every((route) => route.dynamic === route.path.includes(":"))).toBe(true);
  });

  it("keeps statuses honest and evidence-backed (PHKD)", () => {
    expect(registry.phkd.failClosed).toBe(true);
    const valid = new Set(["built", "partial", "planned"]);
    expect(registry.routes.every((route) => valid.has(route.status))).toBe(true);
    // built/partial must cite concrete artifacts; planned must not claim any
    for (const route of registry.routes) {
      if (route.status === "planned") expect(route.implementedBy).toEqual([]);
      else expect(route.implementedBy.length).toBeGreaterThan(0);
    }
    // counts add up
    expect(
      registry.counts.built + registry.counts.partial + registry.counts.planned
    ).toBe(registry.routes.length);
    // nothing that doesn't exist may claim built
    expect(registry.routes.filter((route) => route.status === "built").length).toBeLessThan(10);
    // known anchors
    const byPath = new Map(registry.routes.map((route) => [route.path, route]));
    expect(byPath.get("/radio")!.status).toBe("built");
    expect(byPath.get("/admin")!.status).toBe("built");
    expect(byPath.get("/radio/live")!.status).toBe("partial"); // live streams NULL
    expect(byPath.get("/radio/frequencies")!.status).toBe("planned"); // no licence — never fabricated
    expect(byPath.get("/premium/payment")!.status).toBe("partial");
    expect(byPath.get("/donate")!.status).toBe("planned");
  });

  it("mirrors to web + desktop and ships the catch-all renderer", () => {
    const web = readJson<Registry>("apps/web/public/radio-html/data/route-registry.json");
    const desktop = readJson<Registry>("apps/desktop/public/radio-html/data/route-registry.json");
    expect(web.counts.routes).toBe(registry.counts.routes);
    expect(desktop.counts.routes).toBe(registry.counts.routes);

    const page = read("apps/radio/app/[...slug]/page.tsx");
    expect(page).toContain("matchRoute");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("Fail-closed placeholder");
    expect(page).toContain("notFound()");

    const lib = read("apps/radio/lib/routes.ts");
    expect(lib).toContain("export function matchRoute");
    expect(lib).toContain("export function childrenOf");

    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    expect(pkg.scripts["radio:routes"]).toBe("node scripts/build-route-registry.mjs");
  });
});
