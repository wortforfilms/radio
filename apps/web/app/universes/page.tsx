import { universeRegistry } from "@shared/universes";

export default function UniversesPage() {
  return (
    <>
      <section className="universe-hero tone-emerald">
        <img className="universe-hero-image" src="/universe-heroes/universal-knowledge-lineage-explorer.svg" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Runtime Universes</p>
          <h1>All Knowledge Universes</h1>
          <p>Every preserved structure now has its own landing surface with a hero banner and direct runtime entry point.</p>
        </div>
      </section>
      <main className="page">
        <div className="universe-grid">
          {universeRegistry.map((universe) => (
            <a className={`universe-card tone-${universe.tone}`} href={`/universes/${universe.slug}`} key={universe.slug}>
              <span>{universe.metricHint}</span>
              <strong>{universe.name}</strong>
              <small>{universe.soundtrack ? `Soundtrack: ${universe.soundtrack.title}` : universe.focus}</small>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
