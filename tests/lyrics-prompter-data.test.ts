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

describe("lyrics prompter data lane", () => {
  it("registers an idempotent lyrics prompter generator", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/build-lyrics-prompter-data.mjs");

    expect(pkg.scripts["radio:lyrics:prompter"]).toBe(
      "node scripts/build-lyrics-prompter-data.mjs"
    );
    expect(script).toContain("parseLyricsSource");
    expect(script).toContain("buildCueSpread");
    expect(script).toContain("timingVerified: false");
    expect(script).toContain("lyrics-prompter-data.json");
  });

  it("publishes web and desktop prompter data with PHKD timing guards", () => {
    const web = readJson<{
      id: string;
      phkd: {
        fabricatedLyrics: boolean;
        fabricatedStyles: boolean;
        fabricatedTimingClaims: boolean;
        timingVerified: boolean;
      };
      counts: {
        catalogTracks: number;
        tracksWithSanitizedLyrics: number;
        cueCount: number;
        manualRecords: number;
      };
      tracks: Array<{
        id: string;
        timingVerified: boolean;
        cues: Array<{ timingVerified: boolean; timing: string; text: string }>;
      }>;
    }>("apps/web/public/radio-html/data/lyrics-prompter-data.json");
    const desktop = readJson<{ id: string; counts: { cueCount: number } }>(
      "apps/desktop/public/radio-html/data/lyrics-prompter-data.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-lyrics-prompter-data");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.cueCount).toBe(web.counts.cueCount);
    expect(web.phkd.fabricatedLyrics).toBe(false);
    expect(web.phkd.fabricatedStyles).toBe(false);
    expect(web.phkd.fabricatedTimingClaims).toBe(false);
    expect(web.phkd.timingVerified).toBe(false);
    expect(web.counts.catalogTracks).toBeGreaterThan(0);
    expect(web.counts.tracksWithSanitizedLyrics).toBeGreaterThan(0);
    expect(web.counts.cueCount).toBeGreaterThan(0);
    expect(web.counts.manualRecords).toBeGreaterThan(0);

    const recordWithCue = web.tracks.find((record) => record.cues.length > 0);
    expect(recordWithCue).toBeTruthy();
    expect(recordWithCue?.timingVerified).toBe(false);
    expect(recordWithCue?.cues[0].timingVerified).toBe(false);
    expect(recordWithCue?.cues[0].timing).toBe("estimated-spread");
    expect(recordWithCue?.cues[0].text.trim().length).toBeGreaterThan(0);
  });

  it("ships TSV and HTML prompter surfaces for browser and desktop", () => {
    const webTsv = read("apps/web/public/radio-html/data/lyrics-prompter-index.tsv");
    const desktopTsv = read("apps/desktop/public/radio-html/data/lyrics-prompter-index.tsv");
    const html = read("apps/web/public/radio-html/lyrics-prompter.html");
    const surface = read("apps/web/public/radio-html/surfaces/lyrics.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");
    const index = read("apps/web/public/radio-html/index.html");

    expect(webTsv).toContain("timingVerified");
    expect(desktopTsv).toContain("timingVerified");
    expect(html).toContain("id=\"prompter-bootstrap\"");
    expect(html).toContain("./data/lyrics-prompter-data.json");
    expect(html).toContain("Lyrics Prompter");
    expect(html).toContain("timing verified false");
    expect(surface).toContain("../lyrics-prompter.html");
    expect(standalone).toContain("./lyrics-prompter.html");
    expect(index).toContain("./lyrics-prompter.html");
  });
});
