import { describe, expect, it } from "vitest";
import { universeRegistry } from "@shared/universes";
import { universeSkeletons } from "@shared/universe-skeletons";

describe("universe skeleton registry", () => {
  it("generates one unique skeleton for every universe", () => {
    expect(universeSkeletons).toHaveLength(universeRegistry.length);
    expect(new Set(universeSkeletons.map((skeleton) => skeleton.slug)).size).toBe(universeRegistry.length);
    expect(new Set(universeSkeletons.map((skeleton) => skeleton.title)).size).toBe(universeRegistry.length);
  });

  it("keeps each skeleton implementation-ready and PHKD guarded", () => {
    expect(
      universeSkeletons.every((skeleton) =>
        skeleton.nodeTypes.length > 0 &&
        skeleton.edgeTypes.length > 0 &&
        skeleton.views.length > 0 &&
        skeleton.importers.includes("HKD") &&
        skeleton.exporters.includes("HKD") &&
        skeleton.evidenceGates.some((gate) => gate.toLowerCase().includes("null")) &&
        skeleton.evidenceGates.some((gate) => gate.toLowerCase().includes("citation"))
      )
    ).toBe(true);
  });
});
