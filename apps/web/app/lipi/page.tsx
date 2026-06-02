import {
  lipiCivilizationMatrix,
  lipiExamplePath,
  lipiExplorerPages,
  lipiKnowledgeGraphChain,
  lipiPhkdRule
} from "@shared/lipi-civilization-matrix";

export default function LipiPage() {
  return (
    <main>
      <section className="lipi-hero">
        <div>
          <p className="eyebrow">Lipi Knowledge Graph</p>
          <h1>Civilization to Script Matrix</h1>
          <p>
            A PHKD-safe graph for civilizations, religions, languages, scripts, literature, inscriptions, glyphs, IPA, and sound. Associations are preserved without claiming that a religion owns a script.
          </p>
          <div className="ayodhya-actions">
            <a href="/api/lipi">API Matrix</a>
            <a href="/lipi/evidence">Evidence Center</a>
            <a href="/lineage">Lineage</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          <span>Civilizations<b>{lipiCivilizationMatrix.length}</b></span>
          <span>Explorers<b>{lipiExplorerPages.length}</b></span>
          <span>PHKD<b>Association</b></span>
          <span>Claims<b>Fail Closed</b></span>
        </div>
      </section>

      <section className="page lipi-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">PHKD Rule</p>
            <h2>Association Model</h2>
          </div>
          <span>no ownership inference</span>
        </div>
        <div className="lipi-rule-grid">
          <article>
            <span>Use</span>
            <strong>{lipiPhkdRule.model}</strong>
          </article>
          <article>
            <span>Reject</span>
            <strong>{lipiPhkdRule.rejectedModel}</strong>
          </article>
        </div>
      </section>

      <section className="page lipi-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Explorers</p>
            <h2>Lipi Pages</h2>
          </div>
          <span>{lipiExplorerPages.length} pages</span>
        </div>
        <div className="lipi-explorer-grid">
          {lipiExplorerPages.map((page) => (
            <a className="lipi-card" href={page.path} key={page.key}>
              <span>{page.key}</span>
              <strong>{page.name}</strong>
              <p>{page.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="page lipi-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Knowledge Chain</p>
            <h2>Graph Path</h2>
          </div>
          <span>{lipiKnowledgeGraphChain.length} nodes</span>
        </div>
        <div className="lipi-chain">
          {lipiKnowledgeGraphChain.map((node) => (
            <span key={node}>{node}</span>
          ))}
        </div>
        <div className="lipi-example">
          <span>{lipiExamplePath.civilization}</span>
          <span>{lipiExamplePath.language}</span>
          <span>{lipiExamplePath.script}</span>
          <span>{lipiExamplePath.glyph}</span>
          <span>{lipiExamplePath.ipa}</span>
        </div>
      </section>

      <section className="page lipi-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Matrix</p>
            <h2>Civilization Script Records</h2>
          </div>
          <span>{lipiCivilizationMatrix.length} records</span>
        </div>
        <div className="lipi-matrix-grid">
          {lipiCivilizationMatrix.map((entry) => (
            <article className="lipi-card" key={entry.key}>
              <span>{entry.status}</span>
              <strong>{entry.name}</strong>
              <p>{entry.hkdUri}</p>
              <dl>
                <div><dt>Scripts</dt><dd>{entry.scripts.join(", ") || "NULL"}</dd></div>
                <div><dt>Texts</dt><dd>{entry.texts.join(", ") || "NULL"}</dd></div>
                <div><dt>PHKD</dt><dd>{entry.phkdNote}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
