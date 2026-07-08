import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const WEB_PUBLIC = path.join(ROOT, "apps/web/public");
const generatedAt = new Date().toISOString();

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "target",
  ".pytest_cache",
  ".mypy_cache",
  "__pycache__"
]);

const omitted = {
  appleDouble: 0,
  excludedDirectories: {}
};

const repoFiles = walkFiles(ROOT);
const repoDirs = buildDirectorySummaries(repoFiles);
const radioFiles = repoFiles.filter((entry) => entry.path.startsWith("apps/web/public/radio-html/"));
const desktopRadioFiles = repoFiles.filter((entry) =>
  entry.path.startsWith("apps/desktop/public/radio-html/")
);

const doc = {
  id: "radio-vaigyaaniq-full-tree-detail",
  generatedAt,
  scope: {
    repositoryRoot: ".",
    servedRadioHtml: "apps/web/public/radio-html",
    desktopMirror: "apps/desktop/public/radio-html"
  },
  phkd: {
    fabricatedRoutes: false,
    fabricatedFiles: false,
    omittedAppleDoubleSidecars: true,
    omittedBuildCaches: true,
    unknownValues: "NULL",
    note:
      "Generated from the local filesystem. AppleDouble sidecars and dependency/build cache directories are omitted from product tree counts."
  },
  counts: {
    repositoryFiles: repoFiles.length,
    repositoryDirectories: repoDirs.length,
    radioHtmlFiles: radioFiles.length,
    desktopRadioHtmlFiles: desktopRadioFiles.length,
    omittedAppleDouble: omitted.appleDouble,
    totalBytes: sum(repoFiles.map((entry) => entry.sizeBytes)),
    radioHtmlBytes: sum(radioFiles.map((entry) => entry.sizeBytes)),
    desktopRadioHtmlBytes: sum(desktopRadioFiles.map((entry) => entry.sizeBytes))
  },
  topLevel: topLevelSummaries(repoFiles),
  radioHtml: {
    root: "apps/web/public/radio-html",
    directories: repoDirs.filter((dir) => dir.path.startsWith("apps/web/public/radio-html")),
    files: radioFiles,
    typeCounts: typeCounts(radioFiles),
    categoryCounts: categoryCounts(radioFiles)
  },
  repository: {
    directories: repoDirs,
    files: repoFiles,
    typeCounts: typeCounts(repoFiles),
    categoryCounts: categoryCounts(repoFiles)
  }
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  fs.writeFileSync(path.join(dataRoot, "full-tree-detail.json"), `${JSON.stringify(doc)}\n`);
  fs.writeFileSync(path.join(dataRoot, "full-tree-detail.tsv"), buildTsv(doc.repository.files));
  fs.writeFileSync(path.join(htmlRoot, "full-tree-detail.html"), buildHtml(doc));
  updateHtmlIndex(path.join(htmlRoot, "index.html"));
  updateStandaloneRadio(path.join(htmlRoot, "standalone-radio.html"));
}

console.log(`repositoryFiles=${doc.counts.repositoryFiles}`);
console.log(`radioHtmlFiles=${doc.counts.radioHtmlFiles}`);
console.log(`radioHtmlBytes=${formatBytes(doc.counts.radioHtmlBytes)}`);
console.log(`desktopRadioHtmlFiles=${doc.counts.desktopRadioHtmlFiles}`);
console.log(`omittedAppleDouble=${doc.counts.omittedAppleDouble}`);

function walkFiles(root) {
  const results = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name.startsWith("._")) {
        omitted.appleDouble += 1;
        continue;
      }
      const absolute = path.join(current, entry.name);
      const relative = rel(absolute);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) {
          omitted.excludedDirectories[relative] = (omitted.excludedDirectories[relative] || 0) + 1;
          continue;
        }
        stack.push(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      const stat = fs.statSync(absolute);
      results.push(fileEntry(relative, stat));
    }
  }
  return results.sort((a, b) => a.path.localeCompare(b.path));
}

function fileEntry(relativePath, stat) {
  const ext = extension(relativePath);
  const parent = path.posix.dirname(relativePath);
  const route = routeFor(relativePath);
  const category = categoryFor(relativePath, ext);
  return {
    path: relativePath,
    name: path.posix.basename(relativePath),
    parent,
    depth: relativePath.split("/").length - 1,
    extension: ext || "none",
    category,
    kind: kindFor(ext, relativePath),
    sizeBytes: stat.size,
    size: formatBytes(stat.size),
    route,
    status: statusFor(relativePath),
    detail: detailFor(relativePath, category),
    modifiedAt: stat.mtime.toISOString()
  };
}

function buildDirectorySummaries(files) {
  const dirs = new Map();
  for (const file of files) {
    const parts = file.path.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      const dirPath = parts.slice(0, index).join("/");
      if (!dirs.has(dirPath)) {
        dirs.set(dirPath, {
          path: dirPath,
          name: path.posix.basename(dirPath),
          parent: path.posix.dirname(dirPath),
          depth: dirPath.split("/").length - 1,
          fileCount: 0,
          sizeBytes: 0,
          size: "0 B",
          categories: {}
        });
      }
      const dir = dirs.get(dirPath);
      dir.fileCount += 1;
      dir.sizeBytes += file.sizeBytes;
      dir.categories[file.category] = (dir.categories[file.category] || 0) + 1;
    }
  }
  return [...dirs.values()]
    .map((dir) => ({ ...dir, size: formatBytes(dir.sizeBytes) }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function topLevelSummaries(files) {
  const groups = new Map();
  for (const file of files) {
    const top = file.path.includes("/") ? file.path.split("/")[0] : "root-files";
    if (!groups.has(top)) {
      groups.set(top, {
        path: top,
        fileCount: 0,
        sizeBytes: 0,
        size: "0 B",
        categories: {},
        purpose: purposeForTopLevel(top)
      });
    }
    const group = groups.get(top);
    group.fileCount += 1;
    group.sizeBytes += file.sizeBytes;
    group.categories[file.category] = (group.categories[file.category] || 0) + 1;
  }
  return [...groups.values()]
    .map((group) => ({ ...group, size: formatBytes(group.sizeBytes) }))
    .sort((a, b) => b.sizeBytes - a.sizeBytes || a.path.localeCompare(b.path));
}

function typeCounts(files) {
  const counts = {};
  for (const file of files) counts[file.extension] = (counts[file.extension] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([extension, count]) => ({ extension, count }));
}

function categoryCounts(files) {
  const counts = {};
  for (const file of files) counts[file.category] = (counts[file.category] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => ({ category, count }));
}

function buildTsv(files) {
  const header = [
    "path",
    "parent",
    "name",
    "extension",
    "category",
    "kind",
    "sizeBytes",
    "size",
    "route",
    "status",
    "detail",
    "modifiedAt"
  ];
  const rows = files.map((file) =>
    [
      file.path,
      file.parent,
      file.name,
      file.extension,
      file.category,
      file.kind,
      file.sizeBytes,
      file.size,
      file.route || "NULL",
      file.status,
      file.detail,
      file.modifiedAt
    ]
      .map(tsvCell)
      .join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(data) {
  const bootstrap = JSON.stringify({
    generatedAt: data.generatedAt,
    counts: data.counts,
    topLevel: data.topLevel,
    radioTypeCounts: data.radioHtml.typeCounts,
    radioCategoryCounts: data.radioHtml.categoryCounts
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Vaigyaaniq Full Tree Detail</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#eef4f8;--muted:#94a3b8;--line:rgba(255,255,255,.12);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 18% 0%,rgba(255,138,61,.17),transparent 32rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input,select{font:inherit}.shell{width:min(1500px,calc(100vw - 28px));margin:auto;padding:18px 0 36px}.topbar{position:sticky;top:0;z-index:20;background:rgba(7,10,15,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.topbar-inner{width:min(1500px,calc(100vw - 28px));margin:auto;display:flex;align-items:center;gap:14px;padding:12px 0}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.brand h1{font-size:18px;margin:0}.brand small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none;cursor:pointer}.hero{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;border-bottom:1px solid var(--line);padding:28px 0 22px}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.hero h2{font-size:clamp(2rem,5vw,5rem);line-height:.95;margin:9px 0 10px}.hero p{color:#cbd5df;max-width:880px;font-size:1.05rem}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px;max-width:820px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;min-width:430px}.stat{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.04)}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.grid{display:grid;grid-template-columns:330px minmax(0,1fr);gap:16px;margin-top:18px}.panel{background:linear-gradient(180deg,rgba(16,23,32,.94),rgba(11,16,23,.96));border:1px solid var(--line);border-radius:8px;overflow:hidden}.panel-head{padding:14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:10px;align-items:center}.panel-head h3{margin:0;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}.panel-body{padding:12px}.search,.select{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff;margin-bottom:10px}.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.card{border:1px solid var(--line);border-radius:8px;padding:12px;background:rgba(255,255,255,.04)}.card b{display:block;font-size:16px}.card span{display:block;color:var(--muted);font-size:12px}.tree-list{max-height:74vh;overflow:auto;padding-right:4px}.row{display:grid;grid-template-columns:minmax(0,1fr) 100px 118px 92px;gap:10px;align-items:center;border:1px solid var(--line);background:rgba(255,255,255,.035);border-radius:8px;padding:9px 10px;margin-bottom:7px}.path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.path small{display:block;color:var(--muted);font-family:Inter,ui-sans-serif,system-ui}.tag{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:4px 7px;text-align:center;color:#d9e5ed}.route{color:var(--cyan);text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.muted{color:var(--muted)}.details{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:16px}.list{display:flex;flex-wrap:wrap;gap:6px}.chip{border:1px solid var(--line);border-radius:999px;padding:5px 8px;color:#dfe7ee;background:rgba(255,255,255,.04);font-size:12px}@media(max-width:1050px){.grid,.hero{grid-template-columns:1fr}.stats{min-width:0}.row{grid-template-columns:1fr 80px}.row .tag:nth-of-type(2),.row .route{display:none}}@media(max-width:640px){.shell,.topbar-inner{width:min(100vw - 18px,1500px)}.actions{display:none}.stats{grid-template-columns:1fr 1fr}}
  </style>
</head>
<body>
  <header class="topbar"><div class="topbar-inner"><div class="mark">RV</div><div class="brand"><h1>Full Tree Detail</h1><small>Repository, Radio HTML, assets, data, routes, scripts, tests</small></div><nav class="actions"><a class="pill" href="./standalone-radio.html">Standalone Radio</a><a class="pill" href="./data/full-tree-detail.json">Data JSON</a><a class="pill" href="./data/full-tree-detail.tsv">TSV</a></nav></div></header>
  <main class="shell">
    <section class="hero"><div><span class="eyebrow">Filesystem-derived tree</span><h2>Full project map with detail</h2><p>Live tree generated from the local workspace. Search every included file, inspect sizes, routes, categories, and product purpose.</p><p class="guard">PHKD: no fake files or routes. AppleDouble sidecars and dependency/build caches are omitted from product counts.</p></div><div class="stats"><article class="stat"><span>Repo files</span><b>${data.counts.repositoryFiles.toLocaleString()}</b></article><article class="stat"><span>Radio HTML</span><b>${data.counts.radioHtmlFiles.toLocaleString()}</b></article><article class="stat"><span>Radio size</span><b>${formatBytes(data.counts.radioHtmlBytes)}</b></article></div></section>
    <section class="details"><article class="panel"><div class="panel-head"><h3>Top Level</h3></div><div class="panel-body summary" id="topLevel"></div></article><article class="panel"><div class="panel-head"><h3>Radio Types</h3></div><div class="panel-body"><div class="list" id="typeCounts"></div></div></article><article class="panel"><div class="panel-head"><h3>Radio Categories</h3></div><div class="panel-body"><div class="list" id="categoryCounts"></div></div></article></section>
    <section class="grid">
      <aside class="panel"><div class="panel-head"><h3>Filters</h3><small id="matchCount">0</small></div><div class="panel-body"><input class="search" id="search" placeholder="Search path, category, route, detail..."><select class="select" id="scope"><option value="radio">Radio HTML only</option><option value="repo">Full repository</option></select><select class="select" id="category"><option value="all">All categories</option></select><button class="pill" id="loadLocalData" type="button">Load local JSON</button><input id="fileImport" type="file" accept="application/json" hidden><p class="muted">File mode may block auto-load. Use Load local JSON and choose data/full-tree-detail.json.</p></div></aside>
      <section class="panel"><div class="panel-head"><h3>Tree Rows</h3><small>full data in JSON/TSV</small></div><div class="panel-body"><div class="tree-list" id="treeList"></div></div></section>
    </section>
  </main>
  <script id="tree-bootstrap" type="application/json">${bootstrap}</script>
  <script>
    const BOOTSTRAP = JSON.parse(document.getElementById('tree-bootstrap').textContent);
    let DATA = null;
    const state = { scope: 'radio', category: 'all', search: '' };
    const $ = (id) => document.getElementById(id);
    const normalize = (value) => String(value || '').toLowerCase();
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    function bootSummary() {
      $('topLevel').innerHTML = BOOTSTRAP.topLevel.map((item) => '<article class="card"><b>' + escapeHtml(item.path) + '</b><span>' + item.fileCount.toLocaleString() + ' files · ' + item.size + '</span><span>' + escapeHtml(item.purpose) + '</span></article>').join('');
      $('typeCounts').innerHTML = BOOTSTRAP.radioTypeCounts.map((item) => '<span class="chip">' + escapeHtml(item.extension) + ': ' + item.count.toLocaleString() + '</span>').join('');
      $('categoryCounts').innerHTML = BOOTSTRAP.radioCategoryCounts.map((item) => '<span class="chip">' + escapeHtml(item.category) + ': ' + item.count.toLocaleString() + '</span>').join('');
    }
    async function bootData() {
      try {
        const response = await fetch('./data/full-tree-detail.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('DATA_FETCH_FAILED_' + response.status);
        DATA = await response.json();
        hydrateFilters();
        render();
      } catch (error) {
        $('treeList').innerHTML = '<div class="card">Tree data could not be auto-loaded. Use Load local JSON and choose data/full-tree-detail.json.</div>';
      }
    }
    function hydrateFilters() {
      const cats = [...new Set(DATA.repository.files.map((file) => file.category))].sort();
      $('category').innerHTML = '<option value="all">All categories</option>' + cats.map((cat) => '<option>' + escapeHtml(cat) + '</option>').join('');
    }
    function filtered() {
      if (!DATA) return [];
      const rows = state.scope === 'repo' ? DATA.repository.files : DATA.radioHtml.files;
      const term = normalize(state.search);
      return rows.filter((file) => {
        if (state.category !== 'all' && file.category !== state.category) return false;
        if (term && !normalize([file.path, file.category, file.kind, file.route, file.detail, file.status].join(' ')).includes(term)) return false;
        return true;
      });
    }
    function render() {
      const rows = filtered();
      $('matchCount').textContent = rows.length.toLocaleString();
      $('treeList').innerHTML = rows.map((file) => '<article class="row"><div class="path" title="' + escapeHtml(file.path) + '">' + indent(file.depth) + escapeHtml(file.path) + '<small>' + escapeHtml(file.detail) + '</small></div><span class="tag">' + escapeHtml(file.size) + '</span><span class="tag">' + escapeHtml(file.category) + '</span>' + (file.route ? '<a class="route" href="' + escapeHtml(file.route.replace(/^\\/radio-html\\//, './')) + '">' + escapeHtml(file.route) + '</a>' : '<span class="muted">NULL</span>') + '</article>').join('');
    }
    function indent(depth) {
      return '&nbsp;'.repeat(Math.max(0, depth - 1) * 2);
    }
    $('search').addEventListener('input', (event) => { state.search = event.target.value; render(); });
    $('scope').addEventListener('change', (event) => { state.scope = event.target.value; render(); });
    $('category').addEventListener('change', (event) => { state.category = event.target.value; render(); });
    $('loadLocalData').addEventListener('click', () => $('fileImport').click());
    $('fileImport').addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      DATA = JSON.parse(await file.text());
      hydrateFilters();
      render();
    });
    bootSummary();
    bootData();
  </script>
</body>
</html>
`;
}

function extension(file) {
  const ext = path.extname(file).replace(/^\./, "").toLowerCase();
  return ext || "";
}

function routeFor(file) {
  if (!file.startsWith("apps/web/public/")) return null;
  return `/${path.relative(WEB_PUBLIC, path.join(ROOT, file)).replaceAll(path.sep, "/")}`;
}

function categoryFor(file, ext) {
  if (file.includes("/assets/audio/")) return "audio";
  if (file.includes("/assets/covers/")) return "cover";
  if (file.includes("/assets/images/")) return "image";
  if (file.includes("/assets/icons/")) return "icon";
  if (file.includes("/assets/shaders/")) return "shader";
  if (file.includes("/data/")) return "data";
  if (file.includes("/surfaces/")) return "surface";
  if (file.includes("/routes/")) return "route";
  if (file.includes("/qa/")) return "qa-evidence";
  if (file.includes("/proposals/") || file.startsWith("proposals/")) return "proposal";
  if (file.startsWith("scripts/")) return "script";
  if (file.startsWith("tests/")) return "test";
  if (file.startsWith("prisma/")) return "database";
  if (file.startsWith("packages/")) return "package";
  if (file.startsWith("apps/")) return ext === "html" ? "app-html" : "app";
  if (file.startsWith("_radio_index/")) return "source-index";
  if (file.startsWith("hkd3d/")) return "hkd3d";
  if (file.startsWith("lipi/")) return "lipi";
  if (file.startsWith("integrations/")) return "integration";
  if (["json", "csv", "tsv"].includes(ext)) return "data";
  if (ext === "html") return "html";
  if (["md", "txt"].includes(ext)) return "document";
  return "other";
}

function kindFor(ext, file) {
  if (file.endsWith(".test.ts")) return "test";
  if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
  if (["jpg", "jpeg", "png", "svg", "webp", "gif"].includes(ext)) return "image";
  if (["json", "csv", "tsv"].includes(ext)) return "structured-data";
  if (["html", "css", "js", "mjs", "ts", "tsx"].includes(ext)) return "code-or-surface";
  if (["md", "txt"].includes(ext)) return "document";
  if (["sql", "prisma"].includes(ext)) return "database";
  return "file";
}

function statusFor(file) {
  if (file.includes("/data/") || file.includes("/qa/") || file.includes("evidence")) return "evidence-or-data";
  if (file.includes("/assets/audio/") || file.includes("/assets/covers/")) return "local-media";
  if (file.includes("/surfaces/") || file.endsWith(".html")) return "served-surface";
  if (file.startsWith("tests/")) return "test-contract";
  if (file.startsWith("scripts/")) return "generator";
  return "tracked-local";
}

function detailFor(file, category) {
  if (category === "audio") return "Local audio media file used by Radio playback/runtime.";
  if (category === "cover") return "Local cover image paired with catalog tracks/albums.";
  if (category === "data") return "Runtime, evidence, catalog, matrix, or export data artifact.";
  if (category === "surface" || category === "app-html" || category === "html") {
    return "Served HTML surface or product route artifact.";
  }
  if (category === "script") return "Generator, importer, verifier, or product-factory command.";
  if (category === "test") return "Vitest or integration contract.";
  if (category === "database") return "Prisma schema, migration, seed, or database config.";
  if (category === "source-index") return "Raw/local Radio source index, media, lyrics, backup, or playlist data.";
  if (category === "proposal") return "Commercial/proposal artifact.";
  if (category === "qa-evidence") return "QA screenshot, validation, or evidence artifact.";
  return "Workspace file.";
}

function purposeForTopLevel(top) {
  return {
    _radio_index: "Raw Radio source catalog, media, lyrics, backups, imports, playlists.",
    apps: "Web, desktop, Radio, and HKD3D application surfaces.",
    packages: "Shared graph/search/runtime/package code.",
    prisma: "Database schema, migrations, seeds.",
    scripts: "Generators, importers, proof lanes, release checks.",
    tests: "Automated product and evidence contracts.",
    hkd3d: "HKD3D asset/runtime scaffold.",
    lipi: "Lipi civilization/script knowledge assets.",
    integrations: "External adapter scaffolds such as HDFC UPI parser.",
    proposals: "Proposal and commercial artifacts."
  }[top] || "Workspace root file group.";
}

function updateHtmlIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("full-tree-detail.html")) return;
  const card =
    '      <a href="./full-tree-detail.html"><b>Full Tree Detail</b><small>Filesystem-derived repository and Radio HTML tree with sizes, routes, categories, and PHKD omissions.</small></a>\n';
  if (html.includes('<a href="./standalone-radio.html"')) {
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
  if (html.includes("full-tree-detail.html")) return;
  html = html.replace(
    '<a class="pill" href="./lyrics-prompter.html">Lyrics Prompter</a>',
    '<a class="pill" href="./lyrics-prompter.html">Lyrics Prompter</a><a class="pill" href="./full-tree-detail.html">Full Tree</a>'
  );
  fs.writeFileSync(file, html);
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/") || ".";
}

function formatBytes(value) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(value || 0);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  const precision = unit === 0 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(precision)} ${units[unit]}`;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
