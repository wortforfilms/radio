import { relationshipTaxonomy } from "@shared/taxonomy";
import { persistenceScopes } from "@shared/persistence-scopes";

export default function AdminPage() {
  return (
    <main className="page">
      <h1>Admin Panel</h1>
      <section className="card">
        <h2>PHKD Gate</h2>
        <p className="muted">Lineage edges fail closed unless a citation is present and the claim is explicitly verified.</p>
        <form className="toolbar" action="/api/search">
          <input name="q" placeholder="Search knowledge runtime" />
          <button type="submit">Search</button>
        </form>
      </section>
      <section className="card">
        <h2>.hkd Persistence Scopes</h2>
        <p className="muted">Every persistence scope exposes a fail-closed HKD export with citations, provenance, verification status, and NULLs preserved.</p>
        <div className="persistence-scope-grid">
          {persistenceScopes.map((scope) => (
            <a className="persistence-scope-card" href={`/api/export?format=hkd&scope=${scope.key}`} key={scope.key}>
              <span>.hkd</span>
              <strong>{scope.label}</strong>
              <small>{scope.key}</small>
            </a>
          ))}
        </div>
      </section>
      <h2>Relationship Taxonomy</h2>
      <div className="grid">
        {relationshipTaxonomy.map(([key, label, inverse]) => (
          <section className="card" key={key}>
            <strong>{label}</strong>
            <p className="muted">{key} / inverse: {inverse ?? "NULL"}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
