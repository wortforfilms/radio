import { deviceRuntimeEvidenceArtifacts, deviceRuntimePhkd, productSurfaceMatrixEntries } from "@shared/device-runtime";

export const metadata = {
  title: "Device Evidence | Radio Vaigyaaniq"
};

export default function DeviceEvidencePage() {
  return (
    <main className="governance-shell">
      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Device Evidence</p>
            <h2>Proof registry</h2>
            <p>{deviceRuntimePhkd.note}</p>
          </div>
          <a href="/radio-html/data/device-runtime-evidence.json">Evidence JSON</a>
        </div>
        <div className="governance-lane-grid">
          {deviceRuntimeEvidenceArtifacts.map((artifact) => (
            <article className={artifact.status === "blocked" ? "governance-lane-card blocked" : "governance-lane-card"} key={artifact.key}>
              <span>{artifact.status}</span>
              <h3>{artifact.title}</h3>
              <p>{artifact.verificationState}</p>
              <small>{artifact.requiredEvidence.join(" · ")}</small>
              <div className="governance-lane-actions">
                <a href={artifact.path}>Open Artifact</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Product Surface Matrix</p>
            <h2>Device Runtime entries</h2>
          </div>
          <a href="/radio-html/data/product-surface-matrix.json">Matrix JSON</a>
        </div>
        <div className="governance-gate-list">
          {productSurfaceMatrixEntries.map((entry) => (
            <article key={`${entry.product}-${entry.surface}`}>
              <span>{entry.status}</span>
              <strong>{entry.surface}</strong>
              <p>{entry.route} · {entry.api}</p>
              <small>releaseAllowed: {String(entry.releaseAllowed)}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
