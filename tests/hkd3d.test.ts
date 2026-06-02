import { describe, expect, it } from "vitest";
import { assertHkd3dAssetProductionReady, getHkd3dMetrics, hkd3dCharacters, hkd3dStages } from "@shared/hkd3d";

describe("HKD3D runtime registry", () => {
  it("declares all requested runtime scopes and Ayodhya character slots", () => {
    expect(hkd3dStages.map((stage) => stage.key)).toEqual([
      "base-human-model",
      "texture-system",
      "rig-system",
      "blendshapes",
      "animation-library",
      "facial-runtime",
      "lighting-runtime",
      "clothing-system",
      "hair-system",
      "export-runtime"
    ]);
    expect(hkd3dCharacters.map((character) => character.name)).toEqual([
      "Ram",
      "Sita",
      "Lakshman",
      "Hanuman",
      "Bharat",
      "Shatrughna",
      "Valmiki",
      "Vishwamitra"
    ]);
  });

  it("fails closed for declared asset slots without evidence", () => {
    const asset = hkd3dStages[0].slots[0];
    expect(() => assertHkd3dAssetProductionReady(asset)).toThrow("PHKD_FAIL_CLOSED");
  });

  it("does not report verified assets from scaffolded slots", () => {
    expect(getHkd3dMetrics()).toMatchObject({
      characterCount: 8,
      stageCount: 10,
      verifiedAssetCount: 0,
      evidenceRecordCount: 0
    });
  });
});
