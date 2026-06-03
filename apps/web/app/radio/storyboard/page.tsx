import { radioStoryboardSequences, radioStoryboardSummary } from "@shared/radio-storyboard";

export const metadata = {
  title: "Radio Vaigyaaniq Storyboard"
};

export default function RadioStoryboardPage() {
  return (
    <main className="radio-storyboard-shell">
      <section className="radio-storyboard-hero">
        <div>
          <p className="eyebrow">Radio Vaigyaaniq</p>
          <h1>Full Storyboard</h1>
          <p>
            End-to-end shot plan for the redesigned Radio app, live runtime, Three.js visualizer,
            synchronized lyrics scribe, TTS announcements, gift flow, project intake, archive, and HKD export.
          </p>
          <div className="radio-app-actions">
            <a href="/radio">Radio App</a>
            <a href="/radio/runtime">Live Runtime</a>
            <a href="/radio/frame">Three Frame</a>
          </div>
        </div>
        <div className="radio-storyboard-summary">
          <span>Sequences<b>{radioStoryboardSummary.sequences}</b></span>
          <span>Shots<b>{radioStoryboardSummary.shots}</b></span>
          <span>Implemented<b>{radioStoryboardSummary.implemented}</b></span>
          <span>Draft<b>{radioStoryboardSummary.draft}</b></span>
        </div>
      </section>

      <section className="radio-storyboard-map">
        {radioStoryboardSequences.map((sequence, sequenceIndex) => (
          <a href={`#${sequence.key}`} key={sequence.key}>
            <span>{String(sequenceIndex + 1).padStart(2, "0")}</span>
            <b>{sequence.title}</b>
            <small>{sequence.shots.length} shots · {sequence.route}</small>
          </a>
        ))}
      </section>

      {radioStoryboardSequences.map((sequence, sequenceIndex) => (
        <section className="radio-storyboard-sequence" id={sequence.key} key={sequence.key}>
          <div className="radio-storyboard-sequence-head">
            <div>
              <p className="section-kicker">Sequence {String(sequenceIndex + 1).padStart(2, "0")}</p>
              <h2>{sequence.title}</h2>
              <p>{sequence.summary}</p>
            </div>
            <a href={sequence.route}>Open Surface</a>
          </div>

          <div className="radio-storyboard-shot-grid">
            {sequence.shots.map((shot) => (
              <article className="radio-storyboard-shot" key={shot.id}>
                <header>
                  <span>{shot.id}</span>
                  <b>{shot.status}</b>
                </header>
                <h3>{shot.title}</h3>
                <p>{shot.userIntent}</p>
                <dl>
                  <div><dt>Surface</dt><dd>{shot.surface}</dd></div>
                  <div><dt>Route</dt><dd>{shot.route}</dd></div>
                  <div><dt>Motion</dt><dd>{shot.motion}</dd></div>
                  <div><dt>Data</dt><dd>{shot.dataState}</dd></div>
                  <div><dt>PHKD</dt><dd>{shot.phkdGuardrail}</dd></div>
                  <div><dt>Next</dt><dd>{shot.nextAction}</dd></div>
                </dl>
                <div className="radio-storyboard-ui-list">
                  {shot.primaryUi.map((ui) => <span key={ui}>{ui}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
