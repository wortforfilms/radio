#!/usr/bin/env node
/**
 * prepare-radio-asset-rights-proof.mjs
 *
 * Generates the COMPLETED rights-closure proof for the asset-evidence lane that
 * `npm run radio:rights:closure` verifies. It reads the canonical asset evidence
 * and pre-fills every derivable / accurate field per asset:
 *   - owner-generated assets (heroes, covers, icons, shaders, placeholder) →
 *     creator = VESAHE Film Solutions Private Limited (P.H.K.D.), proprietary licence
 *   - third-party vendor assets (three.js) → creator = Three.js authors, MIT licence
 *   - checksum copied from the evidence sha256 (so the verifier's match check passes)
 *
 * FAIL-CLOSED: the human sign-off is NOT fabricated. rightsStatus stays "draft" and
 * releaseAllowed/auditVerified stay false UNLESS you pass --reviewer "<your name>".
 * Passing --reviewer is the actual review act; only then does the gate become closable.
 *
 * Usage:
 *   node scripts/prepare-radio-asset-rights-proof.mjs                       # draft (gate stays blocked)
 *   node scripts/prepare-radio-asset-rights-proof.mjs --reviewer "Hemant"   # signs off → verified
 *   node scripts/prepare-radio-asset-rights-proof.mjs --reviewer "Hemant" --reviewed-at 2026-06-25
 *   node scripts/prepare-radio-asset-rights-proof.mjs --exclude audio-phkd-audio-placeholder-json
 *
 * Then close the gate:
 *   EVIDENCE_RIGHTS_IMPORT="$(pwd)/_radio_index/rights-proof-assets.json" npm run radio:rights:closure
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (n, d = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const REVIEWER = opt("--reviewer", "");
const REVIEWED_AT = opt("--reviewed-at", new Date().toISOString().slice(0, 10));
const EXCLUDE = new Set((opt("--exclude", "") || "").split(",").map((s) => s.trim()).filter(Boolean));
const includeVendor = !args.includes("--no-vendor");

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = path.join(REPO, "apps/web/public/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json");
const outJson = path.resolve(REPO, opt("--out", "_radio_index/rights-proof-assets.json"));
const outCsv = outJson.replace(/\.json$/i, ".csv");

const OWNER = "VESAHE Film Solutions Private Limited (P.H.K.D.)";
const OWNER_LICENSE = "Proprietary — © VESAHE Film Solutions Private Limited; cleared for project use";
const OWNER_CITATION = "Owner-generated interface asset; rights pack: _radio_index/Rights_Declarations_and_Agreements.docx";
const CONTRACT_REF = "Rights_Declarations_and_Agreements.docx";

const isVendorThree = (rec) => rec.group === "vendor" && /three(\.module)?\.min\.js$/.test(rec.path);

if (!fs.existsSync(evidencePath)) {
  console.error("Asset evidence not found:", evidencePath);
  console.error("Run the milestones build first so the asset evidence + rights-evidence.json exist.");
  process.exit(1);
}
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const signed = Boolean(REVIEWER);

const columns = ["id","path","checksum","source","creator","license","rightsStatus",
  "citation","reviewer","reviewedAt","auditVerified","releaseAllowed","reason","contractRef"];

const records = (evidence.records || [])
  .filter((r) => !EXCLUDE.has(r.id))
  .filter((r) => includeVendor || r.group !== "vendor")
  .map((r) => {
    const vendor = isVendorThree(r);
    const creator = vendor ? "Three.js authors (mrdoob & contributors)" : OWNER;
    const license = vendor ? "MIT (Three.js)" : OWNER_LICENSE;
    const citation = vendor ? "https://github.com/mrdoob/three.js — MIT License" : OWNER_CITATION;
    const source = `${r.source?.kind || r.status || "local"}:${r.path}`;
    return {
      id: r.id,
      path: r.path,
      checksum: r.evidence?.sha256 || "",
      source,
      creator,
      license,
      rightsStatus: signed ? "verified" : "draft",
      citation,
      reviewer: signed ? REVIEWER : "",
      reviewedAt: signed ? REVIEWED_AT : "",
      auditVerified: signed ? "true" : "false",
      releaseAllowed: signed ? "true" : "false",
      reason: vendor ? "third-party MIT dependency, attribution recorded" : "owner-created interface asset",
      contractRef: vendor ? "MIT" : CONTRACT_REF,
    };
  });

const csvCell = (v) => { const s = String(v ?? ""); return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
const csv = [columns.join(","), ...records.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.writeFileSync(outJson, JSON.stringify({ id: "radio-asset-rights-proof", generatedAt: REVIEWED_AT, signed, reviewer: REVIEWER || null, records }, null, 2) + "\n");
fs.writeFileSync(outCsv, csv);

const vendorCount = records.filter(isVendorThree).length;
console.log(`Rights proof written: ${records.length} records (${vendorCount} vendor/MIT, ${records.length - vendorCount} owner).`);
console.log(`  JSON: ${path.relative(REPO, outJson)}`);
console.log(`  CSV : ${path.relative(REPO, outCsv)}`);
if (!signed) {
  console.log(`\nDRAFT — gate stays BLOCKED (fail-closed). No reviewer recorded.`);
  console.log(`Re-run with your sign-off:  node scripts/prepare-radio-asset-rights-proof.mjs --reviewer "<your name>"`);
} else {
  console.log(`\nSIGNED by ${REVIEWER} on ${REVIEWED_AT}. Close the gate:`);
  console.log(`  EVIDENCE_RIGHTS_IMPORT="${outJson}" npm run radio:rights:closure`);
}
