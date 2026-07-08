import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const SOURCE_INSTALLER = path.join(ROOT, "scripts/install-radio-vaigyaaniq.sh");
const generatedAt = new Date().toISOString();
const remote = gitRemote() || "https://github.com/wortforfilms/radio.git";
const rawInstallUrl =
  "https://raw.githubusercontent.com/wortforfilms/radio/main/apps/web/public/radio-html/install-radio-vaigyaaniq.sh";

const evidence = {
  tauri: readJson("tauri-readiness.json"),
  installer: readJson("installer-evidence.json"),
  pipeline: readJson("installer-pipeline.json"),
  signing: readJson("signing-notarization-evidence.json"),
  desktopAlpha: readJson("desktop-alpha-bundle.json"),
  customerRelease: readJson("customer-release-milestone.json"),
  playback: readJson("playback-gate.json"),
  rights: readJson("rights-closure-report.json"),
  releaseReview: readJson("release-review-report.json")
};

const discoveredArtifacts = discoverArtifacts();
const releaseAllowed = evidence.customerRelease?.phkd?.releaseAllowed === true;
const productionReady = evidence.customerRelease?.phkd?.productionReady === true;
const signedArtifacts =
  Number(evidence.installer?.counts?.signedArtifacts || 0) +
  Number(evidence.signing?.counts?.signedArtifacts || 0);
const notarizedArtifacts =
  Number(evidence.installer?.counts?.notarizedArtifacts || 0) +
  Number(evidence.signing?.counts?.notarizedArtifacts || 0);
const playableAudio = Number(evidence.customerRelease?.counts?.playableAudio || 0);

const channels = [
  {
    id: "download-desktop",
    label: "Download Desktop",
    intent: "Signed desktop app download",
    status: canDownloadDesktop() ? "available" : "blocked",
    availability: canDownloadDesktop() ? "customer-download" : "not-available",
    url: canDownloadDesktop() ? discoveredArtifacts[0]?.url || null : null,
    command: null,
    reason: canDownloadDesktop()
      ? "Signed and notarized desktop installer evidence is present."
      : "No signed/notarized desktop installer artifact is available.",
    evidenceRefs: [
      "/radio-html/data/desktop-alpha-bundle.json",
      "/radio-html/data/installer-evidence.json",
      "/radio-html/data/signing-notarization-evidence.json"
    ],
    requiredEvidence: [
      "signed installer artifact",
      "notarization ticket",
      "Gatekeeper assessment",
      "GUI smoke screenshot",
      "release review approval"
    ]
  },
  {
    id: "launch-cloud",
    label: "Launch Cloud",
    intent: "Open hosted cloud app",
    status: "blocked",
    availability: "cloud-url-null",
    url: null,
    command: null,
    reason: "Cloud deployment URL and cloud smoke evidence are NULL.",
    evidenceRefs: ["/radio-html/data/customer-release-milestone.json", "/radio-html/data/release-review-report.json"],
    requiredEvidence: [
      "deployment URL",
      "HTTPS certificate",
      "cloud health check",
      "customer-front smoke",
      "release review approval"
    ]
  },
  {
    id: "install-github",
    label: "Install From GitHub",
    intent: "Developer/source preview checkout",
    status: "source-preview",
    availability: "available-for-local-source-review",
    url: remote.replace(/\s+\(fetch\)$/i, ""),
    command: `git clone ${remoteUrlOnly(remote)} radio && cd radio && npm ci && npm run radio:install:channels`,
    reason: "GitHub source checkout is available, but this is not a signed customer installer.",
    evidenceRefs: ["/radio-html/data/install-channels.json"],
    requiredEvidence: ["git remote", "package scripts", "local npm install"]
  },
  {
    id: "apple-store",
    label: "Apple Store",
    intent: "macOS/iOS App Store listing",
    status: "blocked",
    availability: "store-listing-null",
    url: null,
    command: null,
    reason: "Apple Store listing, Developer ID/App Store signing, notarization, review, and release approvals are NULL.",
    evidenceRefs: ["/radio-html/data/signing-notarization-evidence.json", "/radio-html/data/installer-signing-proof.json"],
    requiredEvidence: [
      "Apple developer account",
      "bundle identifier",
      "signed app archive",
      "notarization or App Store review",
      "store listing URL"
    ]
  },
  {
    id: "play-store",
    label: "Play Store",
    intent: "Android Play Store listing",
    status: "blocked",
    availability: "mobile-build-null",
    url: null,
    command: null,
    reason: "Android APK/AAB, signing key, Play Console listing, and review evidence are NULL.",
    evidenceRefs: ["/radio-html/data/installer-evidence.json", "/radio-html/data/customer-release-milestone.json"],
    requiredEvidence: [
      "Android package",
      "AAB/APK artifact",
      "signing key proof",
      "Play Console listing",
      "review approval"
    ]
  },
  {
    id: "curl-install",
    label: "curl Install",
    intent: "Scripted source-preview install",
    status: "source-preview",
    availability: "local-script-prepared",
    url: "install-radio-vaigyaaniq.sh",
    command: `curl -fsSL ${rawInstallUrl} | bash`,
    localCommand: "curl -fsSL http://127.0.0.1:3000/radio-html/install-radio-vaigyaaniq.sh | bash",
    reason:
      "curl installer is a source-preview bootstrap only. It clones the repository and runs npm install; it does not install a signed desktop/mobile app.",
    evidenceRefs: ["/radio-html/install-radio-vaigyaaniq.sh", "/radio-html/data/install-channels.json"],
    requiredEvidence: ["git", "npm", "source checkout", "local generator run"]
  }
];

const report = {
  id: "radio-vaigyaaniq-install-channels",
  generatedAt,
  status: "install-distribution-fail-closed",
  verificationState: "source-preview-only",
  source: {
    remote,
    installerScript: "scripts/install-radio-vaigyaaniq.sh"
  },
  phkd: {
    fabricatedDownloads: false,
    fabricatedStoreListings: false,
    fabricatedCloudLaunch: false,
    releaseAllowed,
    productionReady,
    unknownValues: "NULL",
    note:
      "Only source-preview install commands are exposed as runnable. Desktop downloads, cloud launch, and app stores remain blocked until evidence exists."
  },
  counts: {
    channels: channels.length,
    blocked: channels.filter((channel) => channel.status === "blocked").length,
    sourcePreview: channels.filter((channel) => channel.status === "source-preview").length,
    available: channels.filter((channel) => channel.status === "available").length,
    discoveredInstallerArtifacts: discoveredArtifacts.length,
    signedArtifacts,
    notarizedArtifacts,
    playableAudio,
    releaseAllowed: releaseAllowed ? 1 : 0,
    productionReady: productionReady ? 1 : 0
  },
  artifacts: discoveredArtifacts,
  channels
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  writeJson(path.join(dataRoot, "install-channels.json"), report);
  fs.writeFileSync(path.join(dataRoot, "install-channels.tsv"), buildTsv(report));
  fs.copyFileSync(SOURCE_INSTALLER, path.join(htmlRoot, "install-radio-vaigyaaniq.sh"));
  fs.writeFileSync(path.join(htmlRoot, "install.html"), buildHtml(report));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
  updateLyricsBook(path.join(htmlRoot, "lyrics-book.html"));
  updateTauriSurface(path.join(htmlRoot, "surfaces/tauri-readiness.html"));
}

console.log(`install-channels=${report.counts.channels}`);
console.log(`blocked=${report.counts.blocked}`);
console.log(`source-preview=${report.counts.sourcePreview}`);
console.log(`desktop-artifacts=${report.counts.discoveredInstallerArtifacts}`);

function canDownloadDesktop() {
  return releaseAllowed && signedArtifacts > 0 && notarizedArtifacts > 0 && discoveredArtifacts.length > 0;
}

function discoverArtifacts() {
  const roots = [
    "apps/desktop/src-tauri/target/release/bundle",
    "apps/desktop/src-tauri/target/universal-apple-darwin/release/bundle",
    "apps/web/public/radio-html/downloads"
  ];
  const extensions = new Set([".dmg", ".pkg", ".msi", ".exe", ".AppImage", ".apk", ".ipa"]);
  const artifacts = [];
  for (const relRoot of roots) {
    const root = path.join(ROOT, relRoot);
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        const absolute = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(absolute);
        else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
          const relative = path.relative(ROOT, absolute).replaceAll(path.sep, "/");
          artifacts.push({
            path: relative,
            url: relative.startsWith("apps/web/public/radio-html/")
              ? relative.replace("apps/web/public/radio-html/", "")
              : null,
            bytes: fs.statSync(absolute).size,
            signed: false,
            notarized: false,
            status: "local-unsigned-or-unverified"
          });
        }
      }
    }
  }
  return artifacts.sort((a, b) => a.path.localeCompare(b.path));
}

function buildTsv(report) {
  const header = ["id", "label", "status", "availability", "url", "command", "reason", "requiredEvidence"];
  const rows = report.channels.map((channel) =>
    [
      channel.id,
      channel.label,
      channel.status,
      channel.availability,
      channel.url || "NULL",
      channel.command || "NULL",
      channel.reason,
      channel.requiredEvidence.join(" | ")
    ]
      .map(tsvCell)
      .join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(report) {
  const bootstrap = JSON.stringify(report).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Vaigyaaniq Install</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--ink:#f3f7fb;--muted:#9aa8b7;--line:rgba(255,255,255,.13);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676;--ok:#8be29d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 18% 0%,rgba(255,138,61,.16),transparent 32rem),radial-gradient(circle at 90% 10%,rgba(99,230,213,.12),transparent 28rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.48 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.shell{width:min(1420px,calc(100vw - 28px));margin:auto;padding:18px 0 42px}.top{display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.top h1{margin:0;font-size:20px}.top small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.hero{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;margin:24px 0}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.hero h2{font-size:clamp(2.4rem,7vw,6.3rem);line-height:.92;margin:10px 0 14px}.hero p{max-width:830px;color:#cbd5df;font-size:1.06rem}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;min-width:520px}.stat,.card{border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:8px}.stat{padding:12px}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:12px}.card{padding:14px;display:flex;flex-direction:column;gap:10px}.card h3{margin:0;font-size:21px}.status{display:inline-flex;align-self:flex-start;border:1px solid var(--line);border-radius:999px;padding:5px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:900}.status.blocked{color:#ffd4d4;border-color:rgba(255,118,118,.42);background:rgba(255,118,118,.08)}.status.source-preview{color:var(--cyan);border-color:rgba(99,230,213,.42);background:rgba(99,230,213,.08)}.status.available{color:var(--ok);border-color:rgba(139,226,157,.42);background:rgba(139,226,157,.08)}.reason{color:#d7e1e9}.muted{color:var(--muted)}pre{white-space:pre-wrap;word-break:break-word;background:#071018;border:1px solid var(--line);border-radius:8px;padding:10px;color:#eaf6ff;margin:0}.refs{display:flex;gap:6px;flex-wrap:wrap}.refs a{color:var(--cyan);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:5px 7px;font-size:12px}@media(max-width:980px){.hero{grid-template-columns:1fr}.stats{min-width:0;grid-template-columns:1fr 1fr}.actions{margin-left:0}.top{align-items:flex-start;flex-wrap:wrap}}@media(max-width:560px){.stats{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="top"><div class="mark">RV</div><div><h1>Radio Vaigyaaniq Install</h1><small>Desktop, cloud, GitHub, store, and curl channels</small></div><nav class="actions"><a class="pill" href="./data/install-channels.json">JSON</a><a class="pill" href="./data/install-channels.tsv">TSV</a><a class="pill" href="./install-radio-vaigyaaniq.sh">curl script</a><a class="pill" href="./surfaces/tauri-readiness.html">Tauri</a></nav></header>
    <section class="hero"><div><span class="eyebrow">Fail-closed distribution</span><h2>Install channels</h2><p>Runnable install actions are limited to source-preview flows. Customer desktop downloads, cloud launch, Apple Store, and Play Store remain blocked until signed artifacts, deployment, store listings, and release approvals exist.</p><p class="guard">PHKD: no fake downloads, no fake store listing, no fake cloud URL. Unknowns stay NULL.</p></div><div class="stats"><article class="stat"><span>Channels</span><b>${report.counts.channels}</b></article><article class="stat"><span>Blocked</span><b>${report.counts.blocked}</b></article><article class="stat"><span>Source Preview</span><b>${report.counts.sourcePreview}</b></article><article class="stat"><span>Release</span><b>${report.counts.releaseAllowed}</b></article></div></section>
    <section class="grid" id="channels"></section>
  </main>
  <script id="install-data" type="application/json">${bootstrap}</script>
  <script>
    const DATA = JSON.parse(document.getElementById('install-data').textContent);
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    const statusClass = (status) => status === 'available' ? 'available' : status === 'source-preview' ? 'source-preview' : 'blocked';
    document.getElementById('channels').innerHTML = DATA.channels.map((channel) => '<article class="card"><span class="status ' + statusClass(channel.status) + '">' + escapeHtml(channel.status) + '</span><h3>' + escapeHtml(channel.label) + '</h3><div class="muted">' + escapeHtml(channel.intent) + '</div><p class="reason">' + escapeHtml(channel.reason) + '</p>' + (channel.url ? '<div><b>URL</b><pre>' + escapeHtml(channel.url) + '</pre></div>' : '<div class="muted">URL: NULL</div>') + (channel.command ? '<div><b>Command</b><pre>' + escapeHtml(channel.command) + '</pre></div>' : '') + (channel.localCommand ? '<div><b>Local Command</b><pre>' + escapeHtml(channel.localCommand) + '</pre></div>' : '') + '<div><b>Required Evidence</b><div class="muted">' + escapeHtml(channel.requiredEvidence.join(' | ')) + '</div></div><div class="refs">' + channel.evidenceRefs.map((ref) => '<a href=".' + escapeHtml(ref.replace('/radio-html', '')) + '">' + escapeHtml(ref.split('/').pop()) + '</a>').join('') + '</div></article>').join('');
  </script>
</body>
</html>
`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("install.html")) return;
  const card =
    '      <a href="./install.html"><b>Install Channels</b><small>Desktop download, cloud launch, GitHub, Apple Store, Play Store, and curl install gates.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/standalone-radio\.html"><b>Standalone Radio<\/b><small>.*?<\/small><\/a>\n)/s, `$1${card}`);
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("./install.html")) return;
  html = html.replace(
    '<a class="pill" href="./possible-albums.html">Album Matrix</a>',
    '<a class="pill" href="./possible-albums.html">Album Matrix</a><a class="pill" href="./install.html">Install</a>'
  );
  fs.writeFileSync(file, html);
}

function updateLyricsBook(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("./install.html")) return;
  html = html.replace(
    '<a class="pill" href="./unique-tracks-with-versions.html">Versions</a>',
    '<a class="pill" href="./unique-tracks-with-versions.html">Versions</a><a class="pill" href="./install.html">Install</a>'
  );
  fs.writeFileSync(file, html);
}

function updateTauriSurface(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("../install.html")) return;
  html = html.replace("</section>", '<article class="surface-card"><span class="surface-label">Install Channels</span><p>Distribution gates for desktop, cloud, GitHub, stores, and curl source preview.</p><div class="surface-controls"><a class="download" href="../install.html">Open Install Channels</a><a class="download" href="../data/install-channels.json">Install JSON</a></div></article></section>');
  fs.writeFileSync(file, html);
}

function readJson(fileName) {
  const file = path.join(WEB_HTML, "data", fileName);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value)}\n`);
}

function gitRemote() {
  const result = spawnSync("git", ["remote", "get-url", "origin"], { cwd: ROOT, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function remoteUrlOnly(value) {
  return String(value || "").replace(/\s+\((fetch|push)\)$/i, "").trim();
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
