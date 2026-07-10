// Static release defaults for registry-adjacent callers.
// The generated release-orchestration report remains the evidence source of truth.
export const registryConfig = {
  productionReady: false,
  releaseAllowed: false,
  shipDecision: "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    fabricatedEvidenceAccepted: false
  },
  features: {
    premium: false,
    labs: false,
    beta: false,
    events: false,
    academy: false
  },
  evidence: {
    rights: false,
    payment: false,
    signing: false,
    guiSmoke: false,
    releaseReview: false,
    customerRelease: false
  }
} as const;
