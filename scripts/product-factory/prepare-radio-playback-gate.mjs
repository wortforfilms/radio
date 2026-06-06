import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const workspaceRoot = path.resolve(".");
const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const sourceRoot = path.resolve("_radio_index/stardust_import_final");
const metadataPath = path.join(sourceRoot, "stardust_import.csv");
const audioRoot = path.join(sourceRoot, "audio");
const rightsReportPath = path.join(webRoot, "data", "rights-closure-report.json");
const today = new Date().toISOString();

const phkd = {
  rule: "fail_closed",
  unknownValues: "NULL",
  productionReady: false,
  releaseAllowed: false,
  note: "Playback records are local provenance/checksum indexes only. canPlay remains false until source, rights, review, audit, and release allowance evidence are verified."
};

function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function copyToDesktop(relativePath) {
  const source = path.join(webRoot, relativePath);
  const target = path.join(desktopRoot, relativePath);
  if (!fs.existsSync(source) || !fs.existsSync(desktopRoot)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function rel(file) {
  return path.relative(workspaceRoot, file).split(path.sep).join("/");
}

function pad(value, width) {
  return String(value ?? "").padStart(width, "0");
}

function nullable(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

const rightsReport = readJson(rightsReportPath, { summary: { closed: 0, blocked: 0, releaseAllowed: 0 } });
const metadataRows = fs.existsSync(metadataPath)
  ? parse(fs.readFileSync(metadataPath, "utf8"), {
      columns: true,
      bom: true,
      skip_empty_lines: true,
      trim: true
    })
  : [];

const records = metadataRows.map((row, index) => {
  const upc = nullable(row.upc);
  const discNumber = nullable(row.discNumber) ?? "1";
  const trackNumber = nullable(row.trackNumber);
  const fileName = upc && trackNumber ? `${upc}_${pad(discNumber, 2)}_${pad(trackNumber, 3)}.mp3` : null;
  const audioPath = fileName ? path.join(audioRoot, fileName) : null;
  const exists = audioPath ? fs.existsSync(audioPath) : false;
  const stat = exists ? fs.statSync(audioPath) : null;
  const checksum = exists ? sha256(audioPath) : null;
  const missing = [
    exists ? null : "audioFile",
    checksum ? null : "checksum",
    "rightsStatus",
    "license",
    "citation",
    "reviewer",
    "reviewedAt",
    "auditVerified",
    "releaseAllowed"
  ].filter(Boolean);

  return {
    id: `stardust-final-${upc ?? "unknown-upc"}-${pad(discNumber, 2)}-${pad(trackNumber ?? index + 1, 3)}`,
    title: nullable(row.trackTitle),
    releaseTitle: nullable(row.title),
    artist: nullable(row.trackArtist) ?? nullable(row.artist),
    label: nullable(row.label),
    language: null,
    genre: nullable(row.genre),
    upc,
    isrc: nullable(row.isrc),
    catalogNumber: nullable(row.catalogNumber),
    releaseDate: nullable(row.releaseDate),
    discNumber: Number(discNumber),
    trackNumber: trackNumber ? Number(trackNumber) : null,
    durationSeconds: row.duration ? Number(row.duration) : null,
    sourcePackage: "_radio_index/stardust_import_final",
    metadataSource: rel(metadataPath),
    source: audioPath ? rel(audioPath) : null,
    publicPath: null,
    checksum,
    bytes: stat?.size ?? null,
    rightsStatus: "NULL",
    license: null,
    citation: null,
    reviewer: null,
    reviewedAt: null,
    auditVerified: false,
    releaseAllowed: false,
    canPlay: false,
    status: "blocked",
    verificationState: "blocked-rights-proof-null",
    missing,
    blocker: exists
      ? "rights/reviewer/audit evidence incomplete; canPlay=false"
      : "audio file missing from curated package; canPlay=false"
  };
});

const counts = {
  imports: records.length,
  localAudioFiles: fs.existsSync(audioRoot)
    ? fs.readdirSync(audioRoot).filter((file) => /\.mp3$/i.test(file)).length
    : 0,
  sourceRows: metadataRows.length,
  checksumPresent: records.filter((record) => record.checksum).length,
  playable: 0,
  blocked: records.length || 1,
  nullEvidence: records.filter((record) => record.missing.length > 0).length || 1,
  stationSlots: readJson(path.join(webRoot, "data", "radio-media.json"), { stations: [] })?.stations?.length ?? 0,
  rightsClosed: rightsReport.summary?.closed ?? 0,
  rightsBlocked: rightsReport.summary?.blocked ?? 0,
  releaseAllowed: 0
};

const audioImportManifest = {
  id: "radio-vaigyaaniq-audio-import-manifest",
  title: "Radio Vaigyaaniq Audio Import Manifest",
  generatedAt: today,
  verificationState: records.length ? "blocked-local-audio-indexed-rights-null" : "blocked-audio-import-null",
  phkd,
  sourcePackage: {
    path: "_radio_index/stardust_import_final",
    metadata: "_radio_index/stardust_import_final/stardust_import.csv",
    audioDirectory: "_radio_index/stardust_import_final/audio",
    status: fs.existsSync(sourceRoot) ? "present-local" : "missing",
    releaseClaim: false
  },
  counts,
  schema: {
    required: ["id", "title", "source", "checksum", "rightsStatus", "verificationState"],
    fields: {
      id: "Stable local import id",
      title: "Track or clip title",
      artist: "Creator/artist from local metadata, NULL if unknown",
      language: "Language, NULL if unknown",
      source: "Local path or external source reference",
      checksum: "sha256 for imported local file",
      rightsStatus: "NULL | draft | verified | blocked",
      verificationState: "NULL | draft | verified | blocked",
      playable: "false until source, rights, review, audit, release allowance, and checksum are verified"
    }
  },
  imports: records,
  placeholder: "/radio-html/assets/audio/PHKD_AUDIO_PLACEHOLDER.json"
};

const playbackGate = {
  id: "radio-vaigyaaniq-playback-gate",
  title: "Radio Vaigyaaniq Playable Audio Import Gate",
  generatedAt: today,
  verificationState: records.length ? "blocked-local-audio-indexed-rights-null" : "blocked-audio-import-null",
  phkd,
  counts,
  gate: {
    name: "Playable Audio Gate",
    status: "blocked",
    detail: records.length
      ? `Playback blocked: ${records.length} local audio candidate(s) indexed, 0 rights-verified.`
      : "Playback blocked: no local audio candidates indexed."
  },
  sourceManifest: "/radio-html/data/audio-import-manifest.json",
  rightsClosureReport: "/radio-html/data/rights-closure-report.json",
  gateRules: [
    "audio source must exist",
    "sha256 checksum must exist",
    "rightsStatus must be verified",
    "license and citation must exist",
    "reviewer and reviewedAt must exist",
    "AuditLog.verified must be true",
    "releaseAllowed must be true",
    "canPlay remains false until every rule passes"
  ],
  records: records.length
    ? records
    : [{ key: "audio-placeholder", label: "No verified imported audio", canPlay: false, status: "blocked", blocker: "audio import manifest has no verified records" }]
};

writeJson(path.join(webRoot, "data/audio-import-manifest.json"), audioImportManifest);
writeJson(path.join(webRoot, "data/playback-gate.json"), playbackGate);
copyToDesktop("data/audio-import-manifest.json");
copyToDesktop("data/playback-gate.json");

console.log(JSON.stringify({
  report: "radio-playback-gate",
  paths: {
    audioImport: "/radio-html/data/audio-import-manifest.json",
    playbackGate: "/radio-html/data/playback-gate.json"
  },
  counts,
  verificationState: playbackGate.verificationState
}, null, 2));
