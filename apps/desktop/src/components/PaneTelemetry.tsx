// Pane C — Telemetry & System Infrastructure. Every readout is REAL or NULL:
// - tuner: interactive dial, honest "no licence — candidate display" label
// - node health: NULL until real monitoring exists (target shown as target only)
// - offline cache: actual Cache Storage API counts + offline manifest numbers
// - licence tracker: the actual roadmap gate state (community licence planned)
import React, { useEffect, useState } from "react";
import { FM_MAX, FM_MIN, useFrequency } from "../hooks/use-frequency";
import { offlineCacheStatus, type EngineManifest } from "../lib/manifest";

export function PaneTelemetry(props: { manifest: EngineManifest | null; onTuneStation: (slug: string) => void }) {
  const slugs = (props.manifest?.stations ?? []).map((station) => station.slug);
  const { frequencyMHz, stationSlug, tune, needleDeg } = useFrequency(slugs);
  const [cache, setCache] = useState<Awaited<ReturnType<typeof offlineCacheStatus>> | null>(null);

  useEffect(() => {
    void offlineCacheStatus().then(setCache);
  }, []);

  useEffect(() => {
    if (stationSlug) props.onTuneStation(stationSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationSlug]);

  const onDial = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    let deg = (Math.atan2(x, -y) * 180) / Math.PI; // -180..180, 0 = up
    deg = Math.max(-135, Math.min(135, deg));
    tune(FM_MIN + ((deg + 135) / 270) * (FM_MAX - FM_MIN));
  };

  const offlineReady = cache?.manifest ? cache.manifest.local === cache.manifest.requested : null;

  return (
    <aside className="pane pane-c">
      <section className="card tuner yantra">
        <h2>Quantum Resonance Tuner</h2>
        <div className="tuner-dial" onClick={onDial} role="slider" aria-label="Frequency dial"
          aria-valuemin={FM_MIN} aria-valuemax={FM_MAX} aria-valuenow={frequencyMHz}>
          <i className="tuner-needle" style={{ transform: `rotate(${needleDeg}deg)` }} />
        </div>
        <div className="tuner-freq">{frequencyMHz.toFixed(1)} MHz</div>
        <p className="muted" style={{ margin: 0, textAlign: "center", fontSize: 10.5 }}>
          Candidate display only — no broadcast licence exists. Dial maps to the {slugs.length} local catalogue lanes.
        </p>
      </section>

      <section className="card">
        <h2>Node Health</h2>
        <p className="mono" style={{ margin: "0 0 6px" }}>
          uptime: <span className="muted">NULL — no monitoring wired</span>
        </p>
        <div className="meter"><i style={{ width: "0%" }} /></div>
        <p className="muted" style={{ fontSize: 10.5, marginBottom: 0 }}>Target 99.8% becomes a live meter once real probes exist; never simulated.</p>
      </section>

      <section className="card">
        <h2>Offline Cache · Runtime</h2>
        <p className="mono" style={{ margin: 0 }}>
          service caches: {cache ? cache.caches : "…"} · entries: {cache?.entries ?? "n/a (Tauri webview)"}
        </p>
        <p className="mono" style={{ margin: "4px 0" }}>
          bundle: {cache?.manifest ? `${cache.manifest.local}/${cache.manifest.requested} local` : "…"}{" "}
          {offlineReady !== null && (
            <span className={`chip ${offlineReady ? "green" : "red"}`}>{offlineReady ? "OFFLINE-READY" : "GAPS"}</span>
          )}
        </p>
        <p className="muted" style={{ fontSize: 10.5, marginBottom: 0 }}>
          MSAR runtime label applies when the storage-separation policy audit passes (see docs/runbooks/RADIO_MEDIA_STORAGE.md) — status here reflects the real offline manifest, not an asserted banner.
        </p>
      </section>

      <section className="card">
        <h2>Community Radio Licence</h2>
        <div className="row" style={{ cursor: "default" }}>
          <div>
            <b>MIB Community Radio Licence</b>
            <small>not applied · frequencies stay NULL (registry: radio.frequencies → planned)</small>
          </div>
          <span className="chip red">PLANNED</span>
        </div>
        <div className="row" style={{ cursor: "default" }}>
          <div>
            <b>Catalogue rights closure</b>
            <small>proof lane built · verification pending (fail-closed NO_SHIP)</small>
          </div>
          <span className="chip gold">IN PROGRESS</span>
        </div>
      </section>
    </aside>
  );
}
