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
    evidence: null,
    blocker: "rights evidence NULL"
  },
  {
    key: "payment-gift",
    label: "Gift and payment receipt",
    status: "blocked",
    evidence: null,
    blocker: "checkout/payment evidence NULL"
  },
  {
    key: "signed-installer",
    label: "Signed Tauri installer",
    status: "blocked",
    evidence: null,
    blocker: "signed installer evidence NULL"
  },
  {
    key: "release-review",
    label: "Human release review",
    status: "blocked",
    evidence: null,
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
