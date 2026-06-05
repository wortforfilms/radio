import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");
const surfaceRoot = path.resolve("apps/web/public/radio-html/surfaces");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("radio proof milestone completion", () => {
  it("adds proof templates and keeps payment proof fail-closed", () => {
    const templates = readJson<{
      verificationState: string;
      counts: { templates: number; exampleRowsWithValues: number; blocked: number };
    }>("payment-proof-import-templates.json");
    const webhook = readJson<{
      verificationState: string;
      counts: { verifiedSignatures: number; blocked: number };
    }>("webhook-signature-proof.json");
    const receipt = readJson<{
      verificationState: string;
      counts: { verifiedReceipts: number; settlementRecords: number; blocked: number };
    }>("receipt-settlement-proof.json");

    expect(templates.verificationState).toBe("draft-templates-no-proof");
    expect(templates.counts).toMatchObject({ templates: 5, exampleRowsWithValues: 0, blocked: 5 });
    expect(webhook.verificationState).toBe("blocked-webhook-proof-null");
    expect(webhook.counts).toMatchObject({ verifiedSignatures: 0 });
    expect(webhook.counts.blocked).toBeGreaterThan(0);
    expect(receipt.verificationState).toBe("blocked-receipt-proof-null");
    expect(receipt.counts).toMatchObject({ verifiedReceipts: 0, settlementRecords: 0 });
    expect(receipt.counts.blocked).toBeGreaterThan(0);
  });

  it("adds review, signing, rights, adapter, and orchestration surfaces", () => {
    const required = [
      "payment-proof-import-templates.html",
      "payment-proof-packet.html",
      "hdfc-upi-parser-adapter.html",
      "webhook-signature-proof.html",
      "receipt-settlement-proof.html",
      "rights-proof-import-templates.html",
      "rights-closure-packet.html",
      "signing-proof-packet.html",
      "release-review-packet.html",
      "remaining-proof-packets.html",
      "release-review-board.html",
      "installer-signing-proof.html",
      "evidence-refresh-command.html"
    ];
    for (const file of required) {
      expect(fs.existsSync(path.join(surfaceRoot, file))).toBe(true);
    }

    const rights = readJson<{ counts: { closed: number; blocked: number } }>("rights-proof-import-templates.json");
    const review = readJson<{ counts: { reviewerAssignments: number; verified: number } }>("release-review-board.json");
    const signing = readJson<{ counts: { signedArtifacts: number; notarizedArtifacts: number } }>("installer-signing-proof.json");
    const rightsPacket = readJson<{ counts: { records: number; releaseAllowed: number }; records: { source: null; creator: null; releaseAllowed: false }[] }>("rights-closure-packet.json");
    const orchestration = readJson<{ counts: { configuredCommands: number; externalProofCreated: number }; steps: { key: string }[] }>("evidence-refresh-command.json");
    const reviewReport = readJson<{ summary: { releaseAllowed: boolean; blocked: number; verified: number }; shipDecision: string }>("release-review-report.json");

    expect(rights.counts.closed).toBe(0);
    expect(rights.counts.blocked).toBeGreaterThan(0);
    expect(rightsPacket.counts).toMatchObject({ records: 19, releaseAllowed: 0 });
    expect(rightsPacket.records[0]).toMatchObject({ source: null, creator: null, releaseAllowed: false });
    expect(review.counts).toMatchObject({ reviewerAssignments: 0, verified: 0 });
    expect(reviewReport.summary).toMatchObject({ releaseAllowed: false, verified: 0 });
    expect(reviewReport.summary.blocked).toBeGreaterThan(0);
    expect(reviewReport.shipDecision).toBe("NO_SHIP");
    expect(signing.counts).toMatchObject({ signedArtifacts: 0, notarizedArtifacts: 0 });
    expect(orchestration.counts).toMatchObject({ configuredCommands: 16, externalProofCreated: 0 });
    expect(orchestration.steps.map((step) => step.key)).toContain("proof-milestones");
    expect(orchestration.steps.map((step) => step.key)).toContain("rights-packet");
    expect(orchestration.steps.map((step) => step.key)).toContain("remaining-packets");
    expect(orchestration.steps.map((step) => step.key)).toContain("customer-release");
    expect(orchestration.steps.map((step) => step.key)).toContain("release-review");
    expect(orchestration.steps.map((step) => step.key)).toContain("hdfc-parser-tests");
  });
});
