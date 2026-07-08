import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const WEB_DATA = path.join(WEB_HTML, "data");
const generatedAt = new Date().toISOString();

const catalog = readJson(path.join(WEB_DATA, "suno-library-catalog.json"));
const stationTracks = readJson(path.join(WEB_DATA, "station-tracks.json"));
const albums = readJson(path.join(WEB_DATA, "possible-albums.json"));
const metaTags = readJson(path.join(WEB_DATA, "song-meta-tags.json"));
const lyricsPrompter = readJson(path.join(WEB_DATA, "lyrics-prompter-data.json"));
const tracks = catalog.tracks || [];
const stationByTrack = buildStationIndex(stationTracks);
const lyricsByTrack = new Map((lyricsPrompter.tracks || []).map((track) => [track.id, track]));

const trackCards = tracks.map((track) => buildTrackCard(track));
const trackById = new Map(trackCards.map((track) => [track.id, track]));
const albumLanes = buildAlbumLanes(albums.candidateAlbums || [], trackCards);
const stationLanes = buildStationLanes(stationTracks, trackCards);
const labelLanes = buildLabelLanes(metaTags, trackCards);

const doc = {
  id: "radio-vaigyaaniq-admin-kanban",
  generatedAt,
  status: "local-admin-draft",
  source: {
    catalog: "apps/web/public/radio-html/data/suno-library-catalog.json",
    stations: "apps/web/public/radio-html/data/station-tracks.json",
    albums: "apps/web/public/radio-html/data/possible-albums.json",
    labels: "apps/web/public/radio-html/data/song-meta-tags.json",
    lyrics: "apps/web/public/radio-html/data/lyrics-prompter-data.json"
  },
  phkd: {
    fabricatedTracks: false,
    writesDatabase: false,
    localStorageOnly: true,
    unknownValues: "NULL",
    note:
      "Drag/drop assignments are local admin draft state until exported and reviewed. No DB mutation is performed by this static page."
  },
  counts: {
    tracks: trackCards.length,
    albumLanes: albumLanes.length,
    stationLanes: stationLanes.length,
    labelLanes: labelLanes.length,
    tracksWithLyrics: trackCards.filter((track) => track.lyricsReady).length,
    tracksWithoutLyrics: trackCards.filter((track) => !track.lyricsReady).length,
    styleNullTracks: trackCards.filter((track) => track.style === "NULL").length
  },
  tracks: trackCards,
  boards: {
    albums: {
      id: "albums",
      title: "Album Assignment",
      description: "Drag tracks across candidate album lanes. Seeded from overlap-aware keyword matches.",
      lanes: albumLanes
    },
    stations: {
      id: "stations",
      title: "Station Assignment",
      description: "Drag tracks across Radio station lanes. Seeded from station-tracks.json.",
      lanes: stationLanes
    },
    labels: {
      id: "labels",
      title: "Label Assignment",
      description: "Drag tracks across canonical theme/label lanes.",
      lanes: labelLanes
    }
  }
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  fs.writeFileSync(path.join(dataRoot, "radio-admin-kanban.json"), `${JSON.stringify(doc)}\n`);
  fs.writeFileSync(path.join(dataRoot, "radio-admin-kanban.tsv"), buildTsv(doc));
  fs.writeFileSync(path.join(htmlRoot, "admin-kanban.html"), buildHtml(doc));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
}

console.log(`tracks=${doc.counts.tracks}`);
console.log(`albumLanes=${doc.counts.albumLanes} stationLanes=${doc.counts.stationLanes} labelLanes=${doc.counts.labelLanes}`);
console.log(`tracksWithLyrics=${doc.counts.tracksWithLyrics} styleNullTracks=${doc.counts.styleNullTracks}`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildStationIndex(doc) {
  const index = new Map();
  for (const [slug, items] of Object.entries(doc.bySlug || {})) {
    for (const item of items || []) {
      index.set(item.sunoId, {
        slug,
        theme: item.theme || null,
        language: item.language || null
      });
    }
  }
  return index;
}

function buildTrackCard(track) {
  const station = stationByTrack.get(track.sunoId) || {};
  const lyrics = lyricsByTrack.get(track.sunoId);
  const style = normalizeStyle(track.styles);
  const theme = station.theme || "Other / Misc";
  const language = station.language || detectLanguage(track.title || "");
  return {
    id: track.sunoId,
    title: track.title || "(untitled)",
    station: station.slug || "unassigned",
    theme,
    language,
    style,
    cover: publicToRelative(track.coverPublicPath || track.coverPath),
    audio: publicToRelative(track.publicPath || track.audioPath),
    canPlay: Boolean(track.canPlay),
    lyricsReady: Boolean(lyrics?.lyricsSanitizedPresent),
    cueCount: lyrics?.promptLineCount || 0,
    labels: unique([theme, language, style === "NULL" ? "Style NULL" : null, lyrics?.lyricsSanitizedPresent ? "Lyrics Ready" : "Lyrics NULL"].filter(Boolean)),
    createdAt: track.createdAt || null
  };
}

function buildAlbumLanes(candidateAlbums, cards) {
  const assignments = new Map();
  const lanes = candidateAlbums.map((album) => {
    const matcher = matcherFor(album.patterns || []);
    const matches = cards.filter((track) => matcher.test([track.title, track.style, track.theme, track.language].join(" ")));
    for (const track of matches) {
      if (!assignments.has(track.id)) assignments.set(track.id, album.slug);
    }
    return {
      id: album.slug,
      title: album.title,
      subtitle: `${matches.length} suggested / ${album.trackCount || 0} source count`,
      board: "albums",
      status: album.status || "candidate-not-persisted",
      cover: publicToRelative(album.coverPublicPath || album.coverImage),
      patterns: album.patterns || [],
      trackIds: matches.map((track) => track.id)
    };
  });
  const unassigned = cards.filter((track) => !assignments.has(track.id)).map((track) => track.id);
  lanes.push({
    id: "album-unassigned",
    title: "Album Unassigned",
    subtitle: `${unassigned.length} tracks`,
    board: "albums",
    status: "local-admin-draft",
    cover: null,
    patterns: [],
    trackIds: unassigned
  });
  return lanes;
}

function buildStationLanes(stationDoc, cards) {
  const stationNames = {
    "sanaatana-vaigyaniq": "Sanaatana Vaigyaniq",
    "kabir-clubbing": "Kabir Clubbing",
    gurukul: "Gurukul",
    ameerpur: "Ameerpur"
  };
  const slugs = Object.keys(stationDoc.counts || {}).sort();
  const lanes = slugs.map((slug) => {
    const ids = cards.filter((track) => track.station === slug).map((track) => track.id);
    return {
      id: slug,
      title: stationNames[slug] || slug,
      subtitle: `${ids.length} tracks`,
      board: "stations",
      status: "seeded-from-station-tracks",
      cover: null,
      trackIds: ids
    };
  });
  const unassigned = cards.filter((track) => !slugs.includes(track.station)).map((track) => track.id);
  lanes.push({
    id: "station-unassigned",
    title: "Station Unassigned",
    subtitle: `${unassigned.length} tracks`,
    board: "stations",
    status: "local-admin-draft",
    cover: null,
    trackIds: unassigned
  });
  return lanes;
}

function buildLabelLanes(tagDoc, cards) {
  const labels = [...(tagDoc.canonicalThemeTags || [])]
    .filter((tag) => tag.tag && tag.tag !== "NULL")
    .slice(0, 14)
    .map((tag) => tag.tag);
  const lanes = labels.map((label) => {
    const ids = cards.filter((track) => track.theme === label || track.labels.includes(label)).map((track) => track.id);
    return {
      id: slugify(label),
      title: label,
      subtitle: `${ids.length} tracks`,
      board: "labels",
      status: "seeded-from-canonical-theme",
      cover: null,
      trackIds: ids
    };
  });
  const lyricsNull = cards.filter((track) => !track.lyricsReady).map((track) => track.id);
  const styleNull = cards.filter((track) => track.style === "NULL").map((track) => track.id);
  lanes.push({
    id: "lyrics-null",
    title: "Lyrics NULL",
    subtitle: `${lyricsNull.length} tracks`,
    board: "labels",
    status: "review-lane",
    cover: null,
    trackIds: lyricsNull
  });
  lanes.push({
    id: "style-null",
    title: "Style NULL",
    subtitle: `${styleNull.length} tracks`,
    board: "labels",
    status: "review-lane",
    cover: null,
    trackIds: styleNull
  });
  return lanes;
}

function matcherFor(patterns) {
  if (!patterns.length) return /$a/;
  return new RegExp(patterns.map(escapeRegExp).join("|"), "i");
}

function buildTsv(data) {
  const header = ["board", "laneId", "laneTitle", "trackId", "title", "station", "theme", "language", "style", "lyricsReady", "cueCount"];
  const rows = [];
  for (const [boardId, board] of Object.entries(data.boards)) {
    for (const lane of board.lanes) {
      for (const trackId of lane.trackIds) {
        const track = trackById.get(trackId);
        if (!track) continue;
        rows.push(
          [
            boardId,
            lane.id,
            lane.title,
            track.id,
            track.title,
            track.station,
            track.theme,
            track.language,
            track.style,
            String(track.lyricsReady),
            String(track.cueCount)
          ]
            .map(tsvCell)
            .join("\t")
        );
      }
    }
  }
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(data) {
  const bootstrap = JSON.stringify({
    generatedAt: data.generatedAt,
    counts: data.counts,
    boards: Object.fromEntries(Object.entries(data.boards).map(([id, board]) => [id, { title: board.title, laneCount: board.lanes.length }]))
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Admin Kanban</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#eef4f8;--muted:#94a3b8;--line:rgba(255,255,255,.12);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676;--ok:#8be29d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 18% 0%,rgba(255,138,61,.16),transparent 32rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui}button,input,select{font:inherit}.top{position:sticky;top:0;z-index:20;background:rgba(7,10,15,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.top-inner{width:min(1500px,calc(100vw - 28px));margin:auto;display:flex;align-items:center;gap:12px;padding:12px 0}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.brand h1{margin:0;font-size:19px}.brand small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.shell{width:min(1500px,calc(100vw - 28px));margin:auto;padding:18px 0 32px}.toolbar{display:grid;grid-template-columns:180px minmax(220px,1fr) 160px auto auto;gap:10px;align-items:center;margin-bottom:14px}.search,.select{padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:10px 12px;margin-bottom:14px}.board{display:flex;gap:12px;overflow:auto;padding-bottom:16px;min-height:72vh}.lane{flex:0 0 322px;background:linear-gradient(180deg,rgba(16,23,32,.94),rgba(11,16,23,.96));border:1px solid var(--line);border-radius:8px;display:flex;flex-direction:column;max-height:78vh}.lane.drag-over{border-color:var(--cyan);box-shadow:0 0 0 1px rgba(99,230,213,.25)}.lane-head{padding:12px;border-bottom:1px solid var(--line)}.lane-head b{display:block}.lane-head span{color:var(--muted);font-size:12px}.lane-body{padding:10px;overflow:auto;min-height:180px}.card{border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.045);padding:8px;margin-bottom:8px;display:grid;grid-template-columns:54px 1fr;gap:9px;cursor:grab}.card:active{cursor:grabbing}.card img{width:54px;height:54px;object-fit:cover;border-radius:6px;background:#151f2b}.card b{display:block;line-height:1.16}.card span{display:block;color:var(--muted);font-size:12px}.chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}.chip{font-size:10px;border:1px solid var(--line);border-radius:999px;padding:2px 5px;color:#dfe7ee}.dirty{color:var(--gold);font-weight:900}.empty{padding:18px;color:var(--muted);text-align:center}.drawer{position:fixed;right:14px;bottom:14px;width:min(520px,calc(100vw - 28px));max-height:60vh;overflow:auto;background:#0b1119;border:1px solid var(--line);border-radius:8px;padding:12px;box-shadow:0 22px 70px rgba(0,0,0,.4)}textarea{width:100%;min-height:180px;background:#070a0f;color:#dfeaf2;border:1px solid var(--line);border-radius:8px;padding:10px;resize:vertical}@media(max-width:900px){.toolbar{grid-template-columns:1fr}.actions{display:none}.lane{flex-basis:86vw}}
  </style>
</head>
<body>
  <header class="top"><div class="top-inner"><div class="mark">RV</div><div class="brand"><h1>Radio Admin Kanban</h1><small>Drag tracks across album, station, and label lanes</small></div><nav class="actions"><a class="pill" href="./standalone-radio.html">Standalone</a><a class="pill" href="./data/radio-admin-kanban.json">JSON</a><a class="pill" href="./data/radio-admin-kanban.tsv">TSV</a></nav></div></header>
  <main class="shell">
    <p class="guard">PHKD: local admin draft only. Drag/drop changes are kept in browser localStorage and exported as JSON; no database write or release claim is made.</p>
    <section class="toolbar"><select class="select" id="boardMode"><option value="albums">Albums</option><option value="stations">Stations</option><option value="labels">Labels</option></select><input class="search" id="search" placeholder="Search title, style, language, station..."><select class="select" id="lyricsFilter"><option value="all">All lyrics states</option><option value="ready">Lyrics ready</option><option value="null">Lyrics NULL</option></select><button class="pill" id="resetBoard">Reset Board</button><button class="pill" id="exportBoard">Export JSON</button><button class="pill" id="loadLocalData" type="button">Load local JSON</button><input id="fileImport" type="file" accept="application/json" hidden></section>
    <section class="board" id="board"></section>
  </main>
  <aside class="drawer" id="drawer" hidden><b>Assignment Export</b><p class="dirty" id="dirtyState">Draft changes local only.</p><textarea id="exportText" readonly></textarea></aside>
  <script id="kanban-bootstrap" type="application/json">${bootstrap}</script>
  <script>
    const BOOTSTRAP = JSON.parse(document.getElementById('kanban-bootstrap').textContent);
    let DATA = null;
    let boards = null;
    const $ = (id) => document.getElementById(id);
    const state = { board: 'albums', search: '', lyrics: 'all', dirty: false };
    const normalize = (value) => String(value || '').toLowerCase();
    const trackMap = () => new Map((DATA?.tracks || []).map((track) => [track.id, track]));
    async function boot() {
      try {
        const response = await fetch('./data/radio-admin-kanban.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('DATA_FETCH_FAILED_' + response.status);
        DATA = await response.json();
        loadState();
        render();
      } catch (error) {
        $('board').innerHTML = '<div class="empty">Kanban data could not be auto-loaded. Use Load local JSON and choose data/radio-admin-kanban.json.</div>';
      }
    }
    function loadState() {
      const saved = localStorage.getItem('radio-admin-kanban-v1');
      boards = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DATA.boards));
    }
    function saveState() {
      localStorage.setItem('radio-admin-kanban-v1', JSON.stringify(boards));
      state.dirty = true;
    }
    function filteredTrack(track) {
      if (!track) return false;
      if (state.lyrics === 'ready' && !track.lyricsReady) return false;
      if (state.lyrics === 'null' && track.lyricsReady) return false;
      const term = normalize(state.search);
      if (term && !normalize([track.title, track.style, track.station, track.theme, track.language, track.labels?.join(' ')].join(' ')).includes(term)) return false;
      return true;
    }
    function render() {
      if (!boards) return;
      const tracks = trackMap();
      const board = boards[state.board];
      $('board').innerHTML = board.lanes.map((lane) => {
        const cards = lane.trackIds.map((id) => tracks.get(id)).filter(filteredTrack);
        return '<article class="lane" data-lane="' + lane.id + '"><div class="lane-head"><b>' + escapeHtml(lane.title) + '</b><span>' + cards.length.toLocaleString() + ' visible · ' + escapeHtml(lane.status || 'local') + '</span></div><div class="lane-body">' + (cards.length ? cards.slice(0, 260).map(cardHtml).join('') : '<div class="empty">No visible tracks.</div>') + '</div></article>';
      }).join('');
      bindDrag();
    }
    function cardHtml(track) {
      return '<div class="card" draggable="true" data-track="' + track.id + '"><img src="' + escapeHtml(track.cover || 'assets/images/radio-vaigyaaniq-runtime-hero.svg') + '" alt=""><div><b>' + escapeHtml(track.title) + '</b><span>' + escapeHtml(track.station + ' · ' + track.theme + ' · ' + track.language) + '</span><div class="chips"><i class="chip">' + (track.lyricsReady ? 'lyrics' : 'lyrics NULL') + '</i><i class="chip">' + escapeHtml(track.style === 'NULL' ? 'style NULL' : track.style.slice(0, 28)) + '</i></div></div></div>';
    }
    function bindDrag() {
      document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', card.dataset.track));
      });
      document.querySelectorAll('.lane').forEach((lane) => {
        lane.addEventListener('dragover', (event) => { event.preventDefault(); lane.classList.add('drag-over'); });
        lane.addEventListener('dragleave', () => lane.classList.remove('drag-over'));
        lane.addEventListener('drop', (event) => {
          event.preventDefault();
          lane.classList.remove('drag-over');
          moveTrack(event.dataTransfer.getData('text/plain'), lane.dataset.lane);
        });
      });
    }
    function moveTrack(trackId, targetLaneId) {
      const board = boards[state.board];
      for (const lane of board.lanes) lane.trackIds = lane.trackIds.filter((id) => id !== trackId);
      const target = board.lanes.find((lane) => lane.id === targetLaneId);
      if (target && !target.trackIds.includes(trackId)) target.trackIds.unshift(trackId);
      saveState();
      render();
    }
    function exportPayload() {
      return { id: 'radio-admin-kanban-export', exportedAt: new Date().toISOString(), sourceGeneratedAt: DATA.generatedAt, board: state.board, phkd: DATA.phkd, boards };
    }
    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }
    $('boardMode').addEventListener('change', (event) => { state.board = event.target.value; render(); });
    $('search').addEventListener('input', (event) => { state.search = event.target.value; render(); });
    $('lyricsFilter').addEventListener('change', (event) => { state.lyrics = event.target.value; render(); });
    $('resetBoard').addEventListener('click', () => { localStorage.removeItem('radio-admin-kanban-v1'); loadState(); state.dirty = false; render(); });
    $('exportBoard').addEventListener('click', () => { $('drawer').hidden = false; $('exportText').value = JSON.stringify(exportPayload(), null, 2); });
    $('loadLocalData').addEventListener('click', () => $('fileImport').click());
    $('fileImport').addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      DATA = JSON.parse(await file.text());
      loadState();
      render();
    });
    boot();
  </script>
</body>
</html>
`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("admin-kanban.html")) return;
  const card =
    '      <a href="./admin-kanban.html"><b>Admin Kanban</b><small>Drag/drop track assignments across album, station, and label lanes with local export.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/standalone-radio\.html"><b>Standalone Radio<\/b><small>.*?<\/small><\/a>\n)/s, `$1${card}`);
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("admin-kanban.html")) return;
  html = html.replace(
    '<a class="pill" href="./full-tree-detail.html">Full Tree</a>',
    '<a class="pill" href="./full-tree-detail.html">Full Tree</a><a class="pill" href="./admin-kanban.html">Admin Kanban</a>'
  );
  fs.writeFileSync(file, html);
}

function normalizeStyle(value) {
  const clean = String(value || "").trim();
  return clean || "NULL";
}

function detectLanguage(title) {
  if (/[\u0900-\u097F]/.test(title)) return "Hindi";
  return "English";
}

function publicToRelative(value) {
  if (!value) return null;
  return String(value).replace(/^\/?radio-html\//, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
