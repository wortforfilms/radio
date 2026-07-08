// Idempotent catalogue seeder for Radio Vaigyaaniq.
//
// Sources (real data only):
//   apps/web/public/radio-html/data/radio-engine-manifest.json  (stations, songs, commerce lane)
//   apps/web/public/radio-html/data/radio-content.json          (slugs, versions, storylines, lyric state)
//
// Targets:
//   ROOT Prisma db (prisma/schema.prisma): Station + RadioTrack
//     - upsert by Station.slug and RadioTrack.sunoId → safe to re-run
//     - commerce defaults respected (price/preview only written when overridden)
//     - `published` is NEVER written here (rights closure owns that flag)
//   Backend db (apps/radio-backend/prisma): stations/programs/ads via its own
//     `npm run prisma:seed` (schema-specific client) — run separately.
//
// Usage:
//   node scripts/seed-catalog.mjs --dry-run     # validate + counts, no DB writes
//   node scripts/seed-catalog.mjs               # upsert into the root database
//
// Fail-closed: with no generated Prisma client / DATABASE_URL, the script
// reports and exits non-zero instead of pretending to seed.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const dryRun = process.argv.includes("--dry-run");

const manifest = readJson("apps/web/public/radio-html/data/radio-engine-manifest.json");
const contentFile = "apps/web/public/radio-html/data/radio-content.json";
const content = fs.existsSync(path.join(ROOT, contentFile)) ? readJson(contentFile) : { tracks: [] };
const contentById = new Map(content.tracks.map((record) => [record.id, record]));

const songs = manifest.offlineBundle?.songs || [];
const stations = manifest.stations || [];

// ---- validation (both modes) ----
const problems = [];
const ids = new Set();
const slugs = new Set();
for (const song of songs) {
  if (ids.has(song.id)) problems.push(`duplicate track id: ${song.id}`);
  ids.add(song.id);
  const record = contentById.get(song.id);
  if (record) {
    if (slugs.has(record.slug)) problems.push(`duplicate slug: ${record.slug}`);
    slugs.add(record.slug);
    if (!record.storyline) problems.push(`missing storyline: ${song.id}`);
  }
}
const summary = {
  stations: stations.length,
  tracks: songs.length,
  withContent: songs.filter((song) => contentById.has(song.id)).length,
  uniqueSlugs: slugs.size,
  freeTier: songs.filter((song) => song.freeTier).length,
  problems: problems.length
};
console.log(`seed-catalog validate ${JSON.stringify(summary)}`);
if (problems.length) {
  console.error(problems.slice(0, 10).join("\n"));
  process.exit(1);
}
if (dryRun) {
  console.log("seed-catalog dry-run OK — no database writes performed.");
  process.exit(0);
}

// ---- root database upserts ----
let PrismaClient;
try {
  ({ PrismaClient } = await import("@prisma/client"));
} catch {
  console.error("seed-catalog blocked: @prisma/client not generated (run: npx prisma generate). Fail-closed, nothing written.");
  process.exit(1);
}
const prisma = new PrismaClient();

try {
  // Stations (root schema: slug unique, themes/languages CSV).
  for (const [index, station] of stations.entries()) {
    await prisma.station.upsert({
      where: { slug: station.slug },
      create: {
        slug: station.slug,
        name: station.name,
        tagline: station.description || null,
        themes: station.name,
        languages: "Hindi,Sanskrit,English",
        coverPath: station.cover || null,
        sortOrder: index,
        active: true
      },
      update: {
        name: station.name,
        tagline: station.description || null,
        coverPath: station.cover || null,
        sortOrder: index
      }
    });
  }

  // Tracks (upsert by sunoId — the stable catalogue UUID). Batched transactions.
  let seeded = 0;
  const BATCH = 100;
  for (let start = 0; start < songs.length; start += BATCH) {
    const slice = songs.slice(start, start + BATCH);
    await prisma.$transaction(
      slice.map((song) => {
        const record = contentById.get(song.id);
        const data = {
          title: song.title,
          theme: record?.theme || null,
          language: record?.language || null,
          styles: (record?.styles || []).join("; ") || null,
          lyricsPath: record?.rawLyricsRef || null, // raw lyrics reference (audit)
          durationSeconds: song.durationSeconds ? Math.round(song.durationSeconds) : null,
          sourceModel: song.model || null,
          sourceCreatedAt: song.sourceCreatedAt ? new Date(song.sourceCreatedAt) : null,
          catalogSource: "radio-engine-manifest",
          // content layer (slug/stylised/version/storyline + sanitisation state)
          metadataJson: record
            ? JSON.stringify({
                slug: record.slug,
                stylizedTitle: record.stylizedTitle,
                artist: record.artist,
                version: record.version,
                versionGroup: record.versionGroup,
                versionCount: record.versionCount,
                stationSlug: record.stationSlug,
                lyricsStatus: record.lyricsStatus,
                flaggedTermCount: record.flaggedTermCount,
                lrcPath: record.lrcPath,
                storyline: record.storyline,
                storylineProvenance: record.storylineProvenance,
                freeTier: song.freeTier === true,
                timingVerified: false
              })
            : null,
          // commerce lane: only write explicit overrides; schema defaults rule.
          ...(song.priceInr != null ? { priceInr: song.priceInr } : {}),
          ...(song.priceUsd != null ? { priceUsd: song.priceUsd } : {}),
          ...(song.previewSeconds != null ? { previewSeconds: song.previewSeconds } : {})
          // NOTE: `published` deliberately untouched — rights closure owns it.
        };
        seeded += 1;
        return prisma.radioTrack.upsert({
          where: { sunoId: song.id },
          create: { sunoId: song.id, sourcePlatform: "Suno", ...data },
          update: data
        });
      })
    );
  }
  console.log(`seed-catalog stations=${stations.length} tracks=${seeded} (upserted, idempotent)`);
  console.log("seed-catalog note: backend stations/programs/ads db seeds via `cd apps/radio-backend && npm run prisma:seed`.");
} finally {
  await prisma.$disconnect();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}
