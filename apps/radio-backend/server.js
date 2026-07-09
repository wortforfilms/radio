// Radio Vaigyaaniq engine backend.
// Thin layer on top of the Next.js app (apps/web): business logic (pricing, orders,
// webhook verification, rights gates) lives in the Next API routes; this server only
// 1) proxies /api/payments/*, /api/radio-release, /api/search, /api/analytics to Next,
// 2) serves rights-aware offline bundles derived from the real engine manifest,
// 3) reads entitlements/wallets from the single shared Prisma database (read-only),
// 4) accepts offline outbox sync batches (play counts, gift intents) as evidence,
// keeping every PHKD gate fail-closed (ads, weather, live streams, commercial rights).

const crypto = require("node:crypto");
const { execFile } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

loadDotEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 4000);
const MANIFEST_PATH = path.resolve(
  __dirname,
  process.env.RADIO_ENGINE_MANIFEST || "../../apps/web/public/radio-html/data/radio-engine-manifest.json"
);
const STREAM_CANDIDATES_PATH = path.resolve(
  __dirname,
  process.env.RADIO_STREAM_CANDIDATES || "../../apps/web/public/radio-html/data/radio-stream-candidates.json"
);
// The Next.js app that owns all business logic (payments, rights, release evidence).
const NEXT_API_BASE = (process.env.NEXT_API_BASE || "http://localhost:3000").replace(/\/$/, "");
// Prefixes forwarded verbatim to Next. Never duplicated here.
const PROXY_PREFIXES = ["/api/payments/", "/api/radio-release", "/api/search", "/api/analytics"];
const PROXY_GET_CACHE_TTL_MS = Number(process.env.PROXY_GET_CACHE_TTL_MS || 30_000);
const SYNC_EVENTS_PATH = path.resolve(__dirname, process.env.SYNC_EVENTS_FILE || "./sync-events.jsonl");

const proxyGetCache = new Map(); // url -> { at, status, body }
let prismaPromise = null;

const app = createRouter();

app.get("/health", (_req, res) => {
  const manifest = loadManifest();
  res.json({
    status: "ok",
    service: "radio-engine-backend",
    manifest: manifest.id,
    verificationState: manifest.verificationState,
    generatedAt: manifest.generatedAt,
    nextApiBase: NEXT_API_BASE,
    database: Boolean(process.env.DATABASE_URL)
  });
});

app.get("/api/evidence", (_req, res) => {
  const manifest = loadManifest();
  res.json({
    id: manifest.id,
    generatedAt: manifest.generatedAt,
    status: manifest.status,
    verificationState: manifest.verificationState,
    source: manifest.source,
    phkd: manifest.phkd,
    counts: manifest.counts,
    commerce: manifest.commerce || null
  });
});

app.get("/api/stations", (_req, res) => {
  const manifest = loadManifest();
  res.json(withStreamCandidates(manifest.stations));
});

app.get("/api/schedule/:stationSlug", (req, res) => {
  const manifest = loadManifest();
  const station = withStreamCandidates(manifest.stations).find(
    (candidate) => candidate.slug === req.params.stationSlug
  );
  if (!station) {
    res.status(404).json({ error: "Station not found", stationSlug: req.params.stationSlug });
    return;
  }
  res.json(station.programs || []);
});

app.get("/api/ads", (_req, res) => {
  const manifest = loadManifest();
  res.json({
    status: manifest.engine.adInsertionMode,
    rightsVerified: false,
    ads: manifest.ads || []
  });
});

app.get("/api/stream-candidates", (_req, res) => {
  res.json({
    enabled: process.env.ENABLE_TEST_STREAMS === "1",
    registry: loadStreamCandidates()
  });
});

app.get("/api/weather", async (req, res) => {
  const manifest = loadManifest();
  const apiKey = process.env.WEATHER_API_KEY;
  const city = req.query.city || process.env.WEATHER_CITY;

  if (!apiKey || !city) {
    res.json({
      status: "blocked-provider-null",
      provider: manifest.weather.provider,
      city: city || null,
      data: null,
      announcementText: null,
      message: "Weather provider or city is NULL. Set WEATHER_API_KEY and WEATHER_CITY to enable real weather announcements."
    });
    return;
  }

  try {
    const units = process.env.WEATHER_UNITS || "metric";
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("q", city);
    url.searchParams.set("units", units);
    url.searchParams.set("appid", apiKey);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ status: "blocked-weather-provider-error", data });
      return;
    }
    const temp = Math.round(data.main?.temp);
    const description = data.weather?.[0]?.description || "weather unavailable";
    res.json({
      status: "ok",
      provider: "openweathermap",
      city: data.name || city,
      data,
      announcementText: `Current weather in ${data.name || city}: ${description}, temperature ${temp} degrees Celsius.`
    });
  } catch (error) {
    res.status(502).json({ status: "blocked-weather-fetch-failed", error: error.message });
  }
});

// Entitlements + wallets for a user, read from the single shared Prisma database.
// Fail-closed: no database, no client, or any error => empty entitlements.
app.get("/api/entitlements/:userId", async (req, res) => {
  const result = await loadEntitlements(req.params.userId);
  res.json(result);
});

// Rights-aware offline bundle. Per song:
//   freeTier            -> "full"              (free tracks cache full audio)
//   entitlement match   -> "full-entitled"     (purchased tracks cache full audio)
//   preview clip exists -> "preview-clip"      (cache the 45s/60s preview clip only)
//   otherwise           -> "preview-clamp-45s" (no dedicated clip yet; playback clamped client-side)
// Ads stay blocked unless ENABLE_ADS=1 AND the inventory is rights-verified.
app.get("/api/offline-bundle", async (req, res) => {
  const manifest = loadManifest();
  const bundle = manifest.offlineBundle || {};
  const userId = req.query.userId || null;
  const entitlementResult = userId ? await loadEntitlements(userId) : { status: "anonymous", entitlements: [] };
  const entitlements = entitlementResult.entitlements || [];
  const allAccess = entitlements.some((e) => e.scope === "all_access" && e.active !== false);

  const songs = (bundle.songs || []).map((song) => {
    let offlinePolicy = "preview-clamp-45s";
    if (song.freeTier) offlinePolicy = "full";
    else if (allAccess || entitlements.some((e) => matchesEntitlement(e, song))) offlinePolicy = "full-entitled";
    else if (song.previewUrl) offlinePolicy = "preview-clip";
    return { ...song, offlinePolicy, offlineUrl: offlinePolicy === "preview-clip" ? song.previewUrl : song.url };
  });

  const adsEnabled = process.env.ENABLE_ADS === "1";
  const verifiedAds = adsEnabled ? (bundle.ads || []).filter((ad) => ad.releaseAllowed === true) : [];

  const cachePaths = [
    ...(bundle.corePaths || []),
    ...songs
      .filter((song) => song.offlinePolicy === "full" || song.offlinePolicy === "full-entitled")
      .map((song) => song.url),
    ...songs.filter((song) => song.offlinePolicy === "preview-clip").map((song) => song.previewUrl),
    ...songs.map((song) => song.coverUrl)
  ].filter(Boolean);

  res.json({
    generatedAt: bundle.generatedAt,
    userId,
    entitlementSource: entitlementResult.status,
    phkd: {
      failClosed: true,
      commercialRightsVerified: false,
      adsBlocked: !adsEnabled,
      note: "Full audio is cacheable only for free-tier tracks and verified entitlements. Everything else is preview-only."
    },
    counts: {
      songs: songs.length,
      full: songs.filter((song) => song.offlinePolicy.startsWith("full")).length,
      previewClip: songs.filter((song) => song.offlinePolicy === "preview-clip").length,
      previewClamp: songs.filter((song) => song.offlinePolicy === "preview-clamp-45s").length,
      ads: verifiedAds.length
    },
    songs,
    programs: bundle.programs || [],
    ads: verifiedAds,
    cachePaths: [...new Set(cachePaths)]
  });
});

// Offline outbox sync: play counts, gift intents, analytics gathered while offline.
// Events are appended as evidence (JSONL); nothing is fabricated or aggregated here.
app.post("/api/sync", async (req, res) => {
  const body = await req.readJson();
  const events = Array.isArray(body?.events) ? body.events : [];
  if (!events.length) {
    res.status(400).json({ error: "events[] required" });
    return;
  }
  const receivedAt = new Date().toISOString();
  const lines = events
    .slice(0, 500)
    .map((event) => JSON.stringify({ receivedAt, userId: body.userId || null, ...event }));
  fs.appendFileSync(SYNC_EVENTS_PATH, `${lines.join("\n")}\n`);
  res.json({ status: "ok", accepted: lines.length, evidenceFile: path.basename(SYNC_EVENTS_PATH) });
});

// ---------------------------------------------------------------------------
// Admin lane (fail-closed).
// Auth: MVP password from ADMIN_PASSWORD env → stateless bearer token
// (sha256 of the password). requireAdmin() is the single seam to swap in
// OAuth/session auth later. With no ADMIN_PASSWORD set, every admin route
// answers 503 blocked-admin-password-null.
// Data: apps/radio-backend/admin-data.json overlay (stations/programs/tracks/
// ads/rightsProofs). The manifest builder merges it fail-closed: `published`
// is honoured only with a verified rights proof for that track.
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_DATA_PATH = path.resolve(__dirname, process.env.ADMIN_DATA_FILE || "./admin-data.json");
const UPLOADS_DIR = path.resolve(__dirname, "./uploads");
const REPO_ROOT = path.resolve(__dirname, "../..");
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const adminToken = () => crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex");

function requireAdmin(req, res) {
  if (!ADMIN_PASSWORD) {
    res.status(503).json({
      error: "blocked-admin-password-null",
      message: "Set ADMIN_PASSWORD in apps/radio-backend/.env to enable the admin lane (fail-closed)."
    });
    return false;
  }
  const header = String(req.headers.authorization || "");
  if (header !== `Bearer ${adminToken()}`) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

function loadAdminData() {
  if (!fs.existsSync(ADMIN_DATA_PATH)) {
    return { stations: {}, programs: {}, tracks: {}, ads: [], rightsProofs: [], updatedAt: null };
  }
  return JSON.parse(fs.readFileSync(ADMIN_DATA_PATH, "utf8"));
}

function saveAdminData(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(ADMIN_DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

function saveUpload(kind, filename, dataBase64) {
  const buffer = Buffer.from(String(dataBase64 || ""), "base64");
  if (!buffer.length) throw new Error("empty upload");
  if (buffer.length > MAX_UPLOAD_BYTES) throw new Error("upload exceeds 25MB limit");
  const safeName = `${Date.now()}-${String(filename || "upload").replace(/[^\w.\-]+/g, "_")}`;
  const dir = path.join(UPLOADS_DIR, kind);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, safeName);
  fs.writeFileSync(file, buffer);
  return {
    file: path.relative(__dirname, file),
    bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex")
  };
}

app.post("/admin/login", async (req, res) => {
  if (!ADMIN_PASSWORD) {
    res.status(503).json({ error: "blocked-admin-password-null" });
    return;
  }
  const body = await req.readJson();
  if (body?.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "invalid password" });
    return;
  }
  res.json({ token: adminToken(), note: "Send as 'Authorization: Bearer <token>' on /admin/* requests." });
});

app.get("/admin/state", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const data = loadAdminData();
  res.json({
    ...data,
    counts: {
      stationOverrides: Object.keys(data.stations || {}).length,
      programOverrides: Object.keys(data.programs || {}).length,
      trackOverrides: Object.keys(data.tracks || {}).length,
      ads: (data.ads || []).length,
      rightsProofs: (data.rightsProofs || []).length,
      verifiedProofs: (data.rightsProofs || []).filter((proof) => proof.verified === true).length
    },
    phkd: {
      failClosed: true,
      note: "Edits are draft overlays. `published` takes effect only when a verified rights proof exists for the track; ads require releaseAllowed + verified proof; regenerate the manifest to apply."
    }
  });
});

// CRUD overlays: stations (by slug), programs (by id), tracks (by id).
for (const [route, key, idField] of [
  ["/admin/stations", "stations", "slug"],
  ["/admin/programs", "programs", "id"],
  ["/admin/tracks", "tracks", "id"]
]) {
  app.post(route, async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const body = await req.readJson();
    const entry = body?.[key.slice(0, -1)] || body?.entry;
    const id = entry?.[idField];
    if (!body?.op || !id) {
      res.status(400).json({ error: `op + ${key.slice(0, -1)}.${idField} required` });
      return;
    }
    const data = loadAdminData();
    data[key] = data[key] || {};
    if (body.op === "delete") delete data[key][id];
    else data[key][id] = { ...(data[key][id] || {}), ...entry, updatedAt: new Date().toISOString() };
    saveAdminData(data);
    res.json({ status: "ok", op: body.op, [idField]: id, note: "Draft overlay saved. Run radio:engine:manifest to apply (fail-closed gates enforced there)." });
  });
}

// Ads: metadata + optional audio upload. Never released without verified proof.
app.post("/admin/ads", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = await req.readJson();
  if (!body?.op || !body?.ad?.id) {
    res.status(400).json({ error: "op + ad.id required" });
    return;
  }
  const data = loadAdminData();
  data.ads = data.ads || [];
  if (body.op === "delete") {
    data.ads = data.ads.filter((ad) => ad.id !== body.ad.id);
  } else {
    const ad = {
      ...body.ad,
      releaseAllowed: false, // fail-closed: flips only via verified trafficking evidence
      verificationState: "blocked-no-verified-ad-inventory"
    };
    if (body.ad.audioBase64) {
      ad.audio = saveUpload("ads", body.ad.filename, body.ad.audioBase64);
      delete ad.audioBase64;
      delete ad.filename;
    }
    const index = data.ads.findIndex((existing) => existing.id === ad.id);
    if (index >= 0) data.ads[index] = { ...data.ads[index], ...ad };
    else data.ads.push(ad);
  }
  saveAdminData(data);
  res.json({ status: "ok", op: body.op, ads: data.ads.length });
});

// Rights proofs: uploaded documents linked to tracks. `verified` is NEVER set
// here — only the rights-closure verifier (radio:rights:closure lane) flips it.
app.post("/admin/rights-proof", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = await req.readJson();
  if (!body?.trackId || !body?.dataBase64) {
    res.status(400).json({ error: "trackId + dataBase64 required" });
    return;
  }
  let stored;
  try {
    stored = saveUpload("rights-proofs", body.filename, body.dataBase64);
  } catch (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  const data = loadAdminData();
  data.rightsProofs = data.rightsProofs || [];
  data.rightsProofs.push({
    id: `proof-${Date.now()}`,
    trackId: body.trackId,
    note: body.note || null,
    mimeType: body.mimeType || null,
    ...stored,
    uploadedAt: new Date().toISOString(),
    verified: false,
    verifiedBy: null
  });
  saveAdminData(data);
  res.json({
    status: "ok",
    proofs: data.rightsProofs.length,
    phkd: "Proof stored unverified. Run the rights-closure lane (npm run radio:rights:closure) to verify; only then can the track publish."
  });
});

app.get("/admin/cache-status", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const file = path.join(REPO_ROOT, "apps/web/public/radio-html/data/offline-cache-manifest.json");
  if (!fs.existsSync(file)) {
    res.json({ status: "missing", message: "Run npm run radio:offline:sync first." });
    return;
  }
  const report = JSON.parse(fs.readFileSync(file, "utf8"));
  res.json({
    status: "ok",
    generatedAt: report.generatedAt,
    counts: report.counts,
    phkd: report.phkd,
    sample: (report.entries || []).slice(0, 40).map(({ id, title, policy, status }) => ({ id, title, policy, status }))
  });
});

app.post("/admin/resync", (req, res) => {
  if (!requireAdmin(req, res)) return;
  execFile("node", ["scripts/download-offline-assets.mjs"], { cwd: REPO_ROOT, timeout: 120_000 }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message, stderr: String(stderr).slice(-800) });
      return;
    }
    res.json({ status: "ok", output: String(stdout).trim().split("\n") });
  });
});

// ---------------------------------------------------------------------------
// Agent orchestrator (Phase 1 — rule engine; LLM opt-in via AGENT_LLM_PROVIDER).
// POST /agent/decide: perception in → validated, fail-closed actions out.
// The agent never executes anything itself — the engine is the action layer.
// ---------------------------------------------------------------------------
const { decide } = require("./agent.js");
const { ask, llmConfig } = require("./cognition-llm.js");

// Knowledge lane dependencies for Phase-2 cognition (real data only).
let contentLibraryCache = null;
function loadContentLibrary() {
  if (contentLibraryCache) return contentLibraryCache;
  const file = path.join(REPO_ROOT, "apps/web/public/radio-html/data/radio-content.json");
  contentLibraryCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")).tracks || [] : [];
  return contentLibraryCache;
}

async function remoteKnowledgeSearch(query) {
  // Existing knowledge-graph search in the Next.js app (proxied lane).
  const response = await fetch(`${NEXT_API_BASE}/api/search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) return [];
  const data = await response.json();
  const rows = Array.isArray(data) ? data : data.results || data.nodes || [];
  return rows.slice(0, 3).map((row) => ({
    title: row.title || row.name || "knowledge entry",
    url: `/search?q=${encodeURIComponent(query)}`,
    ref: `knowledge-graph:${row.id || row.title || "entry"}`,
    excerpt: String(row.summary || row.description || row.content || row.title || "").slice(0, 420)
  }));
}

function trackValidator(entitlements) {
  const manifest = loadManifest();
  const byTrack = new Map(
    (manifest.offlineBundle?.songs || []).map((song) => [song.id, song])
  );
  return (trackId) => {
    const song = byTrack.get(String(trackId || "").replace(/^content-library:/, ""));
    if (!song) return { exists: false };
    const entitled = (entitlements || []).some(
      (e) => e.active !== false && (e.scope === "all_access" || (e.scope === "track" && e.trackId === song.id))
    );
    return {
      exists: true,
      title: song.stylizedTitle || song.title,
      access: song.freeTier || entitled ? "full" : "preview"
    };
  };
}

function loadAgentPolicy() {
  const file = path.join(REPO_ROOT, "apps/radio/public/registry/agent-policy.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

app.get("/agent/capabilities", (_req, res) => {
  const policy = loadAgentPolicy();
  if (!policy) {
    res.status(503).json({ error: "agent-policy-not-built", message: "Run `npm run radio:registry` first." });
    return;
  }
  res.json(policy);
});

app.post("/agent/decide", async (req, res) => {
  const policy = loadAgentPolicy();
  if (!policy) {
    res.status(503).json({ error: "agent-policy-not-built", message: "Run `npm run radio:registry` first." });
    return;
  }
  const perception = (await req.readJson()) || {};
  // server-side perception enrichment: entitlements from the shared db (fail-closed)
  if (perception.userId && !perception.entitlements) {
    const result = await loadEntitlements(perception.userId);
    perception.entitlements = result.entitlements;
  }
  const manifest = loadManifest();
  const decision = decide(perception, { stations: manifest.stations || [], policy });
  res.json(decision);
});

// Phase-2 cognition: natural-language queries, sources-only, fail-closed.
app.post("/agent/ask", async (req, res) => {
  const policy = loadAgentPolicy();
  if (!policy) {
    res.status(503).json({ error: "agent-policy-not-built", message: "Run `npm run radio:registry` first." });
    return;
  }
  const body = (await req.readJson()) || {};
  if (!body.query || !String(body.query).trim()) {
    res.status(400).json({ error: "query required" });
    return;
  }
  let entitlements = body.entitlements || [];
  if (body.userId && !body.entitlements) {
    entitlements = (await loadEntitlements(body.userId)).entitlements;
  }
  const persona = ["maataa", "rishi", "samaya", "vigyaaniq"].includes(body.persona)
    ? body.persona
    : policy.policy.daypartPersona[
        (body.hour ?? new Date().getHours()) < 10 && (body.hour ?? new Date().getHours()) >= 5
          ? "morning"
          : (body.hour ?? new Date().getHours()) < 17
            ? "day"
            : (body.hour ?? new Date().getHours()) < 22
              ? "evening"
              : "night"
      ];
  const context = {
    stationName: body.stationName || null,
    currentTrackTitle: body.currentTrackTitle || null,
    daypart: body.daypart || null,
    weather: body.weather || null,
    entitlements
  };
  const result = await ask(String(body.query), context, persona, body.history || [], {
    contentLibrary: loadContentLibrary(),
    remoteSearch: remoteKnowledgeSearch,
    validateTrack: trackValidator(entitlements),
    policy: policy.policy
  });
  res.json({ decidedAt: new Date().toISOString(), engine: "cognition-llm", persona, provider: llmConfig().provider, ...result });
});

// ---------------------------------------------------------------------------
// Manifest API (read-only).
// Serves the GENERATED registry artifacts — the runtime never queries the
// registry sources (compile-time philosophy: registry → compile → artifacts
// → runtime). External tools, dashboards, and IDE extensions consume these.
// ---------------------------------------------------------------------------
const MANIFEST_DIR = path.resolve(__dirname, process.env.MANIFEST_DIR || "../../apps/radio/public/registry");
const manifestCache = new Map(); // file -> { mtimeMs, data }

function readManifestFile(name) {
  const file = path.join(MANIFEST_DIR, name);
  if (!fs.existsSync(file)) return null;
  const { mtimeMs } = fs.statSync(file);
  const cached = manifestCache.get(name);
  if (cached && cached.mtimeMs === mtimeMs) return cached.data;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  manifestCache.set(name, { mtimeMs, data });
  return data;
}

const manifestUnavailable = (res) =>
  res.status(503).json({
    error: "manifest-not-built",
    message: "Run `npm run radio:registry` to generate the compiled manifest artifacts."
  });

app.get("/manifest", (_req, res) => {
  const compiled = readManifestFile("compiled-manifest.json");
  if (!compiled) return manifestUnavailable(res);
  res.json({
    id: compiled.id,
    compiledAt: compiled.compiledAt,
    schemaVersion: compiled.schemaVersion,
    sourceHash: compiled.sourceHash,
    counts: compiled.counts,
    endpoints: [
      "/manifest/routes", "/manifest/routes/:id", "/manifest/components", "/manifest/layouts",
      "/manifest/tokens", "/manifest/content-types", "/manifest/workflows", "/manifest/platforms",
      "/manifest/graph", "/manifest/navigation", "/manifest/search", "/manifest/permissions",
      "/manifest/openapi", "/manifest/workspace"
    ]
  });
});

app.get("/manifest/routes", (_req, res) => {
  const compiled = readManifestFile("compiled-manifest.json");
  if (!compiled) return manifestUnavailable(res);
  res.json({ count: compiled.routes.length, routes: compiled.routes });
});

app.get("/manifest/routes/:id", (req, res) => {
  const compiled = readManifestFile("compiled-manifest.json");
  if (!compiled) return manifestUnavailable(res);
  const route = compiled.routes.find((candidate) => candidate.id === req.params.id);
  if (!route) {
    res.status(404).json({ error: "unknown route id", id: req.params.id });
    return;
  }
  res.json({
    route,
    componentTree: compiled.componentTrees.find((tree) => tree.route === route.id) || null,
    impact: compiled.graph.impact[`route:${route.id}`] || []
  });
});

for (const [routePath, key] of [
  ["/manifest/components", "components"],
  ["/manifest/layouts", "layouts"],
  ["/manifest/tokens", "tokens"],
  ["/manifest/content-types", "contentTypes"],
  ["/manifest/workflows", "workflows"],
  ["/manifest/workspace", "workspaceApps"]
]) {
  app.get(routePath, (_req, res) => {
    const compiled = readManifestFile("compiled-manifest.json");
    if (!compiled) return manifestUnavailable(res);
    res.json(compiled[key]);
  });
}

for (const [routePath, file] of [
  ["/manifest/platforms", "platform-map.json"],
  ["/manifest/graph", "manifest-graph.json"],
  ["/manifest/navigation", "navigation.json"],
  ["/manifest/search", "search.json"],
  ["/manifest/permissions", "permissions.json"],
  ["/manifest/openapi", "openapi.json"]
]) {
  app.get(routePath, (_req, res) => {
    const data = readManifestFile(file);
    if (!data) return manifestUnavailable(res);
    res.json(data);
  });
}

app.listen(PORT, () => {
  console.log(`Radio engine backend listening on http://localhost:${PORT}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
  console.log(`Proxying business API to: ${NEXT_API_BASE}`);
  console.log(`Test streams enabled: ${process.env.ENABLE_TEST_STREAMS === "1"}`);
});

function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

function loadStreamCandidates() {
  if (!fs.existsSync(STREAM_CANDIDATES_PATH)) {
    return {
      id: "radio-vaigyaaniq-public-stream-candidates",
      status: "missing",
      candidates: []
    };
  }
  return JSON.parse(fs.readFileSync(STREAM_CANDIDATES_PATH, "utf8"));
}

function matchesEntitlement(entitlement, song) {
  if (entitlement.active === false) return false;
  if (entitlement.scope === "track") return entitlement.trackId === song.id;
  if (entitlement.scope === "album") return Boolean(song.albumId) && entitlement.albumId === song.albumId;
  return false;
}

// Single shared database (the Next.js app's Prisma schema). Lazy + fail-closed.
function getPrisma() {
  if (!process.env.DATABASE_URL) return Promise.resolve(null);
  if (!prismaPromise) {
    prismaPromise = import("@prisma/client")
      .then((mod) => new mod.PrismaClient())
      .catch(() => null);
  }
  return prismaPromise;
}

async function loadEntitlements(userId) {
  if (!userId) return { status: "blocked-user-null", entitlements: [], wallets: [] };
  const prisma = await getPrisma();
  if (!prisma) {
    return {
      status: "blocked-entitlement-source-null",
      message: "DATABASE_URL not set or Prisma client unavailable. Entitlements fail closed to none.",
      entitlements: [],
      wallets: []
    };
  }
  try {
    const [entitlements, wallets] = await Promise.all([
      prisma.entitlement.findMany({ where: { userId } }),
      prisma.wallet.findMany({ where: { userId } })
    ]);
    return {
      status: "ok",
      entitlements: entitlements.map((e) => ({
        scope: e.scope,
        trackId: e.trackId ?? null,
        albumId: e.albumId ?? null,
        active: e.active ?? true
      })),
      wallets: wallets.map((w) => ({ currency: w.currency, balance: w.balance }))
    };
  } catch (error) {
    return { status: "blocked-entitlement-query-failed", error: error.message, entitlements: [], wallets: [] };
  }
}

async function proxyToNext(incoming, response, url) {
  const target = `${NEXT_API_BASE}${url.pathname}${url.search}`;
  if (incoming.method === "GET") {
    const cached = proxyGetCache.get(target);
    if (cached && Date.now() - cached.at < PROXY_GET_CACHE_TTL_MS) {
      response.status(cached.status).json(cached.body);
      return;
    }
  }
  try {
    const init = { method: incoming.method, headers: { "content-type": incoming.headers["content-type"] || "application/json" } };
    if (incoming.method !== "GET" && incoming.method !== "HEAD") {
      init.body = await readRawBody(incoming);
      // Razorpay webhook signature verification needs the exact raw body + header.
      if (incoming.headers["x-razorpay-signature"]) {
        init.headers["x-razorpay-signature"] = incoming.headers["x-razorpay-signature"];
      }
    }
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
    if (incoming.method === "GET" && upstream.ok) {
      proxyGetCache.set(target, { at: Date.now(), status: upstream.status, body });
    }
    response.status(upstream.status).json(body);
  } catch (error) {
    response.status(502).json({
      error: "UPSTREAM_UNAVAILABLE",
      target,
      message: `Next.js API not reachable (${error.message}). Business logic lives there; this backend does not duplicate it.`
    });
  }
}

function createRouter() {
  const routes = [];
  return {
    get(pattern, handler) {
      routes.push({ method: "GET", pattern, handler });
    },
    post(pattern, handler) {
      routes.push({ method: "POST", pattern, handler });
    },
    listen(port, callback) {
      const server = http.createServer(async (incoming, outgoing) => {
        const url = new URL(incoming.url, `http://${incoming.headers.host || "localhost"}`);
        const response = createResponse(outgoing);
        if (incoming.method === "OPTIONS") {
          response.status(204).end();
          return;
        }
        // Thin proxy lane: forward business API calls to the Next.js app untouched.
        if (PROXY_PREFIXES.some((prefix) => url.pathname === prefix.replace(/\/$/, "") || url.pathname.startsWith(prefix))) {
          await proxyToNext(incoming, response, url);
          return;
        }
        for (const route of routes) {
          const params = matchRoute(route.pattern, url.pathname);
          if (route.method === incoming.method && params) {
            try {
              await route.handler(
                {
                  params,
                  query: Object.fromEntries(url.searchParams),
                  path: url.pathname,
                  headers: incoming.headers,
                  readJson: async () => {
                    const raw = await readRawBody(incoming);
                    try {
                      return JSON.parse(raw.toString("utf8"));
                    } catch {
                      return null;
                    }
                  }
                },
                response
              );
            } catch (error) {
              response.status(500).json({ error: error.message });
            }
            return;
          }
        }
        response.status(404).json({ error: "Not found", path: url.pathname });
      });
      server.listen(port, callback);
      return server;
    }
  };
}

function readRawBody(incoming) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    incoming.on("data", (chunk) => chunks.push(chunk));
    incoming.on("end", () => resolve(Buffer.concat(chunks)));
    incoming.on("error", reject);
  });
}

function createResponse(outgoing) {
  const headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-razorpay-signature,authorization"
  };
  let statusCode = 200;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      outgoing.writeHead(statusCode, { ...headers, "content-type": "application/json" });
      outgoing.end(JSON.stringify(value));
    },
    end() {
      outgoing.writeHead(statusCode, headers);
      outgoing.end();
    }
  };
}

function matchRoute(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(":")) params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    else if (patternPart !== pathPart) return null;
  }
  return params;
}

function withStreamCandidates(stations) {
  if (process.env.ENABLE_TEST_STREAMS !== "1") return stations;
  const registry = loadStreamCandidates();
  const bySlug = new Map((registry.candidates || []).map((candidate) => [candidate.stationSlug, candidate]));
  return stations.map((station) => {
    const candidate = bySlug.get(station.slug);
    if (!candidate) return station;
    return {
      ...station,
      streamUrl: candidate.streamUrl,
      streamStatus: "CANDIDATE_PUBLIC_STREAM_OPT_IN",
      streamCandidate: {
        name: candidate.name,
        sourcePage: candidate.sourcePage,
        playlistUrl: candidate.playlistUrl,
        status: candidate.status,
        commercialRightsVerified: false,
        rebroadcastRightsVerified: false
      },
      evidence: {
        ...(station.evidence || {}),
        liveStreamVerified: false,
        source: "radio-stream-candidates"
      }
    };
  });
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}
