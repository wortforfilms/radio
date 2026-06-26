import { deviceRuntimePhkd, deviceRuntimeRoutes, deviceRuntimeTopology } from "@shared/device-runtime";

export const metadata = {
  title: "Device Runtime Console | Radio Vaigyaaniq"
};

const capabilityLanes = [
  ["Audio input", "Microphone permission, device label, and capture hash are NULL until browser proof is imported."],
  ["Audio output", "Speaker routing and playback device proof are NULL until a reviewed run exists."],
  ["Display capture", "Screen capture permission and recording evidence are NULL until operator proof exists."],
  ["Desktop shell", "Tauri device bridge remains blocked until signed desktop proof and reviewer evidence exist."],
  ["Sensor bridge", "MIDI, serial, bluetooth, gamepad, and HID lanes are blocked unless explicit permission evidence exists."],
  ["Telemetry export", "Telemetry can only export hashed local evidence frames; no live external telemetry is claimed."]
];

export default function DeviceRuntimeConsolePage() {
  return (
    <main className="governance-shell">
      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Device Runtime Console</p>
            <h2>Capability probes fail closed</h2>
            <p>{deviceRuntimePhkd.note}</p>
          </div>
          <a href="/device">Device Home</a>
        </div>
        <div className="governance-metrics">
          <article><span>Routes</span><b>{deviceRuntimeRoutes.length}</b></article>
          <article><span>Topology Nodes</span><b>{deviceRuntimeTopology.nodes.length}</b></article>
          <article><span>Release Allowed</span><b>{String(deviceRuntimePhkd.releaseAllowed)}</b></article>
          <article><span>Production Ready</span><b>{String(deviceRuntimePhkd.productionReady)}</b></article>
        </div>
      </section>

      <section className="governance-section">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Capability Lanes</p>
            <h2>Local device surfaces</h2>
          </div>
          <a href="/api/device?view=runtime">Runtime API</a>
        </div>
        <div className="governance-lane-grid">
          {capabilityLanes.map(([title, body]) => (
            <article className="governance-lane-card blocked" key={title}>
              <span>blocked</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
