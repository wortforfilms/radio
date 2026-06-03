import { describe, expect, it } from "vitest";
import { sprintCompletions, sprintCompletionSummary } from "@shared/sprint-completion";

describe("sprint completion registry", () => {
  it("covers all requested sprint tracks", () => {
    expect(sprintCompletions).toHaveLength(8);
    expect(sprintCompletions.map((sprint) => sprint.key)).toEqual([
      "radio-landing-polish",
      "radio-creator-workflow",
      "lyrics-scribe-upgrade",
      "audio-visualizer-production",
      "ayodhya-ai-bridge",
      "universe-skeleton-hydration",
      "admin-governance",
      "release-hardening"
    ]);
  });

  it("keeps every sprint PHKD scoped and surface-linked", () => {
    expect(
      sprintCompletions.every((sprint) =>
        sprint.surfaces.length > 0 &&
        sprint.evidenceState.length > 0 &&
        sprint.nextHardening.length > 0 &&
        sprint.status !== "evidence_pending"
      )
    ).toBe(true);
  });

  it("summarizes the sprint matrix", () => {
    expect(sprintCompletionSummary()).toMatchObject({
      total: 8,
      evidencePending: 0
    });
  });
});
