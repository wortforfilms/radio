import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");
const surfaceRoot = path.resolve("apps/web/public/radio-html/surfaces");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("radio release milestone frames", () => {
  it("keeps milestone completion fail-closed", () => {
    const milestones = readJson<{
      counts: {
        milestones: number;
        implementedDraft: number;
        evidenceBlocked: number;
        productionReady: number;
        shipDecision: string;
        rightsClosureClosed: number;
        rightsClosureBlocked: number;
      };
      milestones: { key: string; status: string; blocker: string | null }[];
    }>("milestone-completion.json");

    expect(milestones.counts).toMatchObject({
      milestones: 9,
      implementedDraft: 8,
      rightsClosureClosed: 19,
      rightsClosureBlocked: 0,
      productionReady: 0,
      shipDecision: "NO_SHIP"
    });
    expect(milestones.counts.evidenceBlocked).toBeGreaterThan(0);
    expect(milestones.milestones.find((milestone) => milestone.key === "rights-evidence-closure")).toMatchObject({
      status: "verified",
      blocker: null
    });
    expect(milestones.milestones.some((milestone) => milestone.blocker)).toBe(true);
    expect(milestones.milestones.map((milestone) => milestone.key)).toContain("customer-release-milestone");
    expect(milestones.milestones.map((milestone) => milestone.key)).toContain("device-runtime");
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

  it("keeps the customer release milestone blocked until external proof closes", () => {
    const customerRelease = readJson<{
      verificationState: string;
      shipDecision: string;
      counts: {
        gates: number;
        draftPass: number;
        blocked: number;
        releaseAllowed: number;
        productionReady: number;
        customerReleaseReady: number;
        paymentReceipts: number;
        signedArtifacts: number;
        releaseReviewsVerified: number;
      };
      gates: { key: string; status: string }[];
      blockers: { key: string; blocker: string }[];
    }>("customer-release-milestone.json");

    expect(customerRelease.verificationState).toBe("blocked-customer-release-proof-null");
    expect(customerRelease.shipDecision).toBe("NO_SHIP");
    expect(customerRelease.counts).toMatchObject({
      gates: 10,
      releaseAllowed: 0,
      productionReady: 0,
      customerReleaseReady: 0,
      paymentReceipts: 0,
      signedArtifacts: 0,
      releaseReviewsVerified: 0
    });
    expect(customerRelease.counts.draftPass).toBeGreaterThan(0);
    expect(customerRelease.counts.blocked).toBeGreaterThan(0);
    expect(customerRelease.gates.map((gate) => gate.key)).toContain("customer-front-playwright");
    expect(customerRelease.gates.map((gate) => gate.key)).toContain("rights-closure");
    expect(customerRelease.gates.map((gate) => gate.key)).toContain("gift-payment-proof");
    expect(customerRelease.blockers.map((blocker) => blocker.key)).toContain("signing-notarization");
    expect(fs.existsSync(path.join(surfaceRoot, "customer-release.html"))).toBe(true);
  });
});
