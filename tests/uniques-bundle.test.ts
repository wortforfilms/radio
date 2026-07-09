import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("uniques build target", () => {
  it("plans a one-original-per-song bundle with intact gates", () => {
    execFileSync("node", ["scripts/build-uniques-bundle.mjs"], { cwd: repoRoot, timeout: 60_000 });
    const plan = readJson<{ counts: { uniqueSongs: number; alternateTakesExcluded: number; approxGB: number } }>(
      "build/uniques-plan.json"
    );
    expect(plan.counts.uniqueSongs).toBeGreaterThanOrEqual(440);
    expect(plan.counts.uniqueSongs + plan.counts.alternateTakesExcluded).toBe(1186);
    expect(plan.counts.approxGB).toBeLessThan(3.2); // the point of the variant

    const manifest = readJson<{
      buildVariant: string;
      counts: { playableTracks: number; programs: number; freeTracks: number };
      stations: Array<{ totalPrograms: number; programs: Array<{ sequenceIndex: number; freeTier: boolean }> }>;
      offlineBundle: { songs: Array<{ id: string; freeTier: boolean; offlinePolicy: string; published: boolean }> };
    }>("build/uniques/radio-html/data/radio-engine-manifest.json");
    expect(manifest.buildVariant).toBe("uniques");
    expect(manifest.counts.playableTracks).toBe(plan.counts.uniqueSongs);
    expect(manifest.stations.reduce((sum, station) => sum + station.totalPrograms, 0)).toBe(plan.counts.uniqueSongs);
    // free-tier policy re-applied: 2 per station
    expect(manifest.counts.freeTracks ?? manifest.offlineBundle.songs.filter((song) => song.freeTier).length).toBeGreaterThanOrEqual(
      manifest.stations.length
    );
    expect(manifest.stations.every((station) => station.programs.slice(0, 2).every((program) => program.freeTier))).toBe(true);
    // rights lane untouched: nothing published without the proof gate
    expect(manifest.offlineBundle.songs.every((song) => song.published === false)).toBe(true);
    // offline policy consistent with free tier
    expect(manifest.offlineBundle.songs.filter((song) => song.freeTier).every((song) => song.offlinePolicy === "full")).toBe(true);

    const content = readJson<{ tracks: Array<{ version: string }> }>("build/uniques/radio-html/data/radio-content.json");
    expect(content.tracks.every((track) => track.version === "original")).toBe(true);

    const alternates = readJson<{ groups: Record<string, unknown[]> }>("build/uniques/radio-html/data/alternate-takes.json");
    expect(Object.values(alternates.groups).reduce((sum, group) => sum + group.length, 0)).toBe(plan.counts.alternateTakesExcluded);
  });

  it("is registered as an npm build target and gitignored output", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    expect(pkg.scripts["radio:build:uniques"]).toBe("node scripts/build-uniques-bundle.mjs");
    expect(read(".gitignore")).toContain("build/");
    expect(read("scripts/build-uniques-bundle.mjs")).toContain("--copy");
  });
});
