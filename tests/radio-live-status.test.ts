import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { byId, validateRegistry } from "../apps/radio/registry/index.ts";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), "utf8");

describe("phase 7 — live data lane", () => {
  it("exposes TTL-cached /api/live-status with honest semantics", () => {
    const server = read("apps/radio-backend/server.js");
    expect(server).toContain('app.get("/api/live-status"');
    expect(server).toContain("LIVE_STATUS_TTL_MS");
    // live only with verified stream evidence; ongoing never guessed
    expect(server).toContain("liveStreamVerified");
    expect(server).toContain("programOngoing: null");
    expect(server).toContain("streamUrl NULL");
    // dynamic route instances from real manifest entries
    expect(server).toContain("/radio/programs/");
    // DB enrichment is optional + fail-closed
    expect(server).toContain("manifest-only lane");
  });

  it("registers the dynamic program route pattern honestly", () => {
    expect(validateRegistry()).toEqual([]);
    const route = byId.get("radio.programs");
    expect(route?.path).toBe("/radio/programs/:date/:slug");
    expect(route?.status).toBe("partial");
    expect(route?.dynamic).toBe(true);
    expect(route?.contentType).toBe("live-show");
    expect(route?.api[0].path).toBe("/api/live-status");
  });

  it("shows LIVE/OFFLINE badges in the engine from the live lane", () => {
    const engine = read("apps/web/public/radio-html/assets/js/radio-engine.js");
    expect(engine).toContain("refreshLiveStatus");
    expect(engine).toContain("/api/live-status");
    expect(engine).toContain("OFFLINE");
    expect(engine).toBe(read("apps/desktop/public/radio-html/assets/js/radio-engine.js"));
  });
});
