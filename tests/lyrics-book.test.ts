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

describe("lyrics book", () => {
  it("registers a local lyrics book generator", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/build-lyrics-book.mjs");

    expect(pkg.scripts["radio:lyrics:book"]).toBe("node scripts/build-lyrics-book.mjs");
    expect(script).toContain("lyrics-book.json");
    expect(script).toContain("fabricatedCoverArt: false");
    expect(script).toContain("commercialRightsVerified: false");
    expect(script).toContain("localAssetExists");
  });

  it("publishes web and desktop lyrics book data with cover-art evidence", () => {
    const web = readJson<{
      id: string;
      phkd: {
        fabricatedLyrics: boolean;
        fabricatedCoverArt: boolean;
        generatedCoverArt: boolean;
        commercialRightsVerified: boolean;
      };
      counts: {
        bookTracks: number;
        chapters: number;
        tracksWithLyrics: number;
        tracksWithCoverArt: number;
        tracksMissingCoverArt: number;
        totalLyricLines: number;
      };
      chapters: Array<{
        coverStatus: string;
        tracks: Array<{ coverStatus: string; lyricsStatus: string; sections: Array<{ lines: string[] }> }>;
      }>;
    }>("apps/web/public/radio-html/data/lyrics-book.json");
    const desktop = readJson<{ id: string; counts: { bookTracks: number } }>(
      "apps/desktop/public/radio-html/data/lyrics-book.json"
    );

    expect(web.id).toBe("radio-vaigyaaniq-lyrics-book");
    expect(desktop.id).toBe(web.id);
    expect(desktop.counts.bookTracks).toBe(web.counts.bookTracks);
    expect(web.phkd.fabricatedLyrics).toBe(false);
    expect(web.phkd.fabricatedCoverArt).toBe(false);
    expect(web.phkd.generatedCoverArt).toBe(false);
    expect(web.phkd.commercialRightsVerified).toBe(false);
    expect(web.counts.bookTracks).toBeGreaterThan(1000);
    expect(web.counts.chapters).toBeGreaterThanOrEqual(20);
    expect(web.counts.tracksWithLyrics).toBeGreaterThan(1000);
    expect(web.counts.tracksWithCoverArt).toBeGreaterThan(1000);
    expect(web.counts.tracksWithCoverArt + web.counts.tracksMissingCoverArt).toBe(web.counts.bookTracks);
    expect(web.counts.totalLyricLines).toBeGreaterThan(1000);
    expect(web.chapters.some((chapter) => chapter.coverStatus === "cover-local")).toBe(true);
    expect(web.chapters.flatMap((chapter) => chapter.tracks).some((track) => track.lyricsStatus === "lyrics-ready")).toBe(true);
    expect(
      web.chapters
        .flatMap((chapter) => chapter.tracks)
        .some((track) => track.sections.some((section) => section.lines.length > 0))
    ).toBe(true);
  });

  it("ships HTML, Markdown, TSV, and route links", () => {
    const html = read("apps/web/public/radio-html/lyrics-book.html");
    const markdown = read("apps/web/public/radio-html/lyrics-book.md");
    const tsv = read("apps/web/public/radio-html/data/lyrics-book-index.tsv");
    const index = read("apps/web/public/radio-html/index.html");
    const standalone = read("apps/web/public/radio-html/standalone-radio.html");
    const lyricsSurface = read("apps/web/public/radio-html/surfaces/lyrics.html");

    expect(html).toContain("Radio Vaigyaaniq Lyrics Book");
    expect(html).toContain("lyrics-book-data");
    expect(html).toContain("./lyrics-book.md");
    expect(markdown).toContain("# Radio Vaigyaaniq Lyrics Book");
    expect(markdown).toContain("![");
    expect(tsv).toContain("chapterId\tchapterTitle\ttrackId\ttitle");
    expect(index).toContain("./lyrics-book.html");
    expect(standalone).toContain("./lyrics-book.html");
    expect(lyricsSurface).toContain("../lyrics-book.html");
  });
});
