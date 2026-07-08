// Content production pass for Radio Vaigyaaniq.
//
// Reads the real catalogue (suno-latest-list.json), draft lyric cues
// (lyrics-prompter-data.json) and the engine manifest's station mapping, then
// produces for every track:
//   - sanitised lyrics state (raw text untouched on disk; display redactions only)
//   - a draft time-synced .lrc file (assets/lrc/<id>.lrc) where cues exist
//   - a stylised display title + unique URL slug
//   - version labels (original / take-N) across duplicate-title generations
//   - a deterministic editorial storyline derived from real metadata
//
// Output: data/radio-content.json (web + desktop mirror) + LRC files (mirrored).
// PHKD: storylines are editorial drafts derived from metadata — never presented
// as artist statements; lyric timing stays marked unverified; nothing here can
// flip `published` or any rights gate.
//
// Usage: node scripts/build-radio-content.mjs [--skip-lrc]

import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_ARTIST,
  assignVersions,
  buildStoryline,
  createSlugger,
  instrumentalPlaceholder,
  sanitizeCues,
  sanitizeText,
  stylizeTitle,
  toLrc
} from "./lib/radio-content-lib.mjs";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const skipLrc = process.argv.includes("--skip-lrc");
const generatedAt = new Date().toISOString();

const latest = readJson(path.join(WEB_HTML, "data/suno-latest-list.json"));
const lyricsData = readJson(path.join(WEB_HTML, "data/lyrics-prompter-data.json"));
const manifest = readJson(path.join(WEB_HTML, "data/radio-engine-manifest.json"));

const lyricsById = new Map((lyricsData.tracks || []).map((track) => [track.id, track]));
const stationNameBySlug = new Map((manifest.stations || []).map((station) => [station.slug, station.name]));
const stationByTrackId = new Map(
  (manifest.stations || []).flatMap((station) => (station.programs || []).map((program) => [program.trackId, station.slug]))
);

const tracks = latest.tracks.filter((track) => track.canPlay && track.audioRelativePath);
const versions = assignVersions(tracks);
const nextSlug = createSlugger();

const lrcDirWeb = path.join(WEB_HTML, "assets/lrc");
if (!skipLrc) fs.mkdirSync(lrcDirWeb, { recursive: true });

let flaggedTracks = 0;
let redactedCues = 0;
let lrcFiles = 0;
let placeholders = 0;

const records = tracks.map((track) => {
  const lyric = lyricsById.get(track.id);
  const stationSlug = stationByTrackId.get(track.id) || null;
  const stationName = stationSlug ? stationNameBySlug.get(stationSlug) : null;
  const versionInfo = versions.get(track.id);

  // ---- lyrics: sanitise cues (raw stays on disk, referenced for audit) ----
  const rawCues = lyric?.cues || [];
  const { cues, flaggedTerms, redactedCueIndexes } = sanitizeCues(rawCues);
  const hasLyrics = cues.some((cue) => (cue.kind ?? "lyric") === "lyric" && String(cue.text || "").trim());
  if (flaggedTerms.length) flaggedTracks += 1;
  redactedCues += redactedCueIndexes.length;

  let lyricsStatus = "placeholder-instrumental";
  let lrcPath = null;
  let placeholder = null;
  if (hasLyrics) {
    lyricsStatus = flaggedTerms.length ? "sanitized-redacted" : "sanitized";
    if (!skipLrc) {
      const lrc = toLrc(cues, { title: track.title, artist: DEFAULT_ARTIST, album: stationName || "Radio Vaigyaaniq" });
      fs.writeFileSync(path.join(lrcDirWeb, `${track.id}.lrc`), lrc);
      lrcFiles += 1;
    }
    lrcPath = `/radio-html/assets/lrc/${track.id}.lrc`;
  } else {
    placeholder = instrumentalPlaceholder(track, { language: lyric?.language });
    placeholders += 1;
  }

  // ---- titles / ids ----
  const stylizedTitle = stylizeTitle(track, stationName, versionInfo);
  const slug = nextSlug(`${track.title}${versionInfo.version === "original" ? "" : `-${versionInfo.version}`}`, track.id.slice(0, 8));

  // ---- storyline (sanitised first line only) ----
  const firstLyricLine = hasLyrics
    ? sanitizeText(cues.find((cue) => (cue.kind ?? "lyric") === "lyric" && String(cue.text || "").trim())?.text || "").text.slice(0, 90)
    : null;
  const storyline = buildStoryline(track, {
    language: lyric?.language,
    theme: lyric?.theme,
    styles: lyric?.styles,
    stationName,
    firstLyricLine,
    isInstrumental: !hasLyrics
  });

  return {
    id: track.id, // stable UUID from the source catalogue (globally unique)
    slug,
    title: track.title,
    stylizedTitle,
    artist: DEFAULT_ARTIST,
    version: versionInfo.version,
    versionGroup: versionInfo.versionGroup,
    versionIndex: versionInfo.versionIndex,
    versionCount: versionInfo.versionCount, // peers resolved at runtime via versionGroup
    stationSlug,
    language: lyric?.language || null,
    theme: lyric?.theme || null,
    styles: lyric?.styles || [],
    lyricsStatus,
    flaggedTermCount: flaggedTerms.length,
    redactions: redactedCueIndexes.length
      ? redactedCueIndexes.map((index) => ({ cue: index, text: cues[index].text }))
      : undefined,
    rawLyricsRef: lyric?.sourceLyricsPath || null, // audit trail — raw text never modified
    lrcPath,
    placeholder,
    storyline,
    storylineProvenance: "derived-from-metadata-template", // editorial draft, not an artist statement
    timingVerified: false
  };
});

const content = {
  id: "radio-vaigyaaniq-content-library",
  generatedAt,
  status: "editorial-draft-content",
  verificationState: "content-derived-lyrics-sanitized-timing-unverified",
  phkd: {
    failClosed: true,
    rawLyricsPreserved: true,
    storylinesAreEditorialDrafts: true,
    lyricTimingVerified: false,
    publishGateUntouched: true,
    note: "Sanitisation redacts display text only; raw lyric files stay untouched at rawLyricsRef. Storylines are deterministic editorial drafts derived from catalogue metadata — no inspiration or intent is claimed as fact."
  },
  counts: {
    tracks: records.length,
    withLyrics: records.filter((r) => r.lyricsStatus.startsWith("sanitized")).length,
    flaggedTracks,
    redactedCues,
    placeholders,
    lrcFiles,
    versionGroups: new Set(records.map((r) => r.versionGroup)).size,
    multiVersionTracks: records.filter((r) => r.versionCount > 1).length,
    storylines: records.filter((r) => r.storyline).length
  },
  artistDefault: DEFAULT_ARTIST,
  tracks: records
};

// ---- write web + desktop mirrors ----
for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  fs.mkdirSync(path.join(htmlRoot, "data"), { recursive: true });
  fs.writeFileSync(path.join(htmlRoot, "data/radio-content.json"), `${JSON.stringify(content)}\n`);
}
if (!skipLrc) {
  // Overwrite-in-place mirror (no delete pass — some mounts block unlink).
  const lrcDirDesktop = path.join(DESKTOP_HTML, "assets/lrc");
  try {
    fs.cpSync(lrcDirWeb, lrcDirDesktop, { recursive: true, force: true });
  } catch (error) {
    console.warn(`radio-content warn: desktop LRC mirror incomplete (${error.code || error.message}) — re-run or copy assets/lrc manually.`);
  }
}

console.log(`radio-content tracks=${content.counts.tracks}`);
console.log(`radio-content withLyrics=${content.counts.withLyrics}`);
console.log(`radio-content flaggedTracks=${content.counts.flaggedTracks} redactedCues=${content.counts.redactedCues}`);
console.log(`radio-content placeholders=${content.counts.placeholders}`);
console.log(`radio-content lrcFiles=${content.counts.lrcFiles}`);
console.log(`radio-content versionGroups=${content.counts.versionGroups} multiVersionTracks=${content.counts.multiVersionTracks}`);
console.log(`radio-content storylines=${content.counts.storylines}`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
