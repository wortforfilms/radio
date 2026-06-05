import { describe, expect, it } from "vitest";
import {
  getGovernanceActionRequirements,
  governancePolicies,
  governanceReleaseGates,
  isGovernanceAuditAction
} from "@shared/governance";
import { validateAuditInput } from "@runtime/audit";

describe("governance fail-closed gates", () => {
  it("exposes the required governance policies", () => {
    expect(governancePolicies.map((policy) => policy.id)).toEqual([
      "policy-lineage-citation-required",
      "policy-verification-review-required",
      "policy-merge-reason-required",
      "policy-asset-release-rights-required",
      "policy-tauri-no-ship-until-signed"
    ]);
    expect(governancePolicies.every((policy) => policy.failClosed)).toBe(true);
  });

  it("keeps release blockers explicit", () => {
    expect(governanceReleaseGates.filter((gate) => gate.status === "blocked").map((gate) => gate.key)).toEqual([
      "audio-rights",
      "payment-gift",
      "signed-installer",
      "release-review"
    ]);
  });

  it("recognizes focused audit actions", () => {
    expect(isGovernanceAuditAction("verified")).toBe(true);
    expect(isGovernanceAuditAction("approved")).toBe(false);
    expect(getGovernanceActionRequirements("verified").required).toEqual(["entityType", "entityId", "citation", "reviewer", "reviewedAt"]);
  });

  it("fails closed when verified audit evidence is incomplete", () => {
    expect(validateAuditInput({
      action: "verified",
      entityType: "MediaAsset",
      entityId: "asset-1",
      citation: "local checksum"
    })).toMatchObject({
      ok: false,
      errors: ["reviewer is required", "reviewedAt is required"]
    });
  });

  it("accepts complete verified audit evidence", () => {
    expect(validateAuditInput({
      action: "verified",
      entityType: "MediaAsset",
      entityId: "asset-1",
      citation: "local checksum",
      reviewer: "curator",
      reviewedAt: "2026-06-05T00:00:00.000Z"
    })).toMatchObject({ ok: true });
  });
});
