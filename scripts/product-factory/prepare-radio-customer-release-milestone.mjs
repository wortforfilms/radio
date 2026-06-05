#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve("apps/web/public/radio-html");
const desktopRoot = path.resolve("apps/desktop/public/radio-html");
const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const writeText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
};

const n = (value) => Number(value ?? 0);
const boolValuesPass = (values) => values.length > 0 && values.every(Boolean);
const statusFor = (pass, localOnly = false) => (pass ? (localOnly ? "draft-pass" : "verified") : "blocked");

const dataPath = (name) => path.join(webRoot, "data", name);
const qaPath = (name) => path.join(webRoot, "qa", name);

const rightsClosure = readJson(dataPath("rights-closure-report.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  summary: { records: 0, closed: 0, blocked: 0, releaseAllowed: 0 }
});
const playbackGate = readJson(dataPath("playback-gate.json"), {
  verificationState: "NULL",
  counts: { playable: 0, blocked: 0, releaseAllowed: 0 }
});
const paymentProof = readJson(dataPath("payment-proof-report.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  summary: { paymentReceipts: 0, webhookEvents: 0, fulfilledGifts: 0, verifiedStates: 0, blockedStates: 0 }
});
const signing = readJson(dataPath("signing-notarization-evidence.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  counts: { signedArtifacts: 0, notarizedArtifacts: 0, blockedChecks: 0 }
});
const releaseReview = readJson(dataPath("release-review-report.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  summary: { reviewItems: 0, verified: 0, blocked: 0, releaseAllowed: false }
});
const guiSmoke = readJson(dataPath("gui-smoke-evidence.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  counts: { checks: 0, passedChecks: 0, blockedChecks: 0, screenshots: 0, reviewers: 0 }
});
const customerFront = readJson(qaPath("customer-front/radio-customer-front-playwright-report.json"), {
  verificationState: "NULL",
  counts: { modules: 0, links: 0, failedLinks: 0, brokenDesktopImages: 0, brokenMobileImages: 0 },
  assertions: {}
});
const visualQa = readJson(dataPath("visual-qa.json"), {
  verificationState: "NULL",
  counts: { targets: 0, capturedScreenshots: 0, pass: 0, blocked: 0 }
});
const tauriReadiness = readJson(dataPath("tauri-readiness.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  counts: { draftReady: 0, blocked: 0, notRun: 0 }
});
const orchestration = readJson(dataPath("release-orchestration-run.json"), {
  verificationState: "NULL",
  counts: { steps: 0, pass: 0, fail: 0, browserChecks: 0 }
});
const remainingPackets = readJson(dataPath("remaining-proof-packets.json"), {
  verificationState: "NULL",
  shipDecision: "NO_SHIP",
  counts: { packets: 0, rowsPrepared: 0, nullProofFields: 0, releaseAllowed: 0, blockedLanes: 0 }
});

const allCustomerFrontAssertionsPass = boolValuesPass(Object.values(customerFront.assertions ?? {}));
const rightsPass = n(rightsClosure.summary?.records) > 0
  && n(rightsClosure.summary?.closed) === n(rightsClosure.summary?.records)
  && n(rightsClosure.summary?.releaseAllowed) === n(rightsClosure.summary?.records)
  && n(rightsClosure.summary?.blocked) === 0;
const playbackPass = n(playbackGate.counts?.playable) > 0
  && n(playbackGate.counts?.blocked) === 0
  && n(playbackGate.counts?.releaseAllowed) > 0;
const paymentPass = n(paymentProof.summary?.paymentReceipts) > 0
  && n(paymentProof.summary?.webhookEvents) > 0
  && n(paymentProof.summary?.fulfilledGifts) > 0
  && n(paymentProof.summary?.blockedStates) === 0;
const signingPass = n(signing.counts?.signedArtifacts) > 0
  && n(signing.counts?.notarizedArtifacts) > 0
  && n(signing.counts?.blockedChecks) === 0;
const reviewPass = n(releaseReview.summary?.reviewItems) > 0
  && n(releaseReview.summary?.verified) === n(releaseReview.summary?.reviewItems)
  && releaseReview.summary?.releaseAllowed === true;
const guiPass = n(guiSmoke.counts?.screenshots) > 0
  && n(guiSmoke.counts?.reviewers) > 0
  && n(guiSmoke.counts?.blockedChecks) === 0;
const customerFrontPass = allCustomerFrontAssertionsPass
  && n(customerFront.counts?.failedLinks) === 0
  && n(customerFront.counts?.brokenDesktopImages) === 0
  && n(customerFront.counts?.brokenMobileImages) === 0
  && n(customerFront.counts?.modules) > 0;
const visualPass = n(visualQa.counts?.targets) > 0
  && n(visualQa.counts?.pass) === n(visualQa.counts?.targets)
  && n(visualQa.counts?.capturedScreenshots) === n(visualQa.counts?.targets)
  && n(visualQa.counts?.blocked) === 0;
const tauriPass = n(tauriReadiness.counts?.blocked) === 0
  && tauriReadiness.shipDecision !== "NO_SHIP";
const orchestrationPass = n(orchestration.counts?.steps) > 0
  && n(orchestration.counts?.fail) === 0
  && n(orchestration.counts?.pass) === n(orchestration.counts?.steps);

const gates = [
  {
    key: "customer-front-playwright",
    label: "Customer Front Playwright",
    category: "local-ui",
    status: statusFor(customerFrontPass, true),
    evidence: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json",
    apiView: null,
    blocker: customerFrontPass ? null : "Customer front render, links, images, or PHKD assertions are incomplete.",
    observed: customerFront.counts,
    requiredEvidence: ["routeLoaded", "heroPresent", "navComplete", "noBrokenImages", "internalLinksOk", "phkdGuardVisible"]
  },
  {
    key: "visual-qa",
    label: "Visual QA Board",
    category: "local-ui",
    status: statusFor(visualPass, true),
    evidence: "/radio-html/data/visual-qa.json",
    apiView: null,
    blocker: visualPass ? null : "Visual QA screenshots or target pass counts are incomplete.",
    observed: visualQa.counts,
    requiredEvidence: ["capturedScreenshots", "passEqualsTargets", "blockedEqualsZero"]
  },
  {
    key: "release-orchestration",
    label: "Local Release Orchestration",
    category: "local-command",
    status: statusFor(orchestrationPass, true),
    evidence: "/radio-html/data/release-orchestration-run.json",
    apiView: "release-orchestration",
    blocker: orchestrationPass ? null : "Local release check has not completed all configured commands.",
    observed: orchestration.counts,
    requiredEvidence: ["steps", "pass", "fail"]
  },
  {
    key: "gui-smoke",
    label: "Desktop GUI Smoke",
    category: "desktop-proof",
    status: statusFor(guiPass),
    evidence: "/radio-html/data/gui-smoke-evidence.json",
    apiView: null,
    blocker: guiPass ? null : "Manual GUI screenshot, reviewer, no-crash, and visible no-ship proof are incomplete.",
    observed: guiSmoke.counts,
    requiredEvidence: ["screenshot", "reviewer", "firstPaint", "navigation", "noCrash", "noShipVisible", "audioGateVisible"]
  },
  {
    key: "rights-closure",
    label: "Rights Evidence Closure",
    category: "external-proof",
    status: statusFor(rightsPass),
    evidence: "/radio-html/data/rights-closure-report.json",
    apiView: "rights-closure-report",
    blocker: rightsPass ? null : `Rights closure blocked: ${n(rightsClosure.summary?.blocked)} record(s) lack complete proof.`,
    observed: rightsClosure.summary,
    requiredEvidence: ["source", "creator", "license", "citation", "reviewer", "reviewedAt", "AuditLog.verified", "releaseAllowed"]
  },
  {
    key: "playback-gate",
    label: "Playable Audio Gate",
    category: "external-proof",
    status: statusFor(playbackPass),
    evidence: "/radio-html/data/playback-gate.json",
    apiView: "playback-gate",
    blocker: playbackPass ? null : "Playable audio remains blocked until imported audio and rights evidence are verified.",
    observed: playbackGate.counts,
    requiredEvidence: ["audioImport", "rightsClosed", "releaseAllowed", "canPlay"]
  },
  {
    key: "gift-payment-proof",
    label: "Gift Payment Proof",
    category: "external-proof",
    status: statusFor(paymentPass),
    evidence: "/radio-html/data/payment-proof-report.json",
    apiView: "payment-proof-report",
    blocker: paymentPass ? null : `Gift/payment proof blocked: ${n(paymentProof.summary?.blockedStates)} state(s) lack complete proof.`,
    observed: paymentProof.summary,
    requiredEvidence: ["checkoutSession", "paymentReceipt", "webhookSignature", "settlementStatus", "fulfillment", "AuditLog.created"]
  },
  {
    key: "signing-notarization",
    label: "Signing + Notarization",
    category: "external-proof",
    status: statusFor(signingPass),
    evidence: "/radio-html/data/signing-notarization-evidence.json",
    apiView: null,
    blocker: signingPass ? null : "Signed artifact, notarization, Developer ID, Gatekeeper, and reviewer evidence are incomplete.",
    observed: signing.counts,
    requiredEvidence: ["signedArtifact", "developerId", "notarizationTicket", "gatekeeperAssessment", "reviewer", "AuditLog.verified"]
  },
  {
    key: "release-review",
    label: "Human Release Review",
    category: "external-proof",
    status: statusFor(reviewPass),
    evidence: "/radio-html/data/release-review-report.json",
    apiView: "release-review-report",
    blocker: reviewPass ? null : `Release review blocked: ${n(releaseReview.summary?.blocked)} item(s) lack approval proof.`,
    observed: releaseReview.summary,
    requiredEvidence: ["reviewer", "reviewedAt", "citation", "reason", "decision", "AuditLog.verified"]
  },
  {
    key: "tauri-readiness",
    label: "Tauri Readiness",
    category: "release-packaging",
    status: statusFor(tauriPass),
    evidence: "/radio-html/data/tauri-readiness.json",
    apiView: "tauri-readiness",
    blocker: tauriPass ? null : "Tauri readiness remains NO_SHIP while blocked evidence lanes exist.",
    observed: tauriReadiness.counts,
    requiredEvidence: ["signedInstaller", "notarizedInstaller", "rightsClosed", "paymentReceipt", "releaseReview", "shipDecision"]
  }
];

const blockedGates = gates.filter((gate) => gate.status === "blocked");
const customerReleaseReady = blockedGates.length === 0;
const customerRelease = {
  id: "radio-customer-release-milestone",
  title: "Radio Vaigyaaniq Customer Release Milestone",
  generatedAt: today,
  verificationState: customerReleaseReady ? "customer-release-ready-local" : "blocked-customer-release-proof-null",
  shipDecision: customerReleaseReady ? "CUSTOMER_RELEASE_REVIEW_READY" : "NO_SHIP",
  phkd: {
    rule: "fail_closed",
    unknownValues: "NULL",
    productionReady: false,
    releaseAllowed: false,
    note: "Customer release stays blocked until rights, playable audio, payment receipt, webhook, signing, notarization, GUI smoke, release review, and packaging evidence are independently present and verified."
  },
  counts: {
    gates: gates.length,
    draftPass: gates.filter((gate) => gate.status === "draft-pass").length,
    verified: gates.filter((gate) => gate.status === "verified").length,
    blocked: blockedGates.length,
    customerReleaseReady: customerReleaseReady ? 1 : 0,
    productionReady: 0,
    releaseAllowed: 0,
    rightsClosed: n(rightsClosure.summary?.closed),
    rightsBlocked: n(rightsClosure.summary?.blocked),
    playableAudio: n(playbackGate.counts?.playable),
    paymentReceipts: n(paymentProof.summary?.paymentReceipts),
    webhookEvents: n(paymentProof.summary?.webhookEvents),
    signedArtifacts: n(signing.counts?.signedArtifacts),
    notarizedArtifacts: n(signing.counts?.notarizedArtifacts),
    releaseReviewsVerified: n(releaseReview.summary?.verified),
    guiSmokeScreenshots: n(guiSmoke.counts?.screenshots),
    customerFrontFailedLinks: n(customerFront.counts?.failedLinks),
    visualQaBlocked: n(visualQa.counts?.blocked),
    remainingPacketRowsPrepared: n(remainingPackets.counts?.rowsPrepared),
    remainingPacketNullFields: n(remainingPackets.counts?.nullProofFields)
  },
  gates,
  blockers: blockedGates.map((gate) => ({
    key: gate.key,
    label: gate.label,
    evidence: gate.evidence,
    blocker: gate.blocker,
    requiredEvidence: gate.requiredEvidence
  })),
  releaseCriteria: [
    "rights closure closed for every release asset",
    "playable audio imported with verified rights",
    "gift/payment receipt, webhook signature, settlement, and fulfillment proof",
    "signed and notarized desktop artifacts with reviewer evidence",
    "desktop GUI smoke proof with reviewer and screenshot",
    "human release review with citation, reason, decision, and audit record",
    "Tauri readiness no longer reports NO_SHIP",
    "customer front and visual QA remain locally passing"
  ],
  sourceFrames: [
    { key: "rights-closure", path: "/radio-html/data/rights-closure-report.json", verificationState: rightsClosure.verificationState ?? "NULL" },
    { key: "playback-gate", path: "/radio-html/data/playback-gate.json", verificationState: playbackGate.verificationState ?? "NULL" },
    { key: "payment-proof", path: "/radio-html/data/payment-proof-report.json", verificationState: paymentProof.verificationState ?? "NULL" },
    { key: "signing", path: "/radio-html/data/signing-notarization-evidence.json", verificationState: signing.verificationState ?? "NULL" },
    { key: "release-review", path: "/radio-html/data/release-review-report.json", verificationState: releaseReview.verificationState ?? "NULL" },
    { key: "gui-smoke", path: "/radio-html/data/gui-smoke-evidence.json", verificationState: guiSmoke.verificationState ?? "NULL" },
    { key: "customer-front", path: "/radio-html/qa/customer-front/radio-customer-front-playwright-report.json", verificationState: customerFront.verificationState ?? "NULL" },
    { key: "visual-qa", path: "/radio-html/data/visual-qa.json", verificationState: visualQa.verificationState ?? "NULL" },
    { key: "tauri-readiness", path: "/radio-html/data/tauri-readiness.json", verificationState: tauriReadiness.verificationState ?? "NULL" },
    { key: "release-orchestration-run", path: "/radio-html/data/release-orchestration-run.json", verificationState: orchestration.verificationState ?? "NULL" }
  ]
};

function renderCustomerReleaseSurface() {
  const gateRows = gates.map((gate) => `
        <article class="runtime-row">
          <span>${gate.status}</span>
          <div>
            <b>${gate.label}</b>
            <p>${gate.blocker ?? "Gate has local draft evidence. It does not override PHKD release blockers."}</p>
            <small>${gate.requiredEvidence.join(" · ")}</small>
          </div>
          <a href="${gate.evidence}">Evidence</a>
        </article>`).join("");

  const blockerRows = customerRelease.blockers.map((blocker) => `
        <article class="surface-card blocked">
          <span class="surface-label">${blocker.key}</span>
          <h2>${blocker.label}</h2>
          <p>${blocker.blocker}</p>
          <a href="${blocker.evidence}">Open proof frame</a>
        </article>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Radio Surface - Customer Release Milestone</title>
  <link rel="stylesheet" href="./surface-kit.css">
</head>
<body>
  <main class="surface-shell">
    <aside class="surface-rail">
      <div class="surface-mark">RV</div>
      <nav>
        <a href="./index.html">Index</a>
        <a href="./no-ship-dashboard.html">No-Ship</a>
        <a href="./rights-closure.html">Rights</a>
        <a href="./payment-proof-report.html">Pay</a>
        <a href="./signing-notarization-evidence.html">Sign</a>
        <a href="./release-review.html">Review</a>
      </nav>
      <span>PHKD</span>
    </aside>
    <section class="surface-main">
      <section class="surface-hero with-image">
        <img src="../assets/radio-vaigyaaniq-landing-hero.png" alt="" aria-hidden="true">
        <div>
          <p class="eyebrow">Customer Release Milestone</p>
          <h1>${customerRelease.title}</h1>
          <p>${customerRelease.phkd.note}</p>
          <div class="surface-actions">
            <a href="../data/customer-release-milestone.json">Milestone JSON</a>
            <a href="/api/radio-release?view=customer-release">Release API</a>
            <a href="./no-ship-dashboard.html">No-Ship Dashboard</a>
          </div>
        </div>
        <div class="status-chip">
          <span>Decision</span>
          <b>${customerRelease.shipDecision}</b>
          <small>${customerRelease.verificationState}</small>
        </div>
      </section>
      <section class="surface-grid four">
        <article class="surface-card"><span class="surface-label">Gates</span><b>${customerRelease.counts.gates}</b><p>Customer release checks.</p></article>
        <article class="surface-card"><span class="surface-label">Blocked</span><b>${customerRelease.counts.blocked}</b><p>Must close before customer release.</p></article>
        <article class="surface-card"><span class="surface-label">Draft Pass</span><b>${customerRelease.counts.draftPass}</b><p>Local-only evidence passes.</p></article>
        <article class="surface-card"><span class="surface-label">Release Allowed</span><b>${customerRelease.counts.releaseAllowed}</b><p>Fail-closed external allowance.</p></article>
      </section>
      <section class="surface-card">
        <span class="surface-label">Gate Matrix</span>
        <h2>Customer Release Readiness</h2>
        <section class="runtime-lane">${gateRows}</section>
      </section>
      <section class="surface-grid three">
${blockerRows}
      </section>
    </section>
  </main>
</body>
</html>
`;
}

function upsertMilestone(root) {
  const file = path.join(root, "data", "milestone-completion.json");
  const milestoneCompletion = readJson(file, {
    id: "radio-vaigyaaniq-next-milestone-completion",
    title: "Radio Vaigyaaniq Next Milestone Completion",
    generatedAt: today,
    verificationState: "draft",
    phkd: customerRelease.phkd,
    counts: {},
    milestones: []
  });
  const milestone = {
    key: "customer-release-milestone",
    label: "Customer Release Milestone",
    status: "implemented-draft",
    evidence: "/radio-html/data/customer-release-milestone.json",
    blocker: customerReleaseReady ? null : `Customer release blocked: ${blockedGates.length} gate(s) lack complete proof.`
  };
  const milestones = [
    ...(milestoneCompletion.milestones ?? []).filter((item) => item.key !== milestone.key),
    milestone
  ];
  milestoneCompletion.generatedAt = today;
  milestoneCompletion.counts = {
    ...(milestoneCompletion.counts ?? {}),
    milestones: milestones.length,
    implementedDraft: milestones.filter((item) => item.status === "implemented-draft").length,
    evidenceBlocked: milestones.filter((item) => item.blocker).length,
    productionReady: 0,
    shipDecision: "NO_SHIP",
    customerReleaseReady: customerReleaseReady ? 1 : 0,
    customerReleaseBlocked: blockedGates.length
  };
  milestoneCompletion.milestones = milestones;
  writeJson(file, milestoneCompletion);
}

function upsertSurfaceIndex(root) {
  const file = path.join(root, "surfaces", "index.html");
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<b>\d+<\/b>\s*<small>surfaces \+ milestone lanes<\/small>/, "<b>48</b>\n          <small>surfaces + milestone lanes</small>");
  if (!html.includes('href="./customer-release.html"')) {
    const tile = `        <a class="surface-tile" href="./customer-release.html"><span class="surface-label">Milestone</span><b>Customer Release</b><p>Fail-closed customer release gate aggregating rights, payment, signing, QA, review, and packaging proof.</p></a>`;
    html = html.replace('        <a class="surface-tile" href="./rights-review.html"', `${tile}\n        <a class="surface-tile" href="./rights-review.html"`);
  }
  fs.writeFileSync(file, html);
}

for (const root of [webRoot, desktopRoot]) {
  writeJson(path.join(root, "data", "customer-release-milestone.json"), customerRelease);
  writeText(path.join(root, "surfaces", "customer-release.html"), renderCustomerReleaseSurface());
  upsertMilestone(root);
  upsertSurfaceIndex(root);
}

console.log(JSON.stringify({
  report: "radio-customer-release-milestone",
  data: "/radio-html/data/customer-release-milestone.json",
  surface: "/radio-html/surfaces/customer-release.html",
  counts: customerRelease.counts,
  shipDecision: customerRelease.shipDecision,
  verificationState: customerRelease.verificationState
}, null, 2));
