// Radio-as-Agent orchestrator — Phase 1 rule engine (pure, testable).
//
//   perception  → cognition (deterministic rules; LLM opt-in seam) → actions
//
// Fail-closed constitution (enforced here, mirrored in registry/agent.ts):
//   • announcements are assembled ONLY from manifest fields — no fabrication
//   • playback respects commerce access states (full only free/entitled)
//   • ads permanently blocked without verified inventory
//   • purchases are transparent suggestions through the existing checkout
//   • every spoken action carries the AI disclosure
//   • no AGENT_LLM_PROVIDER ⇒ rule engine only (blocked-llm-provider-null)
//
// decide(perception, world) is side-effect free; the engine executes actions.

"use strict";

const DEFAULT_SINGLE_PRICE = { INR: 2900, USD: 99 }; // mirrors packages/shared/src/commerce.ts
const formatMoney = (minor, currency) => (currency === "INR" ? "₹" : "$") + (minor / 100).toFixed(2);

function daypartOf(hour) {
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

const GREETING = {
  morning: "Suprabhaat.",
  day: "Namaste.",
  evening: "Shubh sandhya.",
  night: "Shubh raatri."
};

function hasAccess(entitlements, track) {
  return (entitlements || []).some(
    (e) => e.active !== false && (e.scope === "all_access" || (e.scope === "track" && e.trackId === (track.trackId || track.id)))
  );
}

/**
 * @param perception {{
 *   hour?: number, entitlements?: Array, previewCounts?: Record<string,number>,
 *   currentTrackId?: string|null, weather?: {status:string, announcementText?:string}|null,
 *   announcementsThisHour?: number, query?: string|null, currency?: "INR"|"USD"
 * }}
 * @param world {{ stations: Array, policy: {policy: Object, capabilities: Array} }}
 */
function decide(perception, world) {
  const policy = world.policy.policy;
  const capabilities = new Map(world.policy.capabilities.map((capability) => [capability.id, capability]));
  const hour = Number.isInteger(perception.hour) ? perception.hour : new Date().getHours();
  const daypart = daypartOf(hour);
  const persona = policy.daypartPersona[daypart];
  const currency = perception.currency === "USD" ? "USD" : "INR";
  const entitlements = perception.entitlements || [];
  const actions = [];
  const evidence = [];
  const blocked = [];

  // ---- select station (daypart preference, falls back to first real station) ----
  const preferred = policy.daypartStations[daypart] || [];
  const station =
    preferred.map((slug) => world.stations.find((candidate) => candidate.slug === slug)).find(Boolean) ||
    world.stations[0];
  if (!station) {
    return { decidedAt: new Date().toISOString(), daypart, persona, actions: [], blocked: ["no stations in manifest"], evidence };
  }
  actions.push({ type: "select-station", stationSlug: station.slug, stationName: station.name });
  evidence.push(`rule:daypart-station ${daypart}→${station.slug}`);

  // ---- pick a track rights-aware: prefer entitled/free full, avoid repeating current ----
  const programs = (station.programs || []).filter((program) => program.trackId !== perception.currentTrackId);
  const fullPlayable = programs.find((program) => program.freeTier || hasAccess(entitlements, program));
  const pick = fullPlayable || programs[0];
  if (pick) {
    const access = fullPlayable ? "full" : "preview";
    actions.push({ type: "play-track", trackId: pick.trackId, title: pick.stylizedTitle || pick.title, access });
    evidence.push(`rule:rights-aware-pick access=${access} freeTier=${Boolean(pick.freeTier)}`);
  }

  // ---- announcement: manifest facts only + disclosure, rate-limited ----
  if ((perception.announcementsThisHour || 0) < policy.maxAnnouncementsPerHour && pick) {
    const facts = [
      GREETING[daypart],
      `You are tuned to ${station.name}.`,
      `Now playing: ${pick.title}${pick.version && pick.version !== "original" ? ` (${pick.version})` : ""}.`
    ];
    if (perception.weather && perception.weather.status === "ok" && perception.weather.announcementText) {
      facts.push(perception.weather.announcementText);
      evidence.push("rule:weather-brief (provider ok)");
    }
    actions.push({ type: "announce", persona, text: `${facts.join(" ")} ${policy.disclosure}` });
    evidence.push(`rule:announce persona=${persona} rate=${(perception.announcementsThisHour || 0) + 1}/${policy.maxAnnouncementsPerHour}`);
  } else if (pick) {
    blocked.push(`announce: rate limit reached (${policy.maxAnnouncementsPerHour}/hour)`);
  }

  // ---- recommendation: same station, real catalogue only ----
  const alternates = programs.filter((program) => program.trackId !== pick?.trackId).slice(0, 3);
  if (alternates.length) {
    actions.push({
      type: "recommend",
      trackIds: alternates.map((program) => program.trackId),
      titles: alternates.map((program) => program.title)
    });
    evidence.push("rule:recommend same-station alternates");
  }

  // ---- transparent upsell after repeated previews of the same track ----
  const previewCounts = perception.previewCounts || {};
  const upsellTrack = Object.entries(previewCounts).find(([, count]) => count >= policy.upsellAfterPreviews);
  if (upsellTrack) {
    const [trackId, count] = upsellTrack;
    const inStation = world.stations.flatMap((s) => s.programs || []).find((program) => program.trackId === trackId);
    if (inStation && !hasAccess(entitlements, { id: trackId })) {
      const minor = currency === "INR" ? (inStation.priceInr ?? DEFAULT_SINGLE_PRICE.INR) : (inStation.priceUsd ?? DEFAULT_SINGLE_PRICE.USD);
      actions.push({
        type: "suggest-purchase",
        trackId,
        title: inStation.title,
        priceLabel: formatMoney(minor, currency),
        checkout: "/api/payments/order",
        transparent: true,
        reason: `previewed ${count} times`
      });
      evidence.push(`rule:upsell after ${count} previews (threshold ${policy.upsellAfterPreviews})`);
    }
  }

  // ---- fail-closed lanes ----
  blocked.push("insert-ad: blocked — no rights-verified ad inventory");
  if (perception.query) {
    const provider = process.env.AGENT_LLM_PROVIDER || null;
    blocked.push(
      provider
        ? `answer-question: blocked — provider "${provider}" configured but knowledge lane (cited sources) not wired yet`
        : "answer-question: blocked-llm-provider-null — set AGENT_LLM_PROVIDER and wire the knowledge lane; answers must cite verified sources"
    );
  }

  return {
    decidedAt: new Date().toISOString(),
    engine: "rules-v1",
    llmProvider: process.env.AGENT_LLM_PROVIDER || null,
    daypart,
    persona,
    goal: daypart === "morning" ? "uplift" : daypart === "evening" ? "calm" : daypart === "night" ? "ambient" : "energise",
    disclosure: policy.disclosure,
    actions: actions.filter((action) => capabilities.get(action.type)?.status === "built"),
    blocked,
    evidence
  };
}

module.exports = { decide, daypartOf };
