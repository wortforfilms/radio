import { notFound } from "next/navigation";
import { getUniverseBySlug, universeRegistry } from "@shared/universes";
import { getPersistenceScope, getPersistenceScopeLanding } from "@shared/persistence-scopes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return universeRegistry.map((universe) => ({ slug: universe.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const universe = getUniverseBySlug(slug);
  return {
    title: universe ? `${universe.name} | Vaishviq Knowledge Runtime` : "Universe"
  };
}

export default async function UniverseLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const universe = getUniverseBySlug(slug);
  if (!universe) notFound();
  const persistenceScope = getPersistenceScope(universe.slug) ?? getPersistenceScope("all");
  const landing = persistenceScope ? getPersistenceScopeLanding(persistenceScope) : null;

  return (
    <>
      <section className={`universe-hero tone-${universe.tone}`}>
        <img className="universe-hero-image" src={universe.heroImagePath} alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Vaishviq Runtime</p>
          <h1>{universe.name}</h1>
          <p>{universe.focus}</p>
          <div className="hero-actions">
            <a href={universe.primaryPath}>Open Runtime Surface</a>
            <a href="/universes">All Universes</a>
          </div>
          {universe.soundtrack ? (
            <div className="soundtrack-panel">
              <span>Related Soundtrack</span>
              <strong>{universe.soundtrack.title}</strong>
              <audio controls preload="none" src={universe.soundtrack.path}>
                <a href={universe.soundtrack.path}>Open soundtrack</a>
              </audio>
            </div>
          ) : null}
        </div>
      </section>
      <main className="page universe-detail">
        <section className="landing-section">
          <h2>Persistence Scope</h2>
          <p>
            This universe is persisted through shared nodes, typed relationships, provenance notes,
            verification status, audit logs, and import/export pathways.
          </p>
          <div className="hkd-scope-banner">
            <div>
              <span>.hkd</span>
              <strong>{persistenceScope?.label ?? universe.name}</strong>
              <p>{persistenceScope?.description ?? universe.focus}</p>
            </div>
            <div className="hkd-scope-actions">
              <a href={`/api/export?format=hkd&scope=${universe.slug}`}>Export .hkd</a>
              <a href={`/api/export?format=json&scope=${universe.slug}`}>JSON</a>
              <a href={`/api/export?format=markdown&scope=${universe.slug}`}>Markdown</a>
            </div>
          </div>
        </section>
        {landing ? (
          <>
            <section className="landing-section">
              <div className="reference-feed-head">
                <div>
                  <p className="section-kicker">Features</p>
                  <h2>What This Scope Supports</h2>
                </div>
              </div>
              <div className="landing-card-grid">
                {landing.features.map((feature) => (
                  <article className="landing-card" key={feature}>
                    <span>Feature</span>
                    <p>{feature}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="landing-section">
              <div className="reference-feed-head">
                <div>
                  <p className="section-kicker">USPs</p>
                  <h2>Why It Matters</h2>
                </div>
              </div>
              <div className="landing-card-grid">
                {landing.usps.map((usp) => (
                  <article className="landing-card landing-card-strong" key={usp}>
                    <span>USP</span>
                    <p>{usp}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="hkd-detail-section">
              <div>
                <p className="section-kicker">HKD Section</p>
                <h2>{landing.hkdSection.title}</h2>
                <p>{landing.hkdSection.description}</p>
              </div>
              <div className="hkd-scope-actions">
                <a href={landing.hkdSection.exportPath}>Export .hkd</a>
                <a href={landing.hkdSection.jsonPath}>JSON</a>
                <a href={landing.hkdSection.markdownPath}>Markdown</a>
              </div>
            </section>
          </>
        ) : null}
        <section className="landing-section">
          <h2>Explorer Modes</h2>
          <div className="grid">
            <a className="card" href="/api/knowledge-graph">Node explorer</a>
            <a className="card" href="/lineage">Lineage explorer</a>
            <a className="card" href="/api/timeline">Timeline explorer</a>
            <a className="card" href="/api/search">Search index</a>
            <a className="card" href="/scopes">All persistence scopes</a>
          </div>
        </section>
      </main>
    </>
  );
}
