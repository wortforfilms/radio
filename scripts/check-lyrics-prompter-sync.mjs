import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB_HTML = path.join(ROOT, "apps/web/public/radio-html");
const DESKTOP_HTML = path.join(ROOT, "apps/desktop/public/radio-html");
const SOURCE = path.join(WEB_HTML, "data/lyrics-prompter-data.json");
const generatedAt = new Date().toISOString();

const data = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const records = [
  ...(data.tracks || []).map((record) => ({ ...record, recordKind: "catalog" })),
  ...(data.manualRecords || []).map((record) => ({ ...record, recordKind: "manual" }))
];

const issues = [];
const recordSummaries = [];
let cueCount = 0;
let recordsWithCues = 0;
let recordsWithoutCues = 0;
let timingVerifiedClaims = 0;
let ffprobeDurationRecords = 0;
let estimatedDurationRecords = 0;
let nullTimingRecords = 0;

for (const record of records) {
  const cues = record.cues || [];
  cueCount += cues.length;
  if (cues.length) recordsWithCues += 1;
  else recordsWithoutCues += 1;
  if (record.timingVerified) timingVerifiedClaims += 1;
  if (record.timingBasis === "ffprobe-duration") ffprobeDurationRecords += 1;
  else if (String(record.timingBasis || "").startsWith("estimated")) estimatedDurationRecords += 1;
  else nullTimingRecords += 1;

  const recordIssues = validateRecord(record, cues);
  issues.push(...recordIssues);
  recordSummaries.push({
    id: record.id,
    title: record.title,
    recordKind: record.recordKind,
    cueCount: cues.length,
    durationSeconds: record.durationSeconds,
    timingBasis: record.timingBasis,
    timingVerified: Boolean(record.timingVerified),
    syncMode: cues.length ? "estimated-spread" : "NULL",
    structuralStatus: recordIssues.length ? "needs-review" : cues.length ? "pass" : "no-cues",
    issueCount: recordIssues.length,
    firstCueStart: cues[0]?.start || null,
    lastCueEnd: cues[cues.length - 1]?.end || null
  });
}

const criticalIssues = issues.filter((issue) => issue.severity === "critical");
const warningIssues = issues.filter((issue) => issue.severity === "warning");
const report = {
  id: "radio-vaigyaaniq-lyrics-prompter-sync-check",
  generatedAt,
  source: {
    lyricsPrompterData: "apps/web/public/radio-html/data/lyrics-prompter-data.json"
  },
  verdict: criticalIssues.length === 0 ? "STRUCTURAL_SYNC_PASS_ESTIMATED_ONLY" : "STRUCTURAL_SYNC_BLOCKED",
  phkd: {
    fabricatedSync: false,
    humanVerifiedSync: false,
    timingVerified: false,
    unknownValues: "NULL",
    note:
      "This validates generated cue structure against durations. It does not certify human-synced lyrics."
  },
  counts: {
    totalRecords: records.length,
    catalogTracks: data.tracks?.length || 0,
    manualRecords: data.manualRecords?.length || 0,
    cueCount,
    recordsWithCues,
    recordsWithoutCues,
    ffprobeDurationRecords,
    estimatedDurationRecords,
    nullTimingRecords,
    timingVerifiedClaims,
    issues: issues.length,
    criticalIssues: criticalIssues.length,
    warningIssues: warningIssues.length
  },
  checks: {
    monotonicCueOrder: !issues.some((issue) => issue.code === "CUE_ORDER_INVALID"),
    cueBoundsWithinDuration: !issues.some((issue) => issue.code === "CUE_OUTSIDE_DURATION"),
    cueTextPresent: !issues.some((issue) => issue.code === "CUE_TEXT_NULL"),
    noVerifiedTimingClaims: timingVerifiedClaims === 0,
    audioHighlightMechanismPresent: fs
      .readFileSync(path.join(WEB_HTML, "lyrics-prompter.html"), "utf8")
      .includes("audio.addEventListener('timeupdate'")
  },
  issues: issues.slice(0, 500),
  records: recordSummaries
};

for (const htmlRoot of [WEB_HTML, DESKTOP_HTML]) {
  const dataRoot = path.join(htmlRoot, "data");
  fs.mkdirSync(dataRoot, { recursive: true });
  fs.writeFileSync(path.join(dataRoot, "lyrics-prompter-sync-check.json"), `${JSON.stringify(report)}\n`);
  fs.writeFileSync(path.join(dataRoot, "lyrics-prompter-sync-check.tsv"), buildTsv(report));
  fs.writeFileSync(path.join(htmlRoot, "lyrics-prompter-sync.html"), buildHtml(report));
  updatePrompter(path.join(htmlRoot, "lyrics-prompter.html"));
  updateIndex(path.join(htmlRoot, "index.html"));
}

console.log(`verdict=${report.verdict}`);
console.log(`records=${report.counts.totalRecords} cues=${report.counts.cueCount}`);
console.log(`criticalIssues=${report.counts.criticalIssues} warnings=${report.counts.warningIssues}`);
console.log(`humanVerifiedSync=false timingVerifiedClaims=${report.counts.timingVerifiedClaims}`);

function validateRecord(record, cues) {
  const issues = [];
  const duration = Number(record.durationSeconds || 0);
  let previousStart = -Infinity;
  let previousEnd = -Infinity;
  if (record.timingVerified) {
    issues.push(issue(record, "TIMING_VERIFIED_CLAIM", "critical", "Record claims verified timing."));
  }
  cues.forEach((cue, index) => {
    const start = Number(cue.startSeconds);
    const end = Number(cue.endSeconds);
    if (!String(cue.text || "").trim()) {
      issues.push(issue(record, "CUE_TEXT_NULL", "critical", `Cue ${index} has empty text.`));
    }
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || start < 0) {
      issues.push(issue(record, "CUE_RANGE_INVALID", "critical", `Cue ${index} has invalid range.`));
    }
    if (start < previousStart) {
      issues.push(issue(record, "CUE_ORDER_INVALID", "critical", `Cue ${index} starts before previous cue.`));
    }
    if (start < previousEnd - 0.05) {
      issues.push(issue(record, "CUE_OVERLAP", "warning", `Cue ${index} overlaps previous cue.`));
    }
    if (duration > 0 && end > duration + 0.1) {
      issues.push(issue(record, "CUE_OUTSIDE_DURATION", "critical", `Cue ${index} ends after duration.`));
    }
    if (cue.timing !== "estimated-spread") {
      issues.push(issue(record, "CUE_TIMING_MODE_UNEXPECTED", "warning", `Cue ${index} timing is ${cue.timing}.`));
    }
    if (cue.timingVerified) {
      issues.push(issue(record, "CUE_TIMING_VERIFIED_CLAIM", "critical", `Cue ${index} claims verified timing.`));
    }
    previousStart = start;
    previousEnd = end;
  });
  return issues;
}

function issue(record, code, severity, detail) {
  return {
    code,
    severity,
    id: record.id,
    title: record.title,
    recordKind: record.recordKind,
    detail
  };
}

function buildTsv(report) {
  const header = [
    "id",
    "title",
    "recordKind",
    "cueCount",
    "durationSeconds",
    "timingBasis",
    "timingVerified",
    "syncMode",
    "structuralStatus",
    "issueCount"
  ];
  const rows = report.records.map((record) =>
    [
      record.id,
      record.title,
      record.recordKind,
      record.cueCount,
      record.durationSeconds ?? "NULL",
      record.timingBasis || "NULL",
      record.timingVerified,
      record.syncMode,
      record.structuralStatus,
      record.issueCount
    ]
      .map(tsvCell)
      .join("\t")
  );
  return `${header.join("\t")}\n${rows.join("\n")}\n`;
}

function buildHtml(report) {
  const bootstrap = JSON.stringify({
    generatedAt: report.generatedAt,
    verdict: report.verdict,
    counts: report.counts,
    checks: report.checks
  }).replace(/<\//g, "<\\/");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lyrics Prompter Sync Check</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--ink:#eef4f8;--muted:#94a3b8;--line:rgba(255,255,255,.12);--accent:#ff8a3d;--cyan:#63e6d5;--gold:#f0c36c;--danger:#ff7676;--ok:#8be29d}
    *{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#070a0f,#091018 48%,#05070a);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui}.shell{width:min(1400px,calc(100vw - 28px));margin:auto;padding:20px 0 36px}.top{display:flex;gap:12px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#071014;font-weight:950}.top h1{margin:0;font-size:22px}.top small{color:var(--muted)}.actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}.pill{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;text-decoration:none}.hero{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end;margin:24px 0}.hero h2{font-size:clamp(2rem,5vw,4.8rem);line-height:.95;margin:8px 0}.eyebrow{color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:950}.guard{border-left:3px solid var(--danger);background:rgba(255,118,118,.08);color:#ffd4d4;border-radius:8px;padding:11px 13px;max-width:760px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;min-width:420px}.stat,.card{border:1px solid var(--line);border-radius:8px;padding:12px;background:rgba(255,255,255,.04)}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.stat b{font-size:24px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}.ok{color:var(--ok)}.warn{color:var(--danger)}pre{white-space:pre-wrap;background:#0b1119;border:1px solid var(--line);border-radius:8px;padding:12px;max-height:360px;overflow:auto}@media(max-width:900px){.hero{grid-template-columns:1fr}.stats{min-width:0}.actions{margin-left:0}.top{align-items:flex-start;flex-wrap:wrap}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="top"><div class="mark">RV</div><div><h1>Lyrics Prompter Sync Check</h1><small>Structural sync validation, not human sync certification</small></div><nav class="actions"><a class="pill" href="./lyrics-prompter.html">Prompter</a><a class="pill" href="./data/lyrics-prompter-sync-check.json">JSON</a><a class="pill" href="./data/lyrics-prompter-sync-check.tsv">TSV</a></nav></header>
    <section class="hero"><div><span class="eyebrow">Estimated spread validation</span><h2>${report.verdict}</h2><p class="guard">PHKD: the prompter highlights cues by audio playhead and generated time ranges. This report validates structure only; human-verified lyric sync remains false.</p></div><div class="stats"><article class="stat"><span>Records</span><b>${report.counts.totalRecords.toLocaleString()}</b></article><article class="stat"><span>Cues</span><b>${report.counts.cueCount.toLocaleString()}</b></article><article class="stat"><span>Critical</span><b>${report.counts.criticalIssues}</b></article></div></section>
    <section class="grid">
      ${Object.entries(report.checks)
        .map(([key, value]) => `<article class="card"><b class="${value ? "ok" : "warn"}">${value ? "PASS" : "REVIEW"}</b><span>${key}</span></article>`)
        .join("")}
    </section>
    <h2>Counts</h2>
    <pre>${JSON.stringify(report.counts, null, 2)}</pre>
    <script id="sync-bootstrap" type="application/json">${bootstrap}</script>
  </main>
</body>
</html>
`;
}

function updatePrompter(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-prompter-sync.html")) return;
  html = html.replace(
    '<a class="pill" href="./data/lyrics-prompter-index.tsv">TSV</a>',
    '<a class="pill" href="./data/lyrics-prompter-index.tsv">TSV</a><a class="pill" href="./lyrics-prompter-sync.html">Sync Check</a>'
  );
  fs.writeFileSync(file, html);
}

function updateIndex(file) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes("lyrics-prompter-sync.html")) return;
  const card =
    '      <a href="./lyrics-prompter-sync.html"><b>Lyrics Sync Check</b><small>Structural cue validation for the Lyrics Prompter; estimated timing only, no human sync claim.</small></a>\n';
  html = html.replace(/(\s*<a href="\.\/lyrics-prompter\.html"><b>Lyrics Prompter<\/b><small>.*?<\/small><\/a>\n)/s, `$1${card}`);
  fs.writeFileSync(file, html);
}

function tsvCell(value) {
  return String(value ?? "NULL").replace(/\t/g, " ").replace(/\n/g, " ");
}
