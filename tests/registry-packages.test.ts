import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// the shim package must resolve the full registry platform
import { allRoutes, validateRegistry } from "../packages/registry-core/src/index.ts";
import { tokens as packagedTokens } from "../packages/ui-tokens/src/index.ts";
import { tokens as sourceTokens } from "../apps/radio/registry/tokens.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("phase 5 — workspace packages", () => {
  it("registry-core shim exposes the validated registry", () => {
    expect(validateRegistry()).toEqual([]);
    expect(allRoutes.length).toBeGreaterThanOrEqual(190);
  });

  it("ui-tokens re-exports the single token source + generated dist", () => {
    expect(packagedTokens).toEqual(sourceTokens);
    expect(read("packages/ui-tokens/dist/tokens.css")).toContain("--color-gold");
    expect(readJson<{ colors: Record<string, string> }>("packages/ui-tokens/dist/tokens.json").colors.cyan).toBe(sourceTokens.colors.cyan);
  });

  it("sdk-client package carries the generated client + openapi", () => {
    const sdk = read("packages/sdk-client/src/index.ts");
    expect(sdk).toContain("createRadioSdk");
    expect(sdk).toContain("GENERATED");
    expect(sdk).not.toContain("/api/v1/"); // still no fabricated endpoints
    expect(sdk).toBe(read("apps/radio/lib/sdk.ts")); // one generator, two outputs
    expect(readJson<{ openapi: string }>("packages/sdk-client/openapi.json").openapi).toBe("3.1.0");
  });

  it("workspace + standalone explorer scaffolding exist", () => {
    expect(read("pnpm-workspace.yaml")).toContain('"apps/*"');
    expect(read("apps/explorer/server.mjs")).toContain("compile-time philosophy");
    for (const pkg of ["sdk-client", "ui-tokens", "registry-core"]) {
      const manifest = readJson<{ name: string }>(`packages/${pkg}/package.json`);
      expect(manifest.name).toBe(`@vaigyaaniq/${pkg}`);
    }
    // migration path documented, physical move deferred (additive rule)
    expect(read("packages/registry-core/src/index.ts")).toContain("MIGRATION NOTE");
  });
});
