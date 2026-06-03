import { ayodhyaWireframeBoardExtraction, extractedWireframeTotals, radioImageHtmlExtraction } from "@shared/extracted-wireframes";
import { WireframeThreeConstellation } from "../components/wireframes/WireframeThreeConstellation";

export const metadata = {
  title: "Extracted Wireframes"
};

export default function WireframesPage() {
  return (
    <main>
      <section className="dashboard-hero wireframe-hero">
        <img src="/radio-html/assets/radio-vaigyaaniq-landing-hero.png" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Extracted UX Architecture</p>
          <h1>Types, Frames, Data Frames, Layouts</h1>
          <p>
            Structured extraction from the supplied Radio Vaigyaaniq image-to-HTML prototype
            and Ayodhya AI unique wireframe board. These are design-system scaffolds, not production evidence claims.
          </p>
          <div className="hero-actions">
            <a href="/radio/frame">Radio Three Frame</a>
            <a href="/radio/runtime">Radio Runtime</a>
            <a href="/ayodhya">Ayodhya AI</a>
            <a href="/sprints">Sprint Matrix</a>
          </div>
        </div>
      </section>

      <section className="page wireframe-page">
        <WireframeThreeConstellation />

        <div className="wireframe-summary-grid">
          <article><span>Radio Frames</span><b>{extractedWireframeTotals.radioFrames}</b></article>
          <article><span>Data Frames</span><b>{extractedWireframeTotals.radioDataFrames}</b></article>
          <article><span>Layouts</span><b>{extractedWireframeTotals.radioLayouts}</b></article>
          <article><span>Ayodhya Wireframes</span><b>{extractedWireframeTotals.ayodhyaWireframes}</b></article>
          <article><span>Groups</span><b>{extractedWireframeTotals.ayodhyaGroups}</b></article>
        </div>

        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Radio Extraction</p>
              <h2>{radioImageHtmlExtraction.title}</h2>
            </div>
            <span>{radioImageHtmlExtraction.verificationStatus}</span>
          </div>
          <p className="reference-feed-note">{radioImageHtmlExtraction.provenance}</p>

          <div className="wireframe-chip-grid">
            {radioImageHtmlExtraction.typeSystem.map((type) => <span key={type}>{type}</span>)}
          </div>

          <div className="wireframe-grid">
            {radioImageHtmlExtraction.frames.map((frame) => (
              <article className="wireframe-card" key={frame.key}>
                <span>{frame.type}</span>
                <h3>{frame.label}</h3>
                <p>{frame.purpose}</p>
                <small>{frame.selectors.join(" · ")}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Data Frames</p>
              <h2>Extracted data structures</h2>
            </div>
            <span>{radioImageHtmlExtraction.counts.generatedSpectrumBars} spectrum bars</span>
          </div>
          <div className="wireframe-grid">
            {radioImageHtmlExtraction.dataFrames.map((frame) => (
              <article className="wireframe-card" key={frame.key}>
                <span>{frame.label}</span>
                <h3>{frame.fields.join(", ")}</h3>
                <p>{frame.source}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Layouts</p>
              <h2>Extracted layout rules</h2>
            </div>
          </div>
          <div className="wireframe-grid">
            {radioImageHtmlExtraction.layouts.map((layout) => (
              <article className="wireframe-card" key={layout.key}>
                <span>{layout.label}</span>
                <h3>{layout.structure}</h3>
                <p>{layout.responsiveRule}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Ayodhya Board</p>
              <h2>{ayodhyaWireframeBoardExtraction.title}</h2>
            </div>
            <span>{ayodhyaWireframeBoardExtraction.summary.uniqueWireframes} unique</span>
          </div>
          <p className="reference-feed-note">{ayodhyaWireframeBoardExtraction.provenance}</p>
          <div className="wireframe-board">
            {ayodhyaWireframeBoardExtraction.groups.map((group) => (
              <section className="wireframe-group" key={group.key}>
                <div>
                  <span>{group.items.length} frames</span>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="wireframe-mini-grid">
                  {group.items.map((item) => (
                    <article key={item.code}>
                      <b>{item.code}</b>
                      <span>{item.name}</span>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
