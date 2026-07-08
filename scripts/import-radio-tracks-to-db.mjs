import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const ROOT = process.cwd();
const WEB_DATA = path.join(ROOT, "apps/web/public/radio-html/data");
const DESKTOP_DATA = path.join(ROOT, "apps/desktop/public/radio-html/data");
const CATALOG_REL = "apps/web/public/radio-html/data/suno-library-catalog.json";
const CATALOG = path.join(ROOT, CATALOG_REL);
const BACKUP_ROOT = path.join(ROOT, "_radio_index/suno_backup");
const PROVIDER_SLUG = "radio-suno-backup";

const prisma = new PrismaClient();

function nullableString(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function nullableInt(value) {
  return Number.isInteger(value) ? value : null;
}

function parseDate(value) {
  if (!value || typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function fileUri(file) {
  return `file://${path.resolve(file)}`;
}

function readTextIfExists(relOrAbs) {
  if (!relOrAbs) return null;
  const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function parseLyricsBody(raw) {
  if (!raw) return null;
  const marker = raw.indexOf("LYRICS:");
  const body = marker >= 0 ? raw.slice(marker + "LYRICS:".length).trim() : raw.trim();
  return body || null;
}

function statSize(relOrAbs) {
  if (!relOrAbs) return null;
  const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  if (!fs.existsSync(abs)) return null;
  return fs.statSync(abs).size;
}

function sha256IfExists(relOrAbs) {
  if (!relOrAbs) return null;
  const abs = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(ROOT, relOrAbs);
  if (!fs.existsSync(abs)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex");
}

function objectKeyFor(kind, track, extension) {
  return `${kind}/${track.sunoId}${extension}`;
}

async function upsertMediaObject({ providerId, objectKey, sourcePath, publicUri, mediaKind, mimeType, byteSize, checksumSha256, rightsStatus }) {
  if (!sourcePath) return null;
  const abs = path.isAbsolute(sourcePath) ? sourcePath : path.join(ROOT, sourcePath);
  if (!fs.existsSync(abs)) return null;

  return prisma.mediaObject.upsert({
    where: { providerId_objectKey: { providerId, objectKey } },
    create: {
      providerId,
      objectKey,
      storageUri: fileUri(abs),
      publicUri,
      mediaKind,
      mimeType,
      byteSize,
      checksumSha256,
      rightsStatus,
      evidenceUri: CATALOG_REL,
      provenanceNote: "Imported from local Suno backup catalog; binary bytes remain outside the database.",
      sourceCitation: CATALOG_REL,
      verificationStatus: "SOURCE_CATALOG"
    },
    update: {
      storageUri: fileUri(abs),
      publicUri,
      mediaKind,
      mimeType,
      byteSize,
      checksumSha256,
      rightsStatus,
      evidenceUri: CATALOG_REL,
      provenanceNote: "Imported from local Suno backup catalog; binary bytes remain outside the database.",
      sourceCitation: CATALOG_REL,
      verificationStatus: "SOURCE_CATALOG"
    }
  });
}

async function linkMedia(radioTrackId, mediaObjectId, role, isPrimary) {
  if (!mediaObjectId) return null;
  return prisma.radioTrackMediaLink.upsert({
    where: {
      radioTrackId_mediaObjectId_role: {
        radioTrackId,
        mediaObjectId,
        role
      }
    },
    create: {
      radioTrackId,
      mediaObjectId,
      role,
      isPrimary
    },
    update: {
      isPrimary
    }
  });
}

async function main() {
  if (!fs.existsSync(CATALOG)) {
    throw new Error(`Catalog not found: ${CATALOG}`);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const tracks = Array.isArray(catalog.tracks) ? catalog.tracks : [];
  const provider = await prisma.storageProvider.upsert({
    where: { slug: PROVIDER_SLUG },
    create: {
      slug: PROVIDER_SLUG,
      name: "Radio Vaigyaaniq Suno Backup",
      kind: "local_fs",
      rootUri: fileUri(BACKUP_ROOT),
      failClosed: true,
      provenanceNote: "Local source backup for Radio Vaigyaaniq catalog import.",
      sourceCitation: CATALOG_REL,
      verificationStatus: "SOURCE_CATALOG"
    },
    update: {
      rootUri: fileUri(BACKUP_ROOT),
      failClosed: true,
      provenanceNote: "Local source backup for Radio Vaigyaaniq catalog import.",
      sourceCitation: CATALOG_REL,
      verificationStatus: "SOURCE_CATALOG"
    }
  });

  const report = {
    id: "radio-track-db-import",
    generatedAt: new Date().toISOString(),
    catalog: CATALOG_REL,
    databaseUrl: process.env.DATABASE_URL || null,
    providerSlug: provider.slug,
    counts: {
      catalogTracks: tracks.length,
      upsertedTracks: 0,
      stylesPresent: 0,
      lyricsTextPresent: 0,
      lyricsBodyPresent: 0,
      audioObjects: 0,
      coverObjects: 0,
      mediaLinks: 0,
      nullSunoId: 0
    },
    phkd: {
      rule: "Source catalog metadata is preserved; unknown lyric bodies remain NULL; binary media stays outside SQLite.",
      verificationState: "SOURCE_CATALOG",
      fabricatedClaims: false
    }
  };

  for (const track of tracks) {
    if (!track.sunoId) {
      report.counts.nullSunoId++;
      continue;
    }

    const lyricsText = readTextIfExists(track.lyricsPath);
    const lyricsBody = parseLyricsBody(lyricsText);
    const styles = nullableString(track.styles);
    const canPlay = Boolean(track.canPlay);
    const rightsStatus = canPlay ? "SOURCE_CATALOG_CAN_PLAY" : "UNKNOWN";
    const metadataJson = JSON.stringify({
      ...track,
      lyricsResolved: Boolean(lyricsText),
      lyricsBodyResolved: Boolean(lyricsBody)
    });

    const radioTrack = await prisma.radioTrack.upsert({
      where: { sunoId: track.sunoId },
      create: {
        sunoId: track.sunoId,
        sourcePlatform: "Suno",
        title: track.title || "(untitled)",
        theme: styles,
        styles,
        lyricsText,
        lyricsBody,
        lyricsPath: nullableString(track.lyricsPath),
        metadataJson,
        catalogSource: CATALOG_REL,
        sourceCreatedAt: parseDate(track.createdAt),
        durationSeconds: nullableInt(track.durationSeconds),
        durationLabel: nullableString(track.duration),
        sourceModel: nullableString(track.model),
        playCount: nullableInt(track.playCount),
        instrumental: typeof track.instrumental === "boolean" ? track.instrumental : null,
        sourceAudioPath: nullableString(track.audioPath),
        sourceCoverPath: nullableString(track.coverPath),
        sourceChecksum: nullableString(track.checksum),
        sourceBytes: nullableInt(track.bytes),
        publicPath: nullableString(track.publicPath),
        coverPublicPath: nullableString(track.coverPublicPath),
        canPlay,
        rightsStatus,
        verificationState: "SOURCE_CATALOG",
        published: false
      },
      update: {
        sourcePlatform: "Suno",
        title: track.title || "(untitled)",
        theme: styles,
        styles,
        lyricsText,
        lyricsBody,
        lyricsPath: nullableString(track.lyricsPath),
        metadataJson,
        catalogSource: CATALOG_REL,
        sourceCreatedAt: parseDate(track.createdAt),
        durationSeconds: nullableInt(track.durationSeconds),
        durationLabel: nullableString(track.duration),
        sourceModel: nullableString(track.model),
        playCount: nullableInt(track.playCount),
        instrumental: typeof track.instrumental === "boolean" ? track.instrumental : null,
        sourceAudioPath: nullableString(track.audioPath),
        sourceCoverPath: nullableString(track.coverPath),
        sourceChecksum: nullableString(track.checksum),
        sourceBytes: nullableInt(track.bytes),
        publicPath: nullableString(track.publicPath),
        coverPublicPath: nullableString(track.coverPublicPath),
        canPlay,
        rightsStatus,
        verificationState: "SOURCE_CATALOG",
        published: false
      }
    });

    report.counts.upsertedTracks++;
    if (styles) report.counts.stylesPresent++;
    if (lyricsText) report.counts.lyricsTextPresent++;
    if (lyricsBody) report.counts.lyricsBodyPresent++;

    const audioObject = await upsertMediaObject({
      providerId: provider.id,
      objectKey: objectKeyFor("audio", track, ".mp3"),
      sourcePath: track.audioPath,
      publicUri: nullableString(track.publicPath),
      mediaKind: "audio",
      mimeType: "audio/mpeg",
      byteSize: nullableInt(track.bytes) ?? statSize(track.audioPath),
      checksumSha256: nullableString(track.checksum) ?? sha256IfExists(track.audioPath),
      rightsStatus
    });
    if (audioObject) {
      report.counts.audioObjects++;
      await linkMedia(radioTrack.id, audioObject.id, "audio", true);
      report.counts.mediaLinks++;
    }

    const coverObject = await upsertMediaObject({
      providerId: provider.id,
      objectKey: objectKeyFor("covers", track, ".jpeg"),
      sourcePath: track.coverPath,
      publicUri: nullableString(track.coverPublicPath),
      mediaKind: "image",
      mimeType: "image/jpeg",
      byteSize: statSize(track.coverPath),
      checksumSha256: sha256IfExists(track.coverPath),
      rightsStatus
    });
    if (coverObject) {
      report.counts.coverObjects++;
      await linkMedia(radioTrack.id, coverObject.id, "cover", true);
      report.counts.mediaLinks++;
    }
  }

  for (const dir of [WEB_DATA, DESKTOP_DATA]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "radio-track-db-import.json"), `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify(report.counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
