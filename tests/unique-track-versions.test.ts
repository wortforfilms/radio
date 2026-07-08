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

describe("unique tracks with versions", () => {
  it("registers a conservative versions generator", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/build-unique-track-versions.mjs");

    expect(pkg.scripts["radio:tracks:versions"]).toBe("node scripts/build-unique-track-versions.mjs");
    expect(script).toContain("exact-normalized-lyrics");
    expect(script).toContain("title-fallback-lyrics-null");
    expect(script).toContain("humanVerifiedVersionGrouping: false");
  });

  it("publishes web and desktop unique-track version ledgers", () => {
    const web = readJson<{
      id: string;
      phkd: {
        fabricatedTracks: boolean;
        fabricatedVersions: boolean;
        releaseMasterClaimed: boolean;
        humanVerifiedVersionGrouping: boolean;
      };
      groupingPolicy: { primary: string; fallback: string };
      counts: {
        sourceTracks: number;
        uniqueTracks: number;
        versionGroups: number;
        totalVersions: number;
        maxVersions: number;
      };
      groups: Array<{
        groupBasis: string;
        versionCount: number;
        versions: Array<{ versionNumber: number; id: string }>;
      }>;
    }>("apps/web/public/radio-html/data/unique-tracks-with-versions.json");
    const desktop = readJson<{ id: string; counts: { uniqueTracks: number } }>(
      "apps/desktop/public/radio-html/data/unique-tracks-with-versions.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-unique-tracks-with-versions");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.uniqueTracks).toBe(web.counts.uniqueTracks);
    expect(web.phkd.fabricatedTracks).toBe(false);
    expect(web.phkd.fabricatedVersions).toBe(false);
    expect(web.phkd.releaseMasterClaimed).toBe(false);
    expect(web.phkd.humanVerifiedVersionGrouping).toBe(false);
    expect(web.groupingPolicy.primary).toBe("exact-normalized-lyrics-fingerprint");
    expect(web.groupingPolicy.fallback).toBe("normalized-title-when-lyrics-null");
    expect(web.counts.sourceTracks).toBe(1186);
    expect(web.counts.totalVersions).toBe(web.counts.sourceTracks);
    expect(web.counts.uniqueTracks).toBeGreaterThan(0);
    expect(web.counts.uniqueTracks).toBeLessThan(web.counts.sourceTracks);
    expect(web.counts.versionGroups).toBeGreaterThan(0);
    expect(web.counts.maxVersions).toBeGreaterThan(1);
    expect(web.groups.some((group) => group.groupBasis === "exact-normalized-lyrics")).toBe(true);

    const groupWithVersions = web.groups.find((group) => group.versionCount > 1);
    expect(groupWithVersions).toBeTruthy();
    expect(groupWithVersions?.versions[0].versionNumber).toBe(1);
    expect(groupWithVersions?.versions[0].id).toBeTruthy();
  });

  it("ships HTML, TSV, and route links", () => {
    const html = read("apps/web/public/radio-html/unique-tracks-with-versions.html");
    const tsv = read("apps/web/public/radio-html/data/unique-tracks-with-versions.tsv");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");
    const lyricsBook = read("apps/web/public/radio-html/lyrics-book.html");
    const lyricsSurface = read("apps/web/public/radio-html/surfaces/lyrics.html");

    expect(html).toContain("Unique Tracks With Versions");
    expect(html).toContain("version-data");
    expect(html).toContain("./data/unique-tracks-with-versions.json");
    expect(tsv).toContain("uniqueTrackId\ttitle\tversionCount");
    expect(index).toContain("./unique-tracks-with-versions.html");
    expect(standalone).toContain("./unique-tracks-with-versions.html");
    expect(lyricsBook).toContain("./unique-tracks-with-versions.html");
    expect(lyricsSurface).toContain("../unique-tracks-with-versions.html");
  });
});
