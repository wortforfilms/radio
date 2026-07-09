import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const SUNO_LATEST = path.join(WEB_HTML, "data/suno-latest-list.json");
const generatedAt = new Date().toISOString();

const latest = readJson(SUNO_LATEST);
const tracks = latest.tracks.filter((track) => track.canPlay && track.audioRelativePath);

// Commerce defaults — mirrors packages/shared/src/commerce.ts (single source of truth
// for the TypeScript side; these constants must stay in sync with it).
const DEFAULT_SINGLE_PRICE = { INR: 2900, USD: 99 }; // minor units: ₹29.00 / $0.99
const ALL_ACCESS_PRICE = { INR: 29900, USD: 999 }; // ₹299.00 / $9.99
const DEFAULT_FREE_TRACKS = 2; // first N tracks per station are free-tier
const DEFAULT_PREVIEW_SECONDS = 45;

// Dedicated preview clips (produced by scripts/suno-previews.mjs + synced into
// radio-html/assets/previews). NULL until generated — playback then clamps at 45s.
function previewUrlFor(trackId) {
  const rel = `assets/previews/${trackId}.mp3`;
  return fs.existsSync(path.join(WEB_HTML, rel)) ? `/radio-html/${rel}` : null;
}

// Content library (scripts/build-radio-content.mjs): stylised titles, slugs,
// versions, sanitised-lyrics state, storyline refs. Two-pass by design: run the
// manifest once, then the content build, then the manifest again to merge.
const CONTENT_PATH = path.join(WEB_HTML, "data/radio-content.json");
const contentById = fs.existsSync(CONTENT_PATH)
  ? new Map(readJson(CONTENT_PATH).tracks.map((record) => [record.id, record]))
  : new Map();

// Admin overlay (apps/radio-backend/admin-data.json). Fail-closed merge rules:
// - track/station edits are display + commerce hints only
// - `published` is honoured ONLY with a verified rights proof for that track
// - ads require releaseAllowed:true AND a verified proof to appear at all
const ADMIN_DATA_PATH = path.join(ROOT, "apps/radio-backend/admin-data.json");
const adminData = fs.existsSync(ADMIN_DATA_PATH)
  ? JSON.parse(fs.readFileSync(ADMIN_DATA_PATH, "utf8"))
  : { tracks: {}, stations: {}, ads: [], rightsProofs: [] };
const verifiedProofTrackIds = new Set(
  (adminData.rightsProofs || []).filter((proof) => proof.verified === true).map((proof) => proof.trackId)
);

function contentFieldsFor(trackId) {
  const record = contentById.get(trackId);
  if (!record) return {};
  return {
    slug: record.slug,
    stylizedTitle: record.stylizedTitle,
    artist: record.artist,
    version: record.version,
    versionGroup: record.versionGroup,
    versionCount: record.versionCount,
    lyricsStatus: record.lyricsStatus,
    lrcPath: record.lrcPath,
    hasStoryline: Boolean(record.storyline)
  };
}

function adminTrackOverrides(trackId) {
  const override = (adminData.tracks || {})[trackId];
  if (!override) return {};
  const allowed = {};
  for (const key of ["title", "artist", "priceInr", "priceUsd", "previewSeconds", "freeTier"]) {
    if (override[key] !== undefined) allowed[key] = override[key];
  }
  // Fail-closed publish gate: admin intent alone never publishes.
  if (override.published === true && verifiedProofTrackIds.has(trackId)) {
    allowed.published = true;
    allowed.rightsStatus = "rights-proof-verified";
    allowed.releaseAllowed = true;
  }
  return allowed;
}

const STATIONS = [
  {
    slug: "sanatan-devotional",
    name: "Sanatan & Devotional",
    description: "Bhajan, mantra, Vedic, Sanskrit, aarti, and devotional catalog lane.",
    rule: /(bhajan|mantra|vedic|sanskrit|sanatan|chant|aarti|shankh|\bom\b|shiv|ram|krishna|hanuman|durga|kabir|bhakti)/i
  },
  {
    slug: "sufi-qawwali",
    name: "Sufi & Qawwali",
    description: "Sufi, qawwali, ishq, shrine, zikr, and devotional-fusion lane.",
    rule: /(sufi|qawwali|qawali|ishq|zikr|dargah|khuda|fakir)/i
  },
  {
    slug: "folk-regional",
    name: "Folk & Regional",
    description: "Folk, regional, Haryanvi, Bhojpuri, Rajasthani, Punjabi, and desi lane.",
    rule: /(folk|ragni|haryanvi|rajasthani|bhojpuri|banjara|jugni|punjabi|nautanki|desi)/i
  },
  {
    slug: "hip-hop-rap",
    name: "Hip-Hop & Rap",
    description: "Rap, drill, trap, phonk, cypher, and beat-forward lane.",
    rule: /(rap|hip[- ]?hop|drill|trap|phonk|boom bap|808|cypher)/i
  },
  {
    slug: "classical-raga",
    name: "Classical & Raga",
    description: "Raga, classical, tabla, sitar, sarangi, bansuri, and acoustic lane.",
    rule: /(raga|raag|classical|sarod|sitar|tabla|dhrupad|thumri|santoor|sarangi|bansuri)/i
  },
  {
    slug: "electronic-fusion",
    name: "Electronic & Fusion",
    description: "EDM, trance, synth, ambient, cyber, lo-fi, and fusion lane.",
    rule: /(edm|trance|electronic|synth|techno|lo[- ]?fi|ambient|future|cyber|neon|fusion)/i
  },
  {
    slug: "cinematic-other",
    name: "Cinematic & Other",
    description: "Fallback lane for playable local tracks without a stronger station match.",
    rule: /.*/
  }
];

const buckets = new Map(STATIONS.map((station) => [station.slug, []]));
for (const track of tracks) {
  const station = stationFor(track);
  buckets.get(station.slug).push(track);
}

const stations = STATIONS.map((station) => buildStation(station, buckets.get(station.slug) || []));
const programs = stations.flatMap((station) => station.programs);

// Free tier: the first DEFAULT_FREE_TRACKS tracks of each station (mirrors the album
// freeTracks rule in commerce.ts). Everything else is preview-until-purchased.
const freeTrackIds = new Set(
  stations.flatMap((station) => station.programs.slice(0, DEFAULT_FREE_TRACKS).map((program) => program.trackId))
);
const stationByTrackId = new Map(
  stations.flatMap((station) => station.programs.map((program) => [program.trackId, station.slug]))
);

const songs = tracks.map((track) => ({
  id: track.id,
  title: track.title,
  url: toPublicPath(track.audioRelativePath),
  coverUrl: toPublicPath(track.coverRelativePath),
  durationSeconds: track.durationSeconds,
  model: track.model,
  tags: track.tags,
  sourceCreatedAt: track.createdAt,
  stationSlug: stationByTrackId.get(track.id) || null,
  // commerce lane (TrackLike shape): null prices fall back to DEFAULT_SINGLE_PRICE
  albumId: null,
  priceInr: null,
  priceUsd: null,
  previewSeconds: DEFAULT_PREVIEW_SECONDS,
  previewUrl: previewUrlFor(track.id),
  freeTier: freeTrackIds.has(track.id),
  accessTier: freeTrackIds.has(track.id) ? "free" : "paid",
  // rights lane (fail-closed): published flips only after rights closure + promotion
  published: false,
  rightsStatus: null,
  releaseAllowed: false,
  // content library + admin overlay (admin publish requires verified proof)
  ...contentFieldsFor(track.id),
  ...adminTrackOverrides(track.id)
}));

const manifest = {
  id: "radio-vaigyaaniq-online-offline-engine",
  generatedAt,
  status: "local-engine-contract",
  verificationState: "offline-playback-local-catalog-live-streams-null",
  source: {
    sunoLatestList: "apps/web/public/radio-html/data/suno-latest-list.json",
    externalNetworkSync: false,
    liveStreamRegistry: null,
    weatherProvider: null,
    adTraffickingSystem: null
  },
  phkd: {
    fabricatedStations: false,
    fabricatedPrograms: false,
    fabricatedAds: false,
    fabricatedWeather: false,
    liveStreamsVerified: false,
    commercialRightsVerified: false,
    adRightsVerified: false,
    weatherProviderVerified: false,
    unknownValues: "NULL",
    note:
      "Stations and sequence schedules are derived from the local playable catalog. Live stream URLs, ad campaigns, weather provider credentials, and commercial release rights remain NULL until independently verified."
  },
  counts: {
    sourceTracks: latest.counts?.manifestRows || tracks.length,
    playableTracks: tracks.length,
    stations: stations.length,
    programs: programs.length,
    ads: 0,
    weatherProviders: 0,
    offlineSongs: songs.length,
    freeTracks: songs.filter((song) => song.freeTier).length,
    previewClips: songs.filter((song) => song.previewUrl).length,
    contentEnriched: songs.filter((song) => song.stylizedTitle).length,
    adminPublished: songs.filter((song) => song.published === true).length
  },
  content: {
    available: contentById.size > 0,
    library: contentById.size ? "/radio-html/data/radio-content.json" : null,
    tracks: contentById.size,
    note: "Storylines/redactions load from the content library at runtime; storylines are editorial drafts derived from metadata."
  },
  // Mirrors packages/shared/src/commerce.ts. mode is "operator-demo" until rights
  // closure publishes tracks; the engine then enforces full/preview/locked strictly.
  commerce: {
    mode: "operator-demo",
    currencyDefault: "INR",
    singlePriceMinor: DEFAULT_SINGLE_PRICE,
    allAccessPriceMinor: ALL_ACCESS_PRICE,
    freeTracksPerStation: DEFAULT_FREE_TRACKS,
    previewSecondsDefault: DEFAULT_PREVIEW_SECONDS,
    previewClipsAvailable: songs.filter((song) => song.previewUrl).length,
    note: "Prices are server-authoritative (Next.js /api/payments/order). These values are display hints only; no entitlement exists without a signature-verified webhook."
  },
  engine: {
    apiBaseDefault: null,
    indexedDbName: "RadioVaigyaaniqEngineDB",
    serviceWorker: "/radio-html/sw.js",
    audioMode: "html-audio-with-web-audio-gain",
    adInsertionMode: "blocked-no-verified-ad-inventory",
    weatherAnnouncementMode: "blocked-provider-null",
    scheduleMode: "sequence-only-startTime-null"
  },
  stations,
  ads: [],
  weather: {
    status: "blocked-provider-null",
    provider: null,
    defaultCity: null,
    apiKeyRequired: "WEATHER_API_KEY",
    announcementText: null
  },
  offlineBundle: {
    generatedAt,
    // Anonymous rights posture (no entitlements): free tracks may cache full audio,
    // everything else is preview-only. The backend /api/offline-bundle recomputes
    // this per user with real entitlements from the shared database.
    policy: {
      free: "full-audio",
      purchased: "full-audio (backend, per verified entitlement)",
      paidUnentitled: "preview-clip when available, else playback clamped at 45s",
      ads: "blocked (fail-closed)"
    },
    songs: songs.map((song) => ({
      ...song,
      offlinePolicy: song.freeTier ? "full" : song.previewUrl ? "preview-clip" : "preview-clamp-45s",
      offlineUrl: song.freeTier ? song.url : song.previewUrl || song.url
    })),
    programs: programs.map((program) => ({
      id: program.id,
      title: program.title,
      stationSlug: program.stationSlug,
      url: program.audioUrl,
      coverUrl: program.coverUrl,
      durationSeconds: program.durationSeconds,
      freeTier: program.freeTier,
      previewUrl: program.previewUrl
    })),
    ads: [],
    corePaths: [
      "/radio-html/online-offline-radio-engine.html",
      "/radio-html/data/radio-engine-manifest.json",
      "/radio-html/data/radio-engine-offline-bundle.json",
      "/radio-html/assets/js/radio-engine.js",
      "/radio-html/sw.js"
    ],
    cachePaths: [
      "/radio-html/online-offline-radio-engine.html",
      "/radio-html/data/radio-engine-manifest.json",
      "/radio-html/assets/js/radio-engine.js",
      "/radio-html/sw.js",
      // free-tier full audio first, then preview clips, then a bounded cover set
      ...songs.filter((song) => song.freeTier).map((song) => song.url),
      ...songs.filter((song) => !song.freeTier && song.previewUrl).slice(0, 120).map((song) => song.previewUrl),
      ...songs.slice(0, 120).map((song) => song.coverUrl)
    ].filter(Boolean)
  }
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  fs.mkdirSync(path.join(htmlRoot, "data"), { recursive: true });
  fs.mkdirSync(path.join(htmlRoot, "assets/js"), { recursive: true });
  writeJson(path.join(htmlRoot, "data/radio-engine-manifest.json"), manifest);
  fs.writeFileSync(path.join(htmlRoot, "data/radio-engine-offline-bundle.json"), `${JSON.stringify(manifest.offlineBundle)}\n`);
  fs.writeFileSync(path.join(htmlRoot, "data/radio-engine-manifest.tsv"), buildTsv(manifest));
  fs.writeFileSync(path.join(htmlRoot, "online-offline-radio-engine.html"), buildHtml(manifest));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
}

console.log(`radio-engine stations=${manifest.counts.stations}`);
console.log(`radio-engine programs=${manifest.counts.programs}`);
console.log(`radio-engine playableTracks=${manifest.counts.playableTracks}`);
console.log(`radio-engine freeTracks=${manifest.counts.freeTracks}`);
console.log(`radio-engine previewClips=${manifest.counts.previewClips}`);
console.log(`radio-engine ads=${manifest.counts.ads}`);
console.log(`radio-engine weatherProviders=${manifest.counts.weatherProviders}`);

function stationFor(track) {
  const haystack = [track.title, track.rawTags, track.promptPreview, ...(track.tags || [])].filter(Boolean).join(" ");
  return STATIONS.find((station) => station.rule.test(haystack)) || STATIONS.at(-1);
}

function buildStation(station, stationTracks) {
  let offset = 0;
  const programs = stationTracks.map((track, index) => {
    const duration = Number.isFinite(track.durationSeconds) ? Math.round(track.durationSeconds) : null;
    const program = {
      id: `${station.slug}-${track.id}`,
      stationSlug: station.slug,
      trackId: track.id,
      title: track.title,
      description: track.promptPreview || null,
      startTime: null,
      endTime: null,
      estimatedStartOffsetSeconds: offset,
      durationSeconds: duration,
      audioUrl: toPublicPath(track.audioRelativePath),
      coverUrl: toPublicPath(track.coverRelativePath),
      isLive: false,
      sequenceIndex: index + 1,
      scheduleVerificationState: "sequence-only-startTime-null",
      // commerce lane
      albumId: null,
      priceInr: null,
      priceUsd: null,
      previewSeconds: DEFAULT_PREVIEW_SECONDS,
      previewUrl: previewUrlFor(track.id),
      freeTier: index < DEFAULT_FREE_TRACKS,
      accessTier: index < DEFAULT_FREE_TRACKS ? "free" : "paid",
      // rights lane (fail-closed)
      published: false,
      rightsStatus: null,
      releaseAllowed: false,
      // content library + admin overlay (admin publish requires verified proof)
      ...contentFieldsFor(track.id),
      ...adminTrackOverrides(track.id)
    };
    offset += duration || 180;
    return program;
  });

  const first = programs[0];
  // Admin station overlay: display fields only — streamUrl/rights stay fail-closed.
  const stationOverride = (adminData.stations || {})[station.slug] || {};
  return {
    id: station.slug,
    slug: station.slug,
    name: stationOverride.name || station.name,
    description: stationOverride.description || station.description,
    streamUrl: null,
    streamStatus: "NULL_UNVERIFIED",
    fallbackUrl: first?.audioUrl || null,
    cover: first?.coverUrl || null,
    totalPrograms: programs.length,
    totalDurationSeconds: programs.reduce((sum, program) => sum + (program.durationSeconds || 0), 0),
    programs,
    evidence: {
      source: "local-suno-latest-list",
      liveStreamVerified: false,
      rightsVerified: false
    }
  };
}

function buildTsv(data) {
  const header = [
    "stationSlug",
    "stationName",
    "programId",
    "title",
    "sequenceIndex",
    "estimatedStartOffsetSeconds",
    "durationSeconds",
    "audioUrl",
    "streamUrl",
    "rightsStatus",
    "releaseAllowed"
  ];
  const rows = data.stations.flatMap((station) =>
    station.programs.map((program) =>
      [
        station.slug,
        station.name,
        program.id,
        program.title,
        program.sequenceIndex,
        program.estimatedStartOffsetSeconds,
        program.durationSeconds,
        program.audioUrl,
        station.streamUrl,
        program.rightsStatus,
        program.releaseAllowed
      ]
        .map(tsvCell)
        .join("\t")
    )
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(data) {
  const stats = [
    ["Stations", data.counts.stations],
    ["Programs", data.counts.programs],
    ["Free Tracks", data.counts.freeTracks],
    ["Offline Songs", data.counts.offlineSongs],
    ["Ads", data.counts.ads],
    ["Live Streams", "NULL"]
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Vaigyaaniq Online Offline Engine</title>
  <style>
    :root{color-scheme:dark;--bg:#070812;--panel:#121624;--panel2:#191f32;--line:rgba(255,255,255,.12);--text:#f7f4ea;--muted:#aba6c8;--gold:#dfb15b;--cyan:#00f5d4;--orange:#ff6b35;--bad:#ff7272}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0%,rgba(0,245,212,.12),transparent 34%),radial-gradient(circle at 10% 10%,rgba(255,107,53,.16),transparent 32%),#070812;color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
    header{position:sticky;top:0;z-index:5;background:rgba(7,8,18,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(16px)}
    .bar,.wrap{width:min(1280px,calc(100vw - 28px));margin:auto}.bar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 0}
    h1{font-family:Georgia,serif;font-size:clamp(25px,4vw,48px);margin:0}h2,h3{margin:0 0 10px}p{color:var(--muted);line-height:1.55}.pill,.btn{border:1px solid var(--line);border-radius:999px;padding:9px 12px;background:rgba(255,255,255,.05);color:var(--text);text-decoration:none;font-size:12px;cursor:pointer}.btn:hover,.pill:hover{border-color:var(--orange)}
    .wrap{padding:22px 0 40px}.hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:16px}.panel{background:linear-gradient(180deg,rgba(25,31,50,.9),rgba(12,15,26,.9));border:1px solid var(--line);border-radius:18px;padding:18px}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:12px}.stat b{display:block;color:var(--gold);font-size:24px}
    .engine{display:grid;grid-template-columns:330px minmax(0,1fr) 300px;gap:14px;margin-top:16px}.list{display:grid;gap:10px}.station,.program{border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:14px;padding:12px;cursor:pointer}.station.active,.program.active{border-color:var(--cyan);background:rgba(0,245,212,.07)}.station b,.program b{display:block}.station small,.program small,.muted{color:var(--muted)}
    .player{display:grid;grid-template-columns:126px minmax(0,1fr);gap:14px;align-items:center}.cover{width:126px;aspect-ratio:1;border-radius:14px;object-fit:cover;background:#0a0d17;border:1px solid var(--line)}audio{width:100%;margin-top:12px}.controls{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}.status{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);white-space:pre-wrap}
    .blocked{color:var(--bad);border-color:rgba(255,114,114,.35)}.ok{color:var(--cyan);border-color:rgba(0,245,212,.35)}
    .badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:2px 8px;font-size:10px;letter-spacing:.4px}
    .badge-free{color:var(--cyan);border-color:rgba(0,245,212,.4)}.badge-owned{color:var(--gold);border-color:rgba(223,177,91,.45)}
    .badge-preview{color:var(--orange);border-color:rgba(255,107,53,.4)}.badge-locked{color:var(--bad);border-color:rgba(255,114,114,.4)}
    #netStatus{font-size:11px}#netStatus.offline{color:var(--bad);border-color:rgba(255,114,114,.5)}
    .widget{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:12px;margin-bottom:12px}.widget h3{font-size:13px;margin-bottom:6px}.widget b{color:var(--gold)}.widget small{display:block;color:var(--muted);margin-top:4px}
    select.btn{appearance:none;background:var(--panel2)}
    .catalog-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.catalog-head input{flex:1;max-width:420px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:10px 12px}
    .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;max-height:520px;overflow:auto}
    .cat-item{border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:12px;padding:8px;cursor:pointer;display:grid;gap:6px;text-align:left;color:var(--text)}
    .cat-item img{width:100%;aspect-ratio:1;border-radius:8px;object-fit:cover;background:#0a0d17}.cat-item .cat-title{font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .lyrics{max-height:180px;overflow:auto;margin-top:14px;border-top:1px solid var(--line);padding-top:10px}.lyric-line{margin:4px 0;color:var(--muted);font-size:13px}.lyric-line.active{color:var(--cyan)}
    .modal{position:fixed;inset:0;z-index:40;display:grid;place-items:center;background:rgba(4,6,12,.72);backdrop-filter:blur(6px)}.modal[hidden]{display:none}
    .modal-card{width:min(620px,calc(100vw - 32px));max-height:76vh;overflow:auto;background:linear-gradient(180deg,rgba(25,31,50,.98),rgba(12,15,26,.98));border:1px solid var(--line);border-radius:18px;padding:20px}
    .modal-card h3{margin:0 0 4px}.modal-card .provenance{font-size:11px;color:var(--muted);border-top:1px solid var(--line);margin-top:14px;padding-top:10px}
    .now-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}select.btn{appearance:none;background:var(--panel2)}
    @media(max-width:1050px){.hero,.engine{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.bar{display:block}.bar nav{margin-top:12px}.player{grid-template-columns:88px minmax(0,1fr)}.cover{width:88px}.cat-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}}
    @media(max-width:520px){.controls{gap:6px}.btn{padding:7px 9px;font-size:11px}.cat-grid{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
  <header>
    <div class="bar">
      <div>
        <h1>Online / Offline Radio Engine</h1>
        <p>Rights-aware playback, previews &amp; checkout, wallet, offline cache, persona TTS, ad gate, and weather gate.</p>
      </div>
      <nav>
        <span class="pill" id="netStatus">ONLINE</span>
        <a class="pill" href="./standalone-radio.html">Standalone Radio</a>
        <a class="pill" href="./data/radio-engine-manifest.json">Manifest JSON</a>
        <a class="pill" href="./data/radio-engine-manifest.tsv">TSV</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <section class="hero">
      <div class="panel">
        <h2>Engine Status</h2>
        <p>Generated ${escapeHtml(data.generatedAt)}. Live streams, verified ads, weather provider, and commercial rights are not asserted until evidence exists. Free tracks play full; paid tracks preview for ${escapeHtml(data.commerce.previewSecondsDefault)}s until purchased.</p>
        <div class="controls"><span class="btn ok">local fallback ready</span><span class="btn ok">previews + checkout wired</span><span class="btn blocked">live streams NULL</span><span class="btn blocked">ads blocked</span><span class="btn blocked">weather provider NULL</span><span class="btn blocked">rights not closed</span></div>
      </div>
      <div class="panel stats">
        ${stats.map(([label, value]) => `<div class="stat"><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></div>`).join("")}
      </div>
    </section>
    <section class="engine">
      <aside class="panel">
        <h2>Stations</h2>
        <div id="stationList" class="list"></div>
      </aside>
      <section class="panel">
        <h2>Now Playing</h2>
        <div class="player">
          <img id="nowCover" class="cover" alt="">
          <div>
            <h3 id="nowTitle">Select a station</h3>
            <p id="nowMeta">Local manifest loading...</p>
            <div id="nowAccess"></div>
            <div class="now-tools">
              <button class="btn" id="storyToggle" style="display:none">Story</button>
              <select class="btn" id="versionSelect" style="display:none" aria-label="Track version"></select>
            </div>
            <audio id="radioAudio" controls preload="metadata"></audio>
            <div class="controls">
              <button class="btn" id="playFirst">Play First</button>
              <button class="btn" id="agentDj">Agent DJ</button>
              <button class="btn" id="playLive">Live Stream</button>
              <button class="btn" id="nextProgram">Next</button>
              <button class="btn" id="buyCurrent" style="display:none">Buy Track</button>
              <button class="btn" id="giftCurrent">Gift</button>
              <button class="btn" id="cacheStation">Cache Station</button>
              <button class="btn" id="announceWeather">Weather TTS</button>
              <button class="btn" id="playAd">Ad Gate</button>
            </div>
          </div>
        </div>
        <div id="lyricsPanel" class="lyrics"></div>
        <h3 style="margin-top:18px">Program Sequence</h3>
        <div id="scheduleList" class="list"></div>
      </section>
      <aside class="panel">
        <div class="widget">
          <h3>Wallet</h3>
          <div id="walletBox"><b>₹0.00</b> · <b>$0.00</b><small>entitlements: 0</small></div>
          <div class="controls"><button class="btn" id="walletTopUp">Top up</button></div>
        </div>
        <div class="widget">
          <h3>Announcer Persona</h3>
          <select class="btn" id="personaSelect"></select>
        </div>
        <div class="widget">
          <h3>Weather</h3>
          <div id="weatherBox" class="muted">Weather blocked: provider NULL.</div>
        </div>
        <h2>Runtime Log</h2>
        <div id="engineStatus" class="status">Booting...</div>
      </aside>
    </section>
    <section class="panel" style="margin-top:16px">
      <div class="catalog-head">
        <h2 style="margin:0">Catalogue (${escapeHtml(data.counts.offlineSongs)} tracks)</h2>
        <input id="catalogSearch" type="search" placeholder="Search title, tag, station...">
        <span class="pill" id="catalogCount"></span>
      </div>
      <div id="catalogGrid" class="cat-grid"></div>
    </section>
  </main>
  <div class="modal" id="storyModal" hidden role="dialog" aria-modal="true" aria-labelledby="storyTitle">
    <div class="modal-card">
      <h3 id="storyTitle"></h3>
      <p class="muted" id="storyMeta"></p>
      <div id="storyBody"></div>
      <p class="provenance">Editorial draft derived from catalogue metadata (station, theme, styles, lyrics). Not an artist statement; lyric timing unverified.</p>
      <div class="controls"><button class="btn" id="storyClose">Close</button></div>
    </div>
  </div>
  <script src="./assets/js/radio-engine.js"></script>
  <script>
    const radioEngineApi = new URL(location.href).searchParams.get("api") || window.RADIO_ENGINE_API || null;
    window.RadioVaigyaaniqEngine.boot({
      manifestUrl: "./data/radio-engine-manifest.json",
      apiBase: radioEngineApi
    });
  </script>
</body>
</html>`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("online-offline-radio-engine.html")) return;
  const card =
    '      <a href="./online-offline-radio-engine.html"><b>Online Offline Engine</b><small>Local fallback playback, sequence schedules, offline cache manifest, ad gate, and weather gate.</small></a>\n';
  html = html.replace(
    /(\s*<a href="\.\/standalone-radio\.html"><b>Standalone Radio<\/b><small>.*?<\/small><\/a>\n)/s,
    `$1${card}`
  );
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("online-offline-radio-engine.html")) {
    html = html.replace(
      '<a class="pill" href="./suno-latest-list.html">Suno Latest</a>',
      '<a class="pill" href="./suno-latest-list.html">Suno Latest</a><a class="pill" href="./online-offline-radio-engine.html">Engine</a>'
    );
  }
  if (!html.includes("standalone-engine-dock")) {
    html = html.replace("</style>", `${standaloneEngineCss()}\n  </style>`);
    html = html.replace('<section class="layout">', `${standaloneEngineDock()}\n    <section class="layout">`);
    html = html.replace("</body>", `${standaloneEngineScript()}\n</body>`);
  }
  fs.writeFileSync(file, html);
}

function standaloneEngineCss() {
  return `.engine-dock{display:grid;grid-template-columns:280px minmax(0,1fr) 340px;gap:16px;margin:18px 0}.engine-dock .engine-list{max-height:260px;overflow:auto;padding-right:4px}.engine-dock .engine-status{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--muted);white-space:pre-wrap;max-height:260px;overflow:auto}.engine-dock .engine-actions{display:flex;gap:8px;flex-wrap:wrap}.engine-dock .engine-chip{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800}.engine-dock .program{width:100%;text-align:left;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:10px;margin-bottom:8px}.engine-dock .program.active{border-color:var(--cyan);background:rgba(99,230,213,.08)}@media(max-width:1120px){.engine-dock{grid-template-columns:1fr}}`;
}

function standaloneEngineDock() {
  return `<section class="engine-dock" id="standalone-engine-dock">
      <aside class="panel"><div class="panel-head"><h3>Engine Stations</h3><small>runtime</small></div><div class="panel-body"><div id="engineStationList" class="engine-list"></div></div></aside>
      <section class="panel"><div class="panel-head"><h3>Engine Schedule</h3><small>sequence-only</small></div><div class="panel-body"><div class="engine-actions"><button class="engine-chip" id="enginePlayFirst">Play Local</button><button class="engine-chip" id="enginePlayLive">Live</button><button class="engine-chip" id="engineNextProgram">Next</button><button class="engine-chip" id="engineCacheStation">Cache</button><button class="engine-chip" id="engineAnnounceWeather">Weather</button><button class="engine-chip" id="enginePlayAd">Ad Gate</button></div><div id="engineScheduleList" class="engine-list" style="margin-top:10px"></div></div></section>
      <aside class="panel"><div class="panel-head"><h3>Engine Log</h3><small>fail-closed</small></div><div class="panel-body"><div id="engineStatus" class="engine-status">Engine not booted.</div></div></aside>
    </section>`;
}

function standaloneEngineScript() {
  return `<script src="./assets/js/radio-engine.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const radioEngineApi = new URL(location.href).searchParams.get('api') || window.RADIO_ENGINE_API || null;
      window.standaloneRadioEngine = window.RadioVaigyaaniqEngine.boot({
        manifestUrl: './data/radio-engine-manifest.json',
        apiBase: radioEngineApi,
        ids: {
          audio: 'audio',
          status: 'engineStatus',
          stationList: 'engineStationList',
          scheduleList: 'engineScheduleList',
          nowCover: 'nowCover',
          nowTitle: 'nowTitle',
          nowMeta: 'nowMeta',
          playFirst: 'enginePlayFirst',
          playLive: 'enginePlayLive',
          nextProgram: 'engineNextProgram',
          cacheStation: 'engineCacheStation',
          announceWeather: 'engineAnnounceWeather',
          playAd: 'enginePlayAd'
        }
      });
    });
  </script>`;
}

function toPublicPath(relativePath) {
  return relativePath ? `/radio-html/${relativePath.replace(/^\/?radio-html\//, "")}` : null;
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
