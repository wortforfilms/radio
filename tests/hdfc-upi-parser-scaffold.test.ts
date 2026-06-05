import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dataRoot = path.resolve("apps/web/public/radio-html/data");
const integrationRoot = path.resolve("integrations/hdfc-upi-parser");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataRoot, file), "utf8")) as T;
}

describe("HDFC UPI parser scaffold", () => {
  it("is wired as candidate-only payment evidence", () => {
    const scaffold = readJson<{
      path: string;
      verificationState: string;
      shipDecision: string;
      counts: { verifiedReceipts: number; verifiedWebhooks: number; fulfilledGifts: number };
      blockedClaims: string[];
    }>("hdfc-upi-parser-scaffold.json");
    const report = readJson<{
      parserIntegrations: { id: string; status: string; verificationState: string }[];
      summary: { paymentReceipts: number; webhookEvents: number; fulfilledGifts: number };
    }>("payment-proof-report.json");

    expect(fs.existsSync(path.join(integrationRoot, "hdfc_upi_parser/core/email_parser.py"))).toBe(true);
    expect(scaffold.path).toBe("integrations/hdfc-upi-parser");
    expect(scaffold.verificationState).toBe("draft-parser-candidate-only");
    expect(scaffold.shipDecision).toBe("NO_SHIP");
    expect(scaffold.counts).toMatchObject({
      verifiedReceipts: 0,
      verifiedWebhooks: 0,
      fulfilledGifts: 0
    });
    expect(scaffold.blockedClaims).toContain("verified HDFC settlement");
    expect(report.parserIntegrations).toContainEqual(
      expect.objectContaining({
        id: "hdfc-upi-parser-scaffold",
        status: "candidate-only",
        verificationState: "draft-parser-candidate-only"
      })
    );
    expect(report.summary).toMatchObject({
      paymentReceipts: 0,
      webhookEvents: 0,
      fulfilledGifts: 0
    });
  });
});

