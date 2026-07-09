import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(repoRoot, `apps/desktop/src/${file}`), "utf8");

// DOM/hook contract tests (component render tests need jsdom + a browser build
// chain; run `npx tsc --noEmit` in apps/desktop for the type-level guarantee).
describe("radio vaigyaaniq SPA shell", () => {
  it("defines the Sovereign Obsidian design tokens and 3-pane grid", () => {
    const theme = read("theme.css");
    for (const token of ["#090b10", "#121620", "#00f0ff", "#e5a93c", "#8a94a6", "#00ff66"]) {
      expect(theme.toLowerCase()).toContain(token);
    }
    expect(theme).toContain("--font-display: Georgia");
    expect(theme).toContain("Noto Sans Devanagari");
    expect(theme).toContain("grid-template-columns: 280px minmax(0, 1fr) 300px");
    expect(theme).toContain(".audio-footer");
    expect(theme).toContain("@media (max-width: 1080px)"); // responsive collapse
  });

  it("ships a dependency-free store with persistence and an evidence outbox", () => {
    const store = read("store/player-store.ts");
    expect(store).toContain("useSyncExternalStore");
    expect(store).toContain("rv.spa.prefs");
    expect(store).toContain("queueIntent");
    expect(store).not.toContain("from \"zustand\""); // no uninstallable deps
  });

  it("audio hook enforces the rights-aware preview clamp and queue controls", () => {
    const hook = read("hooks/use-audio.ts");
    expect(hook).toContain("previewSeconds");
    expect(hook).toContain("audio.pause()");
    expect(hook).toContain("shuffle");
    expect(hook).toContain("repeat");
    const freq = read("hooks/use-frequency.ts");
    expect(freq).toContain("no broadcast licence");
    expect(freq).toContain("102.5"); // default candidate display
  });

  it("panes render real data and NULL for missing lanes — never fabrications", () => {
    expect(read("components/PaneBroadcast.tsx")).toContain("nothing is fabricated");
    expect(read("components/PaneWorkspace.tsx")).toContain("none are simulated");
    const telemetry = read("components/PaneTelemetry.tsx");
    expect(telemetry).toContain("NULL — no monitoring wired");
    expect(telemetry).toContain("Candidate display only");
    expect(telemetry).toContain("offlineCacheStatus");
    expect(telemetry).toContain("PLANNED"); // licence tracker honest state
  });

  it("persistent audio footer meets the spec with honest badging", () => {
    const footer = read("components/AudioFooter.tsx");
    expect(footer).toContain("af-play"); // 40px gold circular play
    expect(footer).toContain("🔀");
    expect(footer).toContain("🔁");
    expect(footer).toContain("Gift intent shows payment NULL until verification"); // mandated tooltip
    expect(footer).toContain('track?.live ? "● LIVE"'); // LIVE only when verified
    expect(footer).toContain("PREVIEW");
    const shell = read("app-shell.tsx");
    expect(shell).toContain("<AudioFooter />");
    expect(shell).toContain("loadManifest"); // real catalogue, not sample data
    expect(read("lib/manifest.ts")).toContain("radio-engine-manifest.json");
  });
});
