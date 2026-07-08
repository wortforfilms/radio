import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_DATA = path.join(ROOT, "apps/web/public/radio-html/data");
const DESKTOP_DATA = path.join(ROOT, "apps/desktop/public/radio-html/data");
const OUT_NAME = "media-storage-separation.json";

const MEDIA_EXTENSIONS = new Set([
  ".aac",
  ".flac",
  ".gif",
  ".glb",
  ".jpg",
  ".jpeg",
  ".ktx2",
  ".m4a",
  ".mov",
  ".mp3",
  ".mp4",
  ".obj",
  ".ogg",
  ".png",
  ".usd",
  ".wav",
  ".webm",
  ".webp"
]);

const ignoredMediaRoots = [
  "_radio_index/",
  "_non_suno/",
  "media/",
  "storage/media/",
  "apps/web/public/radio-html/assets/audio/",
  "apps/web/public/radio-html/assets/covers/",
  "apps/desktop/public/radio-html/assets/audio/",
  "apps/desktop/public/radio-html/assets/covers/"
];

function gitLsFiles() {
  return execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

function classifyTrackedMedia(file) {
  const ext = path.extname(file).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(ext)) return null;
  if (/\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file)) return "audio";
  if (/\.(mp4|mov|webm)$/i.test(file)) return "video";
  if (/\.(glb|fbx|obj|usd|ktx2)$/i.test(file)) return "model";
  if (/\/qa\/|\/screenshots\//.test(file)) return "qa-image";
  if (/\/icons\//.test(file)) return "app-icon";
  return "image";
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function isInsideRepo(mediaRoot) {
  if (!mediaRoot) return false;
  const root = mediaRoot.replace(/\/+$/, "");
  const repo = ROOT.replace(/\/+$/, "");
  return root === repo || root.startsWith(`${repo}/`);
}

const files = gitLsFiles();
const trackedMedia = files
  .map((file) => ({ file, kind: classifyTrackedMedia(file), ext: path.extname(file).toLowerCase() }))
  .filter((item) => item.kind);

const trackedRuntimeAudio = trackedMedia.filter((item) => item.kind === "audio");
const trackedPromotedRadioMirrors = trackedMedia.filter((item) =>
  /apps\/(web|desktop)\/public\/radio-html\/assets\/(audio|covers)\//.test(item.file)
);

const storageConfig = {
  databaseUrlEnv: "DATABASE_URL",
  databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  mediaRootEnv: "RADIO_MEDIA_ROOT",
  mediaRootConfigured: Boolean(process.env.RADIO_MEDIA_ROOT),
  mediaRoot: process.env.RADIO_MEDIA_ROOT || null,
  mediaPublicBaseEnv: "RADIO_MEDIA_PUBLIC_BASE",
  mediaPublicBaseConfigured: Boolean(process.env.RADIO_MEDIA_PUBLIC_BASE),
  providerEnv: "RADIO_MEDIA_PROVIDER",
  provider: process.env.RADIO_MEDIA_PROVIDER || "local_fs"
};

const blockers = [];
if (!storageConfig.databaseUrlConfigured) blockers.push("DATABASE_URL is not configured");
if (!storageConfig.mediaRootConfigured) blockers.push("RADIO_MEDIA_ROOT is not configured");
if (storageConfig.mediaRoot && isInsideRepo(storageConfig.mediaRoot)) {
  blockers.push("RADIO_MEDIA_ROOT points inside the Git workspace");
}
if (trackedRuntimeAudio.length > 0) {
  blockers.push(`${trackedRuntimeAudio.length} tracked audio files remain in Git`);
}
if (trackedPromotedRadioMirrors.length > 0) {
  blockers.push(`${trackedPromotedRadioMirrors.length} promoted radio media mirror files are tracked`);
}

const manifest = {
  id: "radio-media-storage-separation",
  generatedAt: new Date().toISOString(),
  releaseAllowed: blockers.length === 0,
  verificationState: blockers.length === 0 ? "configured" : "blocked-media-storage-separation",
  scope: {
    database: {
      stores: ["metadata", "indexes", "rights evidence", "audit logs", "checksums", "object URIs"],
      neverStores: ["audio bytes", "cover bytes", "video bytes", "model binaries"],
      models: ["StorageProvider", "MediaObject", "RadioTrackMediaLink", "MediaAsset", "AuditLog"]
    },
    mediaStorage: {
      stores: ["audio", "covers", "video", "generated images", "waveform sidecars", "3D binaries"],
      rootEnv: "RADIO_MEDIA_ROOT",
      publicBaseEnv: "RADIO_MEDIA_PUBLIC_BASE",
      providerEnv: "RADIO_MEDIA_PROVIDER",
      allowedProviders: ["local_fs", "s3", "r2", "gcs", "azure_blob", "ipfs"]
    },
    git: {
      stores: ["source code", "schemas", "small UI assets", "evidence JSON", "manifests"],
      neverStores: ["raw catalogue imports", "promoted audio mirrors", "generated media libraries"]
    }
  },
  config: storageConfig,
  ignoredMediaRoots,
  trackedMedia: {
    total: trackedMedia.length,
    byKind: groupBy(trackedMedia, (item) => item.kind),
    byExtension: groupBy(trackedMedia, (item) => item.ext || "(none)"),
    runtimeAudioCount: trackedRuntimeAudio.length,
    promotedMirrorCount: trackedPromotedRadioMirrors.length,
    runtimeAudio: trackedRuntimeAudio.map((item) => item.file),
    promotedMirrors: trackedPromotedRadioMirrors.map((item) => item.file)
  },
  blockers,
  phkd: {
    rule: "Fail closed until media storage root, checksums, rights evidence, and verification state are explicit.",
    unknownValues: "NULL",
    fabricatedClaims: false
  }
};

for (const dir of [WEB_DATA, DESKTOP_DATA]) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, OUT_NAME), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`wrote ${path.relative(ROOT, path.join(dir, OUT_NAME))}`);
}

console.log(`trackedMedia=${trackedMedia.length}`);
console.log(`runtimeAudio=${trackedRuntimeAudio.length}`);
console.log(`releaseAllowed=${manifest.releaseAllowed}`);
if (blockers.length) console.log(`blockers=${blockers.join(" | ")}`);
