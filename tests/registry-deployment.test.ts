import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("phase 8 — GitOps + deployment automation", () => {
  it("generates per-environment configs where flags gate visibility", () => {
    const production = readJson<{ enabledFlags: string[]; counts: { hiddenRoutes: number }; hiddenRoutes: string[] }>(
      "apps/radio/public/registry/env-config.production.json"
    );
    const development = readJson<{ counts: { hiddenRoutes: number } }>(
      "apps/radio/public/registry/env-config.development.json"
    );
    expect(production.enabledFlags).toEqual(["premium"]);
    // academy/events/labs routes hidden in production, visible in development
    expect(production.hiddenRoutes).toContain("academy");
    expect(production.counts.hiddenRoutes).toBeGreaterThan(development.counts.hiddenRoutes);
    expect(development.counts.hiddenRoutes).toBe(0);
  });

  it("emits secret NAMES only — never values, never in registry sources", () => {
    const config = readJson<{ requiredSecrets: string[] }>("apps/radio/public/registry/env-config.production.json");
    expect(config.requiredSecrets).toContain("RAZORPAY_KEY_SECRET");
    for (const registryFile of fs.readdirSync(path.join(repoRoot, "apps/radio/registry"))) {
      if (!registryFile.endsWith(".ts")) continue;
      const source = read(`apps/radio/registry/${registryFile}`);
      expect(source).not.toMatch(/sk-[A-Za-z0-9]{20}/); // no leaked key material
      expect(source).not.toMatch(/AGENT_LLM_API_KEY\s*[:=]\s*["'][^"']+["']/);
    }
  });

  it("derives Terraform JSON from workspace/platform metadata", () => {
    const infra = readJson<{ resource: { generic_service: Record<string, unknown>; static_site: Record<string, unknown> } }>(
      "apps/radio/public/registry/infra.tf.json"
    );
    expect(infra.resource.generic_service.radio).toBeTruthy(); // built app
    expect(infra.resource.generic_service.nlm).toBeUndefined(); // planned apps get no infra
    expect(infra.resource.static_site.radio_surfaces).toBeTruthy();
  });

  it("wires CI: registry validation, breaking-change gate, tests, artifact drift", () => {
    const ci = read(".github/workflows/registry-ci.yml");
    expect(ci).toContain("npm run radio:registry");
    expect(ci).toContain("registry-diff.mjs");
    expect(ci).toContain("npx vitest run");
    expect(ci).toContain("git diff --exit-code");
    const vercel = readJson<{ buildCommand: string }>("vercel.json");
    expect(vercel.buildCommand).toContain("radio:registry");
  });
});
