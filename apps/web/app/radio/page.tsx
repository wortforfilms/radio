export const metadata = {
  title: "Radio Vaigyaaniq"
};

export default function RadioPage() {
  const navItems = [
    ["Live", "/radio/runtime"],
    ["Frame", "/radio/frame"],
    ["Storyboard", "/radio/storyboard"],
    ["Prototype", "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html"],
    ["Ayodhya", "/projects/new"],
    ["Evidence", "/scopes/media-universe"]
  ];

  const modules = [
    ["3D Visualizer", "Mic, files, cinematic shader scenes, lighting, shadows, particles, and WebM capture.", "/radio/runtime#radioVisualizer", "VIZ"],
    ["Synced Lyrics", "Draft LRC timing, Hindi lines, transcript import, HKD lyric evidence export.", "/radio/runtime#radioLyricsScribe", "LRC"],
    ["Persona TTS", "Maataa, Rishi, Samaya, and Vigyaaniq browser voices for announcements.", "/radio/runtime#radioSamaya", "TTS"],
    ["Gift Loop", "Like, save, gift intent, and project creation remain local until evidence exists.", "/radio/runtime", "ACT"],
    ["Storyboard", "Full shot plan for landing, runtime, visualizer, lyrics, TTS, gift, project, archive, and export.", "/radio/storyboard", "SB"],
    ["Full App HTML", "Standalone browser HTML with landing, runtime mock, visualizer, lyrics, storyboard, and PHKD states.", "/radio-html/Radio_Vaigyaaniq_Full_App.html", "APP"],
    ["All HTML Surfaces", "Dedicated browser pages for landing, runtime, visualizer, lyrics, TTS, social/gift, storyboard, evidence, and scaffold.", "/radio-html/surfaces/index.html", "SURF"],
    ["Runtimes + Workflows", "Runtime lane, workflow lane, event triggers, states, storage posture, and PHKD gates.", "/radio-html/surfaces/runtimes-workflows.html", "FLOW"],
    ["ASCII Wireframes", "Full application wireframes covering surfaces, routes, state, persistence, QA, and operator flow.", "/radio-html/surfaces/ascii-wireframes.html", "ASCII"],
    ["Future Structure", "Folder architecture, migration phases, compatibility rules, and structure manifest for future Radio growth.", "/radio-html/structure/index.html", "TREE"],
    ["Scaffold JSON", "Machine-readable routes, components, data contracts, events, storage, exports, QA gates, and PHKD boundaries.", "/radio-html/Radio_Vaigyaaniq_Full_App_Scaffold.json", "JSON"],
    ["HKD Export", "Media universe exports preserve provenance and NULL unknowns.", "/api/export?format=hkd&scope=media-universe", "HKD"],
    ["HTML Archive", "Original uploaded single-file dashboard remains inspectable.", "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html", "HTML"]
  ];

  const workflows = [
    ["01", "Tune", "Select station and track context"],
    ["02", "Announce", "Speak local persona message"],
    ["03", "Visualize", "Run Three.js audio scenes"],
    ["04", "Scribe", "Capture draft lyric timing"],
    ["05", "Package", "Create Ayodhya project intake"],
    ["06", "Export", "Ship HKD evidence bundle"]
  ];

  const evidence = [
    ["Audio source", "Draft until source and creator are verified"],
    ["Gift action", "Intent only; checkout and receipt evidence NULL"],
    ["Lyrics sync", "Local draft cues; not verified performance timing"],
    ["Generated media", "Presentation does not imply production readiness"]
  ];

  return (
    <main className="radio-landing-shell">
      <section className="radio-app-frame">
        <aside className="radio-app-rail" aria-label="Radio app navigation">
          <div className="radio-app-mark">RV</div>
          <nav>
            {navItems.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
          <span>PHKD</span>
        </aside>

        <section className="radio-app-stage">
          <header className="radio-app-topbar">
            <div>
              <p className="eyebrow">Radio Vaigyaaniq</p>
              <h1>Broadcast Command Surface</h1>
            </div>
            <div className="radio-app-status">
              <span>LOCAL</span>
              <b>DRAFT</b>
              <small>verification state</small>
            </div>
          </header>

          <section className="radio-app-hero">
            <img src="/radio-html/assets/radio-vaigyaaniq-landing-hero.png" alt="" aria-hidden="true" />
            <div className="radio-app-hero-copy">
              <span>102.5 MHz</span>
              <h2>Discover the Science, Tune into the Future.</h2>
              <p>
                Live listening, cinematic audio visualization, persona announcements, synchronized lyric scribing,
                and provenance-first media workflows in one operator layout.
              </p>
              <div className="radio-app-actions">
                <a href="/radio/runtime">Open Live Runtime</a>
                <a href="/radio/frame">Three Frame</a>
              </div>
            </div>
            <div className="radio-app-now">
              <small>Now Routed</small>
              <b>Radio Runtime</b>
              <span>Visualizer · TTS · Lyrics · Gift intent</span>
            </div>
          </section>

          <section className="radio-app-console">
            <div className="radio-app-tuner">
              <span>Quantum Resonance Tuner</span>
              <b>LIVE DRAFT</b>
              <div>
                {Array.from({ length: 28 }, (_, index) => (
                  <i style={{ height: 18 + Math.abs(Math.sin(index * 0.46)) * 72 }} key={index} />
                ))}
              </div>
            </div>

            <div className="radio-app-samaya">
              <span>Hemant Samwat Samaya</span>
              <h2>Muhurat · Utsav · Divas</h2>
              <p>Announcement and vishaya vaachan are computed as local draft states until evidence is attached.</p>
            </div>

            <div className="radio-app-proof">
              <span>Fail Closed</span>
              <b>No fabricated audio, citations, checkout, or verification claims.</b>
              <a href="/scopes/media-universe">Open Media Scope</a>
            </div>
          </section>
        </section>
      </section>

      <section className="radio-landing-band radio-landing-band-redesigned">
        <div>
          <p className="section-kicker">Runtime Modules</p>
          <h2>Modules arranged for repeated operation.</h2>
          <p>
            The redesigned layout keeps the app's important surfaces one click away:
            runtime, absorbed Three.js frame, original HTML, project intake, and HKD evidence export.
          </p>
        </div>
        <div className="radio-landing-module-grid">
          {modules.map(([title, body, href, code]) => (
            <a className="radio-landing-module" href={href} key={title}>
              <span>{code}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="radio-landing-workflow">
        <div>
          <p className="section-kicker">Operator Flow</p>
          <h2>From signal to evidence.</h2>
        </div>
        <ol>
          {workflows.map(([step, title, body]) => (
            <li key={step}>
              <span>{step}</span>
              <b>{title}</b>
              <small>{body}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="radio-landing-proof">
        <div>
          <p className="section-kicker">Evidence State</p>
          <h2>PHKD fail-closed by design.</h2>
          <div className="radio-landing-evidence-grid">
            {evidence.map(([title, body]) => (
              <article key={title}>
                <span>{title}</span>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
        <a href="/scopes/media-universe">Open Media Scope</a>
      </section>
    </main>
  );
}
