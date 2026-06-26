import { deviceRuntimeTopology } from "@shared/device-runtime";

export const metadata = {
  title: "Device Topology | Radio Vaigyaaniq"
};

export default function DeviceTopologyPage() {
  return (
    <main className="governance-shell">
      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Device Topology</p>
            <h2>Runtime graph nodes</h2>
            <p>Device Runtime is registered as a graph node connected to dashboard, radio runtime, desktop, and evidence registry surfaces.</p>
          </div>
          <a href="/api/device?view=topology">Topology API</a>
        </div>
        <div className="governance-gate-list">
          {deviceRuntimeTopology.nodes.map((node) => (
            <article className={node.status === "blocked" ? "blocked" : ""} key={node.id}>
              <span>{node.type} · {node.status}</span>
              <strong>{node.label}</strong>
              <p>{node.route ?? "route NULL"}</p>
              <small>{node.evidence ?? "evidence NULL"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Edges</p>
            <h2>Runtime relationships</h2>
          </div>
        </div>
        <div className="governance-policy-table">
          {deviceRuntimeTopology.edges.map((edge) => (
            <article key={`${edge.from}-${edge.relation}-${edge.to}`}>
              <div>
                <span>{edge.status}</span>
                <strong>{edge.relation}</strong>
              </div>
              <p>{edge.from} {"->"} {edge.to}</p>
              <small>PHKD: no device telemetry claim is promoted by this edge.</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
