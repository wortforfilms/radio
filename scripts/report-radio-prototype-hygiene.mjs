import fs from "node:fs";
import path from "node:path";

const webRoot = "apps/web/public/radio-html";
const desktopRoot = "apps/desktop/public/radio-html";
const prototypePath = path.join(webRoot, "Radio_Vaigyaaniq_App_Prototype.html");
const reportJsonPath = path.join(webRoot, "data/report-hygiene-sanitize.json");
const reportHtmlPath = path.join(webRoot, "report-hygiene-sanitize.html");
const desktopJsonPath = path.join(desktopRoot, "data/report-hygiene-sanitize.json");
const desktopHtmlPath = path.join(desktopRoot, "report-hygiene-sanitize.html");

const redactionRules = [
  { id: "hi-degrading-insult", pattern: /कुतिये/gi },
  { id: "hi-explicit-anatomy", pattern: /यौनी/gi },
  { id: "en-adult-style-erotic", pattern: /erotic/gi },
  { id: "en-adult-style-sexual", pattern: /\bsexual\b/gi },
  { id: "en-adult-style-sex", pattern: /\bsex\b/gi }
];

const staleClaimChecks = [
  {
    id: "verified-checkout-copy",
    phrase: "Razorpay · Device-trust verified · Entitlement synced"
  },
  {
    id: "public-live-copy",
    phrase: "Nine live channels"
  },
  {
    id: "on-air-copy",
    phrase: "tracks · on air"
  },
  {
    id: "profile-pro-copy",
    phrase: "hkfaduio · Pro"
  },
  {
    id: "released-copy",
    phrase: "<small> released</small>"
  }
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, out);
    else if (!predicate || predicate(full, entry)) out.push(full);
  }
  return out;
}

function extractData(html) {
  const start = html.indexOf("const DATA=");
  const end = html.indexOf(";\nconst AYO=", start);
  if (start < 0 || end < 0) throw new Error("Unable to extract prototype DATA payload");
  return JSON.parse(html.slice(start + "const DATA=".length, end));
}

function flattenSongs(data) {
  return (data.shows || []).flatMap((show) =>
    (show.songs || []).map((song) => ({
      show: show.slug,
      title: song.t || null,
      translit: song.r || null,
      theme: song.theme || null,
      date: song.dt || null,
      text: [song.t, song.r, song.theme, song.ly].filter(Boolean).join("\n")
    }))
  );
}

function countMatches(songs) {
  const byRule = Object.fromEntries(redactionRules.map((rule) => [rule.id, 0]));
  const flagged = [];
  for (const song of songs) {
    const hitRules = [];
    for (const rule of redactionRules) {
      const matches = song.text.match(rule.pattern);
      if (matches?.length) {
        byRule[rule.id] += matches.length;
        hitRules.push(rule.id);
      }
    }
    if (hitRules.length) {
      flagged.push({
        title: song.title,
        show: song.show,
        theme: song.theme,
        date: song.date,
        rules: hitRules
      });
    }
  }
  return { byRule, flagged };
}

function linkCheck(root, html) {
  const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map((match) => match[1]);
  const missing = refs.filter((ref) => !fs.existsSync(path.join(root, ref)));
  return { checked: refs.length, missing };
}

function appleDoubleCount(root) {
  const files = walk(root, (full) => path.basename(full).startsWith("._"));
  return { count: files.length, samples: files.slice(0, 20).map((file) => path.relative(root, file)) };
}

function pruneAppleDouble(root) {
  const files = walk(root, (full) => path.basename(full).startsWith("._"));
  for (const file of files) fs.rmSync(file, { force: true });
  return files.length;
}

function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  })[char]);
}

const prunedBeforeReport = {
  web: pruneAppleDouble(webRoot),
  desktop: pruneAppleDouble(desktopRoot)
};

const html = read(prototypePath);
const data = extractData(html);
const songs = flattenSongs(data);
const matches = countMatches(songs);
const refs = linkCheck(webRoot, html);
const appleDouble = {
  web: appleDoubleCount(webRoot),
  desktop: appleDoubleCount(desktopRoot)
};
const staleClaims = staleClaimChecks.map((check) => ({
  id: check.id,
  present: html.includes(check.phrase),
  phrase: check.phrase
}));

const report = {
  id: "report-hygiene-sanitize",
  title: "Radio Vaigyaaniq Prototype Hygiene + Sanitization Report",
  generatedAt: new Date().toISOString(),
  status: "sanitized-display-with-raw-source-preserved",
  prototype: "Radio_Vaigyaaniq_App_Prototype.html",
  dataScope: {
    embeddedPrototypeSongs: data.total_songs,
    embeddedPrototypeClips: data.total_clips,
    embeddedPrototypeShows: data.shows?.length || 0,
    scannedSongs: songs.length
  },
  checks: {
    displaySanitizerPresent: html.includes("DISPLAY_REDACTIONS") && html.includes("cleanDisplayText"),
    localRefs: refs,
    staleClaims,
    appleDoubleSidecars: appleDouble,
    appleDoublePrunedBeforeReport: prunedBeforeReport
  },
  sanitization: {
    rawSourcePreserved: true,
    displayRedactionOnly: true,
    redactionRules: redactionRules.map((rule) => rule.id),
    matchCounts: matches.byRule,
    flaggedTrackCount: matches.flagged.length,
    flaggedTrackSamples: matches.flagged.slice(0, 20)
  },
  phkd: {
    productionReady: false,
    releaseAllowed: false,
    verificationState: "hygiene_reported_display_sanitized",
    evidence: "Prototype display text is redacted through a rendering sanitizer; raw embedded source data is preserved for provenance. Stale verified/live checkout copy is checked fail-closed. AppleDouble sidecars are counted so cleanup can be verified."
  }
};

const htmlReport = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(report.title)}</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0f;--panel:#101720;--line:rgba(255,255,255,.12);--ink:#f8fafc;--muted:#94a3b8;--cyan:#00e7d4;--saffron:#ff7a33;--red:#ff7676}
    body{margin:0;min-height:100vh;background:radial-gradient(circle at 16% 0%,rgba(255,122,51,.16),transparent 28rem),radial-gradient(circle at 90% 0%,rgba(0,231,212,.12),transparent 28rem),var(--bg);color:var(--ink);font:14px/1.5 Inter,system-ui,sans-serif}
    main{width:min(1180px,calc(100vw - 32px));margin:auto;padding:34px 0 60px}
    h1{font-size:clamp(30px,5vw,58px);line-height:.96;margin:0 0 10px}p{color:var(--muted);max-width:820px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:22px 0}.card{border:1px solid var(--line);border-radius:8px;background:rgba(16,23,32,.82);padding:16px}.card b{display:block;font-size:28px;line-height:1}.card span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}.ok{color:var(--cyan)}.bad{color:var(--red)}table{width:100%;border-collapse:collapse;border:1px solid var(--line);background:rgba(16,23,32,.72);border-radius:8px;overflow:hidden}th,td{text-align:left;border-bottom:1px solid var(--line);padding:10px;vertical-align:top}th{color:var(--saffron);font-size:12px;text-transform:uppercase;letter-spacing:.08em}code{color:var(--cyan)}.phkd{border:1px solid rgba(255,118,118,.28);background:rgba(255,118,118,.08);border-radius:8px;color:#ffdada;padding:14px;margin-top:18px}
  </style>
</head>
<body>
  <main>
    <h1>${htmlEscape(report.title)}</h1>
    <p>Display-level sanitization and report hygiene for the mobile app prototype. Raw embedded catalogue source is preserved; public-facing render paths are redacted and release claims stay fail-closed.</p>
    <div class="grid">
      <div class="card"><span>Display Sanitizer</span><b class="${report.checks.displaySanitizerPresent ? "ok" : "bad"}">${report.checks.displaySanitizerPresent ? "ON" : "OFF"}</b></div>
      <div class="card"><span>Flagged Tracks</span><b>${report.sanitization.flaggedTrackCount}</b></div>
      <div class="card"><span>Missing Local Refs</span><b class="${refs.missing.length ? "bad" : "ok"}">${refs.missing.length}</b></div>
      <div class="card"><span>AppleDouble Sidecars</span><b>${appleDouble.web.count + appleDouble.desktop.count}</b></div>
    </div>
    <h2>Stale Claim Checks</h2>
    <table><thead><tr><th>Check</th><th>Status</th><th>Phrase</th></tr></thead><tbody>
      ${staleClaims.map((check) => `<tr><td>${htmlEscape(check.id)}</td><td class="${check.present ? "bad" : "ok"}">${check.present ? "present" : "clear"}</td><td><code>${htmlEscape(check.phrase)}</code></td></tr>`).join("")}
    </tbody></table>
    <h2>Redaction Counts</h2>
    <table><thead><tr><th>Rule</th><th>Matches</th></tr></thead><tbody>
      ${Object.entries(matches.byRule).map(([rule, count]) => `<tr><td>${htmlEscape(rule)}</td><td>${count}</td></tr>`).join("")}
    </tbody></table>
    <div class="phkd">PHKD: ${htmlEscape(report.phkd.evidence)}</div>
  </main>
</body>
</html>
`;

mkdirFor(reportJsonPath);
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(reportHtmlPath, htmlReport);
mkdirFor(desktopJsonPath);
fs.writeFileSync(desktopJsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(desktopHtmlPath, htmlReport);

const prunedAfterWrite = {
  web: pruneAppleDouble(webRoot),
  desktop: pruneAppleDouble(desktopRoot)
};

console.log(JSON.stringify({
  reportJsonPath,
  reportHtmlPath,
  displaySanitizerPresent: report.checks.displaySanitizerPresent,
  staleClaimsPresent: staleClaims.filter((check) => check.present).map((check) => check.id),
  flaggedTrackCount: report.sanitization.flaggedTrackCount,
  missingRefs: refs.missing.length,
  appleDoubleSidecars: appleDouble.web.count + appleDouble.desktop.count,
  appleDoublePrunedBeforeReport: prunedBeforeReport.web + prunedBeforeReport.desktop,
  appleDoublePrunedAfterWrite: prunedAfterWrite.web + prunedAfterWrite.desktop
}, null, 2));
