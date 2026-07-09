// Pane B — Center Workspace: hosts the real surfaces (storyboard engine,
// prototypes, learning modules) in the viewer. "Quantum Mechanics for Farmers"
// style live-stream programming remains PLANNED — no such produced show exists,
// so the workspace lists real surfaces only.
import React from "react";

export function PaneWorkspace(props: { surfaceUrl: string; onOpenSurface: (url: string) => void }) {
  return (
    <section className="pane pane-b">
      <section className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h2>Digital Gurukul — Active Viewer</h2>
        <iframe title="Radio Vaigyaaniq surface" src={props.surfaceUrl} />
        <p className="muted" style={{ margin: "8px 0 0", fontSize: 11 }}>
          Viewer hosts the real storyboard/surface archive (14-frame storyboard engine lives in{" "}
          <a
            style={{ color: "var(--accent)", cursor: "pointer" }}
            onClick={() => props.onOpenSurface("./radio-html/surfaces/index.html")}
          >
            surfaces
          </a>
          ). Live-stream teaching shows are planned — none are produced yet, none are simulated.
        </p>
      </section>
    </section>
  );
}
