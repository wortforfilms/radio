import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function read(file: string) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("lyrics prompter sync check", () => {
  it("registers a structural sync check command", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/check-lyrics-prompter-sync.mjs");

    expect(pkg.scripts["radio:lyrics:sync"]).toBe("node scripts/check-lyrics-prompter-sync.mjs");
    expect(script).toContain("STRUCTURAL_SYNC_PASS_ESTIMATED_ONLY");
    expect(script).toContain("humanVerifiedSync: false");
    expect(script).toContain("lyrics-prompter-sync-check.json");
  });

  it("publishes a fail-closed sync report for web and desktop", () => {
    const web = readJson<{
      verdict: string;
      phkd: { fabricatedSync: boolean; humanVerifiedSync: boolean; timingVerified: boolean };
      counts: { cueCount: number; criticalIssues: number; timingVerifiedClaims: number };
      checks: { audioHighlightMechanismPresent: boolean; noVerifiedTimingClaims: boolean };
    }>("apps/web/public/radio-html/data/lyrics-prompter-sync-check.json");
    const desktop = readJson<{ verdict: string }>(
      "apps/desktop/public/radio-html/data/lyrics-prompter-sync-check.json"
    );

    expect(web.verdict).toBe("STRUCTURAL_SYNC_PASS_ESTIMATED_ONLY");
    expect(desktop.verdict).toBe(web.verdict);
    expect(web.phkd.fabricatedSync).toBe(false);
    expect(web.phkd.humanVerifiedSync).toBe(false);
    expect(web.phkd.timingVerified).toBe(false);
    expect(web.counts.cueCount).toBeGreaterThan(0);
    expect(web.counts.criticalIssues).toBe(0);
    expect(web.counts.timingVerifiedClaims).toBe(0);
    expect(web.checks.audioHighlightMechanismPresent).toBe(true);
    expect(web.checks.noVerifiedTimingClaims).toBe(true);
  });

  it("links the sync check from the prompter and index", () => {
    const html = read("apps/web/public/radio-html/lyrics-prompter-sync.html");
    const prompter = read("apps/web/public/radio-html/lyrics-prompter.html");
    const index = read("apps/web/public/radio-html/index.html");
    const tsv = read("apps/web/public/radio-html/data/lyrics-prompter-sync-check.tsv");

    expect(html).toContain("Lyrics Prompter Sync Check");
    expect(prompter).toContain("./lyrics-prompter-sync.html");
    expect(index).toContain("./lyrics-prompter-sync.html");
    expect(tsv).toContain("structuralStatus");
  });
});
