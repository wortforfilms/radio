import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const generatedAt = new Date().toISOString();

const CANDIDATE_REPOS = [
  ROOT,
  "/Volumes/LaCie/pprm/tlps.in/maataa-os",
  "/Volumes/LaCie/pprm/tlps.in/maataa-os/shree-finance-os",
  "/Volumes/LaCie/pprm/hemant-samwat/apps/task-manager",
  "/Users/vesahe/revenue/live/maataa-os",
  "/Users/vesahe/revenue/live/mom",
  "/Users/vesahe/Documents/maataa-ui",
  "/Users/vesahe/Documents/GitHub/hkd",
  "/Users/vesahe/Documents/GitHub/vaigyaanik.online",
  "/Users/vesahe/Documents/parinaya",
  "/Users/vesahe/Downloads/aham"
];

const MAX_FILES_PER_REPO = 20000;
const MAX_CONTENT_FILES_PER_REPO = 3500;
const PRUNE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "target",
  "dist",
  "build",
  ".venv",
  "venv",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  "_radio_index",
  "_non_suno",
  "Library",
  "Applications"
]);
const MEDIA_DIR_HINTS = new Set([
  "assets/audio",
  "assets/covers",
  "suno_backup/audio",
  "suno_backup/covers",
  "stardust_import_FULL/audio",
  "stardust_import_FULL/covers"
]);
const RADIO_TERMS = [
  "radio",
  "vaigyaaniq",
  "vaigyaniq",
  "suno",
  "station",
  "broadcast",
  "lyrics-prompter",
  "admin-kanban",
  "prasar",
  "playback-gate"
];
const CONTENT_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".md",
  ".html",
  ".css",
  ".prisma",
  ".sql",
  ".toml",
  ".yaml",
  ".yml",
  ".txt"
]);
const TERM_TESTERS = Object.fromEntries(RADIO_TERMS.map((term) => [term, new RegExp(termBoundaryPattern(term), "i")]));
const TERM_COUNTERS = Object.fromEntries(RADIO_TERMS.map((term) => [term, new RegExp(termBoundaryPattern(term), "gi")]));

const discoveredRepos = uniqueAbsolutePaths(CANDIDATE_REPOS).filter(isGitRepo);
const repositories = discoveredRepos.map(scanRepo).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
const related = repositories.filter((repo) => repo.score > 0);

const report = {
  id: "radio-related-repository-scan",
  generatedAt,
  status: "local-filesystem-scan",
  scope: {
    candidateRepos: CANDIDATE_REPOS,
    pruneDirs: [...PRUNE_DIRS].sort(),
    mediaDirHints: [...MEDIA_DIR_HINTS].sort(),
    terms: RADIO_TERMS,
    matchingPolicy: "token-or-phrase-boundary"
  },
  phkd: {
    fabricatedRepositories: false,
    fabricatedModules: false,
    unknownValues: "NULL",
    note:
      "Repository/module relevance is derived from local filesystem path and content hits. It is a scan heuristic, not proof of production readiness."
  },
  counts: {
    discoveredRepositories: repositories.length,
    radioRelatedRepositories: related.length,
    highRelevance: related.filter((repo) => repo.relevance === "high").length,
    mediumRelevance: related.filter((repo) => repo.relevance === "medium").length,
    lowRelevance: related.filter((repo) => repo.relevance === "low").length
  },
  repositories,
  radioRelatedRepositories: related
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  fs.writeFileSync(path.join(dataRoot, "radio-related-repository-scan.json"), `${JSON.stringify(report)}\n`);
  fs.writeFileSync(path.join(dataRoot, "radio-related-repository-scan.tsv"), buildTsv(report));
  fs.writeFileSync(path.join(htmlRoot, "radio-related-repositories.html"), buildHtml(report));
  updateIndex(path.join(htmlRoot, "index.html"));
  updateStandalone(path.join(htmlRoot, "standalone-radio.html"));
}

console.log(`discoveredRepositories=${report.counts.discoveredRepositories}`);
console.log(`radioRelatedRepositories=${report.counts.radioRelatedRepositories}`);
for (const repo of related.slice(0, 20)) {
  console.log(`${repo.relevance.padEnd(6)} score=${String(repo.score).padStart(4)} ${repo.path}`);
}

function isGitRepo(repoRoot) {
  if (!fs.existsSync(repoRoot)) return false;
  const result = spawnSync("git", ["-C", repoRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  return result.status === 0;
}

function scanRepo(repoRoot) {
  const fileScan = listRepoFiles(repoRoot);
  const files = fileScan.files;
  const packageInfo = readPackageInfo(repoRoot);
  const pathHits = files.filter((file) => hasAnyRadioTerm(file));
  const contentHits = contentMatches(repoRoot, files);
  const moduleDirs = detectModules(files);
  const remote = gitRemote(repoRoot);
  const score =
    pathHits.length * 3 +
    contentHits.totalMatches +
    moduleDirs.length * 5 +
    packageInfo.radioScripts.length * 8 +
    packageInfo.radioDependencies.length * 4 +
    (hasAnyRadioTerm(repoRoot) ? 25 : 0);
  return {
    name: path.basename(repoRoot),
    path: repoRoot,
    remote,
    relevance: score >= 80 ? "high" : score >= 20 ? "medium" : score > 0 ? "low" : "none",
    score,
    fileCountScanned: files.length,
    scanTruncated: fileScan.truncated,
    radioPathHits: pathHits.length,
    contentMatches: contentHits.totalMatches,
    matchedTerms: contentHits.termCounts,
    radioScripts: packageInfo.radioScripts,
    radioDependencies: packageInfo.radioDependencies,
    packageName: packageInfo.name,
    moduleDirs,
    notableFiles: uniqueList([...pathHits.slice(0, 18), ...contentHits.files.slice(0, 18)]).slice(0, 24),
    notes: noteForRepo(repoRoot, score, moduleDirs, fileScan.truncated)
  };
}

function listRepoFiles(repoRoot) {
  const results = [];
  const stack = [repoRoot];
  let truncated = false;
  while (stack.length) {
    if (results.length >= MAX_FILES_PER_REPO) {
      truncated = true;
      break;
    }
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith("._")) continue;
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(repoRoot, absolute).replaceAll(path.sep, "/");
      if (entry.isDirectory()) {
        if (PRUNE_DIRS.has(entry.name)) continue;
        if (isMediaHeavyPath(relative)) continue;
        stack.push(absolute);
      } else if (entry.isFile()) {
        results.push(relative);
      }
    }
  }
  return { files: results.sort(), truncated };
}

function contentMatches(repoRoot, files) {
  const termCounts = Object.fromEntries(RADIO_TERMS.map((term) => [term, 0]));
  const hitFiles = [];
  let totalMatches = 0;
  let scanned = 0;
  for (const file of files) {
    if (scanned >= MAX_CONTENT_FILES_PER_REPO) break;
    if (!CONTENT_EXTS.has(path.extname(file).toLowerCase())) continue;
    const absolute = path.join(repoRoot, file);
    let text = "";
    try {
      const stat = fs.statSync(absolute);
      if (stat.size > 512 * 1024) continue;
      text = fs.readFileSync(absolute, "utf8").toLowerCase();
      scanned += 1;
    } catch {
      continue;
    }
    let fileHit = false;
    for (const term of RADIO_TERMS) {
      const count = countOccurrences(text, term.toLowerCase());
      if (count > 0) {
        termCounts[term] += count;
        totalMatches += count;
        fileHit = true;
      }
    }
    if (fileHit) hitFiles.push(file);
  }
  return {
    totalMatches,
    termCounts: Object.fromEntries(Object.entries(termCounts).filter(([, count]) => count > 0)),
    files: hitFiles
  };
}

function detectModules(files) {
  const candidates = new Set();
  for (const file of files) {
    if (!hasAnyRadioTerm(file)) continue;
    const parts = file.split("/");
    if (parts.length >= 2) candidates.add(parts.slice(0, Math.min(3, parts.length - 1)).join("/"));
    else candidates.add(file);
  }
  return [...candidates].sort().slice(0, 40);
}

function readPackageInfo(repoRoot) {
  const packageFile = path.join(repoRoot, "package.json");
  if (!fs.existsSync(packageFile)) return { name: null, radioScripts: [], radioDependencies: [] };
  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
    const scripts = Object.entries(pkg.scripts || {})
      .filter(([key, value]) => hasAnyRadioTerm(`${key} ${value}`))
      .map(([key, value]) => `${key}: ${value}`);
    const deps = Object.keys({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }).filter((name) =>
      hasAnyRadioTerm(name)
    );
    return {
      name: pkg.name || null,
      radioScripts: scripts,
      radioDependencies: deps
    };
  } catch {
    return { name: null, radioScripts: [], radioDependencies: [] };
  }
}

function gitRemote(repoRoot) {
  const result = spawnSync("git", ["-C", repoRoot, "remote", "-v"], { encoding: "utf8" });
  if (result.status !== 0) return null;
  const first = result.stdout
    .split(/\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return first || null;
}

function noteForRepo(repoRoot, score, moduleDirs, truncated) {
  const suffix = truncated ? " File scan capped for speed." : "";
  if (score === 0) return "No radio-related path/content hits in scanned files.";
  if (repoRoot === ROOT) return `Primary Radio Vaigyaaniq runtime workspace.${suffix}`;
  if (moduleDirs.length) return `Radio-related modules or artifacts detected from paths/content.${suffix}`;
  return `Radio-related content references detected.${suffix}`;
}

function buildTsv(report) {
  const header = [
    "name",
    "path",
    "relevance",
    "score",
    "packageName",
    "radioPathHits",
    "contentMatches",
    "radioScripts",
    "moduleDirs",
    "notableFiles",
    "remote",
    "notes"
  ];
  const rows = report.repositories.map((repo) =>
    [
      repo.name,
      repo.path,
      repo.relevance,
      repo.score,
      repo.packageName || "NULL",
      repo.radioPathHits,
      repo.contentMatches,
      repo.radioScripts.join(" | ") || "NULL",
      repo.moduleDirs.join(" | ") || "NULL",
      repo.notableFiles.join(" | ") || "NULL",
      repo.remote || "NULL",
      repo.notes
    ]
      .map(tsvCell)
      .join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(report) {
  const bootstrap = JSON.stringify({
    generatedAt: report.generatedAt,
    counts: report.counts,
    related: report.radioRelatedRepositories.map((repo) => ({
      name: repo.name,
      path: repo.path,
      relevance: repo.relevance,
      score: repo.score,
      packageName: repo.packageName,
      radioPathHits: repo.radioPathHits,
      contentMatches: repo.contentMatches,
      radioScripts: repo.radioScripts,
      moduleDirs: repo.moduleDirs,
      notableFiles: repo.notableFiles,
      notes: repo.notes
    }))
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Radio Related Repository Scan</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#eef4f8;--muted:#94a3b8;--line:rgba(255,255,255,.12);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,rgba(255,138,61,.16),transparent 32rem),linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui}.shell{width:min(1450px,calc(100vw - 28px));margin:auto;padding:20px 0 36px}.top{display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.top h1{margin:0;font-size:22px}.top small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none}.hero{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;margin:24px 0}.hero h2{font-size:clamp(2rem,5vw,4.8rem);line-height:.95;margin:8px 0}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px;max-width:820px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;min-width:420px}.stat,.repo{border:1px solid var(--line);border-radius:8px;padding:12px;background:rgba(255,255,255,.04)}.stat span,.repo small{display:block;color:var(--muted);font-size:12px}.stat b{font-size:24px}.repo{margin-bottom:10px}.repo h3{margin:0 0 6px}.chips{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0}.chip{border:1px solid var(--line);border-radius:999px;padding:4px 7px;font-size:11px;color:#dfe7ee}.files{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#cfe7f1;font-size:12px;white-space:pre-wrap}.search{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:#0b1119;color:#fff;margin-bottom:12px}@media(max-width:900px){.hero{grid-template-columns:1fr}.stats{min-width:0}.actions{margin-left:0}.top{align-items:flex-start;flex-wrap:wrap}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="top"><div class="mark">RV</div><div><h1>Radio Related Repository Scan</h1><small>Local filesystem scan across known work roots</small></div><nav class="actions"><a class="pill" href="./data/radio-related-repository-scan.json">JSON</a><a class="pill" href="./data/radio-related-repository-scan.tsv">TSV</a><a class="pill" href="./standalone-radio.html">Standalone</a></nav></header>
    <section class="hero"><div><span class="eyebrow">Repository module matrix</span><h2>${report.counts.radioRelatedRepositories} radio-related repos</h2><p class="guard">PHKD: relevance is path/content heuristic only. No production readiness or ownership claim is inferred.</p></div><div class="stats"><article class="stat"><span>Repos found</span><b>${report.counts.discoveredRepositories}</b></article><article class="stat"><span>High</span><b>${report.counts.highRelevance}</b></article><article class="stat"><span>Medium</span><b>${report.counts.mediumRelevance}</b></article></div></section>
    <input class="search" id="search" placeholder="Filter repos, paths, modules...">
    <section id="repoList"></section>
  </main>
  <script id="scan-data" type="application/json">${bootstrap}</script>
  <script>
    const DATA = JSON.parse(document.getElementById('scan-data').textContent);
    const list = document.getElementById('repoList');
    const search = document.getElementById('search');
    const normalize = (value) => String(value || '').toLowerCase();
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    function render() {
      const term = normalize(search.value);
      const repos = DATA.related.filter((repo) => !term || normalize([repo.name, repo.path, repo.packageName, repo.moduleDirs.join(' '), repo.notableFiles.join(' ')].join(' ')).includes(term));
      list.innerHTML = repos.map((repo) => '<article class="repo"><h3>' + escapeHtml(repo.name) + ' <small>' + escapeHtml(repo.path) + '</small></h3><div class="chips"><span class="chip">' + repo.relevance + '</span><span class="chip">score ' + repo.score + '</span><span class="chip">paths ' + repo.radioPathHits + '</span><span class="chip">content ' + repo.contentMatches + '</span></div><small>' + escapeHtml(repo.notes) + '</small><p><b>Modules:</b> ' + escapeHtml(repo.moduleDirs.slice(0, 10).join(' | ') || 'NULL') + '</p><p><b>Scripts:</b> ' + escapeHtml(repo.radioScripts.slice(0, 6).join(' | ') || 'NULL') + '</p><div class="files">' + escapeHtml(repo.notableFiles.slice(0, 12).join('\\n') || 'NULL') + '</div></article>').join('');
    }
    search.addEventListener('input', render);
    render();
  </script>
</body>
</html>
`;
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("radio-related-repositories.html")) return;
  const card =
    '      <a href="./radio-related-repositories.html"><b>Radio Repo Scan</b><small>Local scan of repositories with radio-related modules, scripts, content, and artifacts.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/full-tree-detail\.html"><b>Full Tree Detail<\/b><small>.*?<\/small><\/a>\n)/s, `$1${card}`);
  fs.writeFileSync(file, html);
}

function updateStandalone(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("radio-related-repositories.html")) return;
  html = html.replace(
    '<a class="pill" href="./admin-kanban.html">Admin Kanban</a>',
    '<a class="pill" href="./admin-kanban.html">Admin Kanban</a><a class="pill" href="./radio-related-repositories.html">Repo Scan</a>'
  );
  fs.writeFileSync(file, html);
}

function countOccurrences(text, term) {
  const matcher = TERM_COUNTERS[term];
  if (!matcher) return 0;
  matcher.lastIndex = 0;
  let count = 0;
  let match = matcher.exec(text);
  while (match) {
    count += 1;
    if (matcher.lastIndex === match.index) matcher.lastIndex += 1;
    match = matcher.exec(text);
  }
  return count;
}

function hasAnyRadioTerm(value) {
  return RADIO_TERMS.some((term) => matchesRadioTerm(value, term));
}

function matchesRadioTerm(value, term) {
  const matcher = TERM_TESTERS[term];
  if (!matcher) return false;
  return matcher.test(String(value).toLowerCase());
}

function termBoundaryPattern(term) {
  const body = escapeRegExp(term.toLowerCase()).replace(/[-_\s]+/g, "[^a-z0-9]+");
  if (term === "station") return `(^|[^a-z0-9])${body}s?([^a-z0-9]|$)`;
  if (term === "broadcast") return `(^|[^a-z0-9])${body}(?:s|ing|er|ed)?([^a-z0-9]|$)`;
  return `(^|[^a-z0-9])${body}([^a-z0-9]|$)`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueAbsolutePaths(paths) {
  return [...new Set(paths.filter(Boolean).map((item) => path.resolve(item)))];
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function isMediaHeavyPath(value) {
  const clean = String(value).replaceAll(path.sep, "/").toLowerCase();
  return [...MEDIA_DIR_HINTS].some((hint) => clean.includes(hint));
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
