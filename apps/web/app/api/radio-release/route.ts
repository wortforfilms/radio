import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";

const DATASETS = {
  "milestones": "radio-html/data/milestone-completion.json",
  "rights-workbench": "radio-html/data/rights-review-workbench.json",
  "playback-gate": "radio-html/data/playback-gate.json",
  "payment-proof": "radio-html/data/payment-proof-lane.json",
  "installer-pipeline": "radio-html/data/installer-pipeline.json",
  "release-orchestration": "radio-html/data/release-orchestration.json",
  "desktop-alpha": "radio-html/data/desktop-alpha-bundle.json",
  "tauri-readiness": "radio-html/data/tauri-readiness.json",
  "release-review": "radio-html/data/release-review.json",
  "release-review-board": "radio-html/data/release-review-board.json",
  "release-review-report": "radio-html/data/release-review-report.json",
  "payment-proof-report": "radio-html/data/payment-proof-report.json",
  "payment-proof-packet": "radio-html/data/payment-proof-packet.json",
  "rights-closure-report": "radio-html/data/rights-closure-report.json",
  "rights-closure-packet": "radio-html/data/rights-closure-packet.json",
  "rights-proof-import-templates": "radio-html/data/rights-proof-import-templates.json",
  "signing-proof-packet": "radio-html/data/signing-proof-packet.json",
  "release-review-packet": "radio-html/data/release-review-packet.json",
  "remaining-proof-packets": "radio-html/data/remaining-proof-packets.json",
  "hdfc-upi-parser-adapter": "radio-html/data/hdfc-upi-parser-adapter.json",
  "evidence-refresh-command": "radio-html/data/evidence-refresh-command.json",
  "installer-signing-proof": "radio-html/data/installer-signing-proof.json",
  "webhook-signature-proof": "radio-html/data/webhook-signature-proof.json",
  "receipt-settlement-proof": "radio-html/data/receipt-settlement-proof.json"
} as const;

type RadioReleaseView = keyof typeof DATASETS;

function readJson<T>(relativePath: string, fallback: T): T {
  const file = path.join(process.cwd(), "apps/web/public", relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function readDataset(view: RadioReleaseView) {
  return readJson(DATASETS[view], {
    id: view,
    verificationState: "NULL",
    phkd: {
      rule: "fail_closed",
      unknownValues: "NULL",
      productionReady: false,
      releaseAllowed: false
    },
    counts: {}
  });
}

export async function GET(request: NextRequest) {
  const view = (request.nextUrl.searchParams.get("view") ?? "milestones") as RadioReleaseView;
  if (!(view in DATASETS)) {
    return Response.json({
      error: "UNKNOWN_RELEASE_VIEW",
      views: Object.keys(DATASETS)
    }, { status: 404 });
  }

  if (view !== "milestones") {
    return Response.json({
      phkd: {
        rule: "fail_closed",
        unknownValues: "NULL",
        note: "Radio release API exposes local evidence frames only. It does not verify rights, payments, installer signing, release approval, or production readiness."
      },
      view,
      data: readDataset(view)
    });
  }

  const datasets = Object.fromEntries(
    (Object.keys(DATASETS) as RadioReleaseView[]).map((key) => [key, readDataset(key)])
  );
  return Response.json({
    phkd: {
      rule: "fail_closed",
      unknownValues: "NULL",
      productionReady: false,
      releaseAllowed: false
    },
    views: Object.keys(DATASETS),
    datasets
  });
}
