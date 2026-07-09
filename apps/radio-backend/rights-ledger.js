// Phase 9 — rights lifecycle automation.
//
//   RightsLedger: append-only JSONL of every rights event (proof-uploaded,
//   proof-verified, published, expiry-reverted, renewal) with timestamp + actor.
//   Expiry job (daily cron): tracks whose rightsExpiryDate has passed are
//   auto-reverted to unpublished (fail-closed) with a ledger entry + a
//   notification record for the admin. Idempotent — safe to re-run.
//
//   External registries (IPRS/PPL): a seam only — RIGHTS_REGISTRY_API env.
//   Without it, verification stays with the manual rights-closure lane
//   (blocked-rights-registry-null; nothing is auto-verified).

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const LEDGER_FILE = path.join(__dirname, "rights-ledger.jsonl");
const NOTIFICATIONS_FILE = path.join(__dirname, "rights-notifications.jsonl");
const ADMIN_DATA_FILE = path.join(__dirname, "admin-data.json");

function appendLedger(event, file = LEDGER_FILE) {
  const record = {
    id: `rl-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    at: new Date().toISOString(),
    kind: String(event.kind), // proof-uploaded | proof-verified | published | expiry-reverted | renewal
    trackId: event.trackId || null,
    proofId: event.proofId || null,
    actor: event.actor || "system",
    detail: event.detail || null
  };
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
  return record;
}

function readLedger(file = LEDGER_FILE) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

/**
 * Daily expiry check. For every track override with published intent and a
 * rightsExpiryDate in the past: revert published → false, ledger the event,
 * notify the admin. Returns the reverted track ids. Pure on inputs for tests.
 */
function checkExpiry(adminData, now = new Date(), files = {}) {
  const reverted = [];
  for (const [trackId, override] of Object.entries(adminData.tracks || {})) {
    if (override.published !== true || !override.rightsExpiryDate) continue;
    if (new Date(override.rightsExpiryDate).getTime() > now.getTime()) continue;
    override.published = false;
    override.rightsStatus = "rights-expired-auto-reverted";
    override.revertedAt = now.toISOString();
    const ledgerEntry = appendLedger(
      { kind: "expiry-reverted", trackId, actor: "expiry-job", detail: `rightsExpiryDate ${override.rightsExpiryDate} passed — published reverted to false (fail-closed)` },
      files.ledger
    );
    fs.appendFileSync(
      files.notifications || NOTIFICATIONS_FILE,
      `${JSON.stringify({ at: now.toISOString(), type: "rights-expiry", trackId, ledgerId: ledgerEntry.id, action: "re-verify rights or renew the proof, then re-publish via the rights lane" })}\n`
    );
    reverted.push(trackId);
  }
  return reverted;
}

/** External rights registry seam (IPRS/PPL). Manual lane without configuration. */
async function verifyWithExternalRegistry(trackId, env = process.env) {
  if (!env.RIGHTS_REGISTRY_API) {
    return { blocked: "blocked-rights-registry-null: no IPRS/PPL API configured — verification stays manual via the rights-closure lane" };
  }
  try {
    const response = await fetch(`${env.RIGHTS_REGISTRY_API}/verify?track=${encodeURIComponent(trackId)}`, {
      headers: env.RIGHTS_REGISTRY_KEY ? { authorization: `Bearer ${env.RIGHTS_REGISTRY_KEY}` } : {}
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || response.status);
    return { covered: Boolean(data.covered), registry: env.RIGHTS_REGISTRY_API, raw: data };
  } catch (error) {
    return { blocked: `rights-registry-unreachable: ${error.message}` };
  }
}

/** The daily job: load admin data, revert expired, persist. */
function runExpiryJob(files = {}) {
  const adminFile = files.adminData || ADMIN_DATA_FILE;
  if (!fs.existsSync(adminFile)) return { reverted: [], note: "no admin-data.json" };
  const adminData = JSON.parse(fs.readFileSync(adminFile, "utf8"));
  const reverted = checkExpiry(adminData, new Date(), files);
  if (reverted.length) {
    adminData.updatedAt = new Date().toISOString();
    fs.writeFileSync(adminFile, `${JSON.stringify(adminData, null, 2)}\n`);
  }
  return { reverted, note: reverted.length ? "run npm run radio:engine:manifest to apply the reverts to served artifacts" : "nothing expired" };
}

module.exports = { appendLedger, readLedger, checkExpiry, verifyWithExternalRegistry, runExpiryJob, LEDGER_FILE };

// CLI: node apps/radio-backend/rights-ledger.js   (cron: daily, e.g. `0 2 * * *`)
if (require.main === module) {
  console.log(JSON.stringify(runExpiryJob(), null, 2));
}
