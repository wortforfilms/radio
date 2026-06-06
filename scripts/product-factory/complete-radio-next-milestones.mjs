import fs from "node:fs";
import path from "node:path";

const root = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = "2026-06-05";

const dataPhkd = {
  rule: "fail_closed",
  unknownValues: "NULL",
  productionReady: false,
  releaseAllowed: false,
  note: "Milestone records describe local implementation and evidence gates only. They do not verify rights, payment settlement, installer signing, release approval, external telemetry, or production readiness."
};

const milestoneSurfaces = [
  ["Rights Review Workbench", "/radio-html/surfaces/rights-review.html", "/apps/desktop/public/radio-html/surfaces/rights-review.html", "apps/web/public/radio-html/data/rights-review-workbench.json"],
  ["Playback Gate", "/radio-html/surfaces/playback-gate.html", "/apps/desktop/public/radio-html/surfaces/playback-gate.html", "apps/web/public/radio-html/data/playback-gate.json"],
  ["Payment Proof", "/radio-html/surfaces/payment-proof.html", "/apps/desktop/public/radio-html/surfaces/payment-proof.html", "apps/web/public/radio-html/data/payment-proof-lane.json"],
  ["Installer Pipeline", "/radio-html/surfaces/installer-pipeline.html", "/apps/desktop/public/radio-html/surfaces/installer-pipeline.html", "apps/web/public/radio-html/data/installer-pipeline.json"],
  ["Release Orchestration", "/radio-html/surfaces/release-orchestration.html", "/apps/desktop/public/radio-html/surfaces/release-orchestration.html", "apps/web/public/radio-html/data/release-orchestration.json"],
  ["Desktop Alpha Bundle", "/radio-html/surfaces/desktop-alpha.html", "/apps/desktop/public/radio-html/surfaces/desktop-alpha.html", "apps/web/public/radio-html/data/desktop-alpha-bundle.json"]
];

const milestoneDataRows = [
  ["Rights Review Workbench Data", "/radio-html/data/rights-review-workbench.json", "served-static-json", "/apps/desktop/public/radio-html/data/rights-review-workbench.json", "apps/web/public/radio-html/data/rights-review-workbench.json", "implemented-draft"],
  ["Playback Gate Data", "/radio-html/data/playback-gate.json", "served-static-json", "/apps/desktop/public/radio-html/data/playback-gate.json", "apps/web/public/radio-html/data/playback-gate.json", "implemented-draft"],
  ["Payment Proof Data", "/radio-html/data/payment-proof-lane.json", "served-static-json", "/apps/desktop/public/radio-html/data/payment-proof-lane.json", "apps/web/public/radio-html/data/payment-proof-lane.json", "implemented-draft"],
  ["Installer Pipeline Data", "/radio-html/data/installer-pipeline.json", "served-static-json", "/apps/desktop/public/radio-html/data/installer-pipeline.json", "apps/web/public/radio-html/data/installer-pipeline.json", "implemented-draft"],
  ["Release Orchestration Data", "/radio-html/data/release-orchestration.json", "served-static-json", "/apps/desktop/public/radio-html/data/release-orchestration.json", "apps/web/public/radio-html/data/release-orchestration.json", "implemented-draft"],
  ["Desktop Alpha Bundle Data", "/radio-html/data/desktop-alpha-bundle.json", "served-static-json", "/apps/desktop/public/radio-html/data/desktop-alpha-bundle.json", "apps/web/public/radio-html/data/desktop-alpha-bundle.json", "implemented-draft"],
  ["Milestone Completion Data", "/radio-html/data/milestone-completion.json", "served-static-json", "/apps/desktop/public/radio-html/data/milestone-completion.json", "apps/web/public/radio-html/data/milestone-completion.json", "implemented-draft"]
];

function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function copyToDesktop(relativePath) {
  if (!fs.existsSync(desktopRoot)) return;
  const source = path.join(root, relativePath);
  const target = path.join(desktopRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function surfaceHtml({ title, eyebrow, headline, body, jsonPath, apiPath, primaryMetric, countKeys, listTitle, listKey, listMap = "default", extraActions = [] }) {
  const extraActionHtml = extraActions.map((action) => `<a href="${action.href}">${action.label}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - ${title}</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail">
      <div class="surface-mark">RV</div>
      <nav><a href="./index.html">Index</a><a href="./tauri-readiness.html">Tauri</a><a href="./release-orchestration.html">Orchestrate</a><a href="/governance#milestone-completion">Governance</a></nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h1>${headline}</h1>
          <p>${body}</p>
          <div class="surface-actions"><a href="${jsonPath}">Data JSON</a>${extraActionHtml}<a href="${apiPath}">API View</a><a href="./no-ship-dashboard.html">No-Ship Dashboard</a></div>
        </div>
        <div class="status-chip"><span>${primaryMetric.label}</span><b id="primaryMetric">NULL</b><small>${primaryMetric.note}</small></div>
      </section>
      <section class="surface-grid three" id="metrics"></section>
      <section class="surface-card"><span class="surface-label">${listTitle}</span><h2>Milestone Records</h2><section class="runtime-lane" id="recordList"></section></section>
    </section>
  </main>
  <script>
    const valueText = (value) => value === null || value === undefined ? "NULL" : String(value);
    const countKeys = ${JSON.stringify(countKeys)};
    fetch("${jsonPath}").then((response) => response.json()).then((data) => {
      document.getElementById("primaryMetric").textContent = valueText(${primaryMetric.value});
      document.getElementById("metrics").innerHTML = countKeys.map((key) => \`
        <article class="surface-card"><span class="surface-label">\${key}</span><b>\${valueText(data.counts?.[key])}</b></article>
      \`).join("");
      const records = data["${listKey}"] || [];
      document.getElementById("recordList").innerHTML = records.length ? records.map((item) => {
        if ("${listMap}" === "command") return \`<article class="runtime-row"><span>\${item.key}</span><div><b>\${item.command || item.label}</b><p>\${item.description || item.evidence || item.blocker || "NULL"}</p></div><small class="surface-state-pill">\${item.status}</small></article>\`;
        if ("${listMap}" === "artifact") return \`<article class="runtime-row"><span>\${item.key}</span><div><b>\${item.label}</b><p>artifact \${valueText(item.artifact)} · signature \${valueText(item.signature)} · \${item.blocker || "NULL"}</p></div><small class="surface-state-pill">\${item.status}</small></article>\`;
        return \`<article class="runtime-row"><span>\${item.key || item.scope || item.id}</span><div><b>\${item.label || item.path || item.title}</b><p>\${item.blocker || item.description || item.evidence || item.nextAction || "NULL"}</p></div><small class="surface-state-pill">\${item.status || item.reviewState || item.state}</small></article>\`;
      }).join("") : '<article class="runtime-row"><span>NULL</span><div><b>No records</b><p>No verified external records are available.</p></div><small class="surface-state-pill">blocked</small></article>';
    });
  </script>
</body>
</html>
`;
}

const assetEvidence = readJson(path.join(root, "assets/Radio_Vaigyaaniq_Asset_Evidence.json"), { counts: {}, records: [] });
const rightsEvidence = readJson(path.join(root, "data/rights-evidence.json"), { counts: {}, records: [] });
const audioImport = readJson(path.join(root, "data/audio-import-manifest.json"), { counts: {}, imports: [] });
const giftPaymentEvidence = readJson(path.join(root, "data/gift-payment-evidence.json"), { counts: {}, states: [] });
const installerEvidence = readJson(path.join(root, "data/installer-evidence.json"), { counts: {}, platformMatrix: [], artifactSlots: [] });
const releaseReview = readJson(path.join(root, "data/release-review.json"), { counts: {}, workflow: [], queue: [] });
const tauriReadiness = readJson(path.join(root, "data/tauri-readiness.json"), { evidenceLanes: [], noShipDashboard: {}, checklist: [] });
const productionFreeze = readJson(path.join(root, "data/production-freeze.json"), { frozenDrafts: [], blockedProductionClaims: [] });
const visualQa = readJson(path.join(root, "data/visual-qa.json"), { counts: {}, targets: [] });
const previousDesktopAlpha = readJson(path.join(root, "data/desktop-alpha-bundle.json"), null);

const rightsReviewWorkbench = {
  id: "radio-vaigyaaniq-rights-review-workbench",
  title: "Radio Vaigyaaniq Rights Review Workbench",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    assets: assetEvidence.counts.records ?? 0,
    queued: assetEvidence.counts.unreviewed ?? 0,
    missingLicense: assetEvidence.counts.rightsNull ?? 0,
    releaseAllowed: assetEvidence.counts.releaseAllowed ?? 0,
    blocked: rightsEvidence.counts.blocked ?? 0
  },
  requiredFields: ["source", "creator", "license", "rightsStatus", "citation", "reviewer", "reviewedAt", "AuditLog.verified"],
  reviewQueue: (assetEvidence.records || []).map((record) => ({
    key: record.id,
    path: record.path,
    status: "blocked",
    reviewState: record.review?.reviewState ?? "unreviewed",
    blocker: "releaseAllowed=false until rights and reviewer evidence are complete",
    missing: record.phkd?.unknownValues ?? [],
    auditApi: "/api/audit/verified"
  }))
};

const playbackGate = {
  id: "radio-vaigyaaniq-playback-gate",
  title: "Radio Vaigyaaniq Playable Audio Import Gate",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    imports: audioImport.counts.imports ?? 0,
    playable: 0,
    blocked: Math.max(audioImport.counts.blocked ?? 0, audioImport.counts.nullEvidence ?? 0),
    nullEvidence: audioImport.counts.nullEvidence ?? 0,
    stationSlots: readJson(path.join(root, "data/radio-media.json"), { stations: [] }).stations?.length ?? 0
  },
  gateRules: [
    "audio source must exist",
    "sha256 checksum must exist",
    "rightsStatus must be verified",
    "releaseAllowed must be true",
    "AuditLog.verified must exist"
  ],
  records: (audioImport.imports || []).length
    ? audioImport.imports.map((item) => ({ ...item, canPlay: false, status: "blocked", blocker: "rights evidence missing" }))
    : [{ key: "audio-placeholder", label: "No verified imported audio", canPlay: false, status: "blocked", blocker: "audio import manifest has no verified records" }]
};

const paymentProofLane = {
  id: "radio-vaigyaaniq-payment-proof-lane",
  title: "Radio Vaigyaaniq Gift Payment Proof Lane",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    giftIntents: giftPaymentEvidence.counts.giftIntents ?? 0,
    checkoutSessions: giftPaymentEvidence.counts.checkoutSessions ?? 0,
    paymentReceipts: giftPaymentEvidence.counts.paymentReceipts ?? 0,
    fulfilledGifts: giftPaymentEvidence.counts.fulfilledGifts ?? 0,
    webhookEvents: 0,
    blocked: giftPaymentEvidence.counts.blocked ?? 0
  },
  webhookVerifier: {
    provider: null,
    endpoint: "/api/radio-release?view=payment-proof",
    signatureHeader: null,
    status: "blocked",
    blocker: "checkout provider, signing secret, and receipt evidence are NULL"
  },
  records: giftPaymentEvidence.states ?? []
};

const installerPipeline = {
  id: "radio-vaigyaaniq-installer-pipeline",
  title: "Radio Vaigyaaniq Tauri Installer Pipeline",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    platformTargets: installerEvidence.platformMatrix?.length ?? 0,
    artifactSlots: installerEvidence.counts.artifactSlots ?? 0,
    signedArtifacts: installerEvidence.counts.signedArtifacts ?? 0,
    nullArtifacts: installerEvidence.counts.nullArtifacts ?? 0,
    blocked: installerEvidence.counts.blocked ?? 0
  },
  commands: [
    { key: "web-build", command: "npm run build", status: "configured", description: "Builds the Next.js web surface." },
    { key: "release-check", command: "npm run radio:release:check", status: "configured", description: "Runs local evidence generation, tests, and build." },
    { key: "tauri-build", command: "npm run tauri:build", status: "blocked", description: "Blocked until a verified Tauri app and signing identity exist." }
  ],
  records: installerEvidence.artifactSlots ?? []
};

const releaseOrchestration = {
  id: "radio-vaigyaaniq-release-orchestration",
  title: "Radio Vaigyaaniq One-Command Evidence Orchestration",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    configuredCommands: 5,
    optionalBrowserChecks: 2,
    lastRunFailures: 0,
    productionReady: 0,
    blockedEvidenceLanes: 4
  },
  command: "npm run radio:release:check",
  steps: [
    { key: "core-data", command: "node scripts/product-factory/complete-radio-milestones.mjs", status: "configured", description: "Refreshes core Radio evidence frames." },
    { key: "next-milestones", command: "node scripts/product-factory/complete-radio-next-milestones.mjs", status: "configured", description: "Refreshes milestone evidence frames." },
    { key: "tests", command: "npm test", status: "configured", description: "Runs Vitest." },
    { key: "build", command: "npm run build", status: "configured", description: "Runs Next production build." },
    { key: "browser-evidence", command: "RADIO_RELEASE_BROWSER_URL=http://127.0.0.1:3000 npm run radio:release:check", status: "optional", description: "Runs governance and Visual QA Playwright checks when a local server is available." }
  ]
};

const desktopAlphaBundle = {
  id: "radio-vaigyaaniq-desktop-alpha-bundle",
  title: "Radio Vaigyaaniq Desktop Alpha Bundle",
  generatedAt: today,
  verificationState: previousDesktopAlpha?.verificationState ?? "draft-alpha",
  phkd: dataPhkd,
  counts: {
    includedSurfaces: milestoneSurfaces.length + 19,
    includedDataFrames: milestoneDataRows.length + 10,
    signedInstallers: 0,
    productionReady: 0,
    blockers: 4,
    ...(previousDesktopAlpha?.counts?.localUnsignedArtifacts !== undefined
      ? { localUnsignedArtifacts: previousDesktopAlpha.counts.localUnsignedArtifacts }
      : {}),
    ...(previousDesktopAlpha?.counts?.appOpenProof !== undefined
      ? { appOpenProof: previousDesktopAlpha.counts.appOpenProof }
      : {})
  },
  alphaState: "local-alpha-no-ship",
  launchModes: uniqueBy([
    ...(previousDesktopAlpha?.launchModes ?? []),
    { key: "web-dev", label: "Next local dev", status: "configured", evidence: "npm run dev -- --webpack -H 127.0.0.1 -p 3000" },
    { key: "static-html", label: "Browser-openable static HTML", status: "configured", evidence: "/radio-html/surfaces/index.html" },
    { key: "tauri-installer", label: "Signed Tauri installer", status: "blocked", evidence: "/radio-html/data/installer-evidence.json" }
  ], (item) => item.key),
  records: uniqueBy([
    ...(previousDesktopAlpha?.records ?? []),
    { key: "no-ship-labels", label: "Visible NO_SHIP labels", status: "configured", blocker: null },
    { key: "rights", label: "Verified rights", status: "blocked", blocker: "rights evidence NULL/unreviewed" },
    { key: "payment", label: "Payment receipts", status: "blocked", blocker: "checkout/payment evidence NULL" },
    { key: "installer", label: "Signed installer", status: "blocked", blocker: "signed installer evidence NULL" },
    { key: "release-review", label: "Human release approval", status: "blocked", blocker: "reviewer/reviewedAt NULL" }
  ], (item) => item.key)
};

const milestoneCompletion = {
  id: "radio-vaigyaaniq-next-milestone-completion",
  title: "Radio Vaigyaaniq Next Milestone Completion",
  generatedAt: today,
  verificationState: "draft",
  phkd: dataPhkd,
  counts: {
    milestones: 7,
    implementedDraft: 7,
    evidenceBlocked: 6,
    productionReady: 0,
    shipDecision: "NO_SHIP"
  },
  milestones: [
    { key: "rights-evidence-closure", label: "Rights Evidence Closure", status: "implemented-draft", evidence: "/radio-html/data/rights-review-workbench.json", blocker: "real rights proof and reviewer evidence still required" },
    { key: "playable-audio-import-gate", label: "Playable Audio Import Gate", status: "implemented-draft", evidence: "/radio-html/data/playback-gate.json", blocker: "no verified playable audio records" },
    { key: "gift-payment-proof-lane", label: "Gift Payment Proof Lane", status: "implemented-draft", evidence: "/radio-html/data/payment-proof-lane.json", blocker: "checkout provider and receipt evidence NULL" },
    { key: "tauri-installer-pipeline", label: "Tauri Installer Pipeline", status: "implemented-draft", evidence: "/radio-html/data/installer-pipeline.json", blocker: "signed installer evidence NULL" },
    { key: "release-review-board", label: "Release Review Board", status: "implemented-draft", evidence: "/radio-html/data/release-review.json", blocker: "human approval evidence NULL" },
    { key: "one-command-evidence-orchestration", label: "One-Command Evidence Orchestration", status: "implemented-draft", evidence: "/radio-html/data/release-orchestration.json", blocker: "browser checks require local server" },
    { key: "desktop-alpha-bundle", label: "Desktop Alpha Bundle", status: "implemented-draft", evidence: "/radio-html/data/desktop-alpha-bundle.json", blocker: "alpha is NO_SHIP until rights/payment/signing/review close" }
  ]
};

const writes = [
  ["data/rights-review-workbench.json", rightsReviewWorkbench],
  ["data/playback-gate.json", playbackGate],
  ["data/payment-proof-lane.json", paymentProofLane],
  ["data/installer-pipeline.json", installerPipeline],
  ["data/release-orchestration.json", releaseOrchestration],
  ["data/desktop-alpha-bundle.json", desktopAlphaBundle],
  ["data/milestone-completion.json", milestoneCompletion]
];

for (const [relativePath, payload] of writes) {
  writeJson(path.join(root, relativePath), payload);
  copyToDesktop(relativePath);
}

const surfaceSpecs = [
  {
    file: "surfaces/rights-review.html",
    title: "Rights Review",
    eyebrow: "Rights Evidence Closure",
    headline: "Review Workbench, Still Blocked",
    body: "The review queue is complete as a workbench, but real license, rights, reviewer, and citation evidence are still required before release.",
    jsonPath: "../data/rights-review-workbench.json",
    apiPath: "/api/governance?view=rights-workbench",
    primaryMetric: { label: "Queued Assets", value: "data.counts?.queued", note: "unreviewed records" },
    countKeys: ["assets", "queued", "missingLicense", "releaseAllowed", "blocked"],
    listTitle: "Review Queue",
    listKey: "reviewQueue"
  },
  {
    file: "surfaces/playback-gate.html",
    title: "Playback Gate",
    eyebrow: "Playable Audio Import Gate",
    headline: "Playback Requires Verified Rights",
    body: "Runtime playback is wired to a canPlay gate. Local audio candidates can be indexed with checksums, but playback remains blocked until rights, review, audit, and release allowance evidence are verified.",
    jsonPath: "../data/playback-gate.json",
    apiPath: "/api/governance?view=playback-gate",
    primaryMetric: { label: "Playable", value: "data.counts?.playable", note: "verified tracks" },
    countKeys: ["imports", "localAudioFiles", "checksumPresent", "playable", "blocked", "rightsClosed", "rightsBlocked", "releaseAllowed"],
    listTitle: "Playback Records",
    listKey: "records"
  },
  {
    file: "surfaces/payment-proof.html",
    title: "Payment Proof",
    eyebrow: "Gift Payment Proof Lane",
    headline: "Checkout Proof Required",
    body: "Gift UX remains local intent until provider, checkout session, payment receipt, webhook signature, and fulfillment evidence exist.",
    jsonPath: "../data/payment-proof-lane.json",
    apiPath: "/api/governance?view=payment-proof",
    primaryMetric: { label: "Receipts", value: "data.counts?.paymentReceipts", note: "verified payments" },
    countKeys: ["giftIntents", "checkoutSessions", "paymentReceipts", "fulfilledGifts", "webhookEvents", "blocked"],
    listTitle: "Payment States",
    listKey: "records",
    extraActions: [{ href: "./payment-proof-report.html", label: "Proof Report" }]
  },
  {
    file: "surfaces/installer-pipeline.html",
    title: "Installer Pipeline",
    eyebrow: "Tauri Installer Pipeline",
    headline: "Build Path Without Signing Claim",
    body: "Build commands and artifact slots are mapped, but signed installers remain blocked until checksums and signing evidence exist.",
    jsonPath: "../data/installer-pipeline.json",
    apiPath: "/api/governance?view=installer-pipeline",
    primaryMetric: { label: "Signed", value: "data.counts?.signedArtifacts", note: "installer artifacts" },
    countKeys: ["platformTargets", "artifactSlots", "signedArtifacts", "nullArtifacts", "blocked"],
    listTitle: "Artifact Slots",
    listKey: "records",
    listMap: "artifact"
  },
  {
    file: "surfaces/release-orchestration.html",
    title: "Release Orchestration",
    eyebrow: "One-Command Evidence Orchestration",
    headline: "One Command, Fail Closed",
    body: "The release-check command refreshes local evidence, runs tests, and builds. Browser evidence runs when a local server URL is supplied.",
    jsonPath: "../data/release-orchestration.json",
    apiPath: "/api/governance?view=release-orchestration",
    primaryMetric: { label: "Command", value: "data.command", note: "configured" },
    countKeys: ["configuredCommands", "optionalBrowserChecks", "lastRunFailures", "productionReady", "blockedEvidenceLanes"],
    listTitle: "Orchestration Steps",
    listKey: "steps",
    listMap: "command"
  },
  {
    file: "surfaces/desktop-alpha.html",
    title: "Desktop Alpha",
    eyebrow: "Desktop Alpha Bundle",
    headline: "Local Alpha, Not Shipped",
    body: "The alpha bundle can carry offline HTML and evidence surfaces, but production release remains blocked by rights, payment, signing, and review.",
    jsonPath: "../data/desktop-alpha-bundle.json",
    apiPath: "/api/governance?view=desktop-alpha",
    primaryMetric: { label: "Alpha State", value: "data.alphaState", note: "NO_SHIP" },
    countKeys: ["includedSurfaces", "includedDataFrames", "signedInstallers", "productionReady", "blockers"],
    listTitle: "Alpha Records",
    listKey: "records"
  }
];

for (const spec of surfaceSpecs) {
  fs.mkdirSync(path.dirname(path.join(root, spec.file)), { recursive: true });
  fs.writeFileSync(path.join(root, spec.file), surfaceHtml(spec));
  copyToDesktop(spec.file);
}

const nextEvidenceLanes = [
  { key: "rights-workbench", label: "Rights Review Workbench", path: "/radio-html/data/rights-review-workbench.json", status: "blocked" },
  { key: "playback-gate", label: "Playable Audio Gate", path: "/radio-html/data/playback-gate.json", status: "blocked" },
  { key: "payment-proof", label: "Payment Proof Lane", path: "/radio-html/data/payment-proof-lane.json", status: "blocked" },
  { key: "installer-pipeline", label: "Installer Pipeline", path: "/radio-html/data/installer-pipeline.json", status: "blocked" },
  { key: "release-orchestration", label: "Release Orchestration", path: "/radio-html/data/release-orchestration.json", status: "implemented-draft" },
  { key: "desktop-alpha", label: "Desktop Alpha Bundle", path: "/radio-html/data/desktop-alpha-bundle.json", status: "implemented-draft" }
];
tauriReadiness.evidenceLanes = uniqueBy([...(tauriReadiness.evidenceLanes ?? []), ...nextEvidenceLanes], (item) => item.key);
tauriReadiness.checklist = uniqueBy([...(tauriReadiness.checklist ?? []), ...nextEvidenceLanes.map((lane) => ({
  key: lane.key,
  label: lane.label,
  status: lane.status === "blocked" ? "blocked" : "draft-ready",
  evidence: lane.path
}))], (item) => item.key);
tauriReadiness.counts = {
  draftReady: tauriReadiness.checklist.filter((item) => item.status === "draft-ready").length,
  blocked: tauriReadiness.checklist.filter((item) => item.status === "blocked").length
};
tauriReadiness.noShipDashboard = {
  ...(tauriReadiness.noShipDashboard ?? {}),
  playableAudio: false,
  verifiedRights: false,
  signedInstaller: false,
  paymentReceipt: false,
  releaseReview: false,
  productionReady: false,
  decision: "NO_SHIP"
};
writeJson(path.join(root, "data/tauri-readiness.json"), tauriReadiness);
copyToDesktop("data/tauri-readiness.json");

productionFreeze.frozenDrafts = uniqueBy([...(productionFreeze.frozenDrafts ?? []), ...writes.map(([relativePath]) => ({
  key: relativePath.replace("data/", "").replace(".json", ""),
  path: `/radio-html/${relativePath}`,
  state: "blocked-draft"
}))], (item) => item.key);
productionFreeze.blockedProductionClaims = uniqueBy([...(productionFreeze.blockedProductionClaims ?? []), "playableAudio", "verifiedRights", "signedInstaller", "paymentReceipt", "releaseReview"], (item) => item);
writeJson(path.join(root, "data/production-freeze.json"), productionFreeze);
copyToDesktop("data/production-freeze.json");

const newVisualTargets = surfaceSpecs.map((spec) => {
  const servedPath = `/radio-html/${spec.file}`;
  const slug = path.basename(spec.file, ".html");
  const previous = visualQa.targets.find((target) => target.path === servedPath);
  return previous ?? {
    title: spec.title,
    path: servedPath,
    screenshot: null,
    renderStatus: "pending",
    linkStatus: "pending",
    imageStatus: "pending",
    mobileStatus: "pending",
    notes: "Pending browser screenshot capture.",
    slug
  };
});
visualQa.targets = uniqueBy([...(visualQa.targets ?? []), ...newVisualTargets], (target) => target.path);
visualQa.counts = {
  targets: visualQa.targets.length,
  capturedScreenshots: visualQa.targets.filter((target) => target.screenshot).length,
  pass: visualQa.targets.filter((target) => target.renderStatus === "pass").length,
  blocked: visualQa.targets.filter((target) => target.renderStatus === "blocked").length
};
writeJson(path.join(root, "data/visual-qa.json"), visualQa);
copyToDesktop("data/visual-qa.json");

const allHtmlPath = path.join(root, "Radio_Vaigyaaniq_All_Html_Links.json");
const allHtml = readJson(allHtmlPath);
if (allHtml) {
  const surfaces = allHtml.groups.find((group) => group.key === "surfaces");
  surfaces.links = uniqueBy([...surfaces.links, ...milestoneSurfaces.map(([title, servedPath, desktopPath]) => ({ title, path: servedPath, desktopPath }))], (item) => item.path);
  allHtml.counts.webHtml = allHtml.groups.reduce((sum, group) => sum + group.links.length, 0);
  allHtml.counts.desktopHtml = allHtml.counts.webHtml;
  writeJson(allHtmlPath, allHtml);
  copyToDesktop("Radio_Vaigyaaniq_All_Html_Links.json");
}

const routeCatalogPath = path.join(root, "Radio_Vaigyaaniq_Route_Catalog.json");
const routeCatalog = readJson(routeCatalogPath);
if (routeCatalog) {
  const staticGroup = routeCatalog.groups.find((group) => group.key === "radio-static-artifacts");
  staticGroup.routes = uniqueBy([...staticGroup.routes, ...milestoneSurfaces.map((row) => row[1]), ...milestoneDataRows.map((row) => row[1])], (item) => item);
  routeCatalog.counts.radioStaticArtifacts = staticGroup.routes.length;
  routeCatalog.counts.totalRecords = routeCatalog.groups.reduce((sum, group) => sum + group.routes.length, 0);
  writeJson(routeCatalogPath, routeCatalog);
  copyToDesktop("Radio_Vaigyaaniq_Route_Catalog.json");
}

const routeMatrixPath = path.join(root, "Radio_Vaigyaaniq_Html_Route_Matrix.json");
const routeMatrix = readJson(routeMatrixPath);
if (routeMatrix) {
  const surfaceGroup = routeMatrix.groups.find((group) => group.key === "html-surface-modules");
  surfaceGroup.rows = uniqueBy([...surfaceGroup.rows, ...milestoneSurfaces.map(([surface, staticHtml, desktopCopy, source]) => ({
    surface,
    staticHtml,
    realRoute: "served-static",
    desktopCopy,
    source,
    state: "implemented-draft"
  }))], (row) => row.staticHtml);
  const dataGroup = routeMatrix.groups.find((group) => group.key === "catalog-and-structure");
  dataGroup.rows = uniqueBy([...dataGroup.rows, ...milestoneDataRows.map(([surface, staticHtml, realRoute, desktopCopy, source, state]) => ({
    surface,
    staticHtml,
    realRoute,
    desktopCopy,
    source,
    state
  }))], (row) => row.staticHtml);
  routeMatrix.counts.matrixRows = routeMatrix.groups.reduce((sum, group) => sum + (group.rows?.length ?? 0), 0);
  writeJson(routeMatrixPath, routeMatrix);
  copyToDesktop("Radio_Vaigyaaniq_Html_Route_Matrix.json");
}

const futureStructurePath = path.join(root, "Radio_Vaigyaaniq_Future_Structure.json");
const futureStructure = readJson(futureStructurePath);
if (futureStructure) {
  futureStructure.htmlInventory = uniqueBy([
    ...futureStructure.htmlInventory,
    ...writes.map(([relativePath]) => ({ path: `/radio-html/${relativePath}`, role: `${path.basename(relativePath, ".json")} manifest`, futureLane: "data/release" })),
    ...milestoneSurfaces.map(([title, servedPath]) => ({ path: servedPath, role: `${title} surface`, futureLane: "surfaces/release" }))
  ], (item) => item.path);
  writeJson(futureStructurePath, futureStructure);
  copyToDesktop("Radio_Vaigyaaniq_Future_Structure.json");
}

const scaffoldPath = path.join(root, "Radio_Vaigyaaniq_Full_App_Scaffold.json");
const scaffold = readJson(scaffoldPath);
if (scaffold) {
  scaffold.routes = uniqueBy([
    ...scaffold.routes,
    ...writes.map(([relativePath]) => ({ path: `/radio-html/${relativePath}`, surface: `${path.basename(relativePath, ".json")} data frame`, status: "implemented" })),
    ...milestoneSurfaces.map(([title, servedPath]) => ({ path: servedPath, surface: `${title} HTML surface`, status: "implemented" }))
  ], (item) => item.path);
  writeJson(scaffoldPath, scaffold);
  copyToDesktop("Radio_Vaigyaaniq_Full_App_Scaffold.json");
}

console.log(JSON.stringify({
  generatedAt: today,
  surfaces: milestoneSurfaces.length,
  dataFrames: writes.length,
  visualQa: visualQa.counts,
  tauri: tauriReadiness.counts,
  shipDecision: tauriReadiness.shipDecision
}, null, 2));
