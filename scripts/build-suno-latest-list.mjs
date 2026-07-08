import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const MANIFEST_PATH = path.join(ROOT, "_radio_index/suno_backup/suno_manifest.csv");
const CATALOG_PATH = path.join(WEB_HTML, "data/suno-library-catalog.json");
const generatedAt = new Date().toISOString();

const manifestRows = parseCsv(fs.readFileSync(MANIFEST_PATH, "utf8"));
const catalog = readJson(CATALOG_PATH);
const catalogTracks = Array.isArray(catalog) ? catalog : catalog.tracks || [];
const catalogById = new Map(catalogTracks.map((track) => [track.sunoId, track]));

const latestTracks = manifestRows
  .map((row) => normalizeManifestTrack(row, catalogById.get(row.id)))
  .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));

const uniqueIds = new Set(latestTracks.map((track) => track.id));
const duplicateIds = latestTracks
  .filter((track, index) => latestTracks.findIndex((candidate) => candidate.id === track.id) !== index)
  .map((track) => track.id);

const report = {
  id: "radio-vaigyaaniq-suno-latest-list",
  generatedAt,
  status: "local-suno-manifest-latest",
  verificationState: "local-manifest-joined-to-playable-catalog",
  source: {
    manifestCsv: "_radio_index/suno_backup/suno_manifest.csv",
    playableCatalog: "apps/web/public/radio-html/data/suno-library-catalog.json",
    externalNetworkSync: false
  },
  phkd: {
    fabricatedTracks: false,
    fabricatedStyles: false,
    fabricatedLyrics: false,
    commercialRightsVerified: false,
    licensingStatus: null,
    publicReleaseAllowed: false,
    unknownValues: "NULL",
    note:
      "This list is generated from the local Suno manifest export and local playable catalog. It does not claim commercial rights, store approval, release clearance, or live Suno account freshness."
  },
  counts: {
    manifestRows: manifestRows.length,
    uniqueIds: uniqueIds.size,
    duplicateIds: duplicateIds.length,
    catalogTracks: catalogTracks.length,
    catalogMatches: latestTracks.filter((track) => track.catalogMatched).length,
    playableTracks: latestTracks.filter((track) => track.canPlay).length,
    tracksWithCover: latestTracks.filter((track) => track.coverRelativePath).length,
    tracksWithPrompt: latestTracks.filter((track) => track.prompt).length,
    tracksWithTags: latestTracks.filter((track) => track.tags.length).length,
    tracksWithModel: latestTracks.filter((track) => track.model).length
  },
  latestCreatedAt: latestTracks[0]?.createdAt || null,
  oldestCreatedAt: latestTracks.at(-1)?.createdAt || null,
  duplicateIds: [...new Set(duplicateIds)].sort(),
  tracks: latestTracks
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  writeJson(path.join(dataRoot, "suno-latest-list.json"), report);
  fs.writeFileSync(path.join(dataRoot, "suno-latest-list.tsv"), buildTsv(report));
  fs.writeFileSync(path.join(htmlRoot, "suno-latest-list.html"), buildHtml(report));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
}

console.log(`suno-latest manifestRows=${report.counts.manifestRows}`);
console.log(`suno-latest uniqueIds=${report.counts.uniqueIds}`);
console.log(`suno-latest catalogMatches=${report.counts.catalogMatches}`);
console.log(`suno-latest playableTracks=${report.counts.playableTracks}`);
console.log(`suno-latest latestCreatedAt=${report.latestCreatedAt || "NULL"}`);

function normalizeManifestTrack(row, catalogTrack) {
  const durationSeconds = parseNumber(row.duration_sec);
  const tags = splitTags(row.tags);
  const coverRelativePath = toRelativeRadioPath(catalogTrack?.coverPublicPath) || manifestCoverFallback(row.id);
  const audioRelativePath = toRelativeRadioPath(catalogTrack?.publicPath);
  return {
    id: row.id || null,
    title: clean(row.title) || "(untitled)",
    createdAt: row.created || null,
    createdDate: row.created ? row.created.slice(0, 10) : null,
    durationSeconds,
    duration: durationSeconds === null ? null : formatDuration(durationSeconds),
    tags,
    rawTags: clean(row.tags) || null,
    model: clean(row.model) || null,
    public: row.public === "1",
    liked: row.liked === "1",
    inLocalFolder: row.in_local_folder === "1",
    catalogMatched: Boolean(catalogTrack),
    canPlay: Boolean(catalogTrack?.canPlay),
    audioRelativePath,
    coverRelativePath: localAssetExists(coverRelativePath) ? coverRelativePath : null,
    audioPublicPath: catalogTrack?.publicPath || null,
    coverPublicPath: catalogTrack?.coverPublicPath || null,
    sourceAudioUrl: row.audio_url || null,
    sourceImageUrl: row.image_url || null,
    prompt: cleanPrompt(row.prompt),
    promptPreview: cleanPrompt(row.prompt).slice(0, 280) || null,
    rightsStatus: null,
    verificationState: "local-suno-manifest-rights-null",
    releaseAllowed: false
  };
}

function buildTsv(data) {
  const header = [
    "id",
    "title",
    "createdAt",
    "duration",
    "model",
    "tags",
    "catalogMatched",
    "canPlay",
    "coverRelativePath",
    "audioRelativePath",
    "rightsStatus",
    "releaseAllowed"
  ];
  const rows = data.tracks.map((track) =>
    [
      track.id,
      track.title,
      track.createdAt,
      track.duration,
      track.model,
      track.tags.join(", "),
      track.catalogMatched,
      track.canPlay,
      track.coverRelativePath,
      track.audioRelativePath,
      track.rightsStatus,
      track.releaseAllowed
    ]
      .map(tsvCell)
      .join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(data) {
  const trackCards = data.tracks
    .map((track, index) => {
      const cover = track.coverRelativePath
        ? `<img src="./${escapeAttr(track.coverRelativePath)}" alt="" loading="lazy">`
        : `<div class="cover-null">NULL</div>`;
      const audio = track.audioRelativePath
        ? `<a class="mini" href="./${escapeAttr(track.audioRelativePath)}">Audio</a>`
        : `<span class="mini muted">Audio NULL</span>`;
      return `<article class="track">
        <div class="rank">${String(index + 1).padStart(3, "0")}</div>
        <div class="cover">${cover}</div>
        <div class="track-body">
          <div class="meta-row"><span>${escapeHtml(track.createdAt || "NULL")}</span><span>${escapeHtml(track.duration || "NULL")}</span><span>${escapeHtml(track.model || "NULL")}</span></div>
          <h2>${escapeHtml(track.title)}</h2>
          <p>${escapeHtml(track.promptPreview || "Prompt NULL")}</p>
          <div class="chips">${(track.tags.length ? track.tags : ["tags NULL"])
            .slice(0, 8)
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join("")}</div>
          <div class="actions">${audio}<span class="mini ${track.canPlay ? "ok" : "blocked"}">${track.canPlay ? "playable local" : "playback blocked"}</span><span class="mini blocked">rights NULL</span></div>
        </div>
      </article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Suno Latest List - Radio Vaigyaaniq</title>
  <style>
    :root{color-scheme:dark;--bg:#070812;--panel:#111421;--panel2:#171b2b;--line:rgba(255,255,255,.12);--text:#f6f4eb;--muted:#aaa4c7;--gold:#dfb15b;--cyan:#00f5d4;--orange:#ff6b35;--bad:#ff7272}
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(255,107,53,.12),transparent 34%),linear-gradient(180deg,#090b16,#05060d);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    header{position:sticky;top:0;z-index:4;background:rgba(7,8,18,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(16px)}
    .bar{width:min(1240px,calc(100vw - 28px));margin:auto;display:flex;gap:16px;align-items:center;justify-content:space-between;padding:16px 0}
    h1{font-size:clamp(24px,4vw,48px);margin:0;font-family:Georgia,serif}
    p{color:var(--muted);line-height:1.55}
    a{color:inherit;text-decoration:none}
    .pill,.mini{border:1px solid var(--line);border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.04);font-size:12px;color:var(--text)}
    .wrap{width:min(1240px,calc(100vw - 28px));margin:0 auto;padding:24px 0 48px}
    .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;margin:18px 0 22px}
    .panel{background:linear-gradient(180deg,rgba(23,27,43,.88),rgba(12,14,25,.88));border:1px solid var(--line);border-radius:18px;padding:22px}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px}
    .stat b{display:block;font-size:26px;color:var(--gold)}
    .note{border-color:rgba(255,114,114,.35);background:rgba(255,114,114,.08)}
    .tools{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
    .track{display:grid;grid-template-columns:54px 96px minmax(0,1fr);gap:14px;background:rgba(17,20,33,.82);border:1px solid var(--line);border-radius:16px;padding:12px;margin:10px 0}
    .rank{color:var(--gold);font-family:ui-monospace,Menlo,monospace;font-size:13px;padding-top:6px}
    .cover{width:96px;aspect-ratio:1;border-radius:12px;overflow:hidden;background:#0b0d16;border:1px solid var(--line);display:grid;place-items:center;color:var(--muted);font-size:12px}
    .cover img{width:100%;height:100%;object-fit:cover;display:block}
    .track h2{font-size:18px;margin:5px 0 4px}
    .track p{font-size:13px;margin:0 0 10px}
    .meta-row,.chips,.actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .meta-row span,.chips span{font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 8px}
    .chips span{color:var(--cyan);background:rgba(0,245,212,.05)}
    .mini{display:inline-flex;align-items:center;min-height:28px}
    .ok{border-color:rgba(0,245,212,.4);color:var(--cyan)}
    .blocked{border-color:rgba(255,114,114,.35);color:var(--bad)}
    .muted{color:var(--muted)}
    @media(max-width:820px){.bar,.hero{display:block}.bar .tools{margin-top:12px}.hero{gap:10px}.stats{grid-template-columns:repeat(2,1fr)}.track{grid-template-columns:42px 72px minmax(0,1fr);gap:10px}.cover{width:72px}.track h2{font-size:15px}}
  </style>
</head>
<body>
  <header>
    <div class="bar">
      <div>
        <h1>Suno Latest List</h1>
        <p>Local Suno export joined with the Radio Vaigyaaniq playable catalog.</p>
      </div>
      <nav class="tools">
        <a class="pill" href="./standalone-radio.html">Standalone Radio</a>
        <a class="pill" href="./data/suno-latest-list.json">JSON</a>
        <a class="pill" href="./data/suno-latest-list.tsv">TSV</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <section class="hero">
      <div class="panel">
        <h2>Latest local Suno snapshot</h2>
        <p>Generated ${escapeHtml(data.generatedAt)} from <code>${escapeHtml(data.source.manifestCsv)}</code>. Newest created timestamp: <b>${escapeHtml(data.latestCreatedAt || "NULL")}</b>. Oldest: <b>${escapeHtml(data.oldestCreatedAt || "NULL")}</b>.</p>
        <div class="tools"><span class="mini blocked">commercial rights NULL</span><span class="mini blocked">releaseAllowed false</span><span class="mini ok">fabricatedTracks false</span></div>
      </div>
      <div class="panel note">
        <h2>PHKD gate</h2>
        <p>${escapeHtml(data.phkd.note)}</p>
      </div>
    </section>
    <section class="stats">
      ${stat("Manifest Rows", data.counts.manifestRows)}
      ${stat("Unique IDs", data.counts.uniqueIds)}
      ${stat("Catalog Matches", data.counts.catalogMatches)}
      ${stat("Playable Local", data.counts.playableTracks)}
      ${stat("With Prompt", data.counts.tracksWithPrompt)}
      ${stat("With Tags", data.counts.tracksWithTags)}
    </section>
    <section>
      ${trackCards}
    </section>
  </main>
</body>
</html>`;
}

function stat(label, value) {
  return `<div class="stat"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></div>`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("suno-latest-list.html")) return;
  const card =
    '      <a href="./suno-latest-list.html"><b>Suno Latest List</b><small>Newest local Suno manifest rows joined to playable Radio catalog paths with PHKD rights NULL.</small></a>\n';
  html = html.replace(
    /(\s*<a href="\.\/standalone-radio\.html"><b>Standalone Radio<\/b><small>.*?<\/small><\/a>\n)/s,
    `$1${card}`
  );
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("suno-latest-list.html")) return;
  html = html.replace(
    '<a class="pill" href="./install.html">Install</a>',
    '<a class="pill" href="./install.html">Install</a><a class="pill" href="./suno-latest-list.html">Suno Latest</a>'
  );
  fs.writeFileSync(file, html);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((candidate) => candidate.some((cell) => cell !== ""));
  return body.map((cells) =>
    Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""]))
  );
}

function splitTags(value) {
  return clean(value)
    .split(/[;,]/g)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function cleanPrompt(value) {
  return String(value || "").replace(/\r/g, "").trim();
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatDuration(seconds) {
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const rest = String(rounded % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function toRelativeRadioPath(value) {
  if (!value) return null;
  return String(value).replace(/^\/radio-html\//, "");
}

function manifestCoverFallback(id) {
  return id ? `assets/covers/${id}.jpeg` : null;
}

function localAssetExists(relativePath) {
  return Boolean(relativePath && fs.existsSync(path.join(WEB_HTML, relativePath)));
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
