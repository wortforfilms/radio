// Pane A — Broadcast & Navigation Feed: live frequency lanes (honest: local
// catalogue lanes, no FM licence), show archives (real surfaces), bulletins
// (fail-closed: no verified news feed exists → NULL, never fabricated).
import React from "react";
import type { EngineManifest } from "../lib/manifest";
import { usePlayerStore } from "../store/player-store";

const ARCHIVES: Array<[string, string]> = [
  ["Stations", "./radio-html/Radio_Stations.html"],
  ["Catalogue", "./radio-html/Radio_Catalogue.html"],
  ["Full App Prototype", "./radio-html/Radio_Vaigyaaniq_Full_App.html"],
  ["Online/Offline Engine", "./radio-html/online-offline-radio-engine.html"],
  ["Lyrics Prompter", "./radio-html/lyrics-prompter.html"],
  ["Storyboards", "./radio-html/surfaces/index.html"]
];

export function PaneBroadcast(props: {
  manifest: EngineManifest | null;
  onSelectStation: (slug: string) => void;
  onOpenSurface: (url: string) => void;
}) {
  const { stationSlug } = usePlayerStore();
  const stations = props.manifest?.stations ?? [];
  return (
    <aside className="pane pane-a">
      <section className="card yantra">
        <h2>Broadcast Lanes</h2>
        {stations.map((station) => (
          <div
            key={station.slug}
            className={`row ${station.slug === stationSlug ? "active" : ""}`}
            onClick={() => props.onSelectStation(station.slug)}
          >
            <div>
              <b>{station.name}</b>
              <small>
                {station.totalPrograms} programs · {station.region ?? "pan-india"} · stream{" "}
                {station.streamUrl ? "candidate" : "NULL"}
              </small>
            </div>
            <span className={`chip ${station.streamUrl ? "gold" : ""}`}>{station.streamUrl ? "CAND" : "LOCAL"}</span>
          </div>
        ))}
        {!stations.length && <p className="muted">Manifest loading…</p>}
      </section>

      <section className="card">
        <h2>Show Archives</h2>
        {ARCHIVES.map(([label, url]) => (
          <div key={url} className="row" onClick={() => props.onOpenSurface(url)}>
            <b>{label}</b>
            <span className="chip cyan">OPEN</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Community Bulletins</h2>
        <p className="muted">
          No verified news/event feed is connected (NCR · Haryana · UP lanes planned). Bulletins stay{" "}
          <span className="mono">NULL</span> until a real, attributable source is wired — nothing is fabricated.
        </p>
      </section>
    </aside>
  );
}
