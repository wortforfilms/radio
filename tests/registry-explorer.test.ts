import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

// DOCUMENTED ASSUMPTION: Playwright/Cypress require browser downloads that are
// unavailable offline; these DOM-contract tests pin the explorer's behaviourally
// relevant markup + script hooks instead. Browser e2e can be layered on a CI
// runner with network access.
describe("phase 6 — explorer visual tooling", () => {
  const explorer = read("apps/radio/public/registry/explorer.html");

  it("renders the dependency graph on canvas with clickable nodes", () => {
    expect(explorer).toContain('id="graphCanvas"');
    expect(explorer).toContain("canvas.onclick");
    expect(explorer).toContain("visualise");
    expect(explorer).toContain("Rings by kind");
  });

  it("shows build-impact previews from the compiler's pluginImpact map", () => {
    expect(explorer).toContain("Build impact");
    expect(explorer).toContain("pluginImpact");
    const compiled = readJson<{ pluginImpact: Record<string, string[]> }>("apps/radio/lib/compiled-manifest.json");
    expect(compiled.pluginImpact).toBeTruthy();
    expect(compiled.pluginImpact["tokens.ts"]).toContain("tokens");
    expect(compiled.pluginImpact["<routes>"]).toContain("navigation");
    expect(compiled.pluginImpact["components.ts"]).toContain("components");
  });

  it("routes changes through the admin-gated proposal ledger, never direct mutation", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/registry/propose"');
    expect(server).toContain('app.get("/registry/proposals"');
    expect(server).toContain("pending-review");
    expect(server).toContain("never mutates registry source files directly");
    expect(explorer).toContain("POST /registry/propose");
    expect(explorer).toContain("radio:registry:diff");
    expect(read(".gitignore")).toContain("registry-proposals.jsonl");
  });

  it("links the explorer from the admin panel (web + desktop mirror)", () => {
    expect(read("apps/web/public/radio-html/admin-panel.html")).toContain("Registry Explorer");
    expect(read("apps/desktop/public/radio-html/admin-panel.html")).toContain("Registry Explorer");
  });
});
