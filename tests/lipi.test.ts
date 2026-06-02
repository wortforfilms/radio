import { describe, expect, it } from "vitest";
import {
  getLipiExplorerPage,
  lipiCivilizationMatrix,
  lipiExplorerPages,
  lipiPhkdRule
} from "@shared/lipi-civilization-matrix";

describe("Lipi civilization matrix", () => {
  it("models association rather than script ownership", () => {
    expect(lipiPhkdRule.model).toContain("Civilization");
    expect(lipiPhkdRule.rejectedModel).toBe("Religion owns Script");
  });

  it("keeps Indus undeciphered and fail-closed", () => {
    const indus = lipiCivilizationMatrix.find((entry) => entry.key === "indus");
    expect(indus).toMatchObject({
      status: "undeciphered",
      symbols: ["Indus Sign Corpus"]
    });
    expect(indus?.phkdNote).toContain("No definitive decipherment");
  });

  it("declares all requested explorer pages", () => {
    expect(lipiExplorerPages).toHaveLength(11);
    expect(getLipiExplorerPage("knowledge-graph")?.name).toBe("Knowledge Graph");
  });
});
