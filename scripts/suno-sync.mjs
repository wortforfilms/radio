#!/usr/bin/env node
/**
 * suno-sync.mjs — Sync a personal Suno library export into the local radio index.
 *
 * Reads a `suno-catalog.json` export (produced from suno.com/me) and:
 *   1. Downloads every remaining track's audio (cdn1.suno.ai/<id>.mp3 — public, no auth)
 *   2. Downloads every remaining cover art (image_url)
 *   3. Writes per-track lyrics + styles as .txt
 *   4. Writes a standalone catalog (JSON + CSV) into the radio-html data dirs
 *   5. Merges new tracks into audio-import-manifest.json (fail-closed: rights NULL, canPlay false)
 *
 * Idempotent: existing files are skipped, so re-running only fetches what's missing
 * ("all remaining"). No credentials required — the Suno audio CDN serves by clip id.
 *
 * Usage:
 *   node scripts/suno-sync.mjs [path/to/suno-catalog.json]
 *   node scripts/suno-sync.mjs --no-audio        # metadata/lyrics/covers only
 *   node scripts/suno-sync.mjs --no-manifest     # skip manifest merge
 *   node scripts/suno-sync.mjs --concurrency 8
 *
 * If no catalog path is given, it searches: ./suno-catalog.json,
 * ./_radio_index/suno-catalog.json, then ~/Downloads/suno-catalog.json.
 */

import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const NO_AUDIO = flag("--no-audio");
const NO_COVERS = flag("--no-covers");
const NO_LYRICS = flag("--no-lyrics");
const NO_MANIFEST = flag("--no-manifest");
const CONCURRENCY = Math.max(1, parseInt(opt("--concurrency", "6"), 10) || 6);

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const positional = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a));

async function firstExisting(paths) {
  for (const p of paths) {
    try { await fs.access(p); return p; } catch { /* keep looking */ }
  }
  return null;
}

async function resolveCatalog() {
  if (positional) return path.resolve(positional);
  const candidates = [
    path.join(REPO_ROOT, "suno-catalog.json"),
    path.join(REPO_ROOT, "_radio_index", "suno-catalog.json"),
    path.join(os.homedir(), "Downloads", "suno-catalog.json"),
  ];
  const found = await firstExisting(candidates);
  if (!found) {
    console.error("Could not find suno-catalog.json. Pass its path as an argument:");
    console.error("  node scripts/suno-sync.mjs ~/Downloads/suno-catalog.json");
    process.exit(1);
  }
  return found;
}

function sanitize(name) {
  return (name || "untitled").replace(/[\\/:*?"<>|\n\r\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function fmtDuration(sec) {
  if (sec == null) return "";
  sec = Math.round(sec);
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return buf;
}

async function withRetry(fn, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 600 * (i + 1))); }
  }
  throw lastErr;
}

async function pool(items, n, worker) {
  let idx = 0;
  const runners = Array.from({ length: n }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      await worker(items[cur], cur);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const catalogPath = await resolveCatalog();
  console.log("Catalog:", catalogPath);
  const raw = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  const tracks = raw.tracks || raw.items || (Array.isArray(raw) ? raw : []);
  if (!tracks.length) { console.error("No tracks in catalog."); process.exit(1); }
  console.log(`Tracks in catalog: ${tracks.length}`);

  const backupDir = path.join(REPO_ROOT, "_radio_index", "suno_backup");
  const audioDir = path.join(backupDir, "audio");
  const coverDir = path.join(backupDir, "covers");
  const lyricsDir = path.join(backupDir, "lyrics");
  for (const d of [audioDir, coverDir, lyricsDir]) await fs.mkdir(d, { recursive: true });
  // keep a copy of the source export alongside the assets
  await fs.copyFile(catalogPath, path.join(backupDir, "suno-catalog.json")).catch(() => {});

  const stats = { audio: 0, audioSkip: 0, audioFail: 0, covers: 0, coverSkip: 0, lyrics: 0 };
  const index = [];

  await pool(tracks, CONCURRENCY, async (t) => {
    const id = t.id;
    if (!id) return;
    const base = `${sanitize(t.title)} [${id.slice(0, 8)}]`;
    const audioFile = path.join(audioDir, `${id}.mp3`);
    const coverFile = path.join(coverDir, `${id}.jpeg`);
    const lyricFile = path.join(lyricsDir, `${id}.txt`);
    let bytes = null, checksum = null;

    if (!NO_AUDIO && t.audio_url) {
      try {
        try { const s = await fs.stat(audioFile); bytes = s.size; stats.audioSkip++; }
        catch {
          const buf = await withRetry(() => download(t.audio_url, audioFile));
          bytes = buf.length;
          checksum = crypto.createHash("sha256").update(buf).digest("hex");
          stats.audio++;
        }
      } catch (e) { stats.audioFail++; console.warn("  audio fail:", base, e.message); }
    }
    if (!NO_COVERS && t.image_url) {
      try {
        try { await fs.access(coverFile); stats.coverSkip++; }
        catch { await withRetry(() => download(t.image_url, coverFile)); stats.covers++; }
      } catch (e) { console.warn("  cover fail:", base, e.message); }
    }
    if (!NO_LYRICS) {
      const body = `${t.title || ""}\n\nSTYLES:\n${t.styles || ""}\n\nLYRICS:\n${t.lyrics || ""}\n`;
      await fs.writeFile(lyricFile, body);
      stats.lyrics++;
    }

    index.push({
      sunoId: id,
      title: t.title || "",
      styles: t.styles || "",
      durationSeconds: t.duration != null ? Math.round(t.duration) : null,
      duration: fmtDuration(t.duration),
      createdAt: (t.created_at || "").slice(0, 10),
      model: t.model || "",
      playCount: t.play_count || 0,
      instrumental: !!t.instrumental,
      audioPath: `_radio_index/suno_backup/audio/${id}.mp3`,
      coverPath: `_radio_index/suno_backup/covers/${id}.jpeg`,
      lyricsPath: `_radio_index/suno_backup/lyrics/${id}.txt`,
      bytes,
      checksum,
    });
  });

  // ---- Standalone catalog (JSON + CSV) into both app data dirs ----
  index.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const catalogDoc = {
    id: "radio-vaigyaaniq-suno-library-catalog",
    title: "Radio Vaigyaaniq Suno Library Catalog",
    generatedAt: new Date().toISOString(),
    verificationState: "draft-local-suno-catalog-rights-null",
    phkd: {
      rule: "fail_closed",
      unknownValues: "NULL",
      productionReady: false,
      releaseAllowed: false,
      note: "Local provenance/index of personal Suno library. Rights, payment, review and release evidence remain NULL; canPlay stays false until verified.",
    },
    counts: { tracks: index.length, withAudio: index.filter((x) => x.bytes).length },
    tracks: index,
  };
  const dataDirs = [
    path.join(REPO_ROOT, "apps", "web", "public", "radio-html", "data"),
    path.join(REPO_ROOT, "apps", "desktop", "public", "radio-html", "data"),
  ];
  const csvHeader = "sunoId,title,styles,duration,createdAt,model,playCount,audioPath\n";
  const csv = csvHeader + index.map((x) =>
    [x.sunoId, x.title, x.styles, x.duration, x.createdAt, x.model, x.playCount, x.audioPath]
      .map((v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  for (const dir of dataDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "suno-library-catalog.json"), JSON.stringify(catalogDoc, null, 2));
      await fs.writeFile(path.join(dir, "suno-library-catalog.csv"), csv);
    } catch (e) { console.warn("catalog write skipped for", dir, e.message); }
  }

  // ---- Merge into audio-import-manifest.json (additive, fail-closed) ----
  if (!NO_MANIFEST) {
    for (const dir of dataDirs) {
      const mPath = path.join(dir, "audio-import-manifest.json");
      let manifest;
      try { manifest = JSON.parse(await fs.readFile(mPath, "utf8")); }
      catch { continue; }
      manifest.imports = manifest.imports || [];
      const have = new Set(manifest.imports.map((i) => i.sunoId).filter(Boolean));
      let added = 0;
      for (const x of index) {
        if (have.has(x.sunoId)) continue;
        manifest.imports.push({
          id: `suno-${x.sunoId}`,
          sunoId: x.sunoId,
          title: x.title,
          releaseTitle: null,
          artist: "P.H.K.D.",
          label: "VESAHE",
          language: null,
          genre: null,
          styles: x.styles,
          releaseDate: x.createdAt || null,
          durationSeconds: x.durationSeconds,
          sourcePackage: "_radio_index/suno_backup",
          source: x.audioPath,
          coverPath: x.coverPath,
          lyricsPath: x.lyricsPath,
          publicPath: null,
          checksum: x.checksum,
          bytes: x.bytes,
          rightsStatus: "NULL",
          license: null,
          citation: null,
          reviewer: null,
          reviewedAt: null,
          auditVerified: false,
          releaseAllowed: false,
          canPlay: false,
          status: "blocked",
          verificationState: "blocked-rights-proof-null",
          missing: ["rightsStatus", "license", "citation", "reviewer", "reviewedAt", "auditVerified", "releaseAllowed"],
          blocker: "imported from Suno library; rights/reviewer/audit evidence NULL; canPlay=false",
        });
        have.add(x.sunoId);
        added++;
      }
      if (manifest.counts) {
        manifest.counts.imports = manifest.imports.length;
        manifest.counts.sunoImports = (manifest.counts.sunoImports || 0) + added;
      }
      manifest.lastSunoSyncAt = new Date().toISOString();
      await fs.writeFile(mPath, JSON.stringify(manifest, null, 2));
      console.log(`Manifest ${path.relative(REPO_ROOT, mPath)}: +${added} suno imports (total ${manifest.imports.length})`);
    }
  }

  console.log("\n=== Suno sync complete ===");
  console.log(`Audio downloaded: ${stats.audio}  (skipped existing: ${stats.audioSkip}, failed: ${stats.audioFail})`);
  console.log(`Covers downloaded: ${stats.covers}  (skipped: ${stats.coverSkip})`);
  console.log(`Lyrics written: ${stats.lyrics}`);
  console.log(`Catalog: apps/*/public/radio-html/data/suno-library-catalog.{json,csv} (${index.length} tracks)`);
  console.log(`Assets: _radio_index/suno_backup/{audio,covers,lyrics}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
