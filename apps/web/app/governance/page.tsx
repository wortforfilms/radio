import fs from "node:fs";
import path from "node:path";
import {
  governancePhkd,
  governancePolicies,
  governanceDraftThumbnails,
  governanceReleaseGates,
  governanceViews
} from "@shared/governance";

export const metadata = {
  title: "Governance Evidence Center | Vaishviq Knowledge Runtime"
};

type CountsRecord = Record<string, number | string | boolean | null | undefined>;

function readJson<T>(relativePath: string, fallback: T): T {
  const file = path.join(process.cwd(), "apps/web/public", relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export default function GovernanceEvidenceCenterPage() {
  const assetEvidence = readJson("radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json", {
    counts: { records: 0, productionReady: 0, releaseAllowed: 0, unreviewed: 0 }
  });
  const customerFrontQa = readJson("radio-html/qa/customer-front/radio-customer-front-playwright-report.json", {
    verificationState: "NULL",
    assertions: {},
    counts: { modules: 0, links: 0, failedLinks: 0, brokenDesktopImages: 0, brokenMobileImages: 0 }
  });
  const visualQa = readJson("radio-html/data/visual-qa.json", {
    counts: { targets: 0, pass: 0, blocked: 0 }
  });
  const tauriReadiness = readJson("radio-html/data/tauri-readiness.json", {
    shipDecision: "NO_SHIP",
    counts: { draftReady: 0, blocked: 0 },
    noShipDashboard: null as Record<string, boolean | string> | null,
    evidenceLanes: [] as { key: string; label: string; path: string; status: string }[]
  });
  const productionFreeze = readJson("radio-html/data/production-freeze.json", {
    freezeState: "NULL",
    productionReady: false
  });
  const rightsEvidence = readJson("radio-html/data/rights-evidence.json", {
    counts: { records: 0, releaseAllowed: 0, rightsNull: 0, unreviewed: 0, blocked: 0 },
    requirements: [] as string[],
    requiredEvidence: [] as string[]
  });
  const giftPaymentEvidence = readJson("radio-html/data/gift-payment-evidence.json", {
    counts: { giftIntents: 0, checkoutSessions: 0, paymentReceipts: 0, fulfilledGifts: 0, blocked: 0 },
    requiredEvidence: [] as string[]
  });
  const installerEvidence = readJson("radio-html/data/installer-evidence.json", {
    counts: { artifactSlots: 0, signedArtifacts: 0, nullArtifacts: 0, blocked: 0 },
    requiredEvidence: [] as string[]
  });
  const releaseReview = readJson("radio-html/data/release-review.json", {
    counts: { reviewItems: 0, unreviewed: 0, verified: 0, rejected: 0, blocked: 0 },
    reviewerRequirements: [] as string[]
  });
  const milestoneCompletion = readJson("radio-html/data/milestone-completion.json", {
    counts: { milestones: 0, implementedDraft: 0, evidenceBlocked: 0, productionReady: 0, shipDecision: "NO_SHIP" },
    milestones: [] as { key: string; label: string; status: string; evidence: string; blocker: string | null }[]
  });
  const customerRelease = readJson("radio-html/data/customer-release-milestone.json", {
    verificationState: "NULL",
    shipDecision: "NO_SHIP",
    counts: { gates: 0, draftPass: 0, blocked: 0, customerReleaseReady: 0, releaseAllowed: 0 },
    blockers: [] as { key: string; label: string; blocker: string; evidence: string }[]
  });
  const playbackGate = readJson("radio-html/data/playback-gate.json", {
    counts: { imports: 0, playable: 0, blocked: 0, nullEvidence: 0 }
  });
  const paymentProofLane = readJson("radio-html/data/payment-proof-lane.json", {
    counts: { paymentReceipts: 0, webhookEvents: 0, blocked: 0 }
  });
  const installerPipeline = readJson("radio-html/data/installer-pipeline.json", {
    counts: { signedArtifacts: 0, blocked: 0 }
  });
  const allAssertionsPass = Object.values(customerFrontQa.assertions ?? {}).every(Boolean);
  const releaseGates = governanceReleaseGates.map((gate) => {
    if (gate.key === "customer-front-playwright") {
      return { ...gate, status: allAssertionsPass ? "draft-ready" : "blocked", blocker: allAssertionsPass ? null : "customer-front assertions failed" };
    }
    if (gate.key === "visual-qa-board") {
      const clear = visualQa.counts.blocked === 0 && visualQa.counts.pass > 0;
      return { ...gate, status: clear ? "draft-ready" : "blocked", blocker: clear ? null : "visual QA blocked" };
    }
    return gate;
  });
  const metrics: CountsRecord = {
    "Asset records": assetEvidence.counts.records,
    "Release allowed": assetEvidence.counts.releaseAllowed,
    "Unreviewed assets": assetEvidence.counts.unreviewed,
    "Rights blocked": rightsEvidence.counts.blocked,
    "Gift/payment blocked": giftPaymentEvidence.counts.blocked,
    "Installer blocked": installerEvidence.counts.blocked,
    "Release review blocked": releaseReview.counts.blocked,
    "Milestones": milestoneCompletion.counts.milestones,
    "Milestone drafts": milestoneCompletion.counts.implementedDraft,
    "Evidence blocked": milestoneCompletion.counts.evidenceBlocked,
    "Customer release blocked": customerRelease.counts.blocked,
    "Customer release ready": customerRelease.counts.customerReleaseReady,
    "Playable audio": playbackGate.counts.playable,
    "Payment receipts": paymentProofLane.counts.paymentReceipts,
    "Pipeline signed": installerPipeline.counts.signedArtifacts,
    "Customer modules": customerFrontQa.counts.modules,
    "Customer failed links": customerFrontQa.counts.failedLinks,
    "Visual QA pass": visualQa.counts.pass,
    "Visual QA blocked": visualQa.counts.blocked,
    "Tauri blocked": tauriReadiness.counts.blocked,
    "Production ready": productionFreeze.productionReady
  };
  const evidenceLanes = [
    {
      title: "Rights Evidence Lane",
      href: "/api/governance?view=rights-evidence",
      evidence: "/radio-html/data/rights-evidence.json",
      status: rightsEvidence.counts.blocked > 0 ? "blocked" : "draft-ready",
      body: "Release remains blocked until every asset has license, rightsStatus, reviewer, reviewedAt, and audit evidence.",
      counts: rightsEvidence.counts,
      required: rightsEvidence.requiredEvidence ?? rightsEvidence.requirements ?? []
    },
    {
      title: "Gift Payment Evidence Lane",
      href: "/api/governance?view=gift-payment",
      evidence: "/radio-html/data/gift-payment-evidence.json",
      status: giftPaymentEvidence.counts.blocked > 0 ? "blocked" : "draft-ready",
      body: "Gift, checkout, receipt, and fulfillment stay NULL until a real provider and payment evidence are attached.",
      counts: giftPaymentEvidence.counts,
      required: giftPaymentEvidence.requiredEvidence
    },
    {
      title: "Installer Evidence Lane",
      href: "/api/governance?view=installer-evidence",
      evidence: "/radio-html/data/installer-evidence.json",
      status: installerEvidence.counts.blocked > 0 ? "blocked" : "draft-ready",
      body: "Desktop distribution stays NO_SHIP until signed artifacts and platform verification are present.",
      counts: installerEvidence.counts,
      required: installerEvidence.requiredEvidence
    },
    {
      title: "Release Review Workflow",
      href: "/api/governance?view=release-review",
      evidence: "/radio-html/data/release-review.json",
      status: releaseReview.counts.blocked > 0 ? "blocked" : "draft-ready",
      body: "Human release approval is blocked until reviewer, reviewedAt, citation, reason, and audit records exist.",
      counts: releaseReview.counts,
      required: releaseReview.reviewerRequirements
    }
  ];
  const noShipDashboard = tauriReadiness.noShipDashboard ?? {
    productionReady: false,
    playableAudio: false,
    verifiedRights: false,
    signedInstaller: false,
    paymentReceipt: false,
    releaseReview: false,
    externalTelemetry: false,
    decision: "NO_SHIP"
  };

  return (
    <main className="governance-shell">
      <section className="governance-hero">
        <img src="/universe-heroes/governance-universe.svg" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Governance Universe</p>
          <h1>Evidence Center</h1>
          <p>
            Audit, verification, merge, policy, release, and Tauri gates in one fail-closed surface.
            Unknown values stay NULL; blocked ship claims remain blocked.
          </p>
          <div className="hero-actions">
            <a href="/api/governance">Governance API</a>
            <a href="/api/audit">Audit API</a>
            <a href="/universes/governance-universe">Universe Page</a>
          </div>
        </div>
        <aside>
          <span>Ship Decision</span>
          <b>{tauriReadiness.shipDecision}</b>
          <small>productionReady: {String(productionFreeze.productionReady)}</small>
        </aside>
      </section>

      <section className="governance-grid" aria-label="Governance views">
        {governanceViews.map((view) => (
          <article className="governance-card" id={view.key} key={view.key}>
            <span>{view.status}</span>
            <h2>{view.title}</h2>
            <p>{view.purpose}</p>
            <a href={view.api}>Open API</a>
          </article>
        ))}
      </section>

      <section className="governance-section" id="release-gates">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Release Gate Dashboard</p>
            <h2>{productionFreeze.freezeState} · productionReady {String(productionFreeze.productionReady)}</h2>
          </div>
          <a href="/radio-html/surfaces/tauri-readiness.html">Tauri Readiness</a>
        </div>
        <div className="governance-gate-list">
          {releaseGates.map((gate) => (
            <article className={gate.status === "blocked" ? "blocked" : ""} key={gate.key}>
              <span>{gate.status}</span>
              <strong>{gate.label}</strong>
              <p>{gate.blocker ?? gate.evidence ?? "NULL"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="evidence-lanes">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Evidence Lanes</p>
            <h2>Rights, gifts, installer, and review gates</h2>
            <p>Each lane is a persistence scope with its own JSON frame and API view. Blocked counts are not hidden.</p>
          </div>
          <a href="/api/governance">Governance API</a>
        </div>
        <div className="governance-lane-grid">
          {evidenceLanes.map((lane) => (
            <article className={lane.status === "blocked" ? "governance-lane-card blocked" : "governance-lane-card"} key={lane.title}>
              <span>{lane.status}</span>
              <h3>{lane.title}</h3>
              <p>{lane.body}</p>
              <div className="governance-lane-counts">
                {Object.entries(lane.counts).map(([label, value]) => (
                  <small key={label}><b>{String(value ?? "NULL")}</b> {label}</small>
                ))}
              </div>
              <small>{lane.required.length ? lane.required.join(" · ") : "Required evidence: NULL"}</small>
              <div className="governance-lane-actions">
                <a href={lane.href}>Open API</a>
                <a href={lane.evidence}>Open JSON</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="no-ship-dashboard">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">No-Ship Dashboard</p>
            <h2>Fail-closed release posture</h2>
            <p>Tauri V2 aggregates ship blockers without promoting any unverifiable production claim.</p>
          </div>
          <a href="/api/governance?view=no-ship">No-Ship API</a>
        </div>
        <div className="no-ship-grid">
          {Object.entries(noShipDashboard).map(([label, value]) => (
            <article className={value === true ? "ready" : "blocked"} key={label}>
              <span>{label}</span>
              <b>{String(value)}</b>
            </article>
          ))}
        </div>
        <div className="governance-link-grid">
          {(tauriReadiness.evidenceLanes ?? []).map((lane) => (
            <a href={lane.path} key={lane.key}>{lane.label} · {lane.status}</a>
          ))}
        </div>
      </section>

      <section className="governance-section" id="milestone-completion">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Milestone Completion</p>
            <h2>{milestoneCompletion.counts.implementedDraft}/{milestoneCompletion.counts.milestones} implemented as draft gates · {milestoneCompletion.counts.shipDecision}</h2>
            <p>All remaining milestones now have data frames, HTML surfaces, and API views. External proof is still required before any release claim changes.</p>
          </div>
          <a href="/api/radio-release">Release API</a>
        </div>
        <div className="governance-lane-grid">
          {milestoneCompletion.milestones.map((milestone) => (
            <article className={milestone.blocker ? "governance-lane-card blocked" : "governance-lane-card"} key={milestone.key}>
              <span>{milestone.status}</span>
              <h3>{milestone.label}</h3>
              <p>{milestone.blocker ?? "No blocker recorded."}</p>
              <div className="governance-lane-actions">
                <a href={milestone.evidence}>Open Evidence</a>
                <a href={`/api/radio-release?view=${milestone.key.includes("customer") ? "customer-release" : milestone.key.includes("rights") ? "rights-workbench" : milestone.key.includes("playable") ? "playback-gate" : milestone.key.includes("gift") ? "payment-proof" : milestone.key.includes("tauri") ? "installer-pipeline" : milestone.key.includes("orchestration") ? "release-orchestration" : milestone.key.includes("desktop") ? "desktop-alpha" : "release-review"}`}>Open API</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="policy-matrix">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Policy Matrix</p>
            <h2>PHKD enforcement gates</h2>
          </div>
          <a href="/api/governance?view=policy-matrix">Policy API</a>
        </div>
        <div className="governance-policy-table">
          {governancePolicies.map((policy) => (
            <article key={policy.id}>
              <div>
                <span>{policy.enforcement}</span>
                <strong>{policy.title}</strong>
              </div>
              <p>{policy.rule}</p>
              <small>{policy.evidenceRequired.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="verification-queue">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Verification Queue</p>
            <h2>Reviewer coverage and blocked claims</h2>
          </div>
          <a href="/api/governance?view=verification-queue">Queue API</a>
        </div>
        <div className="governance-metrics">
          {Object.entries(metrics).map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <b>{String(value ?? "NULL")}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="draft-thumbnails">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Draft Thumbnails</p>
            <h2>Evidence previews for draft and blocked surfaces</h2>
            <p>These thumbnails are visual pointers to draft evidence only. They do not make production, rights, payment, installer, or release claims.</p>
          </div>
          <a href="/api/governance">Thumbnail API</a>
        </div>
        <div className="governance-thumbnail-grid">
          {governanceDraftThumbnails.map((thumbnail) => (
            <article className={thumbnail.status === "blocked" ? "governance-thumbnail-card blocked" : "governance-thumbnail-card"} key={thumbnail.key}>
              <a href={thumbnail.href}>
                <img src={thumbnail.image} alt={`${thumbnail.title} draft thumbnail`} />
              </a>
              <div>
                <span>{thumbnail.status}</span>
                <strong>{thumbnail.title}</strong>
                <p>{thumbnail.summary}</p>
                <small>{thumbnail.verificationState}</small>
                <a href={thumbnail.evidence}>Evidence</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section" id="evidence">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Evidence Links</p>
            <h2>Draft evidence trail</h2>
            <p>{governancePhkd.note}</p>
          </div>
        </div>
        <div className="governance-link-grid">
          <a href="/radio-html/qa/customer-front/radio-customer-front-playwright-report.json">Customer Playwright Report</a>
          <a href="/radio-html/qa/customer-front/radio-customer-desktop.png">Desktop Screenshot</a>
          <a href="/radio-html/qa/customer-front/radio-customer-mobile.png">Mobile Screenshot</a>
          <a href="/radio-html/assets/Radio_Vaigyaaniq_Asset_Evidence.json">Asset Evidence</a>
          <a href="/radio-html/data/visual-qa.json">Visual QA JSON</a>
          <a href="/radio-html/data/tauri-readiness.json">Tauri Readiness JSON</a>
          <a href="/radio-html/data/production-freeze.json">Production Freeze JSON</a>
          <a href="/radio-html/data/rights-evidence.json">Rights Evidence JSON</a>
          <a href="/radio-html/data/gift-payment-evidence.json">Gift Payment Evidence JSON</a>
          <a href="/radio-html/data/installer-evidence.json">Installer Evidence JSON</a>
          <a href="/radio-html/data/release-review.json">Release Review JSON</a>
          <a href="/radio-html/data/milestone-completion.json">Milestone Completion JSON</a>
          <a href="/radio-html/data/rights-review-workbench.json">Rights Workbench JSON</a>
          <a href="/radio-html/data/playback-gate.json">Playback Gate JSON</a>
          <a href="/radio-html/data/payment-proof-lane.json">Payment Proof JSON</a>
          <a href="/radio-html/data/installer-pipeline.json">Installer Pipeline JSON</a>
          <a href="/radio-html/data/release-orchestration.json">Release Orchestration JSON</a>
          <a href="/radio-html/data/desktop-alpha-bundle.json">Desktop Alpha JSON</a>
        </div>
      </section>
    </main>
  );
}
