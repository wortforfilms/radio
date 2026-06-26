#!/usr/bin/env node
/**
 * suno-previews.mjs — Generate free-tier 60-second preview clips for every track.
 *
 * Free tier serves these previews; the full track stays gated behind unlock/Pro,
 * so the complete audio is never exposed to free users.
 *
 * Reads downloaded audio from _radio_index/suno_backup/audio/<id>.mp3 (produced by
 * suno-sync.mjs) and writes _radio_index/suno_backup/previews/<id>.mp3.
 * Idempotent: existing previews are skipped, so re-running only fills gaps.
 *
 * Requires ffmpeg on PATH  (brew install ffmpeg).
 *
 * Usage:
 *   node scripts/suno-previews.mjs                 # 60s previews, first minute
 *   node scripts/suno-previews.mjs --seconds 90    # different length
 *   node scripts/suno-previews.mjs --start 15      # skip a 15s intro, then take the clip
 *   node scripts/suno-previews.mjs --concurrency 4
 *   node scripts/suno-previews.mjs --no-fade
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const SECONDS = Math.max(5, parseInt(opt("--seconds", "60"), 10) || 60);
const START = Math.max(0, parseInt(opt("--start", "0"), 10) || 0);
const CONCURRENCY = Math.max(1, parseInt(opt("--concurrency", "4"), 10) || 4);
const FADE = !flag("--no-fade");
const FADE_DUR = 3;

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const AUDIO_DIR = path.join(REPO_ROOT, "_radio_index", "suno_backup", "audio");
const PREVIEW_DIR = path.join(REPO_ROOT, "_radio_index", "suno_backup", "previews");

function ffmpegAvailable() {
  return new Promise((resolve) => {
    const p = spawn("ffmpeg", ["-version"]);
    p.on("error", () => resolve(false));
    p.on("close", (code) => resolve(code === 0));
  });
}

function runFfmpeg(src, dest) {
  return new Promise((resolve, reject) => {
    const af = FADE ? ["-af", `afade=t=out:st=${Math.max(0, SECONDS - FADE_DUR)}:d=${FADE_DUR}`] : [];
    const a = [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", String(START),
      "-i", src,
      "-t", String(SECONDS),
      ...af,
      "-c:a", "libmp3lame", "-q:a", "4",
      dest,
    ];
    const p = spawn("ffmpeg", a);
    let err = "";
    p.stderr.on("data", (d) => { err += d.toString(); });
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(err || `ffmpeg exit ${code}`))));
  });
}

async function pool(items, n, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const cur = i++; await worker(items[cur]); }
  }));
}

async function main() {
  if (!(await ffmpegAvailable())) {
    console.error("ffmpeg not found on PATH. Install it first:  brew install ffmpeg");
    process.exit(1);
  }
  let files;
  try { files = (await fs.readdir(AUDIO_DIR)).filter((f) => f.toLowerCase().endsWith(".mp3")); }
  catch { console.error(`No audio dir at ${AUDIO_DIR}. Run scripts/suno-sync.mjs first.`); process.exit(1); }

  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  console.log(`Source tracks: ${files.length}  ·  preview length: ${SECONDS}s (start ${START}s, fade ${FADE ? "on" : "off"})`);

  const stats = { made: 0, skipped: 0, failed: 0 };
  await pool(files, CONCURRENCY, async (f) => {
    const src = path.join(AUDIO_DIR, f);
    const dest = path.join(PREVIEW_DIR, f);
    try { await fs.access(dest); stats.skipped++; return; } catch { /* generate */ }
    try { await runFfmpeg(src, dest); stats.made++; }
    catch (e) { stats.failed++; console.warn("  preview fail:", f, e.message.split("\n")[0]); }
  });

  console.log(`\n=== Previews complete ===`);
  console.log(`Made: ${stats.made}  ·  skipped existing: ${stats.skipped}  ·  failed: ${stats.failed}`);
  console.log(`Output: _radio_index/suno_backup/previews/<id>.mp3`);
  console.log(`Free tier should serve previews/; full tracks stay gated in audio/.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
