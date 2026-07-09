// Phase 4 — autonomous content generation (music + lyrics), fail-closed.
//
// Providers via env: CONTENTGEN_PROVIDER (suno | udio | local) + CONTENTGEN_API_KEY
// (+ CONTENTGEN_BASE_URL for local). No provider ⇒ blocked-contentgen-provider-null.
//
// EVERYTHING generated lands UNPUBLISHED in the GeneratedContent ledger
// (generated-content.jsonl): { published: false, rightsProof: null }. The ONLY
// path to publication is the existing rights lane — an admin uploads a proof
// via /admin/rights-proof and the rights-closure verifier marks it verified.
// publishGenerated() refuses anything else. AI provenance is stamped on every
// record and can never be removed.

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const LEDGER = path.join(__dirname, "generated-content.jsonl");

function genConfig(env = process.env) {
  const provider = (env.CONTENTGEN_PROVIDER || "").toLowerCase() || null;
  return { provider, apiKey: env.CONTENTGEN_API_KEY || null, baseUrl: env.CONTENTGEN_BASE_URL || null };
}

async function callMusicProvider(cfg, description, durationSeconds) {
  if (cfg.provider === "suno" || cfg.provider === "udio") {
    // Real integration requires an approved API key; endpoint shapes differ per
    // account tier, so the request is made against the configured base URL.
    const base = cfg.baseUrl || (cfg.provider === "suno" ? "https://api.suno.ai" : "https://api.udio.com");
    const response = await fetch(`${base}/v1/generate`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({ prompt: description, duration: durationSeconds })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `${cfg.provider} ${response.status}`);
    return { audioUrl: data.audio_url || data.url, providerJobId: data.id || null };
  }
  if (cfg.provider === "local") {
    const response = await fetch(`${cfg.baseUrl || "http://localhost:8500"}/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: description, duration: durationSeconds })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `local ${response.status}`);
    return { audioUrl: data.audioUrl, providerJobId: data.jobId || null };
  }
  throw new Error(`unknown provider: ${cfg.provider}`);
}

/** Generate music. Returns a ledger record (published:false) or a blocked result. */
async function generateMusic(description, durationSeconds = 60, deps = {}) {
  const cfg = deps.config || genConfig();
  if (!cfg.provider) {
    return { blocked: "blocked-contentgen-provider-null: set CONTENTGEN_PROVIDER (+ CONTENTGEN_API_KEY) to enable generation" };
  }
  if (cfg.provider !== "local" && !cfg.apiKey) {
    return { blocked: `blocked-contentgen-key-null: provider "${cfg.provider}" configured without CONTENTGEN_API_KEY` };
  }
  let output;
  try {
    output = await (deps.callMusicProvider || callMusicProvider)(cfg, String(description || ""), durationSeconds);
  } catch (error) {
    return { blocked: `generation-failed: ${error.message}` };
  }
  return storeGenerated(
    {
      kind: "music",
      description: String(description || "").slice(0, 400),
      durationSeconds,
      audioUrl: output.audioUrl || null,
      providerJobId: output.providerJobId || null,
      provider: cfg.provider
    },
    deps.ledger
  );
}

/** Store a generated record. ALWAYS unpublished, AI-provenance stamped. */
function storeGenerated(record, ledger = LEDGER) {
  const stored = {
    id: `gen-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
    createdAt: new Date().toISOString(),
    ...record,
    aiGenerated: true, // permanent provenance
    published: false, // fail-closed: rights closure is the only path to true
    rightsProof: null,
    disclosure: "AI-generated content — not published; rights not closed."
  };
  fs.appendFileSync(ledger, `${JSON.stringify(stored)}\n`);
  return stored;
}

function listGenerated(ledger = LEDGER) {
  if (!fs.existsSync(ledger)) return [];
  return fs
    .readFileSync(ledger, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/**
 * Publish attempt — refused unless a VERIFIED rights proof exists for this
 * generated id (adminData.rightsProofs, verified only by the rights-closure
 * lane). Publication appends a new ledger state; history is immutable.
 */
function publishGenerated(generatedId, adminData, ledger = LEDGER) {
  const records = listGenerated(ledger);
  const record = records.filter((entry) => entry.id === generatedId).pop();
  if (!record) return { error: "unknown generated id" };
  const proof = (adminData.rightsProofs || []).find((candidate) => candidate.trackId === generatedId && candidate.verified === true);
  if (!proof) {
    return {
      blocked: `publish refused: no VERIFIED rights proof for ${generatedId}. Upload via /admin/rights-proof, then run the rights-closure lane.`
    };
  }
  const published = { ...record, published: true, rightsProof: proof.id, publishedAt: new Date().toISOString(), disclosure: "AI-generated content (rights closed)." };
  fs.appendFileSync(ledger, `${JSON.stringify(published)}\n`);
  return published;
}

module.exports = { genConfig, generateMusic, storeGenerated, listGenerated, publishGenerated, LEDGER };
