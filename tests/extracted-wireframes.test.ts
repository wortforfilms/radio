import { describe, expect, it } from "vitest";
import { ayodhyaWireframeBoardExtraction, extractedWireframeTotals, radioImageHtmlExtraction } from "@shared/extracted-wireframes";

describe("extracted wireframe registry", () => {
  it("extracts Radio image-to-HTML frames, data frames, and layouts", () => {
    expect(radioImageHtmlExtraction.frames).toHaveLength(11);
    expect(radioImageHtmlExtraction.dataFrames).toHaveLength(5);
    expect(radioImageHtmlExtraction.layouts).toHaveLength(3);
    expect(radioImageHtmlExtraction.counts.stationCards).toBe(8);
    expect(radioImageHtmlExtraction.counts.generatedSpectrumBars).toBe(34);
  });

  it("extracts all Ayodhya unique wireframe archetypes", () => {
    expect(ayodhyaWireframeBoardExtraction.groups).toHaveLength(8);
    expect(extractedWireframeTotals.ayodhyaWireframes).toBe(41);
    expect(ayodhyaWireframeBoardExtraction.groups.map((group) => group.key)).toContain("governance");
  });

  it("keeps extraction provenance and draft verification state visible", () => {
    expect(radioImageHtmlExtraction.provenance).toContain("supplied by user");
    expect(ayodhyaWireframeBoardExtraction.verificationStatus).toBe("draft_extracted");
  });

  it("backs React Three.js absorption routes", () => {
    expect(radioImageHtmlExtraction.frames.map((frame) => frame.key)).toContain("brand-tuner");
    expect(ayodhyaWireframeBoardExtraction.groups.flatMap((group) => group.items).map((item) => item.code)).toContain("UW-034");
  });
});
