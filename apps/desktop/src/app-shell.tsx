// Radio Vaigyaaniq SPA shell — Sovereign Industrial / Dark Obsidian.
// 3-pane grid (Broadcast · Digital Gurukul · Telemetry) + persistent audio
// footer. All content derives from the real engine manifest and surfaces;
// telemetry readouts are real or NULL (never simulated).
import React, { useCallback, useEffect, useState } from "react";
import "./theme.css";
import { bundleMetadata, inTauri, RADIO_ENTRYPOINTS } from "./radio-bridge";
import { loadManifest, stationTracks, type EngineManifest } from "./lib/manifest";
import { setPlayerState } from "./store/player-store";
import { useAudio } from "./hooks/use-audio";
import { PaneBroadcast } from "./components/PaneBroadcast";
import { PaneWorkspace } from "./components/PaneWorkspace";
import { PaneTelemetry } from "./components/PaneTelemetry";
import { AudioFooter } from "./components/AudioFooter";

export function AppShell() {
  const [manifest, setManifest] = useState<EngineManifest | null>(null);
  const [surfaceUrl, setSurfaceUrl] = useState<string>(RADIO_ENTRYPOINTS["App Prototype"] ?? "./radio-html/index.html");
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const { load } = useAudio();

  useEffect(() => {
    loadManifest().then(setManifest).catch(() => setManifest(null));
    bundleMetadata().then(setMeta).catch(() => setMeta(null));
  }, []);

  const selectStation = useCallback(
    (slug: string, autoplay = true) => {
      const station = manifest?.stations.find((candidate) => candidate.slug === slug);
      if (!station) return;
      const queue = stationTracks(station);
      setPlayerState({ stationSlug: slug, queue });
      if (autoplay && queue[0]) load(queue[0], queue);
    },
    [manifest, load]
  );

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          RADIO <em>VAIGYAANIQ</em>
          <small>ज्ञानम् · विज्ञानम् · भारतम् — sovereign offline media engine</small>
        </div>
        <span className="chip gold" style={{ marginLeft: "auto" }}>
          {manifest ? `${manifest.counts.playableTracks ?? 0} tracks · ${manifest.stations.length} lanes` : "manifest…"}
        </span>
        <span className="chip cyan">{inTauri() ? "TAURI" : "BROWSER"}</span>
        <span className="chip">{meta ? "bundle evidence ✓" : "bundle evidence NULL"}</span>
      </header>

      <main className="panes">
        <PaneBroadcast manifest={manifest} onSelectStation={selectStation} onOpenSurface={setSurfaceUrl} />
        <PaneWorkspace surfaceUrl={surfaceUrl} onOpenSurface={setSurfaceUrl} />
        <PaneTelemetry manifest={manifest} onTuneStation={(slug) => selectStation(slug, false)} />
      </main>

      <AudioFooter />
    </div>
  );
}
