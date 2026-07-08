import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const BOOK_PATH = path.join(WEB_HTML, "data/lyrics-book.json");
const generatedAt = new Date().toISOString();

const book = readJson(BOOK_PATH);
const tracks = book.chapters.flatMap((chapter) =>
  chapter.tracks.map((track) => ({
    ...track,
    chapterId: chapter.id,
    chapterTitle: chapter.title
  }))
);

const groupsByKey = new Map();
for (const track of tracks) {
  const groupKey = groupKeyForTrack(track);
  if (!groupsByKey.has(groupKey.key)) {
    groupsByKey.set(groupKey.key, { groupKey, tracks: [] });
  }
  groupsByKey.get(groupKey.key).tracks.push(track);
}

const groups = [...groupsByKey.values()]
  .map((group) => buildGroup(group.groupKey, group.tracks))
  .sort((a, b) => b.versionCount - a.versionCount || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));

const report = {
  id: "radio-vaigyaaniq-unique-tracks-with-versions",
  generatedAt,
  status: "local-catalog-version-index",
  verificationState: "heuristic-exact-lyrics-grouping",
  source: {
    lyricsBook: "apps/web/public/radio-html/data/lyrics-book.json"
  },
  phkd: {
    fabricatedTracks: false,
    fabricatedVersions: false,
    releaseMasterClaimed: false,
    humanVerifiedVersionGrouping: false,
    commercialRightsVerified: false,
    unknownValues: "NULL",
    note:
      "Version groups are derived from exact normalized lyric fingerprints, with title fallback only when lyrics are missing. This is a local grouping heuristic, not a release-master claim."
  },
  groupingPolicy: {
    primary: "exact-normalized-lyrics-fingerprint",
    fallback: "normalized-title-when-lyrics-null",
    blockedFallback: "generic untitled titles are never grouped by title",
    hash: "sha1-16"
  },
  counts: {
    sourceTracks: tracks.length,
    uniqueTracks: groups.length,
    versionGroups: groups.filter((group) => group.versionCount > 1).length,
    singleVersionGroups: groups.filter((group) => group.versionCount === 1).length,
    totalVersions: groups.reduce((sum, group) => sum + group.versionCount, 0),
    exactLyricsGroups: groups.filter((group) => group.groupBasis === "exact-normalized-lyrics").length,
    titleFallbackGroups: groups.filter((group) => group.groupBasis === "title-fallback-lyrics-null").length,
    idFallbackGroups: groups.filter((group) => group.groupBasis === "id-fallback").length,
    maxVersions: Math.max(...groups.map((group) => group.versionCount))
  },
  groups
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  writeJson(path.join(dataRoot, "unique-tracks-with-versions.json"), report);
  fs.writeFileSync(path.join(dataRoot, "unique-tracks-with-versions.tsv"), buildTsv(report));
  fs.writeFileSync(path.join(htmlRoot, "unique-tracks-with-versions.html"), buildHtml(report));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
  updateLyricsBook(path.join(htmlRoot, "lyrics-book.html"));
  updateLyricsSurface(path.join(htmlRoot, "surfaces/lyrics.html"));
}

console.log(`unique-tracks=${report.counts.uniqueTracks}`);
console.log(`version-groups=${report.counts.versionGroups}`);
console.log(`source-tracks=${report.counts.sourceTracks}`);
console.log(`max-versions=${report.counts.maxVersions}`);

function groupKeyForTrack(track) {
  const lyricText = normalizedLyrics(track);
  if (lyricText) {
    return {
      key: `lyrics:${hash16(lyricText)}`,
      basis: "exact-normalized-lyrics",
      confidence: "high-local-exact",
      fingerprint: hash16(lyricText)
    };
  }
  const title = normalizeText(track.title);
  if (title && !isGenericTitle(title)) {
    return {
      key: `title:${hash16(title)}`,
      basis: "title-fallback-lyrics-null",
      confidence: "low-title-fallback",
      fingerprint: hash16(title)
    };
  }
  return {
    key: `id:${track.id}`,
    basis: "id-fallback",
    confidence: "single-record-only",
    fingerprint: track.id
  };
}

function buildGroup(groupKey, inputTracks) {
  const versions = [...inputTracks].sort(compareVersions).map((track, index) => ({
    versionNumber: index + 1,
    id: track.id,
    title: track.title || "(untitled)",
    chapterId: track.chapterId,
    chapterTitle: track.chapterTitle,
    language: track.language || null,
    station: track.station || null,
    theme: track.theme || null,
    style: track.style || null,
    cover: track.coverStatus === "cover-local" ? track.cover : null,
    coverStatus: track.coverStatus,
    lyricsStatus: track.lyricsStatus,
    lyricLineCount: track.lyricLineCount,
    primaryLyricsSource: track.primaryLyricsSource || null,
    sourceFileCount: track.sourceFiles?.length || 0
  }));
  const canonical = versions[0];
  const coverVersion = versions.find((version) => version.coverStatus === "cover-local");
  return {
    id: `ut-${groupKey.fingerprint}`,
    groupKey: groupKey.key,
    groupBasis: groupKey.basis,
    confidence: groupKey.confidence,
    fingerprint: groupKey.fingerprint,
    title: canonical.title,
    canonicalTrackId: canonical.id,
    versionCount: versions.length,
    hasMultipleVersions: versions.length > 1,
    cover: coverVersion?.cover || null,
    coverStatus: coverVersion ? "cover-local" : "cover-null",
    languages: uniqueSorted(versions.map((version) => version.language)),
    stations: uniqueSorted(versions.map((version) => version.station)),
    themes: uniqueSorted(versions.map((version) => version.theme)),
    chapters: uniqueSorted(versions.map((version) => version.chapterTitle)),
    lyricLineMax: Math.max(...versions.map((version) => version.lyricLineCount)),
    lyricLineMin: Math.min(...versions.map((version) => version.lyricLineCount)),
    needsHumanReview: versions.length > 1 || groupKey.basis !== "exact-normalized-lyrics",
    versions
  };
}

function compareVersions(a, b) {
  return (
    Number(b.lyricsStatus === "lyrics-ready") - Number(a.lyricsStatus === "lyrics-ready") ||
    b.lyricLineCount - a.lyricLineCount ||
    Number(b.coverStatus === "cover-local") - Number(a.coverStatus === "cover-local") ||
    normalizeText(a.title).localeCompare(normalizeText(b.title)) ||
    a.id.localeCompare(b.id)
  );
}

function buildTsv(report) {
  const header = [
    "uniqueTrackId",
    "title",
    "versionCount",
    "groupBasis",
    "confidence",
    "canonicalTrackId",
    "versionNumber",
    "trackId",
    "chapterTitle",
    "language",
    "station",
    "theme",
    "coverStatus",
    "lyricsStatus",
    "lyricLineCount",
    "primaryLyricsSource"
  ];
  const rows = [];
  for (const group of report.groups) {
    for (const version of group.versions) {
      rows.push(
        [
          group.id,
          group.title,
          group.versionCount,
          group.groupBasis,
          group.confidence,
          group.canonicalTrackId,
          version.versionNumber,
          version.id,
          version.chapterTitle,
          version.language || "NULL",
          version.station || "NULL",
          version.theme || "NULL",
          version.coverStatus,
          version.lyricsStatus,
          version.lyricLineCount,
          version.primaryLyricsSource || "NULL"
        ]
          .map(tsvCell)
          .join("\t")
      );
    }
  }
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(report) {
  const bootstrap = JSON.stringify({
    generatedAt: report.generatedAt,
    phkd: report.phkd,
    groupingPolicy: report.groupingPolicy,
    counts: report.counts,
    groups: report.groups
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unique Tracks With Versions</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#f3f7fb;--muted:#9aa8b7;--line:rgba(255,255,255,.13);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(255,138,61,.16),transparent 32rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.48 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}.shell{width:min(1480px,calc(100vw - 28px));margin:auto;padding:18px 0 42px}.top{display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.top h1{margin:0;font-size:20px}.top small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.hero{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;margin:24px 0}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.hero h2{font-size:clamp(2.4rem,7vw,6.5rem);line-height:.92;margin:10px 0 14px}.hero p{max-width:850px;color:#cbd5df;font-size:1.06rem}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;min-width:520px}.stat,.group{border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:8px}.stat{padding:12px}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.search,.select{border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff;padding:11px 12px}.search{flex:1 1 320px}.groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:12px}.group{overflow:hidden}.group-head{display:grid;grid-template-columns:96px 1fr;gap:13px;padding:13px;border-bottom:1px solid rgba(255,255,255,.08)}.cover{width:96px;height:96px;object-fit:cover;border-radius:8px;background:#111}.cover-null{display:grid;place-items:center;width:96px;height:96px;border:1px dashed var(--line);border-radius:8px;color:var(--muted);text-align:center;font-size:12px}.group h3{margin:0 0 5px;font-size:19px}.meta{color:var(--muted);font-size:12px}.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.chip{border:1px solid var(--line);border-radius:999px;padding:4px 7px;font-size:11px;color:#dfe7ee}.versions{padding:11px}.version{display:grid;grid-template-columns:42px 1fr;gap:10px;border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:9px;margin-bottom:8px;background:rgba(0,0,0,.12)}.version strong{color:var(--cyan)}.empty{padding:26px;text-align:center;color:var(--muted)}@media(max-width:980px){.hero{grid-template-columns:1fr}.stats{min-width:0;grid-template-columns:1fr 1fr}.groups{grid-template-columns:1fr}.actions{margin-left:0}.top{align-items:flex-start;flex-wrap:wrap}}@media(max-width:560px){.group-head{grid-template-columns:72px 1fr}.cover,.cover-null{width:72px;height:72px}.stats{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="top"><div class="mark">RV</div><div><h1>Unique Tracks With Versions</h1><small>Exact lyric fingerprint groups with conservative title fallback</small></div><nav class="actions"><a class="pill" href="./lyrics-book.html">Lyrics Book</a><a class="pill" href="./data/unique-tracks-with-versions.json">JSON</a><a class="pill" href="./data/unique-tracks-with-versions.tsv">TSV</a></nav></header>
    <section class="hero"><div><span class="eyebrow">Version ledger</span><h2>${report.counts.uniqueTracks.toLocaleString()} unique tracks</h2><p>Groups are built from exact normalized lyric fingerprints. When lyrics are NULL, normalized title fallback is used unless the title is generic.</p><p class="guard">PHKD: version grouping is not human verified and not a release master claim.</p></div><div class="stats"><article class="stat"><span>Source tracks</span><b>${report.counts.sourceTracks.toLocaleString()}</b></article><article class="stat"><span>Version groups</span><b>${report.counts.versionGroups.toLocaleString()}</b></article><article class="stat"><span>Single groups</span><b>${report.counts.singleVersionGroups.toLocaleString()}</b></article><article class="stat"><span>Max versions</span><b>${report.counts.maxVersions}</b></article></div></section>
    <section class="toolbar"><input class="search" id="search" placeholder="Search title, id, chapter, station..."><select class="select" id="mode"><option value="versions">Version groups only</option><option value="all">All unique tracks</option><option value="fallback">Needs review / fallback</option></select></section>
    <section class="groups" id="groups"></section>
  </main>
  <script id="version-data" type="application/json">${bootstrap}</script>
  <script>
    const DATA = JSON.parse(document.getElementById('version-data').textContent);
    const state = { search: '', mode: 'versions' };
    const $ = (id) => document.getElementById(id);
    const normalize = (value) => String(value || '').toLowerCase();
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const cover = (group) => group.coverStatus === 'cover-local' && group.cover ? '<img class="cover" src="' + escapeHtml(group.cover) + '" alt="">' : '<div class="cover-null">Cover NULL</div>';
    function visibleGroups() {
      const term = normalize(state.search);
      return DATA.groups.filter((group) => {
        if (state.mode === 'versions' && group.versionCount < 2) return false;
        if (state.mode === 'fallback' && !group.needsHumanReview) return false;
        if (!term) return true;
        return normalize([group.title, group.canonicalTrackId, group.groupBasis, group.chapters.join(' '), group.stations.join(' '), group.themes.join(' '), group.versions.map((v) => v.id + ' ' + v.title).join(' ')].join(' ')).includes(term);
      });
    }
    function render() {
      const groups = visibleGroups();
      $('groups').innerHTML = groups.map((group) => '<article class="group"><div class="group-head">' + cover(group) + '<div><h3>' + escapeHtml(group.title) + '</h3><div class="meta">' + escapeHtml(group.canonicalTrackId) + '</div><div class="chips"><span class="chip">' + group.versionCount + ' versions</span><span class="chip">' + escapeHtml(group.groupBasis) + '</span><span class="chip">' + escapeHtml(group.confidence) + '</span></div></div></div><div class="versions">' + group.versions.map((version) => '<div class="version"><strong>v' + version.versionNumber + '</strong><div><b>' + escapeHtml(version.title) + '</b><div class="meta">' + escapeHtml([version.id, version.chapterTitle, version.language || 'NULL', version.station || 'NULL'].join(' · ')) + '</div><div class="meta">' + version.lyricLineCount + ' lyric lines · ' + escapeHtml(version.coverStatus) + ' · ' + escapeHtml(version.lyricsStatus) + '</div></div></div>').join('') + '</div></article>').join('') || '<div class="empty">No groups match.</div>';
    }
    $('search').addEventListener('input', (event) => { state.search = event.target.value; render(); });
    $('mode').addEventListener('change', (event) => { state.mode = event.target.value; render(); });
    render();
  </script>
</body>
</html>
`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("unique-tracks-with-versions.html")) return;
  const card =
    '      <a href="./unique-tracks-with-versions.html"><b>Unique Tracks + Versions</b><small>Canonical lyric-fingerprint groups with every local version, cover status, and review flags.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/lyrics-book\.html"><b>Lyrics Book<\/b><small>.*?<\/small><\/a>\n)/s, `$1${card}`);
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("unique-tracks-with-versions.html")) return;
  html = html.replace(
    '<a class="pill" href="./lyrics-book.html">Lyrics Book</a>',
    '<a class="pill" href="./lyrics-book.html">Lyrics Book</a><a class="pill" href="./unique-tracks-with-versions.html">Versions</a>'
  );
  fs.writeFileSync(file, html);
}

function updateLyricsBook(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("unique-tracks-with-versions.html")) return;
  html = html.replace(
    '<a class="pill" href="./lyrics-prompter.html">Prompter</a>',
    '<a class="pill" href="./lyrics-prompter.html">Prompter</a><a class="pill" href="./unique-tracks-with-versions.html">Versions</a>'
  );
  fs.writeFileSync(file, html);
}

function updateLyricsSurface(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("../unique-tracks-with-versions.html")) return;
  html = html.replace(
    '<a class="download" href="../lyrics-book.html">Open Lyrics Book</a>',
    '<a class="download" href="../lyrics-book.html">Open Lyrics Book</a><a class="download" href="../unique-tracks-with-versions.html">Open Versions</a>'
  );
  fs.writeFileSync(file, html);
}

function normalizedLyrics(track) {
  const text = (track.sections || [])
    .flatMap((section) => section.lines || [])
    .map(normalizeText)
    .filter(Boolean)
    .join("\n");
  return text || null;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*untitled[^)]*\)/gi, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericTitle(title) {
  return !title || title === "untitled" || title === "null";
}

function hash16(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 16);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
