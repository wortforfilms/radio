import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  allRoutes,
  byId,
  components,
  contentTypes,
  layouts,
  tokens,
  validateRegistry,
  workflows,
  workspaceApps,
} from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;
const REG = "apps/radio/public/registry";

describe("application-manifest registry (schemaVersion 3)", () => {
  it("validates the full manifest (components, layouts, content types, workflows, apps)", () => {
    expect(validateRegistry()).toEqual([]);
    expect(components.length).toBeGreaterThanOrEqual(15);
    expect(layouts.length).toBe(10);
    expect(contentTypes.length).toBeGreaterThanOrEqual(9);
    expect(workflows.length).toBeGreaterThanOrEqual(2);
    expect(workspaceApps.length).toBeGreaterThanOrEqual(8);
  });

  it("keeps component and content-type statuses evidence-backed", () => {
    for (const component of components) {
      if (component.status === "planned") expect(component.implementedBy).toEqual([]);
      else expect(component.implementedBy.length).toBeGreaterThan(0);
    }
    // built components point at the real engine
    expect(components.find((c) => c.id === "player")?.implementedBy[0]).toContain("radio-engine.js");
    expect(components.find((c) => c.id === "podcast-card")?.status).toBe("planned");
    // radio-track is the only fully built content type today
    expect(contentTypes.find((c) => c.id === "radio-track")?.status).toBe("built");
    expect(contentTypes.find((c) => c.id === "podcast")?.status).toBe("planned");
  });

  it("routes reference valid content types", () => {
    const contentTypeIds = new Set(contentTypes.map((contentType) => contentType.id));
    const withContent = allRoutes.filter((route) => route.contentType);
    expect(withContent.length).toBeGreaterThanOrEqual(30);
    expect(withContent.every((route) => contentTypeIds.has(route.contentType as string))).toBe(true);
    expect(byId.get("radio.archive")?.contentType).toBe("radio-track");
    expect(byId.get("podcasts.transcript")?.contentType).toBe("transcript");
  });

  it("workflow lifecycles include the editorial pipeline and the PHKD rights lane", () => {
    const editorial = workflows.find((workflow) => workflow.id === "editorial");
    expect(editorial?.states).toEqual(["draft", "review", "approved", "scheduled", "published", "archived"]);
    const rights = workflows.find((workflow) => workflow.id === "rights-closure");
    expect(rights?.states).toContain("rights-verified");
    const publish = rights?.transitions.find((transition) => transition.to === "published");
    expect(publish?.requires.join(" ")).toContain("verified rights proof");
  });
});

describe("plugin-generated outputs", () => {
  it("emits a JSON Schema the enriched registry conforms to (spot checks)", () => {
    const schema = readJson<{ properties: { routes: { items: { required: string[] } } } }>(
      `${REG}/registry.schema.json`
    );
    const registry = readJson<{ schemaVersion: number; routes: Array<Record<string, unknown>> }>(
      "apps/radio/lib/route-registry.json"
    );
    expect(registry.schemaVersion).toBe(3);
    for (const field of schema.properties.routes.items.required) {
      expect(registry.routes.every((route) => field in route)).toBe(true);
    }
  });

  it("generates component trees for every route with platform-filtered components", () => {
    const trees = readJson<{
      count: number;
      trees: Array<{ route: string; layout: string; regions: Array<{ components: Array<{ id: string; status: string }> }> }>;
    }>(`${REG}/component-trees.json`);
    expect(trees.count).toBe(allRoutes.length);
    const componentIds = new Set(components.map((component) => component.id));
    for (const tree of trees.trees) {
      expect(byId.has(tree.route)).toBe(true);
      for (const region of tree.regions) for (const component of region.components) {
        expect(componentIds.has(component.id)).toBe(true);
      }
    }
    // player layout carries the player component on radio.live
    const live = trees.trees.find((tree) => tree.route === "radio.live");
    expect(live?.layout).toBe("player");
    expect(live?.regions.some((region) => region.components.some((component) => component.id === "player"))).toBe(true);
  });

  it("emits the five token files + tokens.css from one source", () => {
    for (const file of ["colors", "spacing", "typography", "icons", "motion"]) {
      expect(fs.existsSync(path.join(repoRoot, `${REG}/tokens/${file}.json`))).toBe(true);
    }
    const css = read(`${REG}/tokens/tokens.css`);
    expect(css).toContain("--color-gold: #dfb15b");
    expect(css).toContain("--font-body: Inter");
    const colors = readJson<{ colors: Record<string, string> }>(`${REG}/tokens/colors.json`);
    expect(colors.colors.cyan).toBe(tokens.colors.cyan);
  });

  it("emits honest OpenAPI (real paths only) and a matching typed SDK", () => {
    const openapi = readJson<{ paths: Record<string, unknown>; "x-planned": Array<{ path: string }> }>(
      `${REG}/openapi.json`
    );
    expect(Object.keys(openapi.paths)).toContain("/api/payments/order");
    expect(Object.keys(openapi.paths).every((p) => !p.startsWith("/api/v1/"))).toBe(true);
    expect(openapi["x-planned"].some((entry) => entry.path.startsWith("/api/v1/"))).toBe(true);

    const sdk = read("apps/radio/lib/sdk.ts");
    expect(sdk).toContain("createRadioSdk");
    expect(sdk).toContain("createPaymentOrder");
    expect(sdk).toContain("getEntitlements");
    expect(sdk).not.toContain("/api/v1/"); // no fabricated endpoints
    expect(sdk).not.toContain(": any");
  });

  it("emits CMS schemas, workflows, ui-manifests, and workspace map", () => {
    const cms = readJson<{ schemas: Array<{ id: string; fields: Array<{ widget: string }> }> }>(
      `${REG}/cms-schemas.json`
    );
    expect(cms.schemas.length).toBe(contentTypes.length);
    expect(cms.schemas.find((schema) => schema.id === "radio-track")?.fields.some((field) => field.widget === "money")).toBe(true);

    for (const platform of ["web", "mobile", "desktop", "tv", "car", "watch"]) {
      const manifest = readJson<{ platform: string; routes: unknown[]; layouts: unknown[] }>(
        `${REG}/ui-manifest.${platform}.json`
      );
      expect(manifest.platform).toBe(platform);
      expect(manifest.routes.length).toBeGreaterThan(0);
    }
    const tv = readJson<{ routes: Array<{ id: string }> }>(`${REG}/ui-manifest.tv.json`);
    expect(tv.routes.some((route) => route.id === "radio.live")).toBe(true);
    expect(tv.routes.some((route) => route.id === "admin.users")).toBe(false);

    const workspace = readJson<{ apps: Array<{ id: string; status: string; ownedRoutes: string[] }> }>(
      `${REG}/workspace.json`
    );
    const radioApp = workspace.apps.find((app) => app.id === "radio");
    expect(radioApp?.status).toBe("built");
    expect(radioApp?.ownedRoutes).toContain("radio.live");
    expect(workspace.apps.find((app) => app.id === "nlm")?.status).toBe("planned");
  });

  it("keeps the docs set generated (8 files) and the plugin pipeline modular", () => {
    for (const doc of ["ROUTES", "NAVIGATION", "PERMISSIONS", "API_MAP", "SEARCH_INDEX", "SITE_STRUCTURE", "COMPONENTS", "CONTENT_WORKFLOWS"]) {
      expect(read(`docs/registry/${doc}.md`)).toContain("Generated");
    }
    const runner = read("scripts/build-registry-platform.mjs");
    expect(runner).toContain("registry-plugins");
    for (const plugin of ["core", "navigation", "search", "permissions", "platform", "api", "seo", "components", "tokens", "content", "workspace", "docs"]) {
      expect(fs.existsSync(path.join(repoRoot, `scripts/registry-plugins/${plugin}.mjs`))).toBe(true);
    }
  });
});
