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
    counts: { draftReady: 0, blocked: 0 }
  });
  const productionFreeze = readJson("radio-html/data/production-freeze.json", {
    productionReady: false,
    freezeState: "NULL"
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
      customerFrontFailedLinks: customerFrontQa.counts.failedLinks,
      visualQaPass: visualQa.counts.pass,
      visualQaBlocked: visualQa.counts.blocked,
      tauriDecision: tauriReadiness.shipDecision,
      tauriBlocked: tauriReadiness.counts.blocked,
      productionReady: productionFreeze.productionReady
    },
    evidence: {
      assetEvidence: "/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json",
      customerFrontQa: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
      visualQa: "/radio-html/data/visual-qa.json",
      tauriReadiness: "/radio-html/data/tauri-readiness.json",
      productionFreeze: "/radio-html/data/production-freeze.json"
    }
  };

  if (view === "verification-queue") {
    return Response.json({
      phkd: governancePhkd,
      queue: {
        unreviewedAssets: assetEvidence.counts.unreviewed,
        releaseAllowed: assetEvidence.counts.releaseAllowed,
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
