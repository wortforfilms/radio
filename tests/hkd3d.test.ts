import { describe, expect, it } from "vitest";
import {
  assertHkd3dAssetProductionReady,
  getHkd3dCharacterByKey,
  getHkd3dMetrics,
  getHkd3dStageByKey,
  hkd3dCharacters,
  hkd3dStages,
  hkd3dWorkflows
} from "@shared/hkd3d";

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

  it("resolves stage and character detail routes from registry keys", () => {
    expect(getHkd3dStageByKey("lighting-runtime")?.name).toBe("Lighting Runtime");
    expect(getHkd3dCharacterByKey("hanuman")?.requiredScopes).toContain("animations");
  });

  it("declares evidence-gated workflows for the completed scaffold", () => {
    expect(hkd3dWorkflows.map((workflow) => workflow.key)).toEqual([
      "asset-intake",
      "lookdev",
      "rig-readiness",
      "character-assembly",
      "export-validation"
    ]);
  });
});
