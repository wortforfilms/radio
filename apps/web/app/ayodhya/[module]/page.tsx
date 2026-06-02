import { ayodhyaModules } from "@shared/ayodhya-modules";
import AyodhyaHeader from "../../_components/AyodhyaHeader";

export function generateStaticParams() {
  return ayodhyaModules.map((module) => ({ module: module.key }));
}

export default async function AyodhyaModulePage({
  params
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleKey } = await params;
  const module = ayodhyaModules.find((item) => item.key === moduleKey);

  if (!module) {
    return (
      <main className="ayodhya-shell">
        <AyodhyaHeader />
        <section className="page">
          <h1>Module not found</h1>
          <p className="reference-feed-note">Unknown Ayodhya AI module. Return to the module index.</p>
          <a href="/ayodhya">Open Ayodhya AI</a>
        </section>
      </main>
    );
  }

  return (
    <main className="ayodhya-shell">
      <AyodhyaHeader />
      <section className="ayodhya-module-hero">
        <div>
          <p className="eyebrow">{module.icon}</p>
          <h1>{module.name}</h1>
          <p>{module.description}</p>
        </div>
        <div className="ayodhya-metrics">
          <span>Status<b>Preview</b></span>
          <span>PHKD<b>On</b></span>
          <span>Claims<b>Closed</b></span>
        </div>
      </section>
      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Module Operations</p>
            <h2>{module.name}</h2>
          </div>
          <a href="/projects/new">New Project</a>
        </div>
        <p className="reference-feed-note">
          This module is wired as an intake and planning surface. Generated outputs, model runs, renders, and evidence records must be persisted before they are treated as completed work.
        </p>
        <div className="ayodhya-operation-grid">
          {module.actions.map((action) => (
            <article className="ayodhya-operation-card" key={action}>
              <span>{action}</span>
              <strong>{action} Workspace</strong>
              <p>Prepare inputs, attach sources, and preserve provenance before promotion.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
