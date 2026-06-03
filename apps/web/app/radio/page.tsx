export const metadata = {
  title: "Radio Vaigyaaniq"
};

export default function RadioPage() {
  const pillars = [
    ["Live Runtime", "Launch the absorbed React dashboard with station switching, announcements, social actions, synchronized lyric scribing, and Three.js visualizers."],
    ["Sovereign Audio", "Mic input, file playback, cinematic shader scenes, physics-inspired motion, shadows, lighting, and export-ready visual capture pathways."],
    ["PHKD Guardrails", "Every claim, transcript, lyric cue, gift action, and generated artifact remains draft until provenance and verification evidence exist."],
    ["Creative Pipeline", "Move from devotional concept to audio, synchronized lyrics, Ayodhya AI project intake, media evidence, and HKD export surfaces."]
  ];

  const workflows = [
    "Tune station",
    "Speak announcement",
    "Visualize audio",
    "Scribe synced lyrics",
    "Gift or save locally",
    "Export HKD evidence"
  ];

  return (
    <main className="radio-landing-shell">
      <section className="radio-landing-hero">
        <img src="/radio-html/assets/radio-vaigyaaniq-landing-hero.png" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Radio Vaigyaaniq</p>
          <h1>Discover the Science, Tune into the Future.</h1>
          <p>
            A sacred-science radio surface for live listening, cinematic audio visualization,
            persona announcements, synchronized lyric scribing, and provenance-first media workflows.
          </p>
          <div className="hero-actions">
            <a href="/radio/runtime">Open Live Runtime</a>
            <a href="/radio/frame">Absorbed Three Frame</a>
            <a href="/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html">HTML Prototype</a>
            <a href="/projects/new">Create Ayodhya Project</a>
            <a href="/sprints">Sprint Matrix</a>
          </div>
        </div>
      </section>

      <section className="radio-landing-band">
        <div>
          <p className="section-kicker">Runtime Modules</p>
          <h2>Built for broadcast, not brochure.</h2>
          <p>
            The landing page introduces the system; the runtime handles the work.
            No generated audio, payment, lyric sync, or production claim is marked verified without evidence.
          </p>
        </div>
        <div className="radio-landing-pillar-grid">
          {pillars.map(([title, body]) => (
            <article className="radio-landing-pillar" key={title}>
              <span>{title}</span>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="radio-landing-feature-nav" aria-label="Radio feature anchors">
        <a href="/radio/runtime#radioVisualizer"><b>3D</b><span>Visualizer</span></a>
        <a href="/radio/runtime#radioLyricsScribe"><b>LRC</b><span>Lyrics Scribe</span></a>
        <a href="/radio/runtime#radioSamaya"><b>TTS</b><span>Persona announcements</span></a>
        <a href="/projects/new"><b>AI</b><span>Ayodhya intake</span></a>
        <a href="/api/export?format=hkd&scope=media-universe"><b>HKD</b><span>Media export</span></a>
      </section>

      <section className="radio-landing-workflow">
        <div>
          <p className="section-kicker">Operator Flow</p>
          <h2>From signal to evidence.</h2>
        </div>
        <ol>
          {workflows.map((workflow) => (
            <li key={workflow}>{workflow}</li>
          ))}
        </ol>
      </section>

      <section className="radio-landing-proof">
        <div>
          <p className="section-kicker">Evidence State</p>
          <h2>PHKD fail-closed by design.</h2>
          <p>
            Local browser actions are useful drafts. Runtime exports preserve provenance,
            unknowns remain NULL, and verification is never inferred from presentation quality.
          </p>
        </div>
        <a href="/scopes/media-universe">Open Media Scope</a>
      </section>
    </main>
  );
}
