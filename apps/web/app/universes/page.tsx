import { universeRegistry } from "@shared/universes";
import { universeSkeletons } from "@shared/universe-skeletons";

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
        <section className="landing-section universe-skeleton-index">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Unique Skeletons</p>
              <h2>All Universe Blueprints</h2>
            </div>
          </div>
          <div className="skeleton-grid">
            {universeSkeletons.map((skeleton) => (
              <a className="skeleton-card" href={`/universes/${skeleton.slug}`} key={skeleton.slug}>
                <span>{skeleton.nodeTypes.length} node types · {skeleton.edgeTypes.length} edge types</span>
                <strong>{skeleton.title}</strong>
                <p>{skeleton.archetype}</p>
                <small>{skeleton.views.slice(0, 3).join(" · ")}</small>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
