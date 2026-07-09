import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import {
  NO_INFO_TEXT,
  ask,
  buildSystemPrompt,
  parseModelOutput,
  searchLocalLibrary,
} from "../apps/radio-backend/cognition-llm.js";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const library = [
  { id: "t1", title: "Shiva Bhajan", slug: "shiva-bhajan", theme: "Sanatan & Vedic", language: "Hindi", styles: ["bhajan"], storyline: "A patient devotional recording about Shiva, tabla and bansuri." },
  { id: "t2", title: "Neural Jogi", slug: "neural-jogi", theme: "Electronic", language: "Hindi", styles: ["synth"], storyline: "A synth-driven night piece." },
];
const validateTrack = (trackId: string) => {
  if (trackId === "t1") return { exists: true, title: "Shiva Bhajan", access: "full" };
  if (trackId === "t2") return { exists: true, title: "Neural Jogi", access: "preview" };
  if (trackId === "t-locked") return { exists: true, title: "Locked", access: "locked" };
  return { exists: false };
};
const cfg = { provider: "openai", apiKey: "test-key", model: "test-model", baseUrl: null };
const mockProvider = (payload: unknown) => async () => JSON.stringify(payload);

describe("knowledge lane", () => {
  it("retrieves real local sources by term overlap", () => {
    const sources = searchLocalLibrary("tell me about the shiva bhajan", library);
    expect(sources.length).toBe(1);
    expect(sources[0].ref).toBe("content-library:t1");
    expect(sources[0].excerpt).toContain("devotional");
    expect(searchLocalLibrary("quantum chromodynamics", library)).toEqual([]);
  });

  it("builds a sources-only system prompt with persona + honesty rules", () => {
    const sources = searchLocalLibrary("shiva bhajan", library);
    const prompt = buildSystemPrompt("rishi", sources, { stationName: "Sanatan" }, { rules: ["r1"] });
    expect(prompt).toContain("Rishi");
    expect(prompt).toContain("ONLY from the CITED SOURCES");
    expect(prompt).toContain(NO_INFO_TEXT);
    expect(prompt).toContain("content-library:t1");
    expect(prompt).toContain("Do NOT add any disclosure");
  });
});

describe("ask() fail-closed behaviour", () => {
  it("blocks without a provider, and without a key", async () => {
    const noProvider = await ask("q", {}, "samaya", [], { config: { provider: null }, contentLibrary: library });
    expect(noProvider.actions).toEqual([]);
    expect(noProvider.blocked[0]).toContain("blocked-llm-provider-null");
    const noKey = await ask("q", {}, "samaya", [], { config: { provider: "openai", apiKey: null }, contentLibrary: library });
    expect(noKey.blocked[0]).toContain("blocked-llm-key-null");
  });

  it("answers the exact honest fallback when zero sources — without calling the LLM", async () => {
    let called = false;
    const result = await ask("quantum chromodynamics", {}, "samaya", [], {
      config: cfg,
      contentLibrary: library,
      callProvider: async () => {
        called = true;
        return "{}";
      },
    });
    expect(called).toBe(false);
    expect(result.actions[0].type).toBe("speak");
    expect(result.actions[0].text).toContain(NO_INFO_TEXT);
    expect(result.actions[0].text).toContain("with help from openai");
    expect(result.evidence[0]).toContain("no-sources-honest-fallback");
  });

  it("validates model output: bad JSON blocks, invented tracks dropped, locked play dropped", async () => {
    const badJson = await ask("shiva bhajan", {}, "samaya", [], {
      config: cfg, contentLibrary: library, validateTrack,
      callProvider: async () => "sure! here's a nice answer without json",
    });
    expect(badJson.actions).toEqual([]);
    expect(badJson.blocked[0]).toContain("llm-output-invalid");

    const sneaky = await ask("shiva bhajan", {}, "samaya", [], {
      config: cfg, contentLibrary: library, validateTrack,
      callProvider: mockProvider({
        actions: [
          { type: "speak", text: "About the bhajan." },
          { type: "play", trackId: "t-fabricated" },
          { type: "play", trackId: "t-locked" },
          { type: "buy-now", trackId: "t1" },
          { type: "play", trackId: "t2" },
        ],
      }),
    });
    const types = sneaky.actions.map((action: { type: string }) => action.type);
    expect(types).toEqual(["speak", "play"]);
    expect(sneaky.actions[1].trackId).toBe("t2");
    expect(sneaky.actions[1].access).toBe("preview"); // commerce access preserved
    expect(sneaky.blocked.some((reason: string) => reason.includes("t-fabricated"))).toBe(true);
    expect(sneaky.blocked.some((reason: string) => reason.includes("locked"))).toBe(true);
    expect(sneaky.blocked.some((reason: string) => reason.includes('disallowed type "buy-now"'))).toBe(true);
  });

  it("appends the provider disclosure server-side and cites sources as evidence", async () => {
    const result = await ask("shiva bhajan", {}, "maataa", [], {
      config: cfg, contentLibrary: library, validateTrack,
      callProvider: mockProvider({ actions: [{ type: "speak", text: "The bhajan features tabla and bansuri." }], cited: ["content-library:t1"] }),
    });
    expect(result.actions[0].text).toMatch(/generated by our AI Radio Assistant with help from openai\.$/);
    expect(result.actions[0].persona).toBe("maataa");
    expect(result.sources[0].ref).toBe("content-library:t1");
    expect(result.evidence).toContain("cited content-library:t1");
    expect(result.evidence).toContain("rule:llm-generated");
  });

  it("parses JSON embedded in chatty output", () => {
    expect(parseModelOutput('Here you go: {"actions":[]} hope that helps')).toEqual({ actions: [] });
    expect(parseModelOutput("no json at all")).toBeNull();
  });
});

describe("integration wiring", () => {
  it("exposes /agent/ask with real deps and keeps the registry honest", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/agent/ask"');
    expect(server).toContain("remoteKnowledgeSearch");
    expect(server).toContain("loadContentLibrary");
    expect(server).toContain("trackValidator");
    const agentTs = read("apps/radio/registry/agent.ts");
    expect(agentTs).toContain('"answer-question"');
    expect(agentTs).toContain("cognition-llm.js");
    expect(agentTs).toContain("llmDisclosure");
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("askAgent");
    expect(engine).toContain("/agent/ask");
    const env = read("apps/radio-backend/.env.example");
    expect(env).toContain("AGENT_LLM_PROVIDER=");
    expect(env).toContain("AGENT_LLM_MODEL=");
  });
});
