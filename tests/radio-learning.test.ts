import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { adjustWeights, aggregateByRule, appendFeedback, normalizeRating, personalise, runLearningJob } from "../apps/radio-backend/learning.js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { decide } from "../apps/radio-backend/agent.js";
import { agentPolicy } from "../apps/radio/registry/index.ts";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const world = (weights?: object) => ({
  policy: {
    policy: agentPolicy,
    capabilities: JSON.parse(read("apps/radio/public/registry/agent-policy.json")).capabilities,
  },
  weights,
  stations: [
    { slug: "sanatan-devotional", name: "Sanatan", programs: [{ trackId: "a", title: "A", freeTier: true }] },
    { slug: "sufi-qawwali", name: "Sufi", programs: [{ trackId: "b", title: "B", freeTier: true }] },
  ],
});

describe("phase 3 — feedback storage & aggregation", () => {
  it("normalises ratings and appends immutable feedback", () => {
    expect(normalizeRating("up")).toBe(1);
    expect(normalizeRating("down")).toBe(-1);
    expect(normalizeRating(5)).toBe(1);
    expect(normalizeRating(1)).toBe(-1);
    expect(normalizeRating(3)).toBe(0);
    const file = path.join(os.tmpdir(), `fb-${Date.now()}.jsonl`);
    appendFeedback({ decisionId: "d1", rating: "up", evidence: ["rule:daypart-station x"] }, file);
    appendFeedback({ decisionId: "d2", rating: "down", evidence: ["rule:daypart-station y"] }, file);
    expect(fs.readFileSync(file, "utf8").trim().split("\n").length).toBe(2);
  });

  it("aggregates per rule and adjusts weights boundedly", () => {
    const totals = aggregateByRule([
      { rating: 1, evidence: ["rule:daypart-station m", "rule:announce p"] },
      { rating: -1, evidence: ["rule:daypart-station m"] },
      { rating: 1, evidence: ["rule:announce p"] },
    ]);
    expect(totals["daypart-station"]).toEqual({ sum: 0, count: 2 });
    expect(totals["announce"]).toEqual({ sum: 2, count: 2 });
    const weights = adjustWeights({}, totals, { adjustmentRate: 0.1, minWeight: 0.2 });
    expect(weights["announce"]).toBeCloseTo(1.1);
    expect(weights["daypart-station"]).toBe(1);
    // clamps
    expect(adjustWeights({ x: 0.21 }, { x: { sum: -10, count: 10 } }, { adjustmentRate: 0.5, minWeight: 0.2 }).x).toBe(0.2);
    expect(adjustWeights({ x: 1.99 }, { x: { sum: 10, count: 10 } }, { adjustmentRate: 0.5, minWeight: 0.2 }).x).toBe(2);
  });

  it("personalises only from a listener's own positive feedback", () => {
    const listeners = personalise([
      { userId: "u1", rating: 1, persona: "rishi", stationSlug: "sufi-qawwali" },
      { userId: "u1", rating: 1, persona: "rishi", stationSlug: "sufi-qawwali" },
      { userId: "u1", rating: -1, persona: "maataa", stationSlug: "sanatan-devotional" },
      { userId: "u2", rating: -1, persona: "samaya", stationSlug: "folk-regional" },
    ]);
    expect(listeners.u1).toEqual({ preferredPersona: "rishi", favoredStation: "sufi-qawwali" });
    expect(listeners.u2).toBeUndefined(); // negative-only feedback creates no profile
  });

  it("runs the idempotent learning job honoring policy.learning", () => {
    expect(agentPolicy.learning).toEqual({ enabled: true, adjustmentRate: 0.1, minWeight: 0.2 });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "learn-"));
    const files = { feedback: path.join(dir, "fb.jsonl"), weights: path.join(dir, "w.json") };
    appendFeedback({ decisionId: "d", rating: "up", userId: "u1", persona: "rishi", stationSlug: "sufi-qawwali", evidence: ["rule:announce x"] }, files.feedback);
    const result = runLearningJob(agentPolicy.learning, files) as { ruleWeights: Record<string, number>; listeners: Record<string, unknown> };
    expect(result.ruleWeights.announce).toBeCloseTo(1.1);
    expect(result.listeners.u1).toBeTruthy();
    expect(runLearningJob({ enabled: false, adjustmentRate: 0.1, minWeight: 0.2 }, files)).toEqual({ skipped: "learning disabled in policy" });
  });
});

describe("phase 3 — decide() uses learned weights + personalisation", () => {
  it("returns decision ids and honors personalisation overrides", () => {
    const plain = decide({ hour: 7 }, world());
    expect(plain.decisionId).toMatch(/^d-/);
    expect(plain.actions[0].stationSlug).toBe("sanatan-devotional");
    const learned = decide(
      { hour: 7, userId: "u1" },
      world({ ruleWeights: {}, listeners: { u1: { preferredPersona: "rishi", favoredStation: "sufi-qawwali" } } })
    );
    expect(learned.persona).toBe("rishi");
    expect(learned.actions[0].stationSlug).toBe("sufi-qawwali");
    expect(learned.evidence.some((entry: string) => entry.includes("personalised-persona"))).toBe(true);
  });

  it("demotes the daypart rule when its learned weight is low", () => {
    const demoted = decide({ hour: 7 }, world({ ruleWeights: { "daypart-station": 0.2 }, listeners: {} }));
    expect(demoted.evidence.some((entry: string) => entry.includes("demoted"))).toBe(true);
  });

  it("wires the feedback endpoint, learning job, and engine buttons", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/api/agent/feedback"');
    expect(server).toContain('app.post("/agent/learn"');
    expect(server).toContain("loadWeights()");
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("rateAgent");
    expect(engine).toContain("agent-feedback");
    expect(read("apps/radio-backend/prisma/schema.prisma")).toContain("model AgentFeedback");
  });
});
