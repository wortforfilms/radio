#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const evidenceRoot = path.resolve("apps/desktop/evidence");
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
    else if (["draft-ready", "implemented-draft", "pass", "draft-ready-unsigned", "signed-notarized-verified"].includes(item.status)) counts.draftReady += 1;
  }
  return counts;
};

const signing = readJson(path.join(evidenceRoot, "signing-notarization-report.json"), {
  verification_state: "blocked-signing-notarization-proof-null",
  gate: { name: "installer signing evidence", status: "blocked", detail: "Signing/notarization report is missing." },
  checks: [],
  summary: { pass: 0, blocked: 0, total: 0 },
  signature: {},
  notarization: {},
  artifact: {}
});
const bundle = readJson(path.join(evidenceRoot, "bundle-report.json"), null);
const qa = readJson(path.join(evidenceRoot, "qa-report.json"), null);
const isSigned = signing.gate?.status === "pass";
const macArtifact = signing.artifact?.path ? path.relative(path.resolve("apps/desktop"), signing.artifact.path) : bundle?.installer?.artifact ?? null;
const macChecksum = signing.artifact?.bundle_hash ?? bundle?.installer?.sha256 ?? null;
const signingEvidencePath = "/radio-html/data/signing-notarization-evidence.json";

const signingData = {
  id: "radio-vaigyaaniq-signing-notarization-evidence",
  title: "Radio Vaigyaaniq Signing + Notarization Evidence",
  generatedAt: today,
  verificationState: signing.verification_state,
  shipDecision: qa?.ship_decision ?? "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "This data frame records read-only signing and notarization verification. It does not sign or notarize the app."
  },
  counts: {
    checks: signing.summary?.total ?? signing.checks?.length ?? 0,
    passedChecks: signing.summary?.pass ?? 0,
    blockedChecks: signing.summary?.blocked ?? 0,
    signedArtifacts: isSigned ? 1 : 0,
    notarizedArtifacts: isSigned ? 1 : 0,
    developerIdIdentities: signing.signature?.developerIdApplication ? 1 : 0,
    adhocSignatures: signing.signature?.adhoc ? 1 : 0
  },
  gate: signing.gate,
  artifact: signing.artifact,
  signature: signing.signature,
  notarization: signing.notarization,
  checks: signing.checks ?? [],
  commands: signing.commands ?? [],
  requiredEvidence: [
    "artifact path",
    "sha256 checksum",
    "Developer ID Application authority",
    "codesign verification",
    "Gatekeeper assessment",
    "notarization/stapler validation",
    "human signing reviewer"
  ],
  sources: {
    signingReport: "/apps/desktop/evidence/signing-notarization-report.json",
    bundleReport: "/apps/desktop/evidence/bundle-report.json",
    qaReport: "/apps/desktop/evidence/qa-report.json"
  }
};

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "signing-notarization-evidence.json"), signingData);
}

for (const root of [webRoot, desktopRoot]) {
  const installerPath = path.join(root, "data", "installer-evidence.json");
  const installer = readJson(installerPath, {});
  installer.generatedAt = today;
  installer.verificationState = isSigned ? "signed-notarized-verified" : "draft-local-app-built-signing-proof-blocked";
  installer.counts = {
    ...(installer.counts || {}),
    artifactSlots: 6,
    signedArtifacts: isSigned ? 1 : 0,
    unsignedArtifacts: macArtifact ? 1 : 0,
    nullArtifacts: macArtifact ? 5 : 6,
    blocked: isSigned ? 5 : 6,
    signingChecks: signingData.counts.checks,
    signingBlockedChecks: signingData.counts.blockedChecks,
    notarizedArtifacts: signingData.counts.notarizedArtifacts
  };
  installer.platformMatrix = [
    {
      key: "macos",
      platform: "macOS",
      label: "macOS local app bundle",
      formats: ["app", "dmg"],
      signed: isSigned,
      notarized: isSigned,
      artifact: macArtifact,
      checksum: macChecksum,
      signature: signing.signature?.signature ?? null,
      notarization: isSigned ? "stapled-ticket-verified" : null,
      signingEvidence: signingEvidencePath,
      status: isSigned ? "signed-notarized-verified" : (macArtifact ? "draft-ready-unsigned" : "blocked")
    },
    ...(installer.platformMatrix || []).filter((platform) => platform.platform !== "macOS")
  ];
  installer.artifactSlots = (installer.artifactSlots || []).map((slot) => slot.key === "macos-app"
    ? {
        ...slot,
        path: macArtifact,
        checksum: macChecksum,
        signingEvidence: signingEvidencePath,
        status: isSigned ? "signed-notarized-verified" : (macArtifact ? "draft-ready-unsigned" : "blocked")
      }
    : slot);
  installer.signingChecks = signing.checks ?? [];
  installer.signingGate = signing.gate;
  if (!installer.requiredEvidence?.includes("Gatekeeper assessment")) {
    installer.requiredEvidence = [
      ...(installer.requiredEvidence || []),
      "Gatekeeper assessment",
      "stapled notarization validation"
    ];
  }
  writeJson(installerPath, installer);
}

for (const root of [webRoot, desktopRoot]) {
  const pipelinePath = path.join(root, "data", "installer-pipeline.json");
  const pipeline = readJson(pipelinePath, null);
  if (!pipeline) continue;
  pipeline.generatedAt = today;
  pipeline.verificationState = isSigned ? "signed-notarized-verified" : "draft-local-app-built-signing-proof-blocked";
  pipeline.counts = {
    ...(pipeline.counts || {}),
    signedArtifacts: isSigned ? 1 : 0,
    notarizedArtifacts: isSigned ? 1 : 0,
    signingBlockedChecks: signingData.counts.blockedChecks
  };
  pipeline.commands = pipeline.commands || [];
  const command = {
    key: "signing-notarization-evidence",
    command: "cd apps/desktop && npm run evidence:signing && npm run evidence",
    status: signing.gate?.status ?? "blocked",
    description: "Runs read-only codesign, Gatekeeper, and stapler verification; does not sign or submit notarization."
  };
  const index = pipeline.commands.findIndex((item) => item.key === command.key);
  if (index >= 0) pipeline.commands[index] = command;
  else pipeline.commands.push(command);
  writeJson(pipelinePath, pipeline);
}

for (const root of [webRoot, desktopRoot]) {
  const readinessPath = path.join(root, "data", "tauri-readiness.json");
  const readiness = readJson(readinessPath, {});
  readiness.generatedAt = today;
  readiness.verificationState = isSigned ? "draft-local-app-built-signing-verified" : "draft-local-app-built-signing-proof-blocked";
  readiness.evidenceLanes = readiness.evidenceLanes || [];
  const lane = {
    key: "signing-notarization-evidence",
    label: "Signing + Notarization Evidence Lane",
    path: signingEvidencePath,
    status: signing.gate?.status ?? "blocked"
  };
  const laneIndex = readiness.evidenceLanes.findIndex((item) => item.key === lane.key);
  if (laneIndex >= 0) readiness.evidenceLanes[laneIndex] = lane;
  else readiness.evidenceLanes.push(lane);
  const checklist = readiness.checklist || [];
  const existing = checklist.findIndex((item) => item.key === "signing-notarization");
  const checklistItem = {
    key: "signing-notarization",
    label: "Signing and notarization proof",
    status: signing.gate?.status ?? "blocked",
    evidence: "/apps/desktop/evidence/signing-notarization-report.json"
  };
  if (existing >= 0) checklist[existing] = checklistItem;
  else checklist.push(checklistItem);
  readiness.checklist = checklist;
  readiness.platformMatrix = (readiness.platformMatrix || []).map((platform) => platform.platform === "macOS"
    ? {
        ...platform,
        signed: isSigned,
        notarized: isSigned,
        artifact: macArtifact,
        checksum: macChecksum,
        signature: signing.signature?.signature ?? null,
        notarization: isSigned ? "stapled-ticket-verified" : null,
        status: isSigned ? "signed-notarized-verified" : (macArtifact ? "draft-ready-unsigned" : "blocked")
      }
    : platform);
  readiness.artifactSlots = (readiness.artifactSlots || []).map((slot) => slot.key === "macos-app"
    ? {
        ...slot,
        path: macArtifact,
        checksum: macChecksum,
        signingEvidence: signingEvidencePath,
        status: isSigned ? "signed-notarized-verified" : (macArtifact ? "draft-ready-unsigned" : "blocked")
      }
    : slot);
  readiness.noShipDashboard = {
    ...(readiness.noShipDashboard || {}),
    signedInstaller: isSigned
  };
  readiness.counts = statusCounts(readiness.checklist);
  readiness.localDesktopEvidence = {
    ...(readiness.localDesktopEvidence || {}),
    signingNotarizationReport: "/apps/desktop/evidence/signing-notarization-report.json",
    signingGate: signing.gate,
    shipDecision: qa?.ship_decision ?? readiness.localDesktopEvidence?.shipDecision ?? "NO_SHIP",
    summary: qa?.summary ?? readiness.localDesktopEvidence?.summary ?? null,
    releaseBlockerSummary: qa?.release_blocker_summary ?? readiness.localDesktopEvidence?.releaseBlockerSummary ?? null
  };
  writeJson(readinessPath, readiness);
}

console.log(JSON.stringify({
  report: "radio-signing-evidence-sync",
  gate: signing.gate,
  counts: signingData.counts
}, null, 2));
