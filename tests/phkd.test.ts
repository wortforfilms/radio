import { describe, expect, it } from "vitest";
import { assertVerifiableLineageClaim } from "@shared/phkd";

describe("PHKD lineage gate", () => {
  it("fails closed when a lineage claim lacks a citation", () => {
    expect(() =>
      assertVerifiableLineageClaim({
        fromNodeId: "a",
        toNodeId: "b",
        type: "teacher_of",
        verificationStatus: "VERIFIED"
      })
    ).toThrow("PHKD_FAIL_CLOSED");
  });

  it("fails closed when a lineage claim is not verified", () => {
    expect(() =>
      assertVerifiableLineageClaim({
        fromNodeId: "a",
        toNodeId: "b",
        type: "teacher_of",
        sourceCitation: "Supplied citation",
        verificationStatus: "UNVERIFIED"
      })
    ).toThrow("PHKD_FAIL_CLOSED");
  });

  it("accepts cited verified lineage claims", () => {
    expect(
      assertVerifiableLineageClaim({
        fromNodeId: "a",
        toNodeId: "b",
        type: "teacher_of",
        sourceCitation: "Supplied citation",
        verificationStatus: "VERIFIED"
      })
    ).toMatchObject({ type: "teacher_of" });
  });
});
