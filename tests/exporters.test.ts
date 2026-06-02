import { describe, expect, it } from "vitest";
import { exportGraphMl, exportHkd } from "@runtime/exporters";

describe("GraphML export", () => {
  it("escapes XML-sensitive labels", async () => {
    const prisma = {
      knowledgeNode: {
        findMany: async () => [{ id: "n1", label: "A&B <Node>", type: "RISHI" }]
      },
      knowledgeEdge: {
        findMany: async () => []
      }
    };

    await expect(exportGraphMl(prisma as never)).resolves.toContain("A&amp;B &lt;Node&gt;");
  });
});

describe("HKD export", () => {
  it("exports requested persistence scope with provenance and null citations", async () => {
    const prisma = {
      rishika: {
        findMany: async () => [
          {
            id: "r1",
            name: "Gargi Vachaknavi",
            verificationStatus: "UNVERIFIED",
            sourceCitation: null,
            provenanceNote: "Seed label only."
          }
        ]
      }
    };

    const hkd = await exportHkd(prisma as never, { scope: "rishika-universe" });

    expect(hkd).toContain("scope: rishika-universe");
    expect(hkd).toContain("format: .hkd");
    expect(hkd).toContain("label: Gargi Vachaknavi");
    expect(hkd).toContain("citation: NULL");
    expect(hkd).toContain("phkd: fail_closed");
  });
});
