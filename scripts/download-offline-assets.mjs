// Rights-aware offline cache planner/downloader for the radio engine.
//
// Reads the offline bundle (local manifest or a backend /api/offline-bundle) and
// records, per track, which asset is allowed offline:
//   full            (free tier)            -> full audio
//   full-entitled   (verified entitlement) -> full audio (backend bundles only)
//   preview-clip                            -> dedicated preview clip
//   preview-clamp-45s                       -> no clip generated yet; the engine clamps
//                                              playback, and public builds must run
//                                              scripts/suno-previews.mjs first
//
// Default mode only verifies local files (a cache manifest). Remote downloads
// require --allow-remote. --public restricts the plan to what a public build may
// ship offline (free full audio + preview clips only).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const MANIFEST_PATH = path.join(WEB_HTML, "data/radio-engine-manifest.json");
const generatedAt = new Date().toISOString();

const args = new Set(process.argv.slice(2));
const allowRemote = args.has("--allow-remote");
const publicBuild = args.has("--public");
const apiArg = process.argv.find((arg) => arg.startsWith("--api="));
const apiBase = apiArg ? apiArg.slice("--api=".length).replace(/\/$/, "") : null;

const bundle = apiBase ? await readApiBundle(apiBase) : readJson(MANIFEST_PATH).offlineBundle;

const songEntries = (bundle.songs || []).map((song) => ({
  id: song.id,
  title: song.title,
  policy: song.offlinePolicy || (song.freeTier ? "full" : "preview-clamp-45s"),
  url: song.offlineUrl || song.url,
  coverUrl: song.coverUrl || null
}));
const programEntries = (bundle.programs || [])
  .filter((program) => program.url)
  .map((program) => ({
    id: program.id,
    title: program.title,
    policy: program.freeTier ? "full" : program.previewUrl ? "preview-clip" : "preview-clamp-45s",
    url: program.freeTier ? program.url : program.previewUrl || program.url,
    coverUrl: program.coverUrl || null
  }));
const adEntries = (bundle.ads || []).map((ad) => ({ id: ad.id, title: ad.name || ad.title, policy: "ad", url: ad.url }));

let entries = [...songEntries, ...programEntries, ...adEntries].filter((entry) => entry.url);
let previewPending = 0;
if (publicBuild) {
  // Public builds must not ship full audio for unentitled paid tracks.
  previewPending = entries.filter((entry) => entry.policy === "preview-clamp-45s").length;
  entries = entries.filter((entry) => entry.policy === "full" || entry.policy === "full-entitled" || entry.policy === "preview-clip");
}

const report = {
  id: "radio-vaigyaaniq-offline-cache-manifest",
  generatedAt,
  status: publicBuild ? "public-cache-plan" : "local-cache-plan",
  source: apiBase || "apps/web/public/radio-html/data/radio-engine-manifest.json",
  phkd: {
    remoteDownloadsAllowed: allowRemote,
    publicBuild,
    fabricatedAssets: false,
    commercialRightsVerified: false,
    unknownValues: "NULL",
    note:
      "Default mode records a cache manifest only. Remote downloads require --allow-remote and must still pass rights review before release. Public builds (--public) exclude full audio for unentitled paid tracks; run scripts/suno-previews.mjs to generate their preview clips."
  },
  counts: {
    requestedEntries: entries.length,
    localExisting: 0,
    remoteDownloaded: 0,
    remoteSkipped: 0,
    missing: 0,
    previewPendingClip: previewPending,
    byPolicy: countBy(entries, (entry) => entry.policy)
  },
  entries: []
};

for (const entry of entries) {
  const result = await processEntry(entry);
  report.entries.push(result);
  report.counts[result.countKey] += 1;
}

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  fs.mkdirSync(path.join(htmlRoot, "data"), { recursive: true });
  fs.writeFileSync(path.join(htmlRoot, "data/offline-cache-manifest.json"), `${JSON.stringify(report)}\n`);
  fs.writeFileSync(path.join(htmlRoot, "data/offline-cache-manifest.tsv"), buildTsv(report));
}

console.log(`offline-cache requested=${report.counts.requestedEntries}`);
console.log(`offline-cache localExisting=${report.counts.localExisting}`);
console.log(`offline-cache remoteDownloaded=${report.counts.remoteDownloaded}`);
console.log(`offline-cache remoteSkipped=${report.counts.remoteSkipped}`);
console.log(`offline-cache missing=${report.counts.missing}`);
console.log(`offline-cache previewPendingClip=${report.counts.previewPendingClip}`);
console.log(`offline-cache byPolicy=${JSON.stringify(report.counts.byPolicy)}`);

async function processEntry(entry) {
  const url = entry.url;
  const publicPath = String(url).replace(/^\/radio-html\//, "");
  const localPath = path.join(WEB_HTML, publicPath);
  if (fs.existsSync(localPath)) {
    return {
      id: entry.id,
      title: entry.title,
      url,
      policy: entry.policy,
      status: "local-existing",
      countKey: "localExisting",
      localPath: path.relative(ROOT, localPath),
      bytes: fs.statSync(localPath).size
    };
  }

  if (/^https?:\/\//i.test(url)) {
    if (!allowRemote) {
      return { id: entry.id, title: entry.title, url, policy: entry.policy, status: "remote-skipped", countKey: "remoteSkipped", localPath: null, bytes: null };
    }
    const response = await fetch(url);
    if (!response.ok) {
      return { id: entry.id, title: entry.title, url, policy: entry.policy, status: "missing", countKey: "missing", localPath: null, bytes: null };
    }
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return {
      id: entry.id,
      title: entry.title,
      url,
      policy: entry.policy,
      status: "remote-downloaded",
      countKey: "remoteDownloaded",
      localPath: path.relative(ROOT, localPath),
      bytes: buffer.length
    };
  }

  return { id: entry.id, title: entry.title, url, policy: entry.policy, status: "missing", countKey: "missing", localPath: null, bytes: null };
}

async function readApiBundle(api) {
  const response = await fetch(`${api}/api/offline-bundle`);
  if (!response.ok) throw new Error(`Unable to fetch offline bundle: ${response.status}`);
  return response.json();
}

function countBy(list, keyFn) {
  const out = {};
  for (const item of list) {
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function buildTsv(data) {
  const header = ["id", "title", "url", "policy", "status", "localPath", "bytes"];
  const rows = data.entries.map((entry) =>
    [entry.id, entry.title, entry.url, entry.policy, entry.status, entry.localPath, entry.bytes].map(tsvCell).join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
