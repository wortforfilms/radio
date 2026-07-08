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

describe("radio related repository scan", () => {
  it("registers a repository scan command", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/scan-radio-related-repositories.mjs");

    expect(pkg.scripts["radio:repo:scan"]).toBe("node scripts/scan-radio-related-repositories.mjs");
    expect(script).toContain("radio-related-repository-scan.json");
    expect(script).toContain("fabricatedRepositories: false");
    expect(script).toContain("CANDIDATE_REPOS");
    expect(script).toContain("candidateRepos");
  });

  it("publishes the repository scan report and route links", () => {
    const web = readJson<{
      scope: { matchingPolicy: string };
      counts: { discoveredRepositories: number; radioRelatedRepositories: number };
      repositories: Array<{ path: string; score: number }>;
      radioRelatedRepositories: Array<{ path: string; score: number; relevance: string }>;
      phkd: { fabricatedRepositories: boolean; fabricatedModules: boolean };
    }>("apps/web/public/radio-html/data/radio-related-repository-scan.json");
    const desktop = readJson<{ counts: { radioRelatedRepositories: number } }>(
      "apps/desktop/public/radio-html/data/radio-related-repository-scan.json"
    );
    const html = read("apps/web/public/radio-html/radio-related-repositories.html");
    const tsv = read("apps/web/public/radio-html/data/radio-related-repository-scan.tsv");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");

    expect(web.phkd.fabricatedRepositories).toBe(false);
    expect(web.phkd.fabricatedModules).toBe(false);
    expect(web.scope.matchingPolicy).toBe("token-or-phrase-boundary");
    expect(web.counts.discoveredRepositories).toBeGreaterThan(0);
    expect(web.counts.radioRelatedRepositories).toBeGreaterThan(0);
    expect(desktop.counts.radioRelatedRepositories).toBe(web.counts.radioRelatedRepositories);
    expect(web.radioRelatedRepositories.some((repo) => repo.path.includes("for_radio"))).toBe(true);
    expect(web.repositories.find((repo) => repo.path.includes("task-manager"))?.score).toBe(0);
    expect(web.radioRelatedRepositories[0].score).toBeGreaterThan(0);
    expect(["high", "medium", "low"]).toContain(web.radioRelatedRepositories[0].relevance);
    expect(html).toContain("Radio Related Repository Scan");
    expect(tsv).toContain("name\tpath\trelevance\tscore");
    expect(index).toContain("./radio-related-repositories.html");
    expect(standalone).toContain("./radio-related-repositories.html");
  });
});
