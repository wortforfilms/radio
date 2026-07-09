import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { decide, daypartOf } from "../apps/radio-backend/agent.js";
import { agentCapabilities, agentPolicy, validateRegistry } from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

const policy = { policy: agentPolicy, capabilities: agentCapabilities };
const world = {
  policy,
  stations: [
    {
      slug: "sanatan-devotional",
      name: "Sanatan & Devotional",
      programs: [
        { trackId: "t-free", title: "Free Bhajan", freeTier: true, version: "original", priceInr: null },
        { trackId: "t-paid", title: "Paid Bhajan", freeTier: false, version: "take-2", priceInr: 2900 },
        { trackId: "t-paid-2", title: "Another Bhajan", freeTier: false, version: "original", priceInr: null },
      ],
    },
    {
      slug: "electronic-fusion",
      name: "Electronic & Fusion",
      programs: [{ trackId: "t-night", title: "Night Synth", freeTier: false, version: "original" }],
    },
  ],
};

describe("agent registry layer", () => {
  it("validates with evidence-backed capabilities and a disclosure policy", () => {
    expect(validateRegistry()).toEqual([]);
    expect(agentCapabilities.filter((capability) => capability.status === "built").length).toBe(6);
    for (const capability of agentCapabilities) {
      expect(capability.gates.length).toBeGreaterThan(0);
      if (capability.status === "planned") expect(capability.implementedBy).toEqual([]);
    }
    expect(agentPolicy.disclosure).toContain("AI Radio Assistant");
    // ads and LLM answers are planned/blocked
    expect(agentCapabilities.find((capability) => capability.id === "insert-ad")?.status).toBe("planned");
    expect(agentCapabilities.find((capability) => capability.id === "answer-question")?.status).toBe("partial");
  });
});

describe("rule-based decision engine", () => {
  it("maps dayparts to personas and stations", () => {
    expect(daypartOf(7)).toBe("morning");
    expect(daypartOf(13)).toBe("day");
    expect(daypartOf(19)).toBe("evening");
    expect(daypartOf(23)).toBe("night");
    const morning = decide({ hour: 7 }, world);
    expect(morning.persona).toBe("maataa");
    expect(morning.actions.find((action) => action.type === "select-station")?.stationSlug).toBe("sanatan-devotional");
    const night = decide({ hour: 23 }, world);
    expect(night.persona).toBe("vigyaaniq");
    expect(night.actions.find((action) => action.type === "select-station")?.stationSlug).toBe("electronic-fusion");
  });

  it("plays rights-aware: free tier full, entitled full, otherwise preview", () => {
    const anonymous = decide({ hour: 7 }, world);
    const play = anonymous.actions.find((action) => action.type === "play-track");
    expect(play?.trackId).toBe("t-free");
    expect(play?.access).toBe("full");
    // currently playing the free track → next pick is preview-only
    const rotating = decide({ hour: 7, currentTrackId: "t-free" }, world);
    expect(rotating.actions.find((action) => action.type === "play-track")?.access).toBe("preview");
    // entitlement unlocks full access
    const entitled = decide(
      { hour: 7, currentTrackId: "t-free", entitlements: [{ scope: "track", trackId: "t-paid" }] },
      world
    );
    const entitledPlay = entitled.actions.find((action) => action.type === "play-track");
    expect(entitledPlay?.trackId).toBe("t-paid");
    expect(entitledPlay?.access).toBe("full");
  });

  it("announces manifest facts only, with disclosure, rate-limited", () => {
    const decision = decide({ hour: 7 }, world);
    const announce = decision.actions.find((action) => action.type === "announce");
    expect(announce?.text).toContain("Sanatan & Devotional");
    expect(announce?.text).toContain("AI Radio Assistant");
    expect(announce?.persona).toBe("maataa");
    // no weather in perception → no weather text fabricated
    expect(announce?.text).not.toContain("temperature");
    const limited = decide({ hour: 7, announcementsThisHour: 99 }, world);
    expect(limited.actions.some((action) => action.type === "announce")).toBe(false);
    expect(limited.blocked.some((reason) => reason.includes("rate limit"))).toBe(true);
  });

  it("upsells transparently only after the preview threshold, via the real checkout", () => {
    const below = decide({ hour: 7, previewCounts: { "t-paid": 2 } }, world);
    expect(below.actions.some((action) => action.type === "suggest-purchase")).toBe(false);
    const above = decide({ hour: 7, previewCounts: { "t-paid": 3 } }, world);
    const upsell = above.actions.find((action) => action.type === "suggest-purchase");
    expect(upsell?.trackId).toBe("t-paid");
    expect(upsell?.priceLabel).toBe("₹29.00");
    expect(upsell?.transparent).toBe(true);
    expect(upsell?.checkout).toBe("/api/payments/order");
    // already entitled → never upsold
    const owned = decide(
      { hour: 7, previewCounts: { "t-paid": 5 }, entitlements: [{ scope: "track", trackId: "t-paid" }] },
      world
    );
    expect(owned.actions.some((action) => action.type === "suggest-purchase")).toBe(false);
  });

  it("keeps fail-closed lanes blocked and honest", () => {
    const decision = decide({ hour: 7, query: "explain this raga" }, world);
    expect(decision.blocked.some((reason) => reason.startsWith("insert-ad"))).toBe(true);
    expect(decision.blocked.some((reason) => reason.includes("blocked-llm-provider-null"))).toBe(true);
    // planned capabilities never appear as actions
    expect(decision.actions.every((action) => !["insert-ad", "answer-question", "run-quiz", "compose-content"].includes(action.type))).toBe(true);
    expect(decision.llmProvider).toBeNull();
  });
});

describe("integration artifacts", () => {
  it("emits agent-policy.json and AGENT.md from the registry", () => {
    const policyOut = readJson<{ counts: { built: number }; policy: { disclosure: string } }>(
      "apps/radio/public/registry/agent-policy.json"
    );
    expect(policyOut.counts.built).toBe(6);
    expect(policyOut.policy.disclosure).toContain("AI Radio Assistant");
    expect(read("docs/registry/AGENT.md")).toContain("fail-closed co-pilot");
  });

  it("wires the orchestrator endpoints and the engine co-pilot", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/agent/decide"');
    expect(server).toContain('app.get("/agent/capabilities"');
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("agentAutoDj");
    expect(engine).toContain("/agent/decide");
    expect(engine).toContain("rv.previewCounts");
    // the agent executes through existing rights-aware methods only
    expect(engine).toContain("this.playTrackById(action.trackId)");
    expect(engine).toBe(read("apps/desktop/public/radio-html/assets/js/radio-engine.js"));
  });
});
