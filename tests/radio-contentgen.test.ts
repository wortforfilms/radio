import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { generateMusic, listGenerated, publishGenerated, storeGenerated } from "../apps/radio-backend/content-gen.js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { generateLyrics } from "../apps/radio-backend/cognition-llm.js";
import { agentCapabilities } from "../apps/radio/registry/index.ts";

const tmpLedger = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "gen-")), "ledger.jsonl");
const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("phase 4 — content generation (fail-closed)", () => {
  it("blocks music generation without a provider or key", async () => {
    const noProvider = await generateMusic("calm veena piece", 30, { config: { provider: null } });
    expect(noProvider.blocked).toContain("blocked-contentgen-provider-null");
    const noKey = await generateMusic("calm veena piece", 30, { config: { provider: "suno", apiKey: null } });
    expect(noKey.blocked).toContain("blocked-contentgen-key-null");
  });

  it("stores generated music UNPUBLISHED with permanent AI provenance", async () => {
    const ledger = tmpLedger();
    const record = await generateMusic("calm veena piece", 30, {
      config: { provider: "suno", apiKey: "k" },
      callMusicProvider: async () => ({ audioUrl: "https://tmp/audio.mp3", providerJobId: "job-1" }),
      ledger,
    });
    expect(record.published).toBe(false);
    expect(record.rightsProof).toBeNull();
    expect(record.aiGenerated).toBe(true);
    expect(record.audioUrl).toBe("https://tmp/audio.mp3");
    expect(listGenerated(ledger).length).toBe(1);
  });

  it("refuses publication without a VERIFIED rights proof", () => {
    const ledger = tmpLedger();
    const record = storeGenerated({ kind: "music", description: "x" }, ledger);
    const noProof = publishGenerated(record.id, { rightsProofs: [] }, ledger);
    expect(noProof.blocked).toContain("no VERIFIED rights proof");
    const unverified = publishGenerated(record.id, { rightsProofs: [{ trackId: record.id, verified: false, id: "p1" }] }, ledger);
    expect(unverified.blocked).toBeTruthy();
    const published = publishGenerated(record.id, { rightsProofs: [{ trackId: record.id, verified: true, id: "p1" }] }, ledger);
    expect(published.published).toBe(true);
    expect(published.rightsProof).toBe("p1");
    expect(published.aiGenerated).toBe(true); // provenance survives publication
    expect(publishGenerated("gen-nope", { rightsProofs: [] }, ledger).error).toBeTruthy();
  });

  it("generates lyrics as unpublished AI drafts via the LLM seam", async () => {
    const blocked = await generateLyrics("monsoon raga", "", { config: { provider: null } });
    expect(blocked.blocked).toContain("blocked-llm-provider-null");
    const draft = await generateLyrics("monsoon raga", "classical", {
      config: { provider: "openai", apiKey: "k" },
      callProvider: async () => "बरखा की बूँदें\nराग मल्हार गाए",
    });
    expect(draft.kind).toBe("lyrics");
    expect(draft.aiGenerated).toBe(true);
    expect(draft.published).toBe(false);
    expect(draft.lyrics).toContain("मल्हार");
  });

  it("registers compose-content as partial with provider + rights gates", () => {
    const capability = agentCapabilities.find((entry) => entry.id === "compose-content");
    expect(capability?.status).toBe("partial");
    expect(capability?.implementedBy.some((artifact) => artifact.includes("content-gen"))).toBe(true);
    expect(capability?.gates.some((gate) => gate.includes("published:false"))).toBe(true);
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/agent/compose"');
    expect(server).toContain('app.get("/admin/generated"');
    expect(server).toContain('app.post("/admin/generated/publish"');
    expect(read(".gitignore")).toContain("generated-content.jsonl");
  });
});
