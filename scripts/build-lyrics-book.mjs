import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const LYRICS_DATA_PATH = path.join(WEB_HTML, "data/lyrics-prompter-data.json");
const KANBAN_DATA_PATH = path.join(WEB_HTML, "data/radio-admin-kanban.json");
const ALBUM_DATA_PATH = path.join(WEB_HTML, "data/possible-albums.json");
const generatedAt = new Date().toISOString();

const lyricsData = readJson(LYRICS_DATA_PATH);
const kanbanData = readJson(KANBAN_DATA_PATH);
const possibleAlbums = readJson(ALBUM_DATA_PATH);

const trackById = new Map(lyricsData.tracks.map((track) => [track.id, track]));
const albumInfoBySlug = new Map((possibleAlbums.candidateAlbums || []).map((album) => [album.slug, album]));
const assignedTrackIds = new Set();
const chapters = [];

for (const lane of kanbanData.boards.albums.lanes) {
  const isUnassigned = lane.id === "album-unassigned";
  const trackIds = lane.trackIds.filter((id) => trackById.has(id) && !assignedTrackIds.has(id));
  if (!isUnassigned) {
    trackIds.forEach((id) => assignedTrackIds.add(id));
    chapters.push(buildChapter(lane, trackIds));
  }
}

const remainingIds = [...trackById.keys()].filter((id) => !assignedTrackIds.has(id));
remainingIds.forEach((id) => assignedTrackIds.add(id));
const unassignedLane = kanbanData.boards.albums.lanes.find((lane) => lane.id === "album-unassigned");
chapters.push(
  buildChapter(
    unassignedLane || {
      id: "album-unassigned",
      title: "Album Unassigned",
      subtitle: "Tracks without a primary candidate album",
      status: "candidate-not-persisted",
      cover: null,
      trackIds: remainingIds
    },
    remainingIds
  )
);

const bookTracks = chapters.flatMap((chapter) => chapter.tracks);
const report = {
  id: "radio-vaigyaaniq-lyrics-book",
  generatedAt,
  status: "local-lyrics-book-preview",
  verificationState: "estimated-local-catalog-book",
  source: {
    lyricsPrompterData: "apps/web/public/radio-html/data/lyrics-prompter-data.json",
    radioAdminKanban: "apps/web/public/radio-html/data/radio-admin-kanban.json",
    possibleAlbums: "apps/web/public/radio-html/data/possible-albums.json"
  },
  phkd: {
    fabricatedLyrics: false,
    fabricatedCoverArt: false,
    generatedCoverArt: false,
    commercialRightsVerified: false,
    timingVerified: false,
    unknownValues: "NULL",
    note:
      "Lyrics and cover paths are derived from local catalog artifacts only. Album chapters are candidate groupings, not persisted release albums."
  },
  counts: {
    catalogTracks: lyricsData.counts.catalogTracks,
    bookTracks: bookTracks.length,
    chapters: chapters.length,
    tracksWithLyrics: bookTracks.filter((track) => track.lyricsStatus === "lyrics-ready").length,
    tracksWithoutLyrics: bookTracks.filter((track) => track.lyricsStatus !== "lyrics-ready").length,
    tracksWithCoverArt: bookTracks.filter((track) => track.coverStatus === "cover-local").length,
    tracksMissingCoverArt: bookTracks.filter((track) => track.coverStatus !== "cover-local").length,
    totalLyricLines: bookTracks.reduce((sum, track) => sum + track.lyricLineCount, 0),
    candidateAlbumChapters: chapters.filter((chapter) => chapter.status === "candidate-not-persisted").length
  },
  chapters
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  writeJson(path.join(dataRoot, "lyrics-book.json"), report);
  fs.writeFileSync(path.join(dataRoot, "lyrics-book-index.tsv"), buildIndexTsv(report));
  fs.writeFileSync(path.join(htmlRoot, "lyrics-book.md"), buildMarkdown(report));
  fs.writeFileSync(path.join(htmlRoot, "lyrics-book.html"), buildHtml(report));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
  updateLyricsSurface(path.join(htmlRoot, "surfaces/lyrics.html"));
}

console.log(`lyrics-book chapters=${report.counts.chapters}`);
console.log(`lyrics-book tracks=${report.counts.bookTracks}`);
console.log(`lyrics-book coverArt=${report.counts.tracksWithCoverArt}/${report.counts.bookTracks}`);
console.log(`lyrics-book lyricLines=${report.counts.totalLyricLines}`);

function buildChapter(lane, trackIds) {
  const albumInfo = albumInfoBySlug.get(lane.id);
  const cover = normalizeCover(lane.cover || albumInfo?.coverImage || null);
  const coverStatus = cover && localAssetExists(cover) ? "cover-local" : "cover-null";
  return {
    id: lane.id,
    title: lane.title || albumInfo?.title || "Album NULL",
    status: lane.status || albumInfo?.status || "candidate-not-persisted",
    description: albumInfo?.description || lane.subtitle || null,
    station: albumInfo?.station || null,
    cover,
    coverStatus,
    sourceCandidateTrackCount: lane.trackIds.length,
    bookTrackCount: trackIds.length,
    patterns: lane.patterns || albumInfo?.patterns || [],
    tracks: trackIds.map((id) => buildBookTrack(trackById.get(id), lane.id))
  };
}

function buildBookTrack(track, chapterId) {
  const cover = normalizeCover(track.cover);
  const coverStatus = cover && localAssetExists(cover) ? "cover-local" : "cover-null";
  const sections = buildLyricSections(track);
  const lines = sections.flatMap((section) => section.lines);
  return {
    id: track.id,
    chapterId,
    title: track.title || "(untitled)",
    station: track.station || null,
    theme: track.theme || null,
    language: track.language || null,
    style: track.styleSanitized || track.styleRaw || null,
    cover,
    coverStatus,
    audio: track.audio || null,
    lyricsStatus: track.lyricsSanitizedPresent ? "lyrics-ready" : "lyrics-null",
    lyricLineCount: lines.length,
    timingVerified: false,
    sourceLyricsPath: track.sourceLyricsPath || null,
    primaryLyricsSource: track.primaryLyricsSource || null,
    sourceFiles: (track.sourceFiles || []).map((source) => ({
      path: source.path,
      sourceKind: source.sourceKind,
      lyricLineCount: source.lyricLineCount
    })),
    sections
  };
}

function buildLyricSections(track) {
  const sections = [];
  const sectionByName = new Map();
  for (const cue of track.cues || []) {
    const text = cleanLine(cue.text);
    if (!text) continue;
    const name = cleanLine(cue.section) || "Lyrics";
    if (!sectionByName.has(name)) {
      const section = { name, lines: [] };
      sectionByName.set(name, section);
      sections.push(section);
    }
    sectionByName.get(name).lines.push(text);
  }
  return sections;
}

function buildIndexTsv(report) {
  const header = [
    "chapterId",
    "chapterTitle",
    "trackId",
    "title",
    "language",
    "station",
    "theme",
    "coverStatus",
    "lyricsStatus",
    "lyricLineCount",
    "primaryLyricsSource"
  ];
  const rows = [];
  for (const chapter of report.chapters) {
    for (const track of chapter.tracks) {
      rows.push(
        [
          chapter.id,
          chapter.title,
          track.id,
          track.title,
          track.language || "NULL",
          track.station || "NULL",
          track.theme || "NULL",
          track.coverStatus,
          track.lyricsStatus,
          track.lyricLineCount,
          track.primaryLyricsSource || "NULL"
        ]
          .map(tsvCell)
          .join("\t")
      );
    }
  }
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildMarkdown(report) {
  const out = [
    "# Radio Vaigyaaniq Lyrics Book",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `PHKD: fabricatedLyrics=${report.phkd.fabricatedLyrics}; fabricatedCoverArt=${report.phkd.fabricatedCoverArt}; commercialRightsVerified=${report.phkd.commercialRightsVerified}; timingVerified=${report.phkd.timingVerified}.`,
    "",
    `Catalog tracks: ${report.counts.catalogTracks}`,
    `Book tracks: ${report.counts.bookTracks}`,
    `Chapters: ${report.counts.chapters}`,
    `Tracks with cover art: ${report.counts.tracksWithCoverArt}`,
    `Tracks with lyrics: ${report.counts.tracksWithLyrics}`,
    ""
  ];
  for (const chapter of report.chapters) {
    out.push(`## ${chapter.title}`, "");
    if (chapter.coverStatus === "cover-local") out.push(`![${escapeMarkdown(chapter.title)} cover](${chapter.cover})`, "");
    else out.push("Cover art: NULL", "");
    out.push(`Status: ${chapter.status}`);
    out.push(`Book tracks: ${chapter.bookTrackCount}`);
    out.push(`Candidate source tracks: ${chapter.sourceCandidateTrackCount}`);
    out.push("");
    for (const track of chapter.tracks) {
      out.push(`### ${track.title}`, "");
      if (track.coverStatus === "cover-local") out.push(`![${escapeMarkdown(track.title)} cover](${track.cover})`, "");
      else out.push("Cover art: NULL", "");
      out.push(`Track ID: ${track.id}`);
      out.push(`Language: ${track.language || "NULL"}`);
      out.push(`Station: ${track.station || "NULL"}`);
      out.push(`Style: ${track.style || "NULL"}`);
      out.push(`Primary lyrics source: ${track.primaryLyricsSource || "NULL"}`);
      out.push("");
      if (track.lyricsStatus !== "lyrics-ready") {
        out.push("Lyrics: NULL", "");
        continue;
      }
      for (const section of track.sections) {
        out.push(`#### ${section.name}`, "");
        out.push(section.lines.join("\n"));
        out.push("");
      }
    }
  }
  return `${out.join("\n")}\n`;
}

function buildHtml(report) {
  const bootstrap = JSON.stringify({
    generatedAt: report.generatedAt,
    phkd: report.phkd,
    counts: report.counts,
    chapters: report.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      status: chapter.status,
      description: chapter.description,
      station: chapter.station,
      cover: chapter.cover,
      coverStatus: chapter.coverStatus,
      bookTrackCount: chapter.bookTrackCount,
      sourceCandidateTrackCount: chapter.sourceCandidateTrackCount,
      tracks: chapter.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        language: track.language,
        station: track.station,
        theme: track.theme,
        style: track.style,
        cover: track.cover,
        coverStatus: track.coverStatus,
        lyricsStatus: track.lyricsStatus,
        lyricLineCount: track.lyricLineCount,
        primaryLyricsSource: track.primaryLyricsSource,
        sections: track.sections
      }))
    }))
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Vaigyaaniq Lyrics Book</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#f3f7fb;--muted:#9aa8b7;--line:rgba(255,255,255,.13);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(255,138,61,.16),transparent 32rem),radial-gradient(circle at 90% 12%,rgba(99,230,213,.12),transparent 28rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}.shell{width:min(1480px,calc(100vw - 28px));margin:auto;padding:18px 0 42px}.top{position:sticky;top:0;z-index:20;background:rgba(7,10,15,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.top-inner{width:min(1480px,calc(100vw - 28px));margin:auto;display:flex;gap:12px;align-items:center;padding:12px 0}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.brand h1{margin:0;font-size:18px}.brand small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.hero{display:grid;grid-template-columns:minmax(260px,420px) 1fr;gap:22px;align-items:end;padding:28px 0 24px;border-bottom:1px solid var(--line)}.hero-cover{margin:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#121b25;box-shadow:0 26px 90px rgba(0,0,0,.35)}.hero-cover img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.hero h2{font-size:clamp(2.4rem,7vw,6.5rem);line-height:.92;margin:10px 0 14px}.hero p{max-width:820px;color:#cbd5df;font-size:1.08rem}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:18px 0}.stat,.panel,.chapter,.track{border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:8px}.stat{padding:12px}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.layout{display:grid;grid-template-columns:330px minmax(0,1fr);gap:16px}.panel{position:sticky;top:82px;align-self:start;max-height:calc(100vh - 100px);overflow:auto}.panel h3{margin:0;padding:14px;border-bottom:1px solid var(--line);color:var(--gold);font-size:13px;text-transform:uppercase;letter-spacing:.08em}.panel-body{padding:12px}.search{width:100%;border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff;padding:11px 12px;margin-bottom:10px}.chapter-btn{width:100%;text-align:left;color:var(--ink);border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:8px;padding:10px;margin-bottom:8px;display:grid;grid-template-columns:54px 1fr;gap:10px;align-items:center;cursor:pointer}.chapter-btn.active{border-color:var(--accent);background:rgba(255,138,61,.1)}.chapter-btn img{width:54px;height:54px;object-fit:cover;border-radius:6px;background:#111}.chapter-btn b,.track b{display:block}.chapter-btn span,.track span{display:block;color:var(--muted);font-size:12px}.chapter{overflow:hidden;margin-bottom:16px}.chapter-hero{display:grid;grid-template-columns:220px 1fr;gap:18px;padding:18px;border-bottom:1px solid var(--line)}.chapter-hero img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#111}.chapter h2{font-size:clamp(1.8rem,4vw,3.8rem);line-height:.95;margin:8px 0}.book-tracks{padding:14px}.track{padding:13px;margin-bottom:12px}.track-head{display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:start}.track-head img{width:96px;height:96px;object-fit:cover;border-radius:8px;background:#111}.meta{color:var(--muted);font-size:12px}.lyrics{margin-top:12px;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}.lyrics h4{margin:12px 0 7px;color:var(--cyan);font-size:12px;letter-spacing:.08em;text-transform:uppercase}.lyrics p{margin:0 0 7px;font-size:clamp(1.02rem,1.35vw,1.24rem);line-height:1.58}.empty{color:var(--muted);padding:24px;text-align:center}.cover-null{display:grid;place-items:center;background:#121b25;color:var(--muted);border:1px dashed var(--line);border-radius:8px;aspect-ratio:1/1;text-align:center;padding:10px}@media print{.top,.panel,.actions,.search{display:none}.shell{width:auto;padding:0}.layout{display:block}.chapter,.track{break-inside:avoid;background:#fff;color:#111;border-color:#ddd}.lyrics h4{color:#333}.hero{display:block}.guard{color:#111;background:#fff;border-color:#111}.stat{color:#111;background:#fff}}@media(max-width:980px){.hero,.layout,.chapter-hero{grid-template-columns:1fr}.panel{position:static;max-height:none}.stats{grid-template-columns:1fr 1fr}.actions{margin-left:0}.top-inner{align-items:flex-start;flex-wrap:wrap}}@media(max-width:560px){.track-head{grid-template-columns:72px 1fr}.track-head img{width:72px;height:72px}.hero h2{font-size:2.5rem}}
  </style>
</head>
<body>
  <header class="top"><div class="top-inner"><div class="mark">RV</div><div class="brand"><h1>Lyrics Book</h1><small>Album chapters, local cover art, sanitized lyrics</small></div><nav class="actions"><a class="pill" href="./data/lyrics-book.json">JSON</a><a class="pill" href="./data/lyrics-book-index.tsv">TSV</a><a class="pill" href="./lyrics-book.md">Markdown</a><a class="pill" href="./lyrics-prompter.html">Prompter</a><a class="pill" href="./unique-tracks-with-versions.html">Versions</a><a class="pill" href="./install.html">Install</a><button class="pill" onclick="window.print()">Print</button></nav></div></header>
  <main class="shell">
    <section class="hero"><figure class="hero-cover" id="heroCover"></figure><div><span class="eyebrow">Radio Vaigyaaniq catalog book</span><h2>Lyrics with cover art</h2><p>Book chapters are generated from the local candidate album board. Lyrics come from sanitized local source files and cover art references existing local assets only.</p><p class="guard">PHKD: no cover art is fabricated, no commercial rights are verified here, and timing remains unverified.</p></div></section>
    <section class="stats"><article class="stat"><span>Tracks</span><b>${report.counts.bookTracks.toLocaleString()}</b></article><article class="stat"><span>Chapters</span><b>${report.counts.chapters}</b></article><article class="stat"><span>Lyrics</span><b>${report.counts.tracksWithLyrics.toLocaleString()}</b></article><article class="stat"><span>Covers</span><b>${report.counts.tracksWithCoverArt.toLocaleString()}</b></article><article class="stat"><span>Rights</span><b>0</b></article></section>
    <section class="layout"><aside class="panel"><h3>Chapters</h3><div class="panel-body"><input class="search" id="search" placeholder="Search book..."><div id="chapterNav"></div></div></aside><section id="book"></section></section>
  </main>
  <script id="lyrics-book-data" type="application/json">${bootstrap}</script>
  <script>
    const DATA = JSON.parse(document.getElementById('lyrics-book-data').textContent);
    const state = { chapterId: DATA.chapters[0]?.id || null, search: '' };
    const $ = (id) => document.getElementById(id);
    const normalize = (value) => String(value || '').toLowerCase();
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const coverNode = (src, label) => src ? '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(label) + ' cover">' : '<div class="cover-null">Cover art NULL</div>';
    function filteredChapters() {
      const term = normalize(state.search);
      return DATA.chapters.map((chapter) => {
        const tracks = chapter.tracks.filter((track) => !term || normalize([chapter.title, track.title, track.language, track.station, track.theme, track.style, track.primaryLyricsSource].join(' ')).includes(term));
        return { ...chapter, tracks };
      }).filter((chapter) => chapter.tracks.length > 0 || !term);
    }
    function renderNav(chapters) {
      if (!chapters.some((chapter) => chapter.id === state.chapterId)) state.chapterId = chapters[0]?.id || null;
      $('chapterNav').innerHTML = chapters.map((chapter) => '<button class="chapter-btn ' + (chapter.id === state.chapterId ? 'active' : '') + '" data-chapter="' + escapeHtml(chapter.id) + '">' + coverNode(chapter.coverStatus === 'cover-local' ? chapter.cover : null, chapter.title) + '<span><b>' + escapeHtml(chapter.title) + '</b><span>' + chapter.tracks.length + ' tracks · ' + escapeHtml(chapter.status) + '</span></span></button>').join('') || '<div class="empty">No chapters.</div>';
      document.querySelectorAll('[data-chapter]').forEach((button) => button.addEventListener('click', () => { state.chapterId = button.dataset.chapter; render(); document.getElementById('book').scrollIntoView({ behavior: 'smooth' }); }));
    }
    function renderBook(chapters) {
      const selected = state.chapterId ? chapters.filter((chapter) => chapter.id === state.chapterId) : chapters;
      const firstCover = DATA.chapters.find((chapter) => chapter.coverStatus === 'cover-local')?.cover;
      $('heroCover').innerHTML = coverNode(firstCover, 'Radio Vaigyaaniq lyrics book');
      $('book').innerHTML = selected.map((chapter) => '<article class="chapter"><div class="chapter-hero">' + coverNode(chapter.coverStatus === 'cover-local' ? chapter.cover : null, chapter.title) + '<div><span class="eyebrow">' + escapeHtml(chapter.status) + '</span><h2>' + escapeHtml(chapter.title) + '</h2><p>' + escapeHtml(chapter.description || 'Description NULL') + '</p><p class="meta">Book tracks ' + chapter.tracks.length + ' · source candidates ' + chapter.sourceCandidateTrackCount + ' · station ' + escapeHtml(chapter.station || 'NULL') + '</p></div></div><div class="book-tracks">' + chapter.tracks.map(renderTrack).join('') + '</div></article>').join('') || '<div class="empty">No tracks match the current search.</div>';
    }
    function renderTrack(track) {
      const sections = track.sections.length ? track.sections.map((section) => '<section><h4>' + escapeHtml(section.name) + '</h4>' + section.lines.map((line) => '<p>' + escapeHtml(line) + '</p>').join('') + '</section>').join('') : '<p>Lyrics NULL</p>';
      return '<article class="track"><div class="track-head">' + coverNode(track.coverStatus === 'cover-local' ? track.cover : null, track.title) + '<div><b>' + escapeHtml(track.title) + '</b><span class="meta">' + escapeHtml([track.language || 'NULL', track.station || 'NULL', track.theme || 'NULL'].join(' · ')) + '</span><span class="meta">Style: ' + escapeHtml(track.style || 'NULL') + '</span><span class="meta">Source: ' + escapeHtml(track.primaryLyricsSource || 'NULL') + '</span></div></div><div class="lyrics">' + sections + '</div></article>';
    }
    function render() { const chapters = filteredChapters(); renderNav(chapters); renderBook(chapters); }
    $('search').addEventListener('input', (event) => { state.search = event.target.value; render(); });
    render();
  </script>
</body>
</html>
`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-book.html")) return;
  const card =
    '      <a href="./lyrics-book.html"><b>Lyrics Book</b><small>Album-style lyrics book with local cover art, sanitized lyrics, JSON, TSV, and Markdown exports.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/lyrics-prompter\.html"><b>Lyrics Prompter<\/b><small>.*?<\/small><\/a>\n)/s, `${card}$1`);
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-book.html")) return;
  html = html.replace(
    '<a class="pill" href="./lyrics-prompter.html">Lyrics Prompter</a>',
    '<a class="pill" href="./lyrics-prompter.html">Lyrics Prompter</a><a class="pill" href="./lyrics-book.html">Lyrics Book</a>'
  );
  fs.writeFileSync(file, html);
}

function updateLyricsSurface(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("../lyrics-book.html")) return;
  html = html.replace(
    '<a class="download" href="../lyrics-prompter.html">Open Lyrics Prompter</a>',
    '<a class="download" href="../lyrics-prompter.html">Open Lyrics Prompter</a><a class="download" href="../lyrics-book.html">Open Lyrics Book</a>'
  );
  fs.writeFileSync(file, html);
}

function normalizeCover(value) {
  if (!value) return null;
  return String(value).replace(/^\/radio-html\//, "");
}

function localAssetExists(relativePath) {
  return fs.existsSync(path.join(WEB_HTML, relativePath));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
}

function cleanLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}

function escapeMarkdown(value) {
  return String(value || "").replace(/[[\]]/g, "\\$&");
}
