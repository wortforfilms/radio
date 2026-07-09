import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { SUPPORTED_LANGS, translate } from "../apps/radio-backend/cognition-llm.js";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const readJson = <T>(file: string): T => JSON.parse(read(file)) as T;

describe("phase 10 — multilingual, regions, low-bandwidth", () => {
  it("persona language variants cover the major Indian languages", () => {
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    for (const lang of ["ta-IN", "te-IN", "kn-IN", "bn-IN", "mr-IN", "gu-IN"]) expect(engine).toContain(lang);
    expect(engine).toContain("languageSelect");
    expect(engine).toContain("no ${lang} voice installed"); // honest OS-voice fallback
    const html = read("apps/web/public/radio-html/online-offline-radio-engine.html");
    expect(html).toContain("தமிழ்");
    expect(html).toContain('id="languageSelect"');
  });

  it("translation is fail-closed, AI-marked, and translate-only", async () => {
    expect(Object.keys(SUPPORTED_LANGS)).toContain("ta");
    const blocked = await translate("hello", "ta", { config: { provider: null } });
    expect(blocked.blocked).toContain("blocked-llm-provider-null");
    const unsupported = await translate("hello", "fr", { config: { provider: "openai", apiKey: "k" } });
    expect(unsupported.blocked).toContain("unsupported language");
    const result = await translate("The bhajan features tabla.", "ta", {
      config: { provider: "openai", apiKey: "k" },
      callProvider: async (_cfg: unknown, system: string) => {
        expect(system).toContain("Tamil");
        expect(system).toContain("no invented facts");
        return "பஜனையில் தபலா உள்ளது.";
      },
    });
    expect(result.translation).toContain("தபலா");
    expect(result.aiGenerated).toBe(true);
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.post("/api/translate"');
  });

  it("region lane is honest: geo seam blocked, stations pan-india, regional lanes planned", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.get("/api/region"');
    expect(server).toContain("blocked-geo-provider-null");
    expect(server).toContain("select a region manually");
    const manifest = readJson<{ stations: Array<{ region: string }> }>(
      "apps/web/public/radio-html/data/radio-engine-manifest.json"
    );
    expect(manifest.stations.every((station) => station.region === "pan-india")).toBe(true);
    // no fabricated regional stations
    expect(manifest.stations.length).toBe(7);
  });

  it("low-bandwidth mode reduces payloads and gates LLM usage", () => {
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("lowBandwidth");
    expect(engine).toContain('preload = event.target.checked ? "none"');
    expect(engine).toContain("low-bandwidth mode limits LLM usage");
    expect(read("apps/web/public/radio-html/online-offline-radio-engine.html")).toContain('id="lowBandwidth"');
    expect(engine).toBe(read("apps/desktop/public/radio-html/assets/js/radio-engine.js"));
  });
});
