import { describe, expect, it } from "vitest";
import { radioStoryboardSequences, radioStoryboardSummary } from "@shared/radio-storyboard";

describe("radio storyboard", () => {
  it("covers the full Radio Vaigyaaniq runtime flow", () => {
    expect(radioStoryboardSequences.map((sequence) => sequence.key)).toEqual([
      "landing-command",
      "runtime-broadcast",
      "tts-samaya",
      "visualizer",
      "lyrics",
      "social-project",
      "archive-export"
    ]);
    expect(radioStoryboardSummary).toMatchObject({
      sequences: 7,
      shots: 20,
      implemented: 20,
      draft: 0,
      blocked: 0
    });
  });

  it("keeps every shot routed and PHKD guarded", () => {
    const shots = radioStoryboardSequences.flatMap((sequence) => sequence.shots);
    expect(shots.every((shot) => shot.route.startsWith("/"))).toBe(true);
    expect(shots.every((shot) => shot.primaryUi.length > 0)).toBe(true);
    expect(shots.every((shot) => shot.phkdGuardrail.length > 20)).toBe(true);
  });
});
