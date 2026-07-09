// Phase-2 cognition: LLM-powered natural-language handling for the radio agent.
//
//   query → KNOWLEDGE LANE (local content library + /api/search) → sources
//         → LLM (provider adapters, sources-only system prompt)
//         → VALIDATION (structured JSON, allowed actions, rights, disclosure)
//
// Honesty is enforced in CODE, never delegated to the model:
//   • zero retrieved sources ⇒ the exact honest fallback — the LLM is not called
//   • model output must be valid JSON with allowed action types, else blocked
//   • play/recommend track ids are checked against the real manifest + commerce
//     access; unknown or locked picks are dropped with a blocked note
//   • the provider disclosure is APPENDED SERVER-SIDE to every spoken text
//   • no AGENT_LLM_PROVIDER ⇒ blocked-llm-provider-null (rule engine only)
//
// ask(query, context, persona, history, deps) is dependency-injected (provider
// call, remote search, track validation) so the whole loop is testable offline.

"use strict";

const NO_INFO_TEXT = "I don't have information about that yet.";
const ALLOWED_ACTIONS = new Set(["speak", "recommend", "play"]);
const MAX_SOURCES = 5;
const MAX_ACTIONS = 4;

const PERSONA_VOICE = {
  maataa: "You speak as Maataa: warm, maternal, gentle Hindi-inflected English, blessing-like closings.",
  rishi: "You speak as Rishi: measured, contemplative, scholarly; you cite and reflect.",
  samaya: "You speak as Samaya: clear, present, timekeeper-neutral; concise announcements.",
  vigyaaniq: "You speak as Vigyaaniq: curious, precise, scientific; you explain mechanisms simply."
};

function llmConfig(env = process.env) {
  const provider = (env.AGENT_LLM_PROVIDER || "").toLowerCase() || null;
  return {
    provider,
    apiKey: env.AGENT_LLM_API_KEY || null,
    model: env.AGENT_LLM_MODEL || null,
    baseUrl: env.AGENT_LLM_BASE_URL || null // for local/openrouter overrides
  };
}

// ---------------------------------------------------------------------------
// Knowledge lane
// ---------------------------------------------------------------------------
/** Score-and-rank the LOCAL content library (real storylines/titles/themes). */
function searchLocalLibrary(query, library) {
  const terms = String(query || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 2);
  if (!terms.length) return [];
  const scored = [];
  for (const record of library || []) {
    const haystack = `${record.title} ${record.stylizedTitle || ""} ${record.theme || ""} ${record.language || ""} ${(record.styles || []).join(" ")} ${record.storyline || ""}`.toLowerCase();
    let score = 0;
    for (const term of terms) if (haystack.includes(term)) score += 1;
    if (score > 0) scored.push({ score, record });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_SOURCES).map(({ record }) => ({
    title: record.stylizedTitle || record.title,
    url: `/radio/archive#${record.slug || record.id}`,
    ref: `content-library:${record.id}`,
    excerpt: String(record.storyline || record.title).slice(0, 420)
  }));
}

async function gatherSources(query, deps) {
  const sources = [...searchLocalLibrary(query, deps.contentLibrary)];
  if (deps.remoteSearch) {
    try {
      const remote = await deps.remoteSearch(query);
      for (const passage of remote || []) {
        if (sources.length >= MAX_SOURCES) break;
        if (passage && passage.excerpt) {
          sources.push({
            title: passage.title || "knowledge-graph entry",
            url: passage.url || "/search",
            ref: passage.ref || `search:${passage.title || "result"}`,
            excerpt: String(passage.excerpt).slice(0, 420)
          });
        }
      }
    } catch {
      // remote lane unavailable — local sources only (never fabricated)
    }
  }
  return sources;
}

// ---------------------------------------------------------------------------
// Prompting
// ---------------------------------------------------------------------------
function buildSystemPrompt(persona, sources, context, policy) {
  const voice = PERSONA_VOICE[persona] || PERSONA_VOICE.samaya;
  return [
    "You are the Vaigyaaniq Radio AI assistant (fail-closed, evidence-only).",
    voice,
    "",
    "STRICT RULES:",
    `1. Answer ONLY from the CITED SOURCES below. If they do not contain the answer, reply exactly: "${NO_INFO_TEXT}"`,
    "2. Never invent tracks, facts, prices, schedules, or rights claims.",
    "3. Output ONLY a JSON object: {\"actions\":[{\"type\":\"speak\"|\"recommend\"|\"play\", \"text\"?, \"trackId\"?}], \"cited\":[\"source ref\", ...]}",
    "4. trackId values must come from the sources' content-library refs only.",
    "5. Do NOT add any disclosure — it is appended by the system.",
    "",
    "CONTEXT (verified):",
    JSON.stringify({
      station: context.stationName || null,
      nowPlaying: context.currentTrackTitle || null,
      daypart: context.daypart || null,
      weather: context.weather && context.weather.status === "ok" ? context.weather.announcementText : null,
      entitlements: (context.entitlements || []).length
    }),
    "",
    "CITED SOURCES:",
    ...sources.map((source, index) => `[${index + 1}] (${source.ref}) ${source.title}\n${source.excerpt}`),
    "",
    `POLICY: ${(policy && policy.rules ? policy.rules : []).join(" | ")}`
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Provider adapters (openai | anthropic | openrouter | local[ollama])
// ---------------------------------------------------------------------------
async function callProvider(cfg, system, user, history) {
  const messages = [...(history || []).slice(-6), { role: "user", content: user }];
  if (cfg.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": cfg.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: cfg.model || "claude-3-5-haiku-latest", max_tokens: 700, system, messages })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `anthropic ${response.status}`);
    return data.content?.[0]?.text || "";
  }
  if (cfg.provider === "openai" || cfg.provider === "openrouter") {
    const url = cfg.provider === "openrouter" ? cfg.baseUrl || "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({ model: cfg.model || "gpt-4o-mini", max_tokens: 700, messages: [{ role: "system", content: system }, ...messages] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `${cfg.provider} ${response.status}`);
    return data.choices?.[0]?.message?.content || "";
  }
  if (cfg.provider === "local") {
    const response = await fetch(`${cfg.baseUrl || "http://localhost:11434"}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: cfg.model || "llama3", stream: false, messages: [{ role: "system", content: system }, ...messages] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `local ${response.status}`);
    return data.message?.content || "";
  }
  throw new Error(`unknown provider: ${cfg.provider}`);
}

// ---------------------------------------------------------------------------
// Output validation (never trust the model)
// ---------------------------------------------------------------------------
function parseModelOutput(raw) {
  const match = String(raw || "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function validateActions(parsed, deps, persona, blocked) {
  const actions = [];
  // Validate first, cap AFTER — invalid model actions must not consume the budget.
  for (const action of parsed.actions || []) {
    if (actions.length >= MAX_ACTIONS) {
      blocked.push(`action-dropped: over the ${MAX_ACTIONS}-action limit`);
      break;
    }
    if (!ALLOWED_ACTIONS.has(action.type)) {
      blocked.push(`action-dropped: disallowed type "${action.type}"`);
      continue;
    }
    if (action.type === "speak") {
      const text = String(action.text || "").trim();
      if (!text) continue;
      actions.push({ type: "speak", text, persona });
      continue;
    }
    // recommend/play must reference REAL tracks and respect commerce access
    const verdict = deps.validateTrack ? deps.validateTrack(action.trackId) : { exists: false };
    if (!verdict.exists) {
      blocked.push(`action-dropped: unknown trackId "${action.trackId}" (model may not invent tracks)`);
      continue;
    }
    if (action.type === "play" && verdict.access === "locked") {
      blocked.push(`action-dropped: track ${action.trackId} is locked (rights not closed)`);
      continue;
    }
    actions.push(
      action.type === "play"
        ? { type: "play", trackId: action.trackId, access: verdict.access }
        : { type: "recommend", trackId: action.trackId, title: verdict.title || null }
    );
  }
  return actions;
}

// ---------------------------------------------------------------------------
// ask()
// ---------------------------------------------------------------------------
async function ask(query, context = {}, persona = "samaya", history = [], deps = {}) {
  const cfg = deps.config || llmConfig();
  const result = { actions: [], sources: [], evidence: [], blocked: [] };

  if (!cfg.provider) {
    result.blocked.push("blocked-llm-provider-null: set AGENT_LLM_PROVIDER (+ AGENT_LLM_API_KEY / AGENT_LLM_MODEL) to enable cognition");
    return result;
  }
  if (cfg.provider !== "local" && !cfg.apiKey) {
    result.blocked.push(`blocked-llm-key-null: provider "${cfg.provider}" configured without AGENT_LLM_API_KEY`);
    return result;
  }
  const disclosure = `This announcement was generated by our AI Radio Assistant with help from ${cfg.provider}.`;

  // knowledge lane first — no sources means no LLM call and the exact honest line
  const sources = await gatherSources(query, deps);
  result.sources = sources.map(({ title, url, ref }) => ({ title, url, ref }));
  if (!sources.length) {
    result.actions.push({ type: "speak", text: `${NO_INFO_TEXT} ${disclosure}`, persona });
    result.evidence.push("rule:no-sources-honest-fallback (LLM not called)");
    return result;
  }

  const system = buildSystemPrompt(persona, sources, context, deps.policy);
  let raw;
  try {
    raw = await (deps.callProvider || callProvider)(cfg, system, String(query || ""), history);
  } catch (error) {
    result.blocked.push(`llm-call-failed: ${error.message}`);
    return result;
  }
  const parsed = parseModelOutput(raw);
  if (!parsed) {
    result.blocked.push("llm-output-invalid: response was not the required JSON — no action taken (fail-closed)");
    return result;
  }
  result.actions = validateActions(parsed, deps, persona, result.blocked).map((action) =>
    action.type === "speak" ? { ...action, text: `${action.text} ${disclosure}` } : action
  );
  result.evidence = [
    ...sources.map((source) => `cited ${source.ref}`),
    "rule:llm-generated",
    `provider:${cfg.provider}/${cfg.model || "default"}`
  ];
  if (Array.isArray(parsed.cited)) {
    const known = new Set(sources.map((source) => source.ref));
    for (const ref of parsed.cited) if (!known.has(ref)) result.blocked.push(`citation-dropped: unknown source "${ref}"`);
  }
  return result;
}

/**
 * Phase 4 — lyrics generation via the same provider seam. The result is a
 * DRAFT: aiGenerated, unpublished; storage/rights handled by content-gen.js.
 */
async function generateLyrics(prompt, style = "", deps = {}) {
  const cfg = deps.config || llmConfig();
  if (!cfg.provider) return { blocked: "blocked-llm-provider-null: lyrics generation needs AGENT_LLM_PROVIDER" };
  if (cfg.provider !== "local" && !cfg.apiKey) return { blocked: "blocked-llm-key-null" };
  const system = [
    "You write original song lyrics for Vaigyaaniq Radio.",
    `Style: ${String(style || "devotional/science fusion").slice(0, 120)}`,
    "Rules: original text only — never reproduce existing copyrighted lyrics; no artist names; no claims about real people.",
    "Output plain lyric lines only."
  ].join("\n");
  let text;
  try {
    text = await (deps.callProvider || callProvider)(cfg, system, String(prompt || ""), []);
  } catch (error) {
    return { blocked: `llm-call-failed: ${error.message}` };
  }
  const lyrics = String(text || "").trim();
  if (!lyrics) return { blocked: "llm-output-empty" };
  return {
    kind: "lyrics",
    prompt: String(prompt || "").slice(0, 300),
    style: String(style || "").slice(0, 120),
    lyrics: lyrics.slice(0, 4000),
    aiGenerated: true,
    published: false,
    provider: cfg.provider
  };
}

module.exports = { ask, llmConfig, searchLocalLibrary, buildSystemPrompt, parseModelOutput, validateActions, generateLyrics, NO_INFO_TEXT };
