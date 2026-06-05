export const governanceAuditActions = ["created", "updated", "deleted", "merged", "cited", "verified"] as const;

export type GovernanceAuditAction = (typeof governanceAuditActions)[number];

export type GovernancePolicy = {
  id: string;
  title: string;
  scope: string;
  rule: string;
  enforcement: "block" | "warn" | "record";
  status: "active" | "draft" | "blocked";
  evidenceRequired: string[];
  failClosed: boolean;
};

export type GovernanceView = {
  key: string;
  title: string;
  purpose: string;
  route: string;
  api: string;
  status: "implemented-draft" | "blocked";
};

export type GovernanceReleaseGate = {
  key: string;
  label: string;
  status: "draft-ready" | "blocked";
  evidence: string | null;
  blocker: string | null;
};

export type GovernanceDraftThumbnail = {
  key: string;
  title: string;
  summary: string;
  image: string;
  href: string;
  evidence: string;
  status: "draft" | "draft-ready" | "blocked";
  verificationState: string;
};

export const governancePhkd = {
  policy: "fail_closed",
  unknownValues: "NULL",
  productionReady: false,
  releaseAllowed: false,
  note: "Governance records describe local runtime evidence only. They do not verify rights, payments, installer signing, external telemetry, lineage claims, or production readiness."
};

export const governanceViews: GovernanceView[] = [
  {
    key: "audit-log",
    title: "Audit Log",
    purpose: "Review created, updated, deleted, merged, cited, and verified actions.",
    route: "/governance#audit-log",
    api: "/api/audit",
    status: "implemented-draft"
  },
  {
    key: "verification-queue",
    title: "Verification Queue",
    purpose: "Surface unreviewed records and block verification without citation, reviewer, and reviewedAt evidence.",
    route: "/governance#verification-queue",
    api: "/api/governance?view=verification-queue",
    status: "implemented-draft"
  },
  {
    key: "merge-ledger",
    title: "Merge Ledger",
    purpose: "Track merge decisions and require an explicit reason plus audit record.",
    route: "/governance#merge-ledger",
    api: "/api/audit/merged",
    status: "implemented-draft"
  },
  {
    key: "policy-matrix",
    title: "Policy Matrix",
    purpose: "Expose PHKD gates and show blocked production claims before release.",
    route: "/governance#policy-matrix",
    api: "/api/governance?view=policy-matrix",
    status: "implemented-draft"
  },
  {
    key: "milestone-completion",
    title: "Milestone Completion",
    purpose: "Track remaining release milestones as draft gates with blocked external proof.",
    route: "/governance#milestone-completion",
    api: "/api/radio-release",
    status: "implemented-draft"
  },
  {
    key: "rights-workbench",
    title: "Rights Workbench",
    purpose: "Queue asset rights review without marking unreviewed assets releaseAllowed.",
    route: "/radio-html/surfaces/rights-review.html",
    api: "/api/radio-release?view=rights-workbench",
    status: "implemented-draft"
  },
  {
    key: "playback-gate",
    title: "Playback Gate",
    purpose: "Block audio playback until import records and rights evidence are verifiable.",
    route: "/radio-html/surfaces/playback-gate.html",
    api: "/api/radio-release?view=playback-gate",
    status: "implemented-draft"
  },
  {
    key: "payment-proof",
    title: "Payment Proof",
    purpose: "Keep gifts and payments blocked until receipts and provider evidence exist.",
    route: "/radio-html/surfaces/payment-proof.html",
    api: "/api/radio-release?view=payment-proof",
    status: "implemented-draft"
  },
  {
    key: "installer-pipeline",
    title: "Installer Pipeline",
    purpose: "List desktop package lanes while signed installers remain NULL.",
    route: "/radio-html/surfaces/installer-pipeline.html",
    api: "/api/radio-release?view=installer-pipeline",
    status: "implemented-draft"
  },
  {
    key: "release-orchestration",
    title: "Release Orchestration",
    purpose: "Expose the evidence-first release check command and blocked production posture.",
    route: "/radio-html/surfaces/release-orchestration.html",
    api: "/api/radio-release?view=release-orchestration",
    status: "implemented-draft"
  },
  {
    key: "desktop-alpha",
    title: "Desktop Alpha",
    purpose: "Inventory the draft desktop alpha bundle without signing or production claims.",
    route: "/radio-html/surfaces/desktop-alpha.html",
    api: "/api/radio-release?view=desktop-alpha",
    status: "implemented-draft"
  }
];

export const governancePolicies: GovernancePolicy[] = [
  {
    id: "policy-lineage-citation-required",
    title: "Lineage Claim Citation Required",
    scope: "KnowledgeGraph",
    rule: "teacher_of, student_of, influenced, inspired, authored, translated, belongs_to, discovered, continued, preserved, collaborated_with, and founded claims fail closed without citation.",
    enforcement: "block",
    status: "active",
    evidenceRequired: ["citation", "sourceCitation", "verificationStatus"],
    failClosed: true
  },
  {
    id: "policy-verification-review-required",
    title: "Verification Review Required",
    scope: "Governance",
    rule: "Verified actions require citation, reviewer, reviewedAt, and an audit record.",
    enforcement: "block",
    status: "active",
    evidenceRequired: ["citation", "reviewer", "reviewedAt", "AuditLog"],
    failClosed: true
  },
  {
    id: "policy-merge-reason-required",
    title: "Merge Reason Required",
    scope: "Governance",
    rule: "Merge decisions require before, after, reason, and an AuditLog entry.",
    enforcement: "block",
    status: "active",
    evidenceRequired: ["before", "after", "reason", "AuditLog"],
    failClosed: true
  },
  {
    id: "policy-asset-release-rights-required",
    title: "Asset Release Rights Required",
    scope: "Media",
    rule: "Assets cannot be releaseAllowed until license, rightsStatus, reviewer, and reviewedAt are supplied.",
    enforcement: "block",
    status: "active",
    evidenceRequired: ["license", "rightsStatus", "reviewer", "reviewedAt"],
    failClosed: true
  },
  {
    id: "policy-tauri-no-ship-until-signed",
    title: "Tauri No-Ship Until Signed",
    scope: "Desktop",
    rule: "Tauri shipment remains NO_SHIP until installer signing, rights, payment, and release review evidence exist.",
    enforcement: "block",
    status: "active",
    evidenceRequired: ["signedInstaller", "audioRights", "paymentReceipt", "releaseReview"],
    failClosed: true
  }
];

export const governanceReleaseGates: GovernanceReleaseGate[] = [
  {
    key: "customer-front-playwright",
    label: "Customer front Playwright evidence",
    status: "draft-ready",
    evidence: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
    blocker: null
  },
  {
    key: "visual-qa-board",
    label: "Visual QA board",
    status: "draft-ready",
    evidence: "/radio-html/data/visual-qa.json",
    blocker: null
  },
  {
    key: "asset-checksums",
    label: "Asset checksum evidence",
    status: "draft-ready",
    evidence: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json",
    blocker: null
  },
  {
    key: "audio-rights",
    label: "Playable audio rights",
    status: "blocked",
    evidence: "/radio-html/data/rights-evidence.json",
    blocker: "rights evidence NULL"
  },
  {
    key: "payment-gift",
    label: "Gift and payment receipt",
    status: "blocked",
    evidence: "/radio-html/data/gift-payment-evidence.json",
    blocker: "checkout/payment evidence NULL"
  },
  {
    key: "signed-installer",
    label: "Signed Tauri installer",
    status: "blocked",
    evidence: "/radio-html/data/installer-evidence.json",
    blocker: "signed installer evidence NULL"
  },
  {
    key: "release-review",
    label: "Human release review",
    status: "blocked",
    evidence: "/radio-html/data/release-review.json",
    blocker: "reviewer and reviewedAt NULL"
  }
];

export const governanceDraftThumbnails: GovernanceDraftThumbnail[] = [
  {
    key: "customer-front-desktop",
    title: "Customer Front Desktop",
    summary: "Desktop Playwright capture for the customer-facing Radio front.",
    image: "/radio-html/qa/customer-front/radio-customer-desktop.png",
    href: "/radio-html/qa/customer-front/radio-customer-desktop.png",
    evidence: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
    status: "draft-ready",
    verificationState: "draft-playwright-evidence"
  },
  {
    key: "customer-front-mobile",
    title: "Customer Front Mobile",
    summary: "Mobile Playwright capture used for overflow and broken-image checks.",
    image: "/radio-html/qa/customer-front/radio-customer-mobile.png",
    href: "/radio-html/qa/customer-front/radio-customer-mobile.png",
    evidence: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
    status: "draft-ready",
    verificationState: "draft-playwright-evidence"
  },
  {
    key: "governance-center",
    title: "Governance Evidence Center",
    summary: "Desktop Playwright capture for governance lanes, no-ship state, and release gates.",
    image: "/radio-html/qa/governance/governance-desktop.png",
    href: "/governance",
    evidence: "/radio-html/qa/governance/governance-playwright-report.json",
    status: "draft-ready",
    verificationState: "draft-playwright-evidence"
  },
  {
    key: "runtime-surface",
    title: "Runtime Surface",
    summary: "Draft runtime surface screenshot from the visual QA board.",
    image: "/radio-html/qa/screenshots/runtime-surface.png",
    href: "/radio-html/surfaces/runtime.html",
    evidence: "/radio-html/data/visual-qa.json",
    status: "draft",
    verificationState: "draft"
  },
  {
    key: "asset-evidence",
    title: "Asset Evidence",
    summary: "Draft asset evidence table with checksums, review state, and release gates.",
    image: "/radio-html/qa/screenshots/asset-evidence.png",
    href: "/radio-html/assets/evidence.html",
    evidence: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json",
    status: "draft",
    verificationState: "draft"
  },
  {
    key: "visual-qa",
    title: "Visual QA Board",
    summary: "Draft QA surface listing screenshot capture status for all Radio HTML surfaces.",
    image: "/radio-html/qa/screenshots/visual-qa.png",
    href: "/radio-html/surfaces/visual-qa.html",
    evidence: "/radio-html/data/visual-qa.json",
    status: "draft",
    verificationState: "draft"
  },
  {
    key: "tauri-readiness",
    title: "Tauri Readiness",
    summary: "Draft desktop ship-gate surface. Decision remains NO_SHIP.",
    image: "/radio-html/qa/screenshots/tauri-readiness.png",
    href: "/radio-html/surfaces/tauri-readiness.html",
    evidence: "/radio-html/data/tauri-readiness.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "production-freeze",
    title: "Production Freeze",
    summary: "Draft freeze surface preserving blocked production claims.",
    image: "/radio-html/qa/screenshots/production-freeze.png",
    href: "/radio-html/surfaces/production-freeze.html",
    evidence: "/radio-html/data/production-freeze.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "audio-import",
    title: "Audio Import",
    summary: "Draft audio-import lane. Playable audio remains blocked until rights evidence exists.",
    image: "/radio-html/qa/screenshots/audio-import.png",
    href: "/radio-html/surfaces/audio-import.html",
    evidence: "/radio-html/data/audio-import-manifest.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "rights-review",
    title: "Rights Review",
    summary: "Draft rights workbench for queued asset review. Release claims remain blocked.",
    image: "/radio-html/qa/screenshots/rights-review.png",
    href: "/radio-html/surfaces/rights-review.html",
    evidence: "/radio-html/data/rights-review-workbench.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "playback-gate",
    title: "Playback Gate",
    summary: "Draft playback proof gate. Playable audio remains zero until import evidence exists.",
    image: "/radio-html/qa/screenshots/playback-gate.png",
    href: "/radio-html/surfaces/playback-gate.html",
    evidence: "/radio-html/data/playback-gate.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "payment-proof",
    title: "Payment Proof",
    summary: "Draft payment proof lane. Receipts and webhooks remain NULL.",
    image: "/radio-html/qa/screenshots/payment-proof.png",
    href: "/radio-html/surfaces/payment-proof.html",
    evidence: "/radio-html/data/payment-proof-lane.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "installer-pipeline",
    title: "Installer Pipeline",
    summary: "Draft installer pipeline. Signed artifacts remain NULL.",
    image: "/radio-html/qa/screenshots/installer-pipeline.png",
    href: "/radio-html/surfaces/installer-pipeline.html",
    evidence: "/radio-html/data/installer-pipeline.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "release-orchestration",
    title: "Release Orchestration",
    summary: "Draft orchestration lane for release checks with productionReady false.",
    image: "/radio-html/qa/screenshots/release-orchestration.png",
    href: "/radio-html/surfaces/release-orchestration.html",
    evidence: "/radio-html/data/release-orchestration.json",
    status: "blocked",
    verificationState: "draft"
  },
  {
    key: "desktop-alpha",
    title: "Desktop Alpha",
    summary: "Draft desktop bundle inventory. Signing and shipment remain blocked.",
    image: "/radio-html/qa/screenshots/desktop-alpha.png",
    href: "/radio-html/surfaces/desktop-alpha.html",
    evidence: "/radio-html/data/desktop-alpha-bundle.json",
    status: "blocked",
    verificationState: "draft"
  }
];

export function isGovernanceAuditAction(action: string): action is GovernanceAuditAction {
  return governanceAuditActions.includes(action as GovernanceAuditAction);
}

export function getGovernanceActionRequirements(action: GovernanceAuditAction) {
  return {
    action,
    required: [
      "entityType",
      "entityId",
      ...(action === "cited" || action === "verified" ? ["citation"] : []),
      ...(action === "verified" ? ["reviewer", "reviewedAt"] : []),
      ...(action === "merged" ? ["reason", "before", "after"] : [])
    ],
    failClosed: true
  };
}
