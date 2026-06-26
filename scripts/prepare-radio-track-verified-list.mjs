#!/usr/bin/env node
/**
 * prepare-radio-track-verified-list.mjs
 *
 * Emits the reviewer-approved verified_v1.csv consumed by
 * `node scripts/promote-verified-tracks.mjs --verified-list ...` (audio rights lane).
 * Source: _radio_index/Credits_Labels_Master.csv (suno_id, label, lyricist, ...).
 *
 * FAIL-CLOSED: emitting an approved list IS a sign-off, so --reviewer is REQUIRED.
 * Without it the script refuses and prints guidance — it will not silently approve tracks.
 *
 * Usage:
 *   node scripts/prepare-radio-track-verified-list.mjs --reviewer "Hemant"            # all tracks
 *   node scripts/prepare-radio-track-verified-list.mjs --reviewer "Hemant" --label "Magic Mushrooms"
 *   node scripts/prepare-radio-track-verified-list.mjs --reviewer "Hemant" --limit 105
 *   node scripts/prepare-radio-track-verified-list.mjs --reviewer "Hemant" --out _radio_index/verified_v1.csv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const REVIEWER = opt("--reviewer", "");
const REVIEWED_AT = opt("--reviewed-at", new Date().toISOString().slice(0, 10));
const LABEL = opt("--label", null);
const LIMIT = parseInt(opt("--limit", "0"), 10) || 0;

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(REPO, "_radio_index/Credits_Labels_Master.csv");
const out = path.resolve(REPO, opt("--out", "_radio_index/verified_v1.csv"));

if (!REVIEWER) {
  console.error("Refusing to emit an approved list with no reviewer (fail-closed).");
  console.error('Re-run with your sign-off:  node scripts/prepare-radio-track-verified-list.mjs --reviewer "<your name>"');
  process.exit(1);
}
if (!fs.existsSync(src)) { console.error("Not found:", src); process.exit(1); }

const lines = fs.readFileSync(src, "utf8").split(/\r?\n/).filter(Boolean);
const head = lines.shift().split(",");
const idx = (n) => head.indexOf(n);
const iId = idx("suno_id"), iLabel = idx("label"), iTitle = idx("title");

let rows = lines.map((l) => {
  // simple CSV split is fine here: titles may contain commas, but we only read leading cols
  const cells = l.split(",");
  return { suno_id: cells[iId], label: cells[iLabel], title: cells[iTitle] };
}).filter((r) => r.suno_id);

if (LABEL) rows = rows.filter((r) => r.label === LABEL);
if (LIMIT) rows = rows.slice(0, LIMIT);

const license = "Owner-declared; Suno commercial-use; assigned to VESAHE Film Solutions Private Limited";
const citation = "Rights pack: Rights_Declarations_and_Agreements.docx + Schedule_A_Track_Lists.xlsx";
const csvCell = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
const cols = ["suno_id", "reviewer", "reviewedAt", "license", "citation"];
const csv = [cols.join(","), ...rows.map((r) =>
  [r.suno_id, REVIEWER, REVIEWED_AT, license, citation].map(csvCell).join(","))].join("\n") + "\n";

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, csv);
console.log(`verified list written: ${rows.length} tracks${LABEL ? ` (label="${LABEL}")` : ""}, approved by ${REVIEWER} on ${REVIEWED_AT}.`);
console.log(`  ${path.relative(REPO, out)}`);
console.log(`\nPromote them:`);
console.log(`  node scripts/promote-verified-tracks.mjs --dry-run --verified-list ${path.relative(REPO, out)}`);
console.log(`  npm run radio:promote -- --verified-list ${path.relative(REPO, out)}`);
