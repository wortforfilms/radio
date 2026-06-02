import { persistenceScopes } from "@shared/persistence-scopes";

export default function PersistenceScopesPage() {
  return (
    <>
      <section className="dashboard-hero scope-hero">
        <img src="/universe-heroes/governance-universe.svg" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Persistence Scopes</p>
          <h1>All Runtime Archives</h1>
          <p>Every scope has a landing page, feature set, USP set, and fail-closed HKD export pathway.</p>
          <div className="hero-actions">
            <a href="/api/export?format=hkd&scope=all">Download all.hkd</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
      </section>
      <main className="page">
        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Scope Registry</p>
              <h2>Persistence Scope Landing Pages</h2>
            </div>
          </div>
          <div className="scope-landing-grid">
            {persistenceScopes.map((scope) => (
              <a className="scope-landing-card" href={`/scopes/${scope.key}`} key={scope.key}>
                <span>{scope.model ?? "graph"}</span>
                <strong>{scope.label}</strong>
                <p>{scope.description}</p>
                <small>.hkd / JSON / Markdown</small>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
