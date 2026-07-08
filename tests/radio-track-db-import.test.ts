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

describe("radio track DB import contract", () => {
  it("adds first-class track metadata, lyrics, and source fields to Prisma", () => {
    const schema = read("prisma/schema.prisma");
    expect(schema).toContain("styles         String?");
    expect(schema).toContain("lyricsText     String?");
    expect(schema).toContain("lyricsBody     String?");
    expect(schema).toContain("metadataJson   String?");
    expect(schema).toContain("sourceAudioPath String?");
    expect(schema).toContain("rightsStatus   String      @default(\"UNKNOWN\")");
  });

  it("ships a migration for catalog metadata columns", () => {
    const migration = read(
      "prisma/migrations/20260627001000_radio_track_catalog_metadata/migration.sql"
    );
    expect(migration).toContain('ALTER TABLE "RadioTrack" ADD COLUMN "styles" TEXT');
    expect(migration).toContain('ALTER TABLE "RadioTrack" ADD COLUMN "lyricsText" TEXT');
    expect(migration).toContain('ALTER TABLE "RadioTrack" ADD COLUMN "metadataJson" TEXT');
    expect(migration).toContain('CREATE INDEX "RadioTrack_rightsStatus_idx"');
  });

  it("keeps an idempotent importer command for the Suno catalog", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");
    const script = read("scripts/import-radio-tracks-to-db.mjs");
    expect(pkg.scripts["radio:tracks:import"]).toBe("node scripts/import-radio-tracks-to-db.mjs");
    expect(script).toContain("prisma.radioTrack.upsert");
    expect(script).toContain("lyricsBody");
    expect(script).toContain("prisma.mediaObject.upsert");
    expect(script).toContain("Radio Vaigyaaniq Suno Backup");
  });

  it("writes an import evidence artifact after import", () => {
    const report = readJson<{
      id: string;
      counts: { catalogTracks: number; upsertedTracks: number; lyricsTextPresent: number };
      phkd: { fabricatedClaims: boolean };
    }>("apps/web/public/radio-html/data/radio-track-db-import.json");
    expect(report.id).toBe("radio-track-db-import");
    expect(report.counts.catalogTracks).toBeGreaterThan(0);
    expect(report.counts.upsertedTracks).toBe(report.counts.catalogTracks);
    expect(report.counts.lyricsTextPresent).toBe(report.counts.catalogTracks);
    expect(report.phkd.fabricatedClaims).toBe(false);
  });
});
