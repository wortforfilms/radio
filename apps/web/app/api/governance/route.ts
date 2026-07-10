import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import {
  governancePhkd,
  governancePolicies,
  governanceDraftThumbnails,
  governanceReleaseGates,
  governanceViews
} from "@shared/governance";

function readJson<T>(relativePath: string, fallback: T): T {
  const file = path.join(process.cwd(), "apps/web/public", relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get("view");
  const [auditLogCount, citedCount, verifiedCount, mergedCount] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { action: "cited" } }),
    prisma.auditLog.count({ where: { action: "verified" } }),
    prisma.auditLog.count({ where: { action: "merged" } })
  ]);

  const assetEvidence = readJson("radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json", {
    counts: { records: 0, releaseAllowed: 0, unreviewed: 0 }
  });
  const tauriReadiness = readJson("radio-html/data/tauri-readiness.json", {
    shipDecision: "NO_SHIP",
    counts: { draftReady: 0, blocked: 0 },
    noShipDashboard: null,
    evidenceLanes: []
  });
  const productionFreeze = readJson("radio-html/data/production-freeze.json", {
    productionReady: false,
    freezeState: "NULL"
  });
  const rightsEvidence = readJson("radio-html/data/rights-evidence.json", {
    counts: { records: 0, releaseAllowed: 0, rightsNull: 0, unreviewed: 0, blocked: 0 }
  });
  const giftPaymentEvidence = readJson("radio-html/data/gift-payment-evidence.json", {
    counts: { giftIntents: 0, checkoutSessions: 0, paymentReceipts: 0, fulfilledGifts: 0, blocked: 0 }
  });
  const installerEvidence = readJson("radio-html/data/installer-evidence.json", {
    counts: { artifactSlots: 0, signedArtifacts: 0, nullArtifacts: 0, blocked: 0 },
    platformMatrix: []
  });
  const releaseReview = readJson("radio-html/data/release-review.json", {
    counts: { reviewItems: 0, unreviewed: 0, verified: 0, rejected: 0, blocked: 0 },
    workflow: []
  });
  const milestoneCompletion = readJson("radio-html/data/milestone-completion.json", {
    counts: { milestones: 0, implementedDraft: 0, evidenceBlocked: 0, productionReady: 0 },
    milestones: []
  });
  const rightsWorkbench = readJson("radio-html/data/rights-review-workbench.json", {
    counts: { assets: 0, queued: 0, missingLicense: 0, releaseAllowed: 0, blocked: 0 },
    reviewQueue: []
  });
  const playbackGate = readJson("radio-html/data/playback-gate.json", {
    counts: { imports: 0, playable: 0, blocked: 0, nullEvidence: 0 },
    records: []
  });
  const paymentProofLane = readJson("radio-html/data/payment-proof-lane.json", {
    counts: { giftIntents: 0, checkoutSessions: 0, paymentReceipts: 0, fulfilledGifts: 0, webhookEvents: 0, blocked: 0 },
    records: []
  });
  const installerPipeline = readJson("radio-html/data/installer-pipeline.json", {
    counts: { platformTargets: 0, artifactSlots: 0, signedArtifacts: 0, nullArtifacts: 0, blocked: 0 },
    commands: [],
    records: []
  });
  const releaseOrchestration = readJson("radio-html/data/release-orchestration.json", {
    counts: { configuredCommands: 0, optionalBrowserChecks: 0, lastRunFailures: 0, productionReady: 0, blockedEvidenceLanes: 0 },
    steps: []
  });
  const releaseOrchestrationRun = readJson("radio-html/data/release-orchestration-run.json", {
    counts: { steps: 0, pass: 0, fail: 0, gates: 0, gatesBlocked: 0, productionReady: 0, releaseAllowed: 0 },
    evidenceDashboard: { gateCounts: { total: 0, pass: 0, blocked: 0 }, gates: [], realWorldBlockers: [] },
    shipDecision: "NO_SHIP",
    productionReady: false,
    releaseAllowed: false
  });
  const desktopAlphaBundle = readJson("radio-html/data/desktop-alpha-bundle.json", {
    counts: { includedSurfaces: 0, includedDataFrames: 0, signedInstallers: 0, productionReady: 0, blockers: 0 },
    records: []
  });
  const visualQa = readJson("radio-html/data/visual-qa.json", {
    counts: { targets: 0, pass: 0, blocked: 0 }
  });
  const customerFrontQa = readJson("radio-html/qa/customer-front/radio-customer-front-playwright-report.json", {
    verificationState: "NULL",
    assertions: {},
    counts: { links: 0, failedLinks: 0 }
  });

  const releaseGates = governanceReleaseGates.map((gate) => {
    if (gate.key === "visual-qa-board") {
      return {
        ...gate,
        status: visualQa.counts?.blocked === 0 && visualQa.counts?.pass > 0 ? "draft-ready" : "blocked",
        blocker: visualQa.counts?.blocked === 0 ? null : "visual QA has blocked targets"
      };
    }
    if (gate.key === "customer-front-playwright") {
      return {
        ...gate,
        status: Object.values(customerFrontQa.assertions ?? {}).every(Boolean) ? "draft-ready" : "blocked",
        blocker: Object.values(customerFrontQa.assertions ?? {}).every(Boolean) ? null : "customer-front Playwright assertions not all true"
      };
    }
    return gate;
  });

  const payload = {
    id: "governance-evidence-center",
    generatedAt: new Date().toISOString(),
    verificationState: "draft",
    phkd: governancePhkd,
    views: governanceViews,
    policies: governancePolicies,
    draftThumbnails: governanceDraftThumbnails,
    releaseGates,
    observatory: {
      auditLogCount,
      citedCount,
      verifiedCount,
      mergedCount,
      assetRecords: assetEvidence.counts.records,
      releaseAllowed: assetEvidence.counts.releaseAllowed,
      unreviewedAssets: assetEvidence.counts.unreviewed,
      rightsBlocked: rightsEvidence.counts.blocked,
      giftPaymentBlocked: giftPaymentEvidence.counts.blocked,
      installerBlocked: installerEvidence.counts.blocked,
      releaseReviewBlocked: releaseReview.counts.blocked,
      milestonesImplemented: milestoneCompletion.counts.implementedDraft,
      milestoneEvidenceBlocked: milestoneCompletion.counts.evidenceBlocked,
      playbackPlayable: playbackGate.counts.playable,
      playbackBlocked: playbackGate.counts.blocked,
      paymentReceipts: paymentProofLane.counts.paymentReceipts,
      installerPipelineBlocked: installerPipeline.counts.blocked,
      releaseCommandFailures: releaseOrchestrationRun.counts.fail,
      releaseEvidenceGatesBlocked: releaseOrchestrationRun.counts.gatesBlocked,
      customerFrontFailedLinks: customerFrontQa.counts.failedLinks,
      visualQaPass: visualQa.counts.pass,
      visualQaBlocked: visualQa.counts.blocked,
      tauriDecision: tauriReadiness.shipDecision,
      tauriBlocked: tauriReadiness.counts.blocked,
      productionReady: productionFreeze.productionReady
    },
    lanes: {
      rightsEvidence,
      giftPaymentEvidence,
      installerEvidence,
      releaseReview,
      milestoneCompletion,
      rightsWorkbench,
      playbackGate,
      paymentProofLane,
      installerPipeline,
      releaseOrchestration,
      releaseOrchestrationRun,
      desktopAlphaBundle
    },
    noShipDashboard: tauriReadiness.noShipDashboard ?? {
      productionReady: false,
      playableAudio: false,
      verifiedRights: false,
      signedInstaller: false,
      paymentReceipt: false,
      releaseReview: false,
      externalTelemetry: false,
      decision: "NO_SHIP"
    },
    evidence: {
      assetEvidence: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json",
      customerFrontQa: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
      visualQa: "/radio-html/data/visual-qa.json",
      tauriReadiness: "/radio-html/data/tauri-readiness.json",
      productionFreeze: "/radio-html/data/production-freeze.json",
      rightsEvidence: "/radio-html/data/rights-evidence.json",
      giftPaymentEvidence: "/radio-html/data/gift-payment-evidence.json",
      installerEvidence: "/radio-html/data/installer-evidence.json",
      releaseReview: "/radio-html/data/release-review.json",
      milestoneCompletion: "/radio-html/data/milestone-completion.json",
      rightsWorkbench: "/radio-html/data/rights-review-workbench.json",
      playbackGate: "/radio-html/data/playback-gate.json",
      paymentProofLane: "/radio-html/data/payment-proof-lane.json",
      installerPipeline: "/radio-html/data/installer-pipeline.json",
      releaseOrchestration: "/radio-html/data/release-orchestration.json",
      releaseOrchestrationRun: "/radio-html/data/release-orchestration-run.json",
      desktopAlphaBundle: "/radio-html/data/desktop-alpha-bundle.json"
    }
  };

  if (view === "milestones") return Response.json({ phkd: governancePhkd, milestoneCompletion });
  if (view === "rights-workbench") return Response.json({ phkd: governancePhkd, rightsWorkbench });
  if (view === "playback-gate") return Response.json({ phkd: governancePhkd, playbackGate });
  if (view === "payment-proof") return Response.json({ phkd: governancePhkd, paymentProofLane });
  if (view === "installer-pipeline") return Response.json({ phkd: governancePhkd, installerPipeline });
  if (view === "release-orchestration") return Response.json({ phkd: governancePhkd, releaseOrchestration });
  if (view === "release-orchestration-run") return Response.json({ phkd: governancePhkd, releaseOrchestrationRun });
  if (view === "desktop-alpha") return Response.json({ phkd: governancePhkd, desktopAlphaBundle });
  if (view === "rights-evidence") return Response.json({ phkd: governancePhkd, rightsEvidence });
  if (view === "gift-payment") return Response.json({ phkd: governancePhkd, giftPaymentEvidence });
  if (view === "installer-evidence") return Response.json({ phkd: governancePhkd, installerEvidence });
  if (view === "release-review") return Response.json({ phkd: governancePhkd, releaseReview });
  if (view === "no-ship") return Response.json({ phkd: governancePhkd, noShipDashboard: payload.noShipDashboard, releaseGates });

  if (view === "verification-queue") {
    return Response.json({
      phkd: governancePhkd,
      queue: {
        unreviewedAssets: assetEvidence.counts.unreviewed,
        releaseAllowed: assetEvidence.counts.releaseAllowed,
        rightsBlocked: rightsEvidence.counts.blocked,
        giftPaymentBlocked: giftPaymentEvidence.counts.blocked,
        installerBlocked: installerEvidence.counts.blocked,
        releaseReviewBlocked: releaseReview.counts.blocked,
        milestoneEvidenceBlocked: milestoneCompletion.counts.evidenceBlocked,
        playbackBlocked: playbackGate.counts.blocked,
        paymentProofBlocked: paymentProofLane.counts.blocked,
        installerPipelineBlocked: installerPipeline.counts.blocked,
        failedLinks: customerFrontQa.counts.failedLinks,
        blockedVisualQa: visualQa.counts.blocked
      },
      releaseGates
    });
  }

  if (view === "policy-matrix") {
    return Response.json({
      phkd: governancePhkd,
      policies: governancePolicies,
      releaseGates
    });
  }

  return Response.json(payload);
}
