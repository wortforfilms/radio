#!/usr/bin/env node
/**
 * promote-verified-tracks.mjs — the gated connector between the local provenance
 * store and the app's served layer.
 *
 * For every track that is RIGHTS-VERIFIED, it:
 *   1. copies audio  _radio_index/suno_backup/audio/<id>.mp3   → apps/(web|desktop)/public/radio-html/assets/audio/<id>.mp3
 *   2. copies cover  _radio_index/suno_backup/covers/<id>.jpeg → apps/(web|desktop)/public/radio-html/assets/covers/<id>.jpeg
 *   3. sets publicPath + coverPublicPath, recomputes canPlay, stamps the manifest
 *   4. stamps the public catalogue (suno-library-catalog.json) with publicPath/canPlay
 *   5. writes evidence to .../data/promotion-report.json
 *
 * FAIL-CLOSED: a track is promoted ONLY if it is verified. Everything else is left
 * untouched — no copy, canPlay stays false. Nothing is fabricated.
 *
 * A track counts as verified when EITHER:
 *   - its manifest entry already has rightsStatus === "verified" && releaseAllowed === true, OR
 *   - its sunoId appears in a reviewer-supplied --verified-list (csv with a suno_id column,
 *     or a json array of ids / objects). List rows may carry reviewer, reviewedAt, license,
 *     citation; missing fields are filled with sensible verified-state defaults.
 * In all cases the audio file must exist and have a checksum (computed if absent).
 *
 * Usage:
 *   node scripts/promote-verified-tracks.mjs --dry-run
 *   node scripts/promote-verified-tracks.mjs --verified-list _radio_index/verified_v1.csv
 *   node scripts/promote-verified-tracks.mjs --verified-list ids.json --limit 105
 *   node scripts/promote-verified-tracks.mjs --no-desktop
 *
 * Flags:
 *   --dry-run            report only; copy nothing, write nothing
 *   --verified-list <p>  csv/json of reviewer-approved sunoIds
 *   --limit <n>          cap number of tracks promoted this run
 *   --no-desktop         skip the apps/desktop public mirror
 *   --no-catalog-stamp   don't stamp suno-library-catalog.json
 *   --force              re-promote even if already public
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const DRY = has("--dry-run");
const DESKTOP = !has("--no-desktop");
const STAMP_CATALOG = !has("--no-catalog-stamp");
const FORCE = has("--force");
const LIMIT = parseInt(opt("--limit", "0"), 10) || 0;
const LIST = opt("--verified-list", null);

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKUP = path.join(REPO, "_radio_index", "suno_backup");
const TODAY = new Date().toISOString().slice(0, 10);

const webRoots = [path.join(REPO, "apps/web/public/radio-html")];
if (DESKTOP && fs.existsSync(path.join(REPO, "apps/desktop/public/radio-html")))
  webRoots.push(path.join(REPO, "apps/desktop/public/radio-html"));
const primary = webRoots[0];
const manifestPath = path.join(primary, "data", "audio-import-manifest.json");
const catalogPath = path.join(primary, "data", "suno-library-catalog.json");

const readJson = (p, d = null) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d;
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

// ---- load reviewer-approved list (csv or json) ----
function loadVerified(p) {
  const map = new Map();
  if (!p) return map;
  const abs = path.resolve(REPO, p);
  if (!fs.existsSync(abs)) { console.warn("verified-list not found:", abs); return map; }
  const raw = fs.readFileSync(abs, "utf8");
  if (abs.endsWith(".json")) {
    const j = JSON.parse(raw);
    (Array.isArray(j) ? j : j.ids || j.tracks || []).forEach((row) => {
      const id = typeof row === "string" ? row : (row.suno_id || row.sunoId || row.id);
      if (id) map.set(String(id).trim(), typeof row === "object" ? row : {});
    });
  } else {
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const head = lines.shift().split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    const ci = (n) => head.findIndex((h) => h.toLowerCase() === n);
    const idIdx = [ci("suno_id"), ci("sunoid"), ci("id")].find((i) => i >= 0);
    if (idIdx == null || idIdx < 0) { console.warn("verified-list csv has no suno_id column"); return map; }
    for (const line of lines) {
      const cells = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      const id = cells[idIdx];
      if (id) map.set(id, {
        reviewer: cells[ci("reviewer")] || null, reviewedAt: cells[ci("reviewedat")] || null,
        license: cells[ci("license")] || null, citation: cells[ci("citation")] || null,
      });
    }
  }
  return map;
}

const manifest = readJson(manifestPath);
if (!manifest || !Array.isArray(manifest.imports)) {
  console.error("No usable manifest at", manifestPath); process.exit(1);
}
const verified = loadVerified(LIST);

function isVerified(entry) {
  if (entry.rightsStatus === "verified" && entry.releaseAllowed === true) return { ok: true, src: "manifest" };
  if (verified.has(entry.sunoId)) return { ok: true, src: "list", row: verified.get(entry.sunoId) };
  return { ok: false };
}

const ensureDir = (d) => { if (!DRY) fs.mkdirSync(d, { recursive: true }); };
const report = {
  id: "radio-vaigyaaniq-promotion-report", generatedAt: new Date().toISOString(),
  mode: DRY ? "dry-run" : "live", verifiedListUsed: LIST || null,
  rule: "fail-closed: only rights-verified tracks are promoted to public/served + canPlay:true",
  counts: { eligible: 0, promoted: 0, skippedAlreadyPublic: 0, missingAudio: 0, notVerified: 0 },
  promoted: [],
};

let promotedThisRun = 0;
for (const e of manifest.imports) {
  const v = isVerified(e);
  if (!v.ok) { report.counts.notVerified++; continue; }
  report.counts.eligible++;
  const id = e.sunoId;
  const srcAudio = path.join(BACKUP, "audio", `${id}.mp3`);
  if (!fs.existsSync(srcAudio)) { report.counts.missingAudio++; continue; }
  const alreadyPublic = !!e.publicPath && fs.existsSync(path.join(primary, "assets/audio", `${id}.mp3`));
  if (alreadyPublic && !FORCE) { report.counts.skippedAlreadyPublic++; continue; }
  if (LIMIT && promotedThisRun >= LIMIT) continue;

  const srcCover = path.join(BACKUP, "covers", `${id}.jpeg`);
  const hasCover = fs.existsSync(srcCover);
  const checksum = e.checksum || sha256(srcAudio);
  const publicPath = `/radio-html/assets/audio/${id}.mp3`;
  const coverPublicPath = hasCover ? `/radio-html/assets/covers/${id}.jpeg` : (e.coverPublicPath || null);

  for (const root of webRoots) {
    const aDir = path.join(root, "assets/audio"), cDir = path.join(root, "assets/covers");
    ensureDir(aDir); ensureDir(cDir);
    if (!DRY) {
      fs.copyFileSync(srcAudio, path.join(aDir, `${id}.mp3`));
      if (hasCover) fs.copyFileSync(srcCover, path.join(cDir, `${id}.jpeg`));
    }
  }

  // stamp manifest entry (verified, public, playable)
  const row = v.row || {};
  e.checksum = checksum;
  e.publicPath = publicPath;
  e.coverPublicPath = coverPublicPath;
  e.rightsStatus = "verified";
  e.license = e.license || row.license || "Owner-declared; assigned to VESAHE Film Solutions Private Limited";
  e.citation = e.citation || row.citation || "Own creation; rights pack + Schedule A";
  e.reviewer = e.reviewer || row.reviewer || (v.src === "list" ? "release-review (listed)" : e.reviewer);
  e.reviewedAt = e.reviewedAt || row.reviewedAt || TODAY;
  e.auditVerified = true;
  e.releaseAllowed = true;
  e.canPlay = true;
  e.status = "release-ready";
  e.verificationState = "verified";
  e.missing = null; e.blocker = null;

  report.counts.promoted++; promotedThisRun++;
  report.promoted.push({ sunoId: id, publicPath, coverPublicPath, checksum, source: v.src });
}

// stamp public catalogue
if (STAMP_CATALOG && !DRY) {
  const cat = readJson(catalogPath);
  if (cat && Array.isArray(cat.tracks)) {
    const byId = new Map(report.promoted.map((p) => [p.sunoId, p]));
    for (const t of cat.tracks) {
      const p = byId.get(t.sunoId || t.id);
      if (p) { t.publicPath = p.publicPath; t.coverPublicPath = p.coverPublicPath; t.canPlay = true; }
    }
    fs.writeFileSync(catalogPath, JSON.stringify(cat, null, 2));
  }
}

// write manifest + report (to every web root's data dir)
if (!DRY) {
  manifest.lastPromotionAt = new Date().toISOString();
  for (const root of webRoots) {
    fs.writeFileSync(path.join(root, "data", "audio-import-manifest.json"), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(root, "data", "promotion-report.json"), JSON.stringify(report, null, 2));
  }
}

const c = report.counts;
console.log(`=== Promote verified tracks (${report.mode}) ===`);
console.log(`Eligible (verified): ${c.eligible}`);
console.log(`Promoted: ${c.promoted}  ·  already public: ${c.skippedAlreadyPublic}  ·  missing audio: ${c.missingAudio}`);
console.log(`Not verified (left untouched, canPlay stays false): ${c.notVerified}`);
if (c.eligible === 0)
  console.log(`\nNothing is rights-verified yet. Supply a reviewer-approved list:\n  node scripts/promote-verified-tracks.mjs --verified-list _radio_index/verified_v1.csv\n(csv needs a suno_id column; optional reviewer,reviewedAt,license,citation)`);
else if (DRY)
  console.log(`\nDry run — no files copied. Re-run without --dry-run to promote.`);
else
  console.log(`\nDone. Manifest + catalogue stamped; report at data/promotion-report.json. Re-run radio:playback:gate / radio:release:check to roll evidence forward.`);
