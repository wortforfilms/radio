import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const WEB_DATA = path.join(WEB_HTML, "data");
const DESKTOP_DATA = path.join(DESKTOP_HTML, "data");
const BACKUP_LYRICS = path.join(ROOT, "_radio_index/suno_backup/lyrics");
const MANUAL_LYRICS = path.join(ROOT, "_radio_index/lyrics");
const FULL_UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const SHORT_ID_RE = /\b[0-9a-f]{8}\b/i;

const generatedAt = new Date().toISOString();
const catalog = readJson(path.join(WEB_DATA, "suno-library-catalog.json"));
const stationTracks = readJson(path.join(WEB_DATA, "station-tracks.json"));
const tracks = catalog.tracks || [];
const trackById = new Map(tracks.map((track) => [track.sunoId, track]));
const prefixIndex = buildPrefixIndex(tracks);
const stationIndex = buildStationIndex(stationTracks);
const ffprobePath = findFfprobe();
const durationCache = new Map();

const parsedFiles = [
  ...listTextFiles(BACKUP_LYRICS).map((file) => parseLyricsSource(file, "suno-backup")),
  ...listTextFiles(MANUAL_LYRICS).map((file) => parseLyricsSource(file, "manual-lyrics"))
];

const sourcesByTrackId = new Map();
const orphanSources = [];
for (const source of parsedFiles) {
  const matchedId = resolveTrackId(source);
  if (matchedId) {
    if (!sourcesByTrackId.has(matchedId)) sourcesByTrackId.set(matchedId, []);
    sourcesByTrackId.get(matchedId).push({ ...source, matchedTrackId: matchedId });
  } else {
    orphanSources.push(source);
  }
}

const trackRecords = tracks.map((track) => buildTrackPrompterRecord(track));
const manualRecords = orphanSources
  .filter((source) => source.promptLines.length > 0 || source.styles.length > 0)
  .map((source) => buildManualPrompterRecord(source));

const summary = summarize(trackRecords, manualRecords);
const prompterData = {
  id: "radio-vaigyaaniq-lyrics-prompter-data",
  generatedAt,
  status: "local-preview-fail-closed",
  verificationState: "timing-unverified",
  source: {
    catalog: rel(path.join(WEB_DATA, "suno-library-catalog.json")),
    stationTracks: rel(path.join(WEB_DATA, "station-tracks.json")),
    sunoBackupLyrics: rel(BACKUP_LYRICS),
    manualLyrics: rel(MANUAL_LYRICS),
    ffprobe: ffprobePath || null
  },
  phkd: {
    fabricatedLyrics: false,
    fabricatedStyles: false,
    fabricatedTimingClaims: false,
    timingVerified: false,
    unknownValues: "NULL",
    note:
      "Cue timing is an estimated spread over available audio duration or NULL/estimated duration. It is not human-verified sync."
  },
  counts: summary,
  tracks: trackRecords,
  manualRecords
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  ensureDir(dataRoot);
  writeJson(path.join(dataRoot, "lyrics-prompter-data.json"), prompterData);
  fs.writeFileSync(path.join(dataRoot, "lyrics-prompter-index.tsv"), buildIndexTsv(prompterData));
  fs.writeFileSync(path.join(htmlRoot, "lyrics-prompter.html"), buildPrompterHtml(prompterData));
  updateHtmlIndex(path.join(htmlRoot, "index.html"));
  updateStandaloneRadio(path.join(htmlRoot, "standalone-radio.html"));
}

updateSurfaceLyrics(path.join(WEB_HTML, "surfaces/lyrics.html"));
updateSurfaceLyrics(path.join(DESKTOP_HTML, "surfaces/lyrics.html"));

console.log(`lyrics-prompter tracks=${summary.catalogTracks}`);
console.log(`linkedTracks=${summary.linkedTracks} tracksWithSanitizedLyrics=${summary.tracksWithSanitizedLyrics}`);
console.log(`cueCount=${summary.cueCount} manualRecords=${summary.manualRecords}`);
console.log(`timingBasis=${JSON.stringify(summary.timingBasis)}`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function listTextFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".txt") && !name.startsWith("._"))
    .map((name) => path.join(dir, name))
    .sort((a, b) => a.localeCompare(b));
}

function buildPrefixIndex(items) {
  const index = new Map();
  for (const track of items) {
    const prefix = track.sunoId.slice(0, 8).toLowerCase();
    if (!index.has(prefix)) index.set(prefix, []);
    index.get(prefix).push(track.sunoId);
  }
  return index;
}

function buildStationIndex(doc) {
  const index = new Map();
  for (const [slug, items] of Object.entries(doc.bySlug || {})) {
    for (const item of items || []) {
      index.set(item.sunoId, {
        station: slug,
        theme: item.theme || null,
        language: item.language || null
      });
    }
  }
  return index;
}

function parseLyricsSource(file, sourceKind) {
  const raw = fs.readFileSync(file, "utf8").replace(/\uFEFF/g, "");
  const base = path.basename(file, ".txt");
  const sourcePath = rel(file);
  const explicitId = extractExplicitId(raw, base);
  const shortId = extractShortId(base, raw);
  const title = extractTitle(raw, base);
  const styles = extractStyles(raw);
  const structured = hasStructuredLyrics(raw);
  const parsed = structured ? parseStructuredLyrics(raw) : parseGenericLyrics(raw);

  return {
    sourcePath,
    sourceKind,
    title,
    explicitId,
    shortId,
    styles: uniqueStrings([...styles, ...parsed.styles]),
    sections: parsed.sections,
    promptLines: parsed.promptLines,
    lyricLineCount: parsed.promptLines.filter((line) => line.kind === "lyric").length,
    directionLineCount: parsed.promptLines.filter((line) => line.kind === "direction").length,
    rawHasContent: normalizeWhitespace(raw).length > 0
  };
}

function extractExplicitId(raw, base) {
  const found = `${base}\n${raw}`.match(FULL_UUID_RE);
  return found ? found[0].toLowerCase() : null;
}

function extractShortId(base, raw) {
  const datePrefix = base.match(/^\d{4}-\d{2}-\d{2}_([0-9a-f]{8})_/i);
  if (datePrefix) return datePrefix[1].toLowerCase();
  const idLine = raw.match(/^#\s*id:\s*([0-9a-f]{8})/im);
  if (idLine) return idLine[1].toLowerCase();
  const found = base.match(SHORT_ID_RE);
  return found ? found[0].toLowerCase() : null;
}

function extractTitle(raw, base) {
  const header = raw
    .split(/\n/)
    .map((line) => cleanLine(line))
    .find((line) => line.startsWith("# ") && !/^#\s*(id|file):/i.test(line));
  if (header) return cleanLine(header.replace(/^#\s*/, ""));
  const first = raw
    .split(/\n/)
    .map((line) => cleanLine(line))
    .find((line) => line && !line.startsWith("#") && !isMarkerLine(line));
  if (first) return cleanLine(first).slice(0, 120);
  return cleanLine(base.replace(/^\d{4}-\d{2}-\d{2}_[0-9a-f]{8}_/i, ""));
}

function extractStyles(raw) {
  const styles = [];
  const styleBlock = raw.match(/STYLES:\s*([\s\S]*?)(?:\n\s*LYRICS:|$)/i);
  if (styleBlock) {
    for (const line of styleBlock[1].split(/\n/)) addStyle(styles, line);
  }
  const styleLineRe = /^\s*(?:\[?\s*)Style(?:s)?\s*:\s*(.+?)(?:\]?\s*)$/gim;
  for (const match of raw.matchAll(styleLineRe)) addStyle(styles, match[1]);
  return uniqueStrings(styles);
}

function hasStructuredLyrics(raw) {
  return /^\s*Lyrics\s*:/im.test(raw) || /(?:Lead|Chorus|Hook|Verse)\s*:\s*["“]/i.test(raw);
}

function parseStructuredLyrics(raw) {
  const sections = [];
  const styles = [];
  const promptLines = [];
  let currentSection = null;
  for (const line of raw.split(/\n/)) {
    const cleaned = cleanLine(line);
    if (!cleaned || shouldSkipLine(cleaned)) continue;
    if (isBracketSection(cleaned)) {
      currentSection = stripBracket(cleaned);
      sections.push(currentSection);
      addStyle(styles, currentSection);
      continue;
    }
    const styleMatch = cleaned.match(/^Style(?:s)?\s*:\s*(.+)$/i);
    if (styleMatch) {
      addStyle(styles, styleMatch[1]);
      continue;
    }
    const lyricMatch = cleaned.match(/^Lyrics\s*:\s*(.+)$/i);
    if (lyricMatch) {
      addLyricFragments(promptLines, lyricMatch[1], currentSection, "lyric");
      continue;
    }
    const labelQuoted = [...cleaned.matchAll(/([A-Za-z][A-Za-z0-9 -]{0,30})\s*:\s*["“]([^"”]+)["”]/g)];
    if (labelQuoted.length) {
      for (const match of labelQuoted) {
        addPromptLine(promptLines, `${match[1].trim()}: ${match[2]}`, currentSection, "lyric");
      }
    }
  }
  return { styles: uniqueStrings(styles), sections: uniqueStrings(sections), promptLines };
}

function parseGenericLyrics(raw) {
  const sections = [];
  const styles = [];
  const promptLines = [];
  let currentSection = null;
  for (const line of raw.split(/\n/)) {
    const cleaned = cleanLine(line);
    if (!cleaned || shouldSkipLine(cleaned)) continue;
    if (isBracketSection(cleaned) || isPlainSection(cleaned)) {
      currentSection = isBracketSection(cleaned) ? stripBracket(cleaned) : cleaned;
      sections.push(currentSection);
      if (isArrangementSection(currentSection)) addStyle(styles, currentSection);
      continue;
    }
    const styleMatch = cleaned.match(/^Style(?:s)?\s*:\s*(.+)$/i);
    if (styleMatch) {
      addStyle(styles, styleMatch[1]);
      continue;
    }
    if (/^\(.+\)$/.test(cleaned)) {
      addPromptLine(promptLines, stripOuterQuotes(cleaned), currentSection, "direction");
      continue;
    }
    addPromptLine(promptLines, cleaned, currentSection, "lyric");
  }
  return { styles: uniqueStrings(styles), sections: uniqueStrings(sections), promptLines };
}

function cleanLine(line) {
  return normalizeWhitespace(line)
    .replace(/^```(?:text|lyrics|markdown)?\s*$/i, "")
    .replace(/^[-*]\s+/, "")
    .trim();
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function shouldSkipLine(line) {
  return (
    !line ||
    /^```/.test(line) ||
    /^#/.test(line) ||
    /^#\s*(id|file):/i.test(line) ||
    /^#\s*$/.test(line) ||
    /^LYRICS:\s*$/i.test(line) ||
    /^STYLES:\s*$/i.test(line) ||
    /^Title\s*:/i.test(line)
  );
}

function isMarkerLine(line) {
  return shouldSkipLine(line) || /^#/.test(line);
}

function isBracketSection(line) {
  return /^\[[^\]]+\]$/.test(line);
}

function stripBracket(line) {
  return line.replace(/^\[/, "").replace(/\]$/, "").trim();
}

function isPlainSection(line) {
  return (
    line.length <= 90 &&
    /(^|\b)(intro|outro|verse|hook|chorus|bridge|antara|sthayi|staya|refrain|mukda|climax|अन्तरा|स्थायी|समापन)(\b|$)/i.test(
      line
    )
  );
}

function isArrangementSection(line) {
  return /\b(bpm|raga|raag|slow|fast|tempo|alap|chorus|claps|drone|tabla|harmonium|cinematic|ambient|rap|folk|trance|qawwali)\b/i.test(
    line
  );
}

function addStyle(styles, value) {
  const clean = cleanStyle(value);
  if (clean && clean !== "NULL") styles.push(clean);
}

function cleanStyle(value) {
  return normalizeWhitespace(value)
    .replace(/^Style(?:s)?\s*:\s*/i, "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

function addLyricFragments(lines, value, section, kind) {
  const noLabel = stripOuterQuotes(value.replace(/^Lyrics\s*:\s*/i, ""));
  for (const fragment of noLabel.split(/\s+\/\s+/)) {
    addPromptLine(lines, fragment, section, kind);
  }
}

function addPromptLine(lines, text, section, kind) {
  const cleaned = stripOuterQuotes(cleanLine(text));
  if (!cleaned || shouldSkipLine(cleaned)) return;
  lines.push({
    index: lines.length,
    kind,
    section: section || null,
    text: cleaned
  });
}

function stripOuterQuotes(value) {
  return normalizeWhitespace(value)
    .replace(/^["'“”]+/, "")
    .replace(/["'“”]+$/, "")
    .trim();
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const clean = normalizeWhitespace(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}

function resolveTrackId(source) {
  if (source.explicitId && trackById.has(source.explicitId)) return source.explicitId;
  if (source.shortId) {
    const matches = prefixIndex.get(source.shortId) || [];
    if (matches.length === 1) return matches[0];
  }
  return null;
}

function buildTrackPrompterRecord(track) {
  const sources = (sourcesByTrackId.get(track.sunoId) || []).sort(sourceSort);
  const primary = sources[0] || null;
  const stationMeta = stationIndex.get(track.sunoId) || {};
  const catalogStyle = cleanStyle(track.styles || "");
  const styles = uniqueStrings([catalogStyle, ...(primary?.styles || [])]);
  const promptLines = primary?.promptLines || [];
  const duration = resolveDuration(track, promptLines.length);
  const cues = buildCueSpread(promptLines, duration.seconds);
  const lyricLineCount = promptLines.filter((line) => line.kind === "lyric").length;

  return {
    id: track.sunoId,
    title: track.title || "(untitled)",
    station: stationMeta.station || null,
    theme: stationMeta.theme || null,
    language: stationMeta.language || null,
    styleRaw: catalogStyle || null,
    styles,
    styleSanitized: styles.length ? styles.join("; ") : null,
    audio: publicToRelative(track.publicPath || track.audioPath),
    cover: publicToRelative(track.coverPublicPath || track.coverPath),
    sourceLyricsPath: track.lyricsPath || null,
    sourceFiles: sources.map((source) => ({
      path: source.sourcePath,
      sourceKind: source.sourceKind,
      lineCount: source.promptLines.length,
      lyricLineCount: source.lyricLineCount,
      directionLineCount: source.directionLineCount
    })),
    primaryLyricsSource: primary?.sourcePath || null,
    lyricsSanitizedPresent: promptLines.length > 0,
    lyricLineCount,
    promptLineCount: promptLines.length,
    durationSeconds: duration.seconds,
    timingBasis: promptLines.length ? duration.basis : "NULL",
    timingVerified: false,
    cues,
    status: sources.length ? (promptLines.length ? "lyrics-extracted" : "lyrics-null") : "lyrics-source-null",
    provenance: {
      catalog: rel(path.join(WEB_DATA, "suno-library-catalog.json")),
      lyricsSources: sources.map((source) => source.sourcePath),
      timing: duration.provenance
    }
  };
}

function buildManualPrompterRecord(source) {
  const duration = {
    seconds: estimateDuration(source.promptLines.length),
    basis: source.promptLines.length ? "estimated-no-audio-duration" : "NULL",
    provenance: "manual lyric source has no linked catalog audio"
  };
  return {
    id: `manual:${hash(source.sourcePath).slice(0, 12)}`,
    title: source.title,
    sourceFiles: [source.sourcePath],
    styles: source.styles,
    styleSanitized: source.styles.length ? source.styles.join("; ") : null,
    audio: null,
    cover: null,
    lyricsSanitizedPresent: source.promptLines.length > 0,
    lyricLineCount: source.lyricLineCount,
    promptLineCount: source.promptLines.length,
    durationSeconds: duration.seconds,
    timingBasis: duration.basis,
    timingVerified: false,
    cues: buildCueSpread(source.promptLines, duration.seconds),
    status: "manual-unmatched",
    provenance: {
      lyricsSources: [source.sourcePath],
      timing: duration.provenance
    }
  };
}

function sourceSort(a, b) {
  const scoreA = sourceScore(a);
  const scoreB = sourceScore(b);
  if (scoreA !== scoreB) return scoreB - scoreA;
  return a.sourcePath.localeCompare(b.sourcePath);
}

function sourceScore(source) {
  let score = source.promptLines.length * 100 + source.styles.length * 10;
  if (source.sourcePath.includes("_radio_index/suno_backup/lyrics/20")) score += 5;
  if (source.explicitId) score += 2;
  return score;
}

function publicToRelative(value) {
  if (!value) return null;
  return String(value).replace(/^\/?radio-html\//, "");
}

function resolveDuration(track, lineCount) {
  const catalogDuration = Number(track.durationSeconds || 0);
  if (catalogDuration > 0) {
    return {
      seconds: round2(catalogDuration),
      basis: "catalog-duration",
      provenance: "catalog durationSeconds"
    };
  }
  const audioPath = resolveAudioPath(track);
  if (lineCount > 0 && audioPath && fs.existsSync(audioPath) && ffprobePath) {
    const cached = durationCache.get(audioPath);
    if (cached) return cached;
    const probe = spawnSync(ffprobePath, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      audioPath
    ]);
    const seconds = Number(String(probe.stdout || "").trim());
    if (Number.isFinite(seconds) && seconds > 0) {
      const result = {
        seconds: round2(seconds),
        basis: "ffprobe-duration",
        provenance: rel(audioPath)
      };
      durationCache.set(audioPath, result);
      return result;
    }
  }
  if (lineCount > 0) {
    return {
      seconds: estimateDuration(lineCount),
      basis: audioPath ? "estimated-ffprobe-unavailable" : "estimated-no-audio-duration",
      provenance: audioPath ? rel(audioPath) : "audio path NULL"
    };
  }
  return {
    seconds: null,
    basis: "NULL",
    provenance: "lyrics unavailable"
  };
}

function resolveAudioPath(track) {
  const publicPath = track.publicPath || track.audioPath;
  if (!publicPath) return null;
  const relative = publicPath.replace(/^\/?radio-html\//, "");
  return path.join(WEB_HTML, relative);
}

function findFfprobe() {
  for (const candidate of ["/opt/homebrew/bin/ffprobe", "/usr/local/bin/ffprobe", "ffprobe"]) {
    if (candidate.includes("/") && fs.existsSync(candidate)) return candidate;
    if (!candidate.includes("/")) {
      const found = spawnSync("which", [candidate]);
      const resolved = String(found.stdout || "").trim();
      if (resolved) return resolved;
    }
  }
  return null;
}

function estimateDuration(lineCount) {
  return round2(Math.max(45, lineCount * 5));
}

function buildCueSpread(lines, durationSeconds) {
  if (!lines.length || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];
  const introPad = Math.min(8, durationSeconds * 0.08);
  const outroPad = Math.min(5, durationSeconds * 0.05);
  const usable = Math.max(0.1, durationSeconds - introPad - outroPad);
  const step = usable / lines.length;
  return lines.map((line, index) => {
    const rawStart = Math.min(durationSeconds, introPad + index * step);
    const nextStart = index === lines.length - 1 ? durationSeconds : Math.min(durationSeconds, introPad + (index + 1) * step);
    const rawEnd = Math.max(rawStart + step * 0.5, nextStart - step * 0.08);
    const startSeconds = round2(rawStart);
    const endSeconds = round2(Math.min(durationSeconds, Math.max(rawStart + 0.01, rawEnd)));
    return {
      index,
      kind: line.kind,
      section: line.section,
      text: line.text,
      startSeconds,
      endSeconds,
      start: formatTimestamp(startSeconds),
      end: formatTimestamp(endSeconds),
      timing: "estimated-spread",
      timingVerified: false
    };
  });
}

function formatTimestamp(seconds) {
  if (!Number.isFinite(seconds)) return "NULL";
  const minutes = Math.floor(seconds / 60);
  const whole = Math.floor(seconds % 60);
  const fraction = Math.round((seconds - Math.floor(seconds)) * 100);
  return `${minutes}:${String(whole).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function hash(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

function summarize(trackRecords, manualRecords) {
  const timingBasis = {};
  for (const record of [...trackRecords, ...manualRecords]) {
    timingBasis[record.timingBasis] = (timingBasis[record.timingBasis] || 0) + 1;
  }
  return {
    catalogTracks: trackRecords.length,
    linkedTracks: trackRecords.filter((record) => record.sourceFiles.length > 0).length,
    tracksWithSanitizedLyrics: trackRecords.filter((record) => record.lyricsSanitizedPresent).length,
    tracksWithoutSanitizedLyrics: trackRecords.filter((record) => !record.lyricsSanitizedPresent).length,
    tracksWithStyles: trackRecords.filter((record) => record.styles.length > 0).length,
    cueCount: trackRecords.reduce((sum, record) => sum + record.cues.length, 0),
    manualRecords: manualRecords.length,
    manualCueCount: manualRecords.reduce((sum, record) => sum + record.cues.length, 0),
    parsedSourceFiles: parsedFiles.length,
    sunoBackupFiles: parsedFiles.filter((source) => source.sourceKind === "suno-backup").length,
    manualSourceFiles: parsedFiles.filter((source) => source.sourceKind === "manual-lyrics").length,
    unmatchedSourceFiles: orphanSources.length,
    timingBasis
  };
}

function buildIndexTsv(data) {
  const rows = [
    [
      "id",
      "kind",
      "title",
      "station",
      "theme",
      "language",
      "styleSanitized",
      "promptLineCount",
      "lyricLineCount",
      "timingBasis",
      "timingVerified",
      "primaryLyricsSource"
    ].join("\t")
  ];
  for (const record of data.tracks) {
    rows.push(
      [
        record.id,
        "catalog-track",
        record.title,
        record.station || "NULL",
        record.theme || "NULL",
        record.language || "NULL",
        record.styleSanitized || "NULL",
        record.promptLineCount,
        record.lyricLineCount,
        record.timingBasis,
        String(record.timingVerified),
        record.primaryLyricsSource || "NULL"
      ]
        .map(tsvCell)
        .join("\t")
    );
  }
  for (const record of data.manualRecords) {
    rows.push(
      [
        record.id,
        "manual-unmatched",
        record.title,
        "NULL",
        "NULL",
        "NULL",
        record.styleSanitized || "NULL",
        record.promptLineCount,
        record.lyricLineCount,
        record.timingBasis,
        String(record.timingVerified),
        record.sourceFiles[0] || "NULL"
      ]
        .map(tsvCell)
        .join("\t")
    );
  }
  return `${rows.join("\n")}\n`;
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}

function buildPrompterHtml(data) {
  const bootstrap = JSON.stringify({
    generatedAt: data.generatedAt,
    counts: data.counts,
    verificationState: data.verificationState
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Vaigyaaniq Lyrics Prompter</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--panel2:#151f2b;--ink:#eef4f8;--muted:#94a3b8;--line:rgba(255,255,255,.12);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(255,138,61,.16),transparent 30rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}.shell{width:min(1480px,calc(100vw - 28px));margin:auto;padding:18px 0 32px}.topbar{position:sticky;top:0;z-index:20;background:rgba(7,10,15,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.topbar-inner{width:min(1480px,calc(100vw - 28px));margin:auto;display:flex;align-items:center;gap:14px;padding:12px 0}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.brand h1{font-size:18px;margin:0}.brand small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.pill.primary{background:var(--accent);border-color:var(--accent);color:#111}.hero{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;border-bottom:1px solid var(--line);padding:28px 0 22px}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.hero h2{font-size:clamp(2rem,5vw,5rem);line-height:.95;margin:9px 0 10px}.hero p{color:#cbd5df;max-width:850px;font-size:1.05rem}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px;max-width:700px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;min-width:330px}.stat{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.04)}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.layout{display:grid;grid-template-columns:320px minmax(0,1fr) 340px;gap:16px;margin-top:18px}.panel{background:linear-gradient(180deg,rgba(16,23,32,.94),rgba(11,16,23,.96));border:1px solid var(--line);border-radius:8px;overflow:hidden}.panel-head{padding:14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:10px;align-items:center}.panel-head h3{margin:0;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}.panel-body{padding:12px}.search{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff;margin-bottom:10px}.select{width:100%;background:#0b1119;color:#fff;border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:10px}.track-list{max-height:72vh;overflow:auto;padding-right:4px}.track{width:100%;text-align:left;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--ink);border-radius:8px;padding:10px;margin-bottom:8px;cursor:pointer}.track.active{border-color:var(--accent);background:rgba(255,138,61,.1)}.track b{display:block}.track span{display:block;color:var(--muted);font-size:12px}.stage{min-height:590px;display:grid;grid-template-rows:auto 1fr auto}.now{display:grid;grid-template-columns:96px 1fr;gap:14px}.now img{width:96px;height:96px;object-fit:cover;border-radius:8px;background:#151f2b}.now h2{margin:0;font-size:24px}.meta{color:var(--muted);font-size:13px}.style-box{border:1px solid var(--line);border-radius:8px;padding:10px;margin-top:10px;background:rgba(255,255,255,.035);color:#d8e2ea}.prompter{margin:16px 0;max-height:520px;overflow:auto;scroll-behavior:smooth;padding-right:8px}.cue{border:1px solid var(--line);border-radius:8px;margin-bottom:8px;padding:12px 12px 12px 14px;background:rgba(255,255,255,.04);display:grid;grid-template-columns:80px 1fr;gap:12px;transition:.18s}.cue.active{border-color:var(--cyan);background:rgba(99,230,213,.12);box-shadow:0 0 0 1px rgba(99,230,213,.15)}.cue-time{font-variant-numeric:tabular-nums;color:var(--cyan);font-size:12px}.cue-kind{display:block;color:var(--muted);font-size:10px;letter-spacing:.08em;text-transform:uppercase}.cue-line{font-size:clamp(1.05rem,1.9vw,1.85rem);line-height:1.28}.empty{color:var(--muted);text-align:center;padding:28px}.transport{border-top:1px solid var(--line);padding-top:12px}.transport audio{width:100%;display:block;margin-bottom:10px}.timeline{position:relative;height:12px;border:1px solid var(--line);border-radius:999px;background:#101721;overflow:hidden}.timeline i{position:absolute;top:0;bottom:0;background:var(--accent);opacity:.35}.inspector dl{display:grid;grid-template-columns:110px 1fr;gap:8px;margin:0}.inspector dt{color:var(--muted)}.inspector dd{margin:0;word-break:break-word}.export-box textarea{width:100%;min-height:190px;background:#0b1119;color:#dfeaf2;border:1px solid var(--line);border-radius:8px;padding:10px;resize:vertical}@media(max-width:1150px){.layout{grid-template-columns:1fr}.track-list{max-height:380px}.hero{grid-template-columns:1fr}.stats{min-width:0}}@media(max-width:640px){.shell,.topbar-inner{width:min(100vw - 18px,1480px)}.topbar-inner{align-items:flex-start}.actions{display:none}.now{grid-template-columns:72px 1fr}.now img{width:72px;height:72px}.cue{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <header class="topbar"><div class="topbar-inner"><div class="mark">RV</div><div class="brand"><h1>Lyrics Prompter</h1><small>Sanitized catalog lyrics with estimated spread cues</small></div><nav class="actions"><a class="pill" href="./standalone-radio.html">Standalone Radio</a><a class="pill" href="./data/lyrics-prompter-data.json">Data JSON</a><a class="pill" href="./data/lyrics-prompter-index.tsv">TSV</a></nav></div></header>
  <main class="shell">
    <section class="hero"><div><span class="eyebrow">Fail-closed lyric timing</span><h2>Prompter from real source files</h2><p>Lyrics and styles are extracted from local catalog/source files only. Cue timings are generated as estimated spreads for review and export.</p><p class="guard">PHKD: no human-verified sync is claimed. Missing lyrics stay NULL; unmatched manual lyrics remain unlinked.</p></div><div class="stats"><article class="stat"><span>Tracks</span><b>${data.counts.catalogTracks.toLocaleString()}</b></article><article class="stat"><span>Lyrics</span><b>${data.counts.tracksWithSanitizedLyrics.toLocaleString()}</b></article><article class="stat"><span>Cues</span><b>${data.counts.cueCount.toLocaleString()}</b></article></div></section>
    <section class="layout">
      <aside class="panel"><div class="panel-head"><h3>Catalog</h3><small id="listCount">0</small></div><div class="panel-body"><input class="search" id="search" placeholder="Search title, style, station..."><select class="select" id="recordKind"><option value="catalog">Catalog tracks</option><option value="manual">Manual unmatched</option><option value="all">All records</option></select><select class="select" id="lyricsFilter"><option value="with">With lyrics</option><option value="all">All</option><option value="without">Lyrics NULL</option></select><button class="pill" id="loadLocalData" type="button">Load local JSON</button><input id="fileImport" type="file" accept="application/json" hidden><div class="track-list" id="trackList"></div></div></aside>
      <section class="panel stage"><div class="panel-body"><div class="now"><img id="cover" src="assets/images/radio-vaigyaaniq-runtime-hero.svg" alt=""><div><h2 id="title">Select a record</h2><div class="meta" id="meta">Timing verified: false</div><div class="style-box" id="style">Style NULL</div></div></div><div class="prompter" id="prompter"></div></div><div class="panel-body transport"><audio id="audio" controls preload="metadata"></audio><div class="timeline" id="timeline"></div></div></section>
      <aside class="panel inspector"><div class="panel-head"><h3>Evidence</h3><button class="pill" id="copyLrc">Copy LRC</button></div><div class="panel-body"><dl id="details"></dl></div><div class="panel-head"><h3>Export Preview</h3><button class="pill" id="copyJson">Copy HKD</button></div><div class="panel-body export-box"><textarea id="exportBox" readonly></textarea></div></aside>
    </section>
  </main>
  <script id="prompter-bootstrap" type="application/json">${bootstrap}</script>
  <script>
    const BOOTSTRAP = JSON.parse(document.getElementById('prompter-bootstrap').textContent);
    let DATA = null;
    let allRecords = [];
    const $ = (id) => document.getElementById(id);
    const audio = $('audio');
    const state = { selectedId: null, search: '', kind: 'catalog', lyrics: 'with' };
    const normalize = (value) => String(value || '').toLowerCase();
    const current = () => allRecords.find((record) => record.id === state.selectedId) || filteredRecords()[0];
    async function boot() {
      try {
        const response = await fetch('./data/lyrics-prompter-data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('DATA_FETCH_FAILED_' + response.status);
        DATA = await response.json();
        allRecords = [...DATA.tracks.map((record) => ({ ...record, kind: 'catalog' })), ...DATA.manualRecords.map((record) => ({ ...record, kind: 'manual' }))];
        renderList();
        selectRecord(current()?.id);
      } catch (error) {
        $('listCount').textContent = '0';
        $('trackList').innerHTML = '<div class="empty">Prompter data could not be loaded automatically. Serve this file over localhost/Tauri, or use Load local JSON and choose data/lyrics-prompter-data.json.</div>';
        $('title').textContent = 'Prompter data unavailable';
        $('meta').textContent = String(error && error.message ? error.message : error);
        $('prompter').innerHTML = '<div class="empty">No cues loaded.</div>';
      }
    }
    function filteredRecords() {
      const term = normalize(state.search);
      return allRecords.filter((record) => {
        if (state.kind !== 'all' && record.kind !== state.kind) return false;
        if (state.lyrics === 'with' && !record.lyricsSanitizedPresent) return false;
        if (state.lyrics === 'without' && record.lyricsSanitizedPresent) return false;
        if (term && !normalize([record.title, record.styleSanitized, record.station, record.theme, record.language, record.id].join(' ')).includes(term)) return false;
        return true;
      });
    }
    function renderList() {
      const records = filteredRecords();
      $('listCount').textContent = records.length.toLocaleString();
      $('trackList').innerHTML = records.slice(0, 420).map((record) => '<button class="track ' + (record.id === state.selectedId ? 'active' : '') + '" data-id="' + record.id + '"><b>' + escapeHtml(record.title) + '</b><span>' + record.promptLineCount + ' cues · ' + (record.styleSanitized || 'style NULL') + '</span></button>').join('') || '<div class="empty">No matching records.</div>';
      document.querySelectorAll('[data-id]').forEach((button) => button.addEventListener('click', () => selectRecord(button.dataset.id)));
    }
    function selectRecord(id) {
      state.selectedId = id;
      const record = current();
      if (!record) return;
      $('cover').src = record.cover || 'assets/images/radio-vaigyaaniq-runtime-hero.svg';
      $('title').textContent = record.title;
      $('meta').textContent = [record.station || record.kind, record.theme || 'theme NULL', record.language || 'language NULL', 'timing verified false'].join(' · ');
      $('style').textContent = record.styleSanitized || 'Style NULL';
      audio.src = record.audio || '';
      audio.hidden = !record.audio;
      renderCues(record);
      renderTimeline(record);
      renderDetails(record);
      renderExport(record);
      renderList();
    }
    function renderCues(record) {
      $('prompter').innerHTML = record.cues.length ? record.cues.map((cue) => '<article class="cue" id="cue-' + cue.index + '" data-start="' + cue.startSeconds + '" data-end="' + cue.endSeconds + '"><div><span class="cue-time">' + cue.start + '</span><span class="cue-kind">' + cue.kind + '</span></div><div class="cue-line">' + escapeHtml(cue.text) + '</div></article>').join('') : '<div class="empty">Lyrics NULL for this record.</div>';
    }
    function renderTimeline(record) {
      const duration = record.durationSeconds || 0;
      $('timeline').innerHTML = record.cues.map((cue) => {
        const left = duration ? (cue.startSeconds / duration) * 100 : 0;
        const width = duration ? Math.max(.35, ((cue.endSeconds - cue.startSeconds) / duration) * 100) : 0;
        return '<i style="left:' + left + '%;width:' + width + '%"></i>';
      }).join('');
    }
    function renderDetails(record) {
      const source = record.primaryLyricsSource || (record.sourceFiles && record.sourceFiles[0]) || 'NULL';
      $('details').innerHTML = [
        ['ID', record.id],
        ['Status', record.status],
        ['Source', source],
        ['Lines', record.promptLineCount],
        ['Lyric lines', record.lyricLineCount],
        ['Duration', record.durationSeconds == null ? 'NULL' : record.durationSeconds + 's'],
        ['Timing basis', record.timingBasis],
        ['Verified', String(record.timingVerified)]
      ].map(([k, v]) => '<dt>' + k + '</dt><dd>' + escapeHtml(v) + '</dd>').join('');
    }
    function renderExport(record) {
      $('exportBox').value = JSON.stringify({ id: record.id, title: record.title, timingVerified: false, timingBasis: record.timingBasis, cues: record.cues }, null, 2);
    }
    function exportLrc(record) {
      return record.cues.map((cue) => '[' + cue.start.replace('.', '.') + ']' + cue.text).join('\\n') + '\\n';
    }
    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }
    audio.addEventListener('timeupdate', () => {
      const time = audio.currentTime || 0;
      let active = null;
      document.querySelectorAll('.cue').forEach((node) => {
        const on = time >= Number(node.dataset.start) && time < Number(node.dataset.end);
        node.classList.toggle('active', on);
        if (on) active = node;
      });
      if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    $('search').addEventListener('input', (event) => { state.search = event.target.value; renderList(); });
    $('recordKind').addEventListener('change', (event) => { state.kind = event.target.value; state.selectedId = null; renderList(); selectRecord(current()?.id); });
    $('lyricsFilter').addEventListener('change', (event) => { state.lyrics = event.target.value; state.selectedId = null; renderList(); selectRecord(current()?.id); });
    $('loadLocalData').addEventListener('click', () => $('fileImport').click());
    $('fileImport').addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      DATA = JSON.parse(await file.text());
      allRecords = [...DATA.tracks.map((record) => ({ ...record, kind: 'catalog' })), ...DATA.manualRecords.map((record) => ({ ...record, kind: 'manual' }))];
      state.selectedId = null;
      renderList();
      selectRecord(current()?.id);
    });
    $('copyLrc').addEventListener('click', () => navigator.clipboard?.writeText(exportLrc(current())));
    $('copyJson').addEventListener('click', () => navigator.clipboard?.writeText($('exportBox').value));
    boot();
  </script>
</body>
</html>
`;
}

function updateHtmlIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-prompter.html")) return;
  const card =
    '      <a href="./lyrics-prompter.html"><b>Lyrics Prompter</b><small>Sanitized lyric/style extraction with estimated cue spreads and fail-closed timing evidence.</small></a>\n';
  if (html.includes("</nav>")) {
    html = html.replace(/(\s*<\/nav>)/, `${card}$1`);
  } else if (html.includes('<a href="./standalone-radio.html"')) {
    html = html.replace(
      /(\s*<a href="\.\/standalone-radio\.html"><b>Standalone Radio<\/b><small>.*?<\/small><\/a>\n)/s,
      `$1${card}`
    );
  } else {
    html = html.replace(/(\s*<\/div>\s*<\/main>)/, `${card}$1`);
  }
  fs.writeFileSync(file, html);
}

function updateStandaloneRadio(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-prompter.html")) return;
  html = html.replace(
    '<a class="pill" href="./possible-albums.html">Album Matrix</a>',
    '<a class="pill" href="./possible-albums.html">Album Matrix</a><a class="pill" href="./lyrics-prompter.html">Lyrics Prompter</a>'
  );
  fs.writeFileSync(file, html);
}

function updateSurfaceLyrics(file) {
  if (!fs.existsSync(file)) return;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - Lyrics</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail"><div class="surface-mark">RV</div><nav><a href="./index.html">Index</a><a href="./runtime.html">Runtime</a><a href="./tts.html">TTS</a><a href="../lyrics-prompter.html">Prompter</a></nav><span>PHKD</span></aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div><p class="eyebrow">Synced Lyrics Scribe</p><h1>Lyrics Prompter Data Lane</h1><p>Sanitized lyric/style extraction, estimated cue spreads, LRC/HKD preview, and source provenance for catalog tracks.</p></div>
        <div class="status-chip"><span>Status</span><b>LOCAL</b><small>verified timing NULL</small></div>
      </section>
      <article class="surface-card"><span class="surface-label">Prompter</span><p>Open the generated prompter for searchable catalog lyrics and estimated cue timing.</p><div class="surface-controls"><a class="download" href="../lyrics-prompter.html">Open Lyrics Prompter</a><a class="download" href="../data/lyrics-prompter-data.json">Data JSON</a><a class="download" href="../data/lyrics-prompter-index.tsv">Index TSV</a></div></article>
      <article class="surface-card"><span class="surface-label">PHKD Guard</span><p>No human-verified sync is claimed. Missing lyrics stay NULL and manual unmatched lyric files are kept unlinked.</p></article>
    </section>
  </main>
  <script src="./surface-kit.js"></script>
</body>
</html>
`;
  fs.writeFileSync(file, html);
}
