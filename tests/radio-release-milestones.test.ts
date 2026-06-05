import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("radio release milestone frames", () => {
  it("keeps milestone completion fail-closed", () => {
    const milestones = readJson<{
      counts: { milestones: number; implementedDraft: number; evidenceBlocked: number; productionReady: number; shipDecision: string };
      milestones: { status: string; blocker: string | null }[];
    }>("milestone-completion.json");

    expect(milestones.counts).toMatchObject({
      milestones: 7,
      implementedDraft: 7,
      productionReady: 0,
      shipDecision: "NO_SHIP"
    });
    expect(milestones.counts.evidenceBlocked).toBeGreaterThan(0);
    expect(milestones.milestones.every((milestone) => milestone.status === "implemented-draft")).toBe(true);
    expect(milestones.milestones.some((milestone) => milestone.blocker)).toBe(true);
  });

  it("blocks playback, payment, installer, and alpha release claims without evidence", () => {
    const playback = readJson<{ counts: { playable: number; blocked: number } }>("playback-gate.json");
    const payment = readJson<{ counts: { paymentReceipts: number; blocked: number } }>("payment-proof-lane.json");
    const installer = readJson<{ counts: { signedArtifacts: number; blocked: number } }>("installer-pipeline.json");
    const alpha = readJson<{ counts: { productionReady: number; signedInstallers: number; blockers: number }; alphaState: string }>("desktop-alpha-bundle.json");

    expect(playback.counts.playable).toBe(0);
    expect(playback.counts.blocked).toBeGreaterThan(0);
    expect(payment.counts.paymentReceipts).toBe(0);
    expect(payment.counts.blocked).toBeGreaterThan(0);
    expect(installer.counts.signedArtifacts).toBe(0);
    expect(installer.counts.blocked).toBeGreaterThan(0);
    expect(alpha.alphaState).toBe("local-alpha-no-ship");
    expect(alpha.counts).toMatchObject({ productionReady: 0, signedInstallers: 0 });
    expect(alpha.counts.blockers).toBeGreaterThan(0);
  });
});
