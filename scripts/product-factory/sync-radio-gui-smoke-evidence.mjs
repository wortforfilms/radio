#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const desktopEvidence = path.resolve("apps/desktop/evidence");
const today = new Date().toISOString().slice(0, 10);

const readJson = (file, fallback = null) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};
const statusCounts = (items) => {
  const counts = { draftReady: 0, blocked: 0, notRun: 0 };
  for (const item of items) {
    if (item.status === "blocked") counts.blocked += 1;
    else if (item.status === "not-run") counts.notRun += 1;
    else if (["draft-ready", "implemented-draft", "pass", "draft-ready-unsigned"].includes(item.status)) counts.draftReady += 1;
  }
  return counts;
};

const gui = readJson(path.join(desktopEvidence, "gui-smoke-report.json"), {
  verification_state: "blocked-gui-proof-null",
  gate: { name: "GUI smoke proof", status: "blocked", detail: "GUI smoke report is missing." },
  checks: [],
  summary: { pass: 0, blocked: 0, total: 0 },
  manual_evidence: {},
  app: {}
});
const appOpen = readJson(path.join(desktopEvidence, "app-open-report.json"), null);
const qa = readJson(path.join(desktopEvidence, "qa-report.json"), null);
const bundle = readJson(path.join(desktopEvidence, "bundle-report.json"), null);

const guiData = {
  id: "radio-vaigyaaniq-gui-smoke-evidence",
  title: "Radio Vaigyaaniq GUI Smoke Evidence",
  generatedAt: today,
  verificationState: gui.verification_state,
  shipDecision: qa?.ship_decision ?? "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This data frame records GUI smoke proof requirements. It does not claim the app opened unless screenshot, reviewer, and checklist proof exist."
  },
  counts: {
    checks: gui.summary?.total ?? gui.checks?.length ?? 0,
    passedChecks: gui.summary?.pass ?? 0,
    blockedChecks: gui.summary?.blocked ?? 0,
    screenshots: gui.manual_evidence?.screenshot_exists ? 1 : 0,
    reviewers: gui.manual_evidence?.reviewer ? 1 : 0,
    appOpenProof: appOpen?.gate?.status === "pass" ? 1 : 0
  },
  gate: gui.gate,
  app: gui.app,
  manualEvidence: gui.manual_evidence,
  checks: gui.checks ?? [],
  requiredEvidence: [
    "desktop screenshot of launched app",
    "human reviewer",
    "first paint confirmation",
    "navigation confirmation",
    "no crash or blank screen confirmation",
    "visible NO_SHIP state",
    "visible audio rights/playback gate",
    "renderer error review"
  ],
  commands: [
    {
      key: "create-gui-smoke-report",
      command: "cd apps/desktop && npm run evidence:gui-smoke",
      status: "configured"
    },
    {
      key: "attach-manual-proof",
      command: "EVIDENCE_GUI_SMOKE_SCREENSHOT=/abs/path.png EVIDENCE_GUI_SMOKE_REVIEWER=name EVIDENCE_GUI_SMOKE_FIRST_PAINT=1 EVIDENCE_GUI_SMOKE_NAVIGATION=1 EVIDENCE_GUI_SMOKE_NO_CRASH=1 EVIDENCE_GUI_SMOKE_NO_SHIP=1 EVIDENCE_GUI_SMOKE_AUDIO_GATE=1 EVIDENCE_GUI_SMOKE_ERROR_REVIEW=1 npm run evidence:gui-smoke",
      status: "blocked-until-human-proof"
    }
  ],
  sources: {
    guiSmokeReport: "/apps/desktop/evidence/gui-smoke-report.json",
    appOpenReport: "/apps/desktop/evidence/app-open-report.json",
    qaReport: "/apps/desktop/evidence/qa-report.json",
    bundleReport: "/apps/desktop/evidence/bundle-report.json"
  }
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "gui-smoke-evidence.json"), guiData);
}

for (const root of [webRoot, desktopRoot]) {
  const readinessPath = path.join(root, "data", "tauri-readiness.json");
  const readiness = readJson(readinessPath, {});
  readiness.generatedAt = today;
  readiness.verificationState = gui.gate?.status === "pass"
    ? "draft-local-app-built-gui-smoke-proof-attached"
    : "draft-local-app-built-gui-proof-null";
  readiness.reason = "Local macOS .app bundle, bundle hash, tests, build, cargo check, and app bundle structure are recorded. Shipment remains NO_SHIP until GUI smoke/open proof, signing/notarization, rights, payment, and human release review evidence exist.";
  readiness.evidenceLanes = readiness.evidenceLanes || [];
  const guiLane = {
    key: "gui-smoke-evidence",
    label: "GUI Smoke Evidence Lane",
    path: "/radio-html/data/gui-smoke-evidence.json",
    status: gui.gate?.status ?? "blocked"
  };
  const laneIndex = readiness.evidenceLanes.findIndex((item) => item.key === guiLane.key);
  if (laneIndex >= 0) readiness.evidenceLanes[laneIndex] = guiLane;
  else readiness.evidenceLanes.push(guiLane);

  readiness.checklist = (readiness.checklist || []).map((item) => item.key === "gui-smoke"
    ? {
        ...item,
        label: "GUI smoke screenshot/reviewer proof",
        status: gui.gate?.status ?? "blocked",
        evidence: "/apps/desktop/evidence/gui-smoke-report.json"
      }
    : item);
  readiness.counts = statusCounts(readiness.checklist || []);
  readiness.localDesktopEvidence = {
    ...(readiness.localDesktopEvidence || {}),
    guiSmokeReport: "/apps/desktop/evidence/gui-smoke-report.json",
    guiSmokeGate: gui.gate,
    qaReport: "/apps/desktop/evidence/qa-report.json",
    bundleReport: "/apps/desktop/evidence/bundle-report.json",
    appOpenReport: "/apps/desktop/evidence/app-open-report.json",
    shipDecision: qa?.ship_decision ?? readiness.localDesktopEvidence?.shipDecision ?? "NO_SHIP",
    summary: qa?.summary ?? readiness.localDesktopEvidence?.summary ?? null,
    releaseBlockerSummary: qa?.release_blocker_summary ?? readiness.localDesktopEvidence?.releaseBlockerSummary ?? null,
    bundle: bundle?.installer ?? readiness.localDesktopEvidence?.bundle ?? null
  };
  writeJson(readinessPath, readiness);
}

for (const root of [webRoot, desktopRoot]) {
  const pipelinePath = path.join(root, "data", "installer-pipeline.json");
  const pipeline = readJson(pipelinePath, null);
  if (!pipeline) continue;
  pipeline.generatedAt = today;
  pipeline.verificationState = gui.gate?.status === "pass"
    ? "draft-local-app-built-gui-smoke-proof-attached"
    : "draft-local-app-built-gui-proof-null";
  pipeline.counts = {
    ...(pipeline.counts || {}),
    guiSmokeProof: gui.gate?.status === "pass" ? 1 : 0,
    appOpenProof: appOpen?.gate?.status === "pass" ? 1 : 0
  };
  pipeline.commands = pipeline.commands || [];
  const command = {
    key: "gui-smoke-evidence",
    command: "cd apps/desktop && npm run evidence:gui-smoke && npm run evidence",
    status: gui.gate?.status ?? "blocked",
    description: "Records GUI smoke proof from screenshot, reviewer, and explicit checklist confirmations."
  };
  const index = pipeline.commands.findIndex((item) => item.key === command.key);
  if (index >= 0) pipeline.commands[index] = command;
  else pipeline.commands.push(command);
  writeJson(pipelinePath, pipeline);
}

console.log(JSON.stringify({
  report: "radio-gui-smoke-evidence-sync",
  gate: gui.gate,
  checks: guiData.counts
}, null, 2));
