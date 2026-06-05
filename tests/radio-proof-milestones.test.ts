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
      "hdfc-upi-parser-adapter.html",
      "webhook-signature-proof.html",
      "receipt-settlement-proof.html",
      "rights-proof-import-templates.html",
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
    const orchestration = readJson<{ counts: { configuredCommands: number; externalProofCreated: number }; steps: { key: string }[] }>("evidence-refresh-command.json");

    expect(rights.counts.closed).toBe(0);
    expect(rights.counts.blocked).toBeGreaterThan(0);
    expect(review.counts).toMatchObject({ reviewerAssignments: 0, verified: 0 });
    expect(signing.counts).toMatchObject({ signedArtifacts: 0, notarizedArtifacts: 0 });
    expect(orchestration.counts).toMatchObject({ configuredCommands: 12, externalProofCreated: 0 });
    expect(orchestration.steps.map((step) => step.key)).toContain("proof-milestones");
    expect(orchestration.steps.map((step) => step.key)).toContain("hdfc-parser-tests");
  });
});
