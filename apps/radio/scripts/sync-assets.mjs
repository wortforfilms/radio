#!/usr/bin/env node
// Populate apps/radio/public/radio-html from the monorepo web app.
// Default: symlink (no duplication). Use --copy for a self-contained copy (for deploy).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");                 // apps/radio
const src = path.resolve(root, "../web/public/radio-html");
const destDir = path.resolve(root, "public");
const dest = path.join(destDir, "radio-html");
const copy = process.argv.includes("--copy");

if (!fs.existsSync(src)) {
  console.error("source not found:", src, "\nRun from the monorepo, or pass a path.");
  process.exit(1);
}
fs.mkdirSync(destDir, { recursive: true });
try { fs.rmSync(dest, { recursive: true, force: true }); } catch { /* ignore */ }

if (copy) {
  fs.cpSync(src, dest, { recursive: true });
  console.log("copied radio-html →", path.relative(root, dest));
} else {
  const rel = path.relative(destDir, src);
  fs.symlinkSync(rel, dest, "dir");
  console.log("symlinked", path.relative(root, dest), "→", rel);
}
