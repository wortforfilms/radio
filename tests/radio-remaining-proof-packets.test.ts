import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");
const surfaceRoot = path.resolve("apps/web/public/radio-html/surfaces");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("radio remaining proof packets", () => {
  it("prepares payment, signing, and release-review packets without proof claims", () => {
    const summary = readJson<{
      verificationState: string;
      shipDecision: string;
      counts: { packets: number; rowsPrepared: number; releaseAllowed: number; blockedLanes: number };
    }>("remaining-proof-packets.json");
    const payment = readJson<{
      verificationState: string;
      counts: { states: number; rowsPrepared: number; releaseAllowed: number; verifiedStates: number };
      records: { webhookVerified: false; auditCreated: false; paymentReceiptId: null }[];
    }>("payment-proof-packet.json");
    const signing = readJson<{
      verificationState: string;
      counts: { artifactSlots: number; rowsPrepared: number; releaseAllowed: number; signedArtifacts: number; notarizedArtifacts: number };
      records: { signingIdentity: null; signatureVerification: null; notarizationTicket: null; auditVerified: false; releaseAllowed: false }[];
    }>("signing-proof-packet.json");
    const review = readJson<{
      verificationState: string;
      counts: { reviewItems: number; rowsPrepared: number; releaseAllowed: number; verified: number; reviewerAssignments: number };
      records: { reviewer: null; reviewedAt: null; citation: null; decision: null; auditVerified: false; releaseAllowed: false }[];
    }>("release-review-packet.json");

    expect(summary.verificationState).toBe("draft-packets-no-proof");
    expect(summary.shipDecision).toBe("NO_SHIP");
    expect(summary.counts).toMatchObject({ packets: 3, releaseAllowed: 0, blockedLanes: 3 });
    expect(summary.counts.rowsPrepared).toBe(34);

    expect(payment.verificationState).toBe("draft-payment-proof-packet-no-proof");
    expect(payment.counts).toMatchObject({ states: 5, rowsPrepared: 5, releaseAllowed: 0, verifiedStates: 0 });
    expect(payment.records.every((record) => record.webhookVerified === false && record.auditCreated === false)).toBe(true);
    expect(payment.records.every((record) => record.paymentReceiptId === null)).toBe(true);

    expect(signing.verificationState).toBe("draft-signing-proof-packet-no-proof");
    expect(signing.counts).toMatchObject({ artifactSlots: 6, rowsPrepared: 6, releaseAllowed: 0, signedArtifacts: 0, notarizedArtifacts: 0 });
    expect(signing.records.every((record) => record.signingIdentity === null && record.signatureVerification === null)).toBe(true);
    expect(signing.records.every((record) => record.notarizationTicket === null && record.auditVerified === false)).toBe(true);

    expect(review.verificationState).toBe("draft-release-review-packet-no-proof");
    expect(review.counts).toMatchObject({ reviewItems: 23, rowsPrepared: 23, releaseAllowed: 0, verified: 0, reviewerAssignments: 0 });
    expect(review.records.every((record) => record.reviewer === null && record.reviewedAt === null)).toBe(true);
    expect(review.records.every((record) => record.decision === null && record.auditVerified === false)).toBe(true);

    for (const file of [
      "payment-proof-import-packet.csv",
      "signing-proof-import-template.csv",
      "release-review-import-template.csv"
    ]) {
      expect(fs.existsSync(path.join(dataRoot, file))).toBe(true);
    }
    for (const file of [
      "payment-proof-packet.html",
      "signing-proof-packet.html",
      "release-review-packet.html",
      "remaining-proof-packets.html"
    ]) {
      expect(fs.existsSync(path.join(surfaceRoot, file))).toBe(true);
    }
  });
});
