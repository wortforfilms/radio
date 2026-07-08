import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assignVersions,
  buildStoryline,
  createSlugger,
  instrumentalPlaceholder,
  sanitizeCues,
  sanitizeText,
  slugify,
  stylizeTitle,
  toLrc,
  // @ts-expect-error — plain .mjs module without type declarations
} from "../scripts/lib/radio-content-lib.mjs";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("lyrics sanitisation", () => {
  it("redacts offensive terms but leaves clean text untouched", () => {
    const clean = sanitizeText("हट हट हट होनी तू हट");
    expect(clean.text).toBe("हट हट हट होनी तू हट");
    expect(clean.flagged).toEqual([]);

    const dirty = sanitizeText("what the fuck yaar, चूतिया move");
    expect(dirty.text).not.toContain("fuck");
    expect(dirty.text).not.toContain("चूतिया");
    expect(dirty.text).toContain("▮▮▮");
    expect(dirty.flagged.length).toBe(2);
  });

  it("sanitises cue lists and reports redacted indexes", () => {
    const { cues, flaggedTerms, redactedCueIndexes } = sanitizeCues([
      { text: "clean line" },
      { text: "bhenchod something" },
    ]);
    expect(cues[0].text).toBe("clean line");
    expect(cues[1].text).toContain("▮▮▮");
    expect(redactedCueIndexes).toEqual([1]);
    expect(flaggedTerms).toEqual(["bhenchod"]);
  });
});

describe("titles, slugs, versions", () => {
  it("builds unique slugs including Devanagari titles", () => {
    const next = createSlugger();
    expect(slugify("Midnight Echoes!")).toBe("midnight-echoes");
    expect(next("छट का दिन")).toBeTruthy();
    expect(next("छट का दिन")).toMatch(/-2$/); // duplicate gets a suffix
    expect(slugify("", "fallback")).toBe("fallback");
  });

  it("labels duplicate-title generations as takes, untitled as singletons", () => {
    const versions = assignVersions([
      { id: "a", title: "Same Song", createdAt: "2026-01-01" },
      { id: "b", title: "same song", createdAt: "2026-01-02" },
      { id: "c", title: "(untitled)", createdAt: "2026-01-03" },
      { id: "d", title: "(untitled)", createdAt: "2026-01-04" },
    ]);
    expect(versions.get("a")!.version).toBe("original");
    expect(versions.get("b")!.version).toBe("take-2");
    expect(versions.get("a")!.versionGroup).toBe(versions.get("b")!.versionGroup);
    // untitled tracks are distinct songs, never grouped
    expect(versions.get("c")!.version).toBe("original");
    expect(versions.get("d")!.version).toBe("original");
    expect(versions.get("c")!.versionGroup).not.toBe(versions.get("d")!.versionGroup);
  });

  it("stylises titles with artist, station, and non-original version", () => {
    const track = { id: "x", title: "Midnight Echoes" };
    expect(stylizeTitle(track, "Ameerpur", { version: "original" })).toBe(
      "Midnight Echoes — VESAHE · hkfaduio · Ameerpur"
    );
    expect(stylizeTitle(track, "Ameerpur", { version: "take-2" })).toContain("(take-2)");
  });
});

describe("storylines and LRC", () => {
  it("generates deterministic metadata-derived storylines", () => {
    const track = { id: "abc", title: "Test", durationSeconds: 180 };
    const one = buildStoryline(track, { language: "Hindi", stationName: "Gurukul" });
    const two = buildStoryline(track, { language: "Hindi", stationName: "Gurukul" });
    expect(one).toBe(two); // deterministic per id
    expect(one).toContain("Hindi-language");
    expect(one).toContain("Gurukul");
    expect(one.split(/\s+/).length).toBeGreaterThan(60);
  });

  it("emits valid draft LRC with unverified-timing marker", () => {
    const lrc = toLrc(
      [
        { startSeconds: 8, text: "पहली पंक्ति", kind: "lyric" },
        { startSeconds: 71.5, text: "दूसरी पंक्ति", kind: "lyric" },
        { startSeconds: 90, text: "", kind: "lyric" }, // empty dropped
      ],
      { title: "Song", artist: "VESAHE" }
    );
    expect(lrc).toContain("[ti:Song]");
    expect(lrc).toContain("[00:08.00]पहली पंक्ति");
    expect(lrc).toContain("[01:11.50]दूसरी पंक्ति");
    expect(lrc).toContain("draft timing, unverified");
    expect(lrc.split("\n").filter((line: string) => line.startsWith("[0")).length).toBe(2);
  });

  it("gives instrumentals a clearly generic placeholder", () => {
    const text = instrumentalPlaceholder({ id: "x", title: "T" }, { language: "Sanskrit" });
    expect(text).toContain("instrumental");
    expect(text).toContain("Sanskrit");
  });
});

describe("content library artifact", () => {
  const content = readJson<{
    counts: Record<string, number>;
    phkd: Record<string, unknown>;
    tracks: Array<{
      id: string;
      slug: string;
      stylizedTitle: string;
      version: string;
      storyline: string;
      storylineProvenance: string;
      lyricsStatus: string;
      rawLyricsRef: string | null;
      lrcPath: string | null;
      placeholder: string | null;
      timingVerified: boolean;
    }>;
  }>("apps/web/public/radio-html/data/radio-content.json");

  it("covers the full catalogue with unique ids and slugs", () => {
    expect(content.tracks.length).toBeGreaterThan(1000);
    expect(new Set(content.tracks.map((t) => t.id)).size).toBe(content.tracks.length);
    expect(new Set(content.tracks.map((t) => t.slug)).size).toBe(content.tracks.length);
    expect(content.tracks.every((t) => t.stylizedTitle && t.version && t.storyline)).toBe(true);
    expect(content.counts.storylines).toBe(content.tracks.length);
  });

  it("keeps provenance honest: drafts, raw refs, unverified timing", () => {
    expect(content.phkd.storylinesAreEditorialDrafts).toBe(true);
    expect(content.phkd.rawLyricsPreserved).toBe(true);
    expect(content.tracks.every((t) => t.storylineProvenance === "derived-from-metadata-template")).toBe(true);
    expect(content.tracks.every((t) => t.timingVerified === false)).toBe(true);
    // every sanitised track keeps an audit pointer to the raw lyric source
    expect(
      content.tracks.filter((t) => t.lyricsStatus.startsWith("sanitized")).every((t) => t.rawLyricsRef)
    ).toBe(true);
    // instrumentals get placeholders, not empty panels
    expect(
      content.tracks.filter((t) => t.lyricsStatus === "placeholder-instrumental").every((t) => t.placeholder)
    ).toBe(true);
  });

  it("mirrors content + LRC to desktop and merges into the manifest", () => {
    const desktop = readJson<{ counts: Record<string, number> }>(
      "apps/desktop/public/radio-html/data/radio-content.json"
    );
    expect(desktop.counts.tracks).toBe(content.counts.tracks);
    const sample = content.tracks.find((t) => t.lrcPath);
    expect(sample).toBeTruthy();
    const rel = sample!.lrcPath!.replace("/radio-html/", "");
    expect(fs.existsSync(path.join(repoRoot, "apps/web/public/radio-html", rel))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, "apps/desktop/public/radio-html", rel))).toBe(true);

    const manifest = readJson<{
      counts: { contentEnriched: number; adminPublished: number };
      offlineBundle: { songs: Array<{ stylizedTitle?: string; slug?: string; published: boolean }> };
    }>("apps/web/public/radio-html/data/radio-engine-manifest.json");
    expect(manifest.counts.contentEnriched).toBe(content.tracks.length);
    expect(manifest.offlineBundle.songs.every((s) => s.stylizedTitle && s.slug)).toBe(true);
    // no verified rights proofs in-repo → nothing published
    expect(manifest.counts.adminPublished).toBe(0);
    expect(manifest.offlineBundle.songs.every((s) => s.published === false)).toBe(true);
  });
});

describe("admin lane (fail-closed)", () => {
  it("keeps the admin API password-gated with a verified-proof publish gate", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain("ADMIN_PASSWORD");
    expect(server).toContain("blocked-admin-password-null");
    expect(server).toContain('app.post("/admin/login"');
    expect(server).toContain('app.get("/admin/state"');
    expect(server).toContain('app.post("/admin/rights-proof"');
    expect(server).toContain('app.get("/admin/cache-status"');
    expect(server).toContain('app.post("/admin/resync"');
    // proofs are stored unverified; only the rights-closure lane verifies
    expect(server).toContain("verified: false");
    // auth seam documented for OAuth swap
    expect(server).toContain("requireAdmin");
  });

  it("manifest builder honours publish intent only with a verified proof", () => {
    const generator = read("scripts/build-radio-engine-manifest.mjs");
    expect(generator).toContain("verifiedProofTrackIds");
    expect(generator).toContain("override.published === true && verifiedProofTrackIds.has(trackId)");
  });

  it("ships the admin panel UI on web and desktop", () => {
    const panel = read("apps/web/public/radio-html/admin-panel.html");
    const desktopPanel = read("apps/desktop/public/radio-html/admin-panel.html");
    expect(panel).toBe(desktopPanel);
    for (const anchor of ["/admin/login", "/admin/rights-proof", "/admin/cache-status", "PHKD fail-closed"]) {
      expect(panel).toContain(anchor);
    }
  });
});

describe("seeding", () => {
  it("seed script validates, upserts idempotently, and never touches published", () => {
    const seed = read("scripts/seed-catalog.mjs");
    expect(seed).toContain("--dry-run");
    expect(seed).toContain("upsert");
    expect(seed).toContain("where: { sunoId: song.id }");
    expect(seed).toContain("where: { slug: station.slug }");
    expect(seed).toContain("`published` deliberately untouched");
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    expect(pkg.scripts["radio:seed"]).toBe("node scripts/seed-catalog.mjs");
    expect(pkg.scripts["radio:seed:dry"]).toBe("node scripts/seed-catalog.mjs --dry-run");
    expect(pkg.scripts["radio:content"]).toContain("build-radio-content.mjs");
  });
});
