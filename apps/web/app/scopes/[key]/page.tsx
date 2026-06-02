import { notFound } from "next/navigation";
import { getPersistenceScope, getPersistenceScopeLanding, persistenceScopes } from "@shared/persistence-scopes";

type PageProps = {
  params: Promise<{ key: string }>;
};

export function generateStaticParams() {
  return persistenceScopes.map((scope) => ({ key: scope.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { key } = await params;
  const scope = getPersistenceScope(key);
  return {
    title: scope ? `${scope.label} Scope | Vaishviq Knowledge Runtime` : "Persistence Scope"
  };
}

export default async function PersistenceScopeLandingPage({ params }: PageProps) {
  const { key } = await params;
  const scope = getPersistenceScope(key);
  if (!scope) notFound();
  const landing = getPersistenceScopeLanding(scope);

  return (
    <>
      <section className="dashboard-hero scope-hero">
        <img src={heroFor(scope.key)} alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Persistence Scope</p>
          <h1>{scope.label}</h1>
          <p>{scope.description}</p>
          <div className="hero-actions">
            <a href={landing.hkdSection.exportPath}>Export .hkd</a>
            <a href="/scopes">All scopes</a>
          </div>
        </div>
      </section>
      <main className="page universe-detail">
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
      </main>
    </>
  );
}

function heroFor(key: string) {
  if (key.includes("rishika")) return "/universe-heroes/rishika-universe.svg";
  if (key.includes("rishi")) return "/universe-heroes/rishi-universe.svg";
  if (key.includes("civilization")) return "/universe-heroes/civilization-universe.svg";
  if (key.includes("subject")) return "/universe-heroes/subject-universe.svg";
  if (key.includes("text") || key.includes("dictionary")) return "/universe-heroes/text-universe.svg";
  if (key.includes("timeline")) return "/universe-heroes/timeline-universe.svg";
  if (key.includes("research")) return "/universe-heroes/research-universe.svg";
  if (key.includes("education") || key.includes("course")) return "/universe-heroes/education-universe.svg";
  if (key.includes("media")) return "/universe-heroes/media-universe.svg";
  if (key.includes("governance") || key.includes("audit")) return "/universe-heroes/governance-universe.svg";
  if (key.includes("graph") || key === "all") return "/universe-heroes/knowledge-graph-universe.svg";
  return "/universe-heroes/universal-command-center.svg";
}
