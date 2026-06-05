import fs from "node:fs";
import path from "node:path";
import {
  governancePhkd,
  governancePolicies,
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
    counts: { draftReady: 0, blocked: 0 }
  });
  const productionFreeze = readJson("radio-html/data/production-freeze.json", {
    freezeState: "NULL",
    productionReady: false
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
    "Customer modules": customerFrontQa.counts.modules,
    "Customer failed links": customerFrontQa.counts.failedLinks,
    "Visual QA pass": visualQa.counts.pass,
    "Visual QA blocked": visualQa.counts.blocked,
    "Tauri blocked": tauriReadiness.counts.blocked,
    "Production ready": productionFreeze.productionReady
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
        </div>
      </section>
    </main>
  );
}
