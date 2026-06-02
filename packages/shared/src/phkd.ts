import { z } from "zod";

export const verificationStatusSchema = z.enum(["UNKNOWN", "UNVERIFIED", "VERIFIED", "DISPUTED", "REJECTED"]);

export const lineageClaimSchema = z.object({
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  type: z.enum([
    "teacher_of",
    "student_of",
    "influenced",
    "inspired",
    "authored",
    "translated",
    "belongs_to",
    "discovered",
    "continued",
    "preserved",
    "collaborated_with",
    "founded"
  ]),
  sourceCitation: z.string().trim().min(1).nullable().optional(),
  provenanceNote: z.string().trim().min(1).nullable().optional(),
  verificationStatus: verificationStatusSchema.default("UNVERIFIED")
});

export function assertVerifiableLineageClaim(input: unknown) {
  const parsed = lineageClaimSchema.parse(input);
  if (!parsed.sourceCitation || parsed.verificationStatus !== "VERIFIED") {
    throw new Error("PHKD_FAIL_CLOSED: lineage claims require a citation and VERIFIED status.");
  }
  return parsed;
}

export function nullableUnknown(value: unknown) {
  return value === undefined || value === "" ? null : value;
}
