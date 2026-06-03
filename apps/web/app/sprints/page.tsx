import { sprintCompletions, sprintCompletionSummary } from "@shared/sprint-completion";

export const metadata = {
  title: "Sprint Completion Matrix"
};

export default function SprintsPage() {
  const summary = sprintCompletionSummary();

  return (
    <main>
      <section className="dashboard-hero sprint-hero">
        <img src="/radio-html/assets/radio-vaigyaaniq-landing-hero.png" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Sprint Completion</p>
          <h1>All Sprint Scaffolds Wired in One Pass</h1>
          <p>
            A PHKD-safe delivery matrix for Radio, Ayodhya AI, lyrics, visualizers, universe skeletons,
            governance, and release hardening. Runtime wiring is complete; unverifiable production claims remain closed.
          </p>
          <div className="hero-actions">
            <a href="/radio">Radio Landing</a>
            <a href="/radio/runtime">Radio Runtime</a>
            <a href="/projects/new">Project Intake</a>
            <a href="/dashboard">Command Center</a>
          </div>
        </div>
      </section>
      <section className="page sprint-page">
        <div className="sprint-summary-grid">
          <article><span>Total</span><b>{summary.total}</b></article>
          <article><span>Runtime wired</span><b>{summary.runtimeWired}</b></article>
          <article><span>Completed scaffolds</span><b>{summary.completedScaffold}</b></article>
          <article><span>Evidence pending</span><b>{summary.evidencePending}</b></article>
        </div>

        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Completion Matrix</p>
              <h2>Next sprints closed as implementation surfaces</h2>
            </div>
            <span>PHKD fail-closed</span>
          </div>
          <div className="sprint-grid">
            {sprintCompletions.map((sprint) => (
              <article className="sprint-card" key={sprint.key}>
                <span>{sprint.status.replaceAll("_", " ")}</span>
                <h3>{sprint.title}</h3>
                <p>{sprint.outcome}</p>
                <div className="sprint-link-list">
                  {sprint.surfaces.map((surface) => (
                    surface.startsWith("/") ? <a href={surface} key={surface}>{surface}</a> : <small key={surface}>{surface}</small>
                  ))}
                </div>
                <dl>
                  <div><dt>Evidence</dt><dd>{sprint.evidenceState}</dd></div>
                  <div><dt>Hardening</dt><dd>{sprint.nextHardening}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
