import React, { useEffect, useState } from "react";
import { bundleMetadata, archiveEntrypoints, inTauri, RADIO_ENTRYPOINTS } from "./radio-bridge";

const C = {
  bg: "#05060f", panel: "#101124", line: "rgba(255,255,255,.12)",
  violet: "#7b2cff", cyan: "#00d4ff", muted: "#a8a2d1", text: "#fff",
};

export function AppShell() {
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const [entry, setEntry] = useState<string>(RADIO_ENTRYPOINTS["App Prototype"]);
  const [entries, setEntries] = useState<Record<string, string>>(RADIO_ENTRYPOINTS);

  useEffect(() => {
    bundleMetadata().then(setMeta).catch(() => setMeta(null));
    archiveEntrypoints().then((list) => {
      // keep labelled map; list is for provenance/validation
      void list;
      setEntries(RADIO_ENTRYPOINTS);
    });
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${C.line}`, background: C.panel }}>
        <strong style={{ background: `linear-gradient(90deg,${C.violet},${C.cyan})`, WebkitBackgroundClip: "text", color: "transparent", fontWeight: 800 }}>
          RADIO VAIGYAANIQ
        </strong>
        <select value={entry} onChange={(e) => setEntry(e.target.value)}
          style={{ marginLeft: "auto", background: "#0c0d1e", color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 10px" }}>
          {Object.entries(entries).map(([label, url]) => (
            <option key={url} value={url}>{label}</option>
          ))}
        </select>
      </header>

      <iframe title="Radio Vaigyaaniq" src={entry}
        style={{ flex: 1, border: 0, width: "100%", background: C.bg }} />

      <footer style={{ fontSize: 11, color: C.muted, padding: "6px 14px", borderTop: `1px solid ${C.line}`, background: C.panel, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span>runtime: {inTauri() ? "tauri" : "browser (native bridge inactive)"}</span>
        <span>app: {(meta?.productName as string) ?? "NULL"}</span>
        <span>version: {(meta?.version as string) ?? "NULL"}</span>
        <span>platform: {(meta?.platform as string) ?? "NULL"}</span>
        <span>build_hash: {(meta?.build_hash as string) ?? "NULL"}</span>
        <span style={{ marginLeft: "auto", color: C.violet }}>
          media library: NULL — large audio/cover assets are not bundled; configure a local library path before claiming playback.
        </span>
      </footer>
    </div>
  );
}
