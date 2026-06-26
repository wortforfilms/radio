import {
  deviceRuntimeDashboardCard,
  deviceRuntimeEvidenceArtifacts,
  deviceRuntimePhkd,
  deviceRuntimeRoutes,
  deviceRuntimeTopology
} from "@shared/device-runtime";

export const metadata = {
  title: "Device Runtime | Radio Vaigyaaniq"
};

export default function DeviceRuntimePage() {
  const blockedNodes = deviceRuntimeTopology.nodes.filter((node) => node.status === "blocked").length;

  return (
    <main className="governance-shell">
      <section className="governance-hero">
        <img src="/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg" alt="" aria-hidden="true" />
        <div>
          <p className="eyebrow">Device Runtime</p>
          <h1>Device Runtime Control</h1>
          <p>
            Browser, desktop, sensor, permission, and telemetry lanes are registered as draft device surfaces.
            Hardware claims remain blocked until real device proof is imported.
          </p>
          <div className="hero-actions">
            <a href="/device/runtime">Runtime Console</a>
            <a href="/device/topology">Topology</a>
            <a href="/device/evidence">Evidence</a>
            <a href="/api/device">Device API</a>
          </div>
        </div>
        <aside>
          <span>Release Allowed</span>
          <b>{String(deviceRuntimePhkd.releaseAllowed).toUpperCase()}</b>
          <small>{deviceRuntimeDashboardCard.status} · blocked nodes {blockedNodes}</small>
        </aside>
      </section>

      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Registered Routes</p>
            <h2>/device/* surfaces</h2>
          </div>
          <a href="/api/device?view=routes">Routes API</a>
        </div>
        <div className="governance-lane-grid">
          {deviceRuntimeRoutes.map((route) => (
            <article className={route.status === "blocked" ? "governance-lane-card blocked" : "governance-lane-card"} key={route.key}>
              <span>{route.status}</span>
              <h3>{route.title}</h3>
              <p>{route.purpose}</p>
              <div className="governance-lane-actions">
                <a href={route.path}>Open Route</a>
                <a href={route.api}>Open API</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Evidence Registration</p>
            <h2>Device proof artifacts</h2>
            <p>{deviceRuntimePhkd.note}</p>
          </div>
          <a href="/api/device?view=evidence">Evidence API</a>
        </div>
        <div className="governance-gate-list">
          {deviceRuntimeEvidenceArtifacts.map((artifact) => (
            <article className={artifact.status === "blocked" ? "blocked" : ""} key={artifact.key}>
              <span>{artifact.status}</span>
              <strong>{artifact.title}</strong>
              <p>{artifact.verificationState}</p>
              <small>{artifact.requiredEvidence.join(" · ")}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
