// Phase 3 — continuous learning over the agent's evidence trail.
//
//   feedback events (agent-feedback ledger) → aggregate per rule fired →
//   bounded weight adjustment → agent-weights.json (runtime config) →
//   decide() consults weights + per-listener personalisation.
//
// Honest learning: weights only ever move by policy.learning.adjustmentRate per
// run, clamped to [minWeight, 2.0]; feedback is stored immutably (JSONL);
// personalisation derives ONLY from explicit listener feedback — never inferred
// silently. Weekly cadence is a documented cron (see AGENT.md) — the job itself
// is idempotent and safe to run any time: `node apps/radio-backend/learning.js`.

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const FEEDBACK_FILE = path.join(__dirname, "agent-feedback.jsonl");
const WEIGHTS_FILE = path.join(__dirname, "agent-weights.json");

function loadWeights(file = WEIGHTS_FILE) {
  if (!fs.existsSync(file)) return { updatedAt: null, ruleWeights: {}, listeners: {} };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function appendFeedback(entry, file = FEEDBACK_FILE) {
  const record = {
    receivedAt: new Date().toISOString(),
    decisionId: String(entry.decisionId || ""),
    userId: entry.userId || null,
    rating: normalizeRating(entry.rating),
    comment: entry.comment ? String(entry.comment).slice(0, 500) : null,
    // evidence of WHICH rules produced the rated decision (from decide()'s trail)
    evidence: Array.isArray(entry.evidence) ? entry.evidence.slice(0, 12) : [],
    persona: entry.persona || null,
    stationSlug: entry.stationSlug || null
  };
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
  return record;
}

/** up/down or 1–5 → [-1, +1] */
function normalizeRating(rating) {
  if (rating === "up") return 1;
  if (rating === "down") return -1;
  const numeric = Number(rating);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) return (numeric - 3) / 2;
  return 0;
}

function readFeedback(file = FEEDBACK_FILE) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** Aggregate normalised ratings per rule id (rule ids come from evidence: "rule:xyz ..."). */
function aggregateByRule(feedback) {
  const totals = {};
  for (const record of feedback) {
    for (const evidence of record.evidence || []) {
      const match = /^rule:([a-z0-9\-]+)/i.exec(evidence);
      if (!match) continue;
      const rule = match[1];
      totals[rule] = totals[rule] || { sum: 0, count: 0 };
      totals[rule].sum += record.rating;
      totals[rule].count += 1;
    }
  }
  return totals;
}

/**
 * Bounded adjustment: weight += rate * meanRating, clamped [minWeight, 2.0].
 * Deterministic given the same ledger — safe to re-run.
 */
function adjustWeights(current, totals, learning) {
  const rate = learning.adjustmentRate ?? 0.1;
  const minWeight = learning.minWeight ?? 0.2;
  const next = { ...current };
  for (const [rule, { sum, count }] of Object.entries(totals)) {
    const mean = count ? sum / count : 0;
    const weight = (next[rule] ?? 1) + rate * mean;
    next[rule] = Math.min(2, Math.max(minWeight, Number(weight.toFixed(4))));
  }
  return next;
}

/** Per-listener preferences from that listener's OWN positive feedback only. */
function personalise(feedback) {
  const listeners = {};
  for (const record of feedback) {
    if (!record.userId || record.rating <= 0) continue;
    const listener = (listeners[record.userId] = listeners[record.userId] || { personaVotes: {}, stationVotes: {} });
    if (record.persona) listener.personaVotes[record.persona] = (listener.personaVotes[record.persona] || 0) + record.rating;
    if (record.stationSlug) listener.stationVotes[record.stationSlug] = (listener.stationVotes[record.stationSlug] || 0) + record.rating;
  }
  const out = {};
  for (const [userId, votes] of Object.entries(listeners)) {
    const top = (map) => Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    out[userId] = { preferredPersona: top(votes.personaVotes), favoredStation: top(votes.stationVotes) };
  }
  return out;
}

/** The weekly job (idempotent). Returns the written config. */
function runLearningJob(learning, files = {}) {
  if (!learning || learning.enabled === false) {
    return { skipped: "learning disabled in policy" };
  }
  const feedback = readFeedback(files.feedback);
  const current = loadWeights(files.weights);
  const config = {
    updatedAt: new Date().toISOString(),
    feedbackCount: feedback.length,
    ruleWeights: adjustWeights(current.ruleWeights || {}, aggregateByRule(feedback), learning),
    listeners: personalise(feedback)
  };
  fs.writeFileSync(files.weights || WEIGHTS_FILE, `${JSON.stringify(config, null, 2)}\n`);
  return config;
}

module.exports = { appendFeedback, normalizeRating, readFeedback, aggregateByRule, adjustWeights, personalise, runLearningJob, loadWeights, WEIGHTS_FILE, FEEDBACK_FILE };

// CLI: node apps/radio-backend/learning.js  (cron: weekly, e.g. `0 3 * * 1`)
if (require.main === module) {
  const policyFile = path.join(__dirname, "../../apps/radio/public/registry/agent-policy.json");
  const learning = fs.existsSync(policyFile) ? JSON.parse(fs.readFileSync(policyFile, "utf8")).policy.learning : null;
  console.log(JSON.stringify(runLearningJob(learning || { enabled: true, adjustmentRate: 0.1, minWeight: 0.2 }), null, 2));
}
