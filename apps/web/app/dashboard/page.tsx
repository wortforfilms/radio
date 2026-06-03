import { getObservatoryMetrics } from "@runtime/metrics";
import { prisma } from "@runtime/db";
import { universeRegistry } from "@shared/universes";
import { persistenceScopes } from "@shared/persistence-scopes";

export default async function DashboardPage() {
  const metrics = await getObservatoryMetrics(prisma);
  const cards = [
    ["Nodes", metrics.nodeCount],
    ["Edges", metrics.edgeCount],
    ["Lineages", metrics.lineageCount],
    ["Civilizations", metrics.civilizationCount],
    ["Subjects", metrics.subjectCount],
    ["Texts", metrics.textCount],
    ["Sanskrit Lexemes", metrics.sanskritLexemeCount],
    ["Audit Logs", metrics.auditLogCount]
  ];
  const modelCounts = Object.entries(metrics.persistenceCounts).sort(([a], [b]) => a.localeCompare(b));
  const verificationCounts = Object.entries(metrics.verificationStatus);
  const quickActions = [
    ["Lineage Explorer", "/lineage"],
    ["Sanskrit Dictionary", "/dictionary"],
    ["HKD Banners", "/hkd-banners"],
    ["Sprint Matrix", "/sprints"],
    ["Wireframes", "/wireframes"],
    ["Universes", "/universes"],
    ["Persistence Scopes", "/scopes"],
    ["Admin", "/admin"],
    ["Knowledge Graph API", "/api/knowledge-graph"],
    ["Complete HKD Export", "/api/export?format=hkd&scope=all"]
  ];

  return (
    <>
      <section className="dashboard-hero">
        <img src="/universe-heroes/universal-command-center.svg" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Universal Command Center</p>
          <h1>Universal Knowledge Lineage Explorer</h1>
          <p>Persistent runtime with graph traversal, provenance, search, audit, HKD scopes, Sanskrit dictionary, and observatory metrics.</p>
          <div className="hero-actions">
            {quickActions.slice(0, 4).map(([label, href]) => (
              <a href={href} key={href}>{label}</a>
            ))}
          </div>
        </div>
      </section>
      <main className="page">
        <section className="dashboard-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Observatory</p>
              <h2>Runtime Metrics</h2>
            </div>
            <a href="/api/analytics">Analytics API</a>
          </div>
        <div className="grid">
          {cards.map(([label, value]) => (
            <section className="card" key={label}>
              <div className="muted">{label}</div>
              <div className="metric">{value}</div>
            </section>
          ))}
        </div>
        </section>

        <section className="dashboard-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Primary Surfaces</p>
              <h2>Actions</h2>
            </div>
          </div>
          <div className="quick-action-grid">
            {quickActions.map(([label, href]) => (
              <a href={href} key={href}>{label}</a>
            ))}
          </div>
        </section>

        <section className="dashboard-section dashboard-columns">
          <div className="card">
            <h2>All Persistence Counts</h2>
            <div className="model-count-list">
              {modelCounts.map(([label, value]) => (
                <span key={label}><strong>{label}</strong><b>{value}</b></span>
              ))}
            </div>
          </div>
          <div className="card">
            <h2>Verification Status</h2>
            <p className="muted">Records remain fail-closed unless a cited verification process promotes them.</p>
            <div className="model-count-list">
              {verificationCounts.length ? verificationCounts.map(([label, value]) => (
                <span key={label}><strong>{label}</strong><b>{value}</b></span>
              )) : <span><strong>UNKNOWN</strong><b>0</b></span>}
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">HKD</p>
              <h2>Every Persistence Scope</h2>
            </div>
            <a href="/api/export?format=hkd&scope=all">Download all.hkd</a>
          </div>
          <div className="persistence-scope-grid">
            {persistenceScopes.slice(0, 24).map((scope) => (
              <a className="persistence-scope-card" href={`/api/export?format=hkd&scope=${scope.key}`} key={scope.key}>
                <span>.hkd</span>
                <strong>{scope.label}</strong>
                <small>{scope.key}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Preserved Structures</p>
              <h2>All Universes</h2>
            </div>
            <a href="/universes">Open all</a>
          </div>
        <div className="universe-grid">
          {universeRegistry.map((universe) => (
            <a className={`universe-card universe-card-image tone-${universe.tone}`} href={`/universes/${universe.slug}`} key={universe.slug}>
              <img src={universe.heroImagePath} alt="" aria-hidden="true" />
              <span>{universe.metricHint}</span>
              <strong>{universe.name}</strong>
              <small>{universe.soundtrack ? `Soundtrack: ${universe.soundtrack.title}` : universe.focus}</small>
            </a>
          ))}
        </div>
        </section>
      </main>
    </>
  );
}
