// Layout registry: each of the 10 route layouts declares its regions and
// default component tree. route → layout → component tree is generated from
// this (component-trees.json) — never assembled by hand in app code.
import type { LayoutDefinition } from "./types.ts";

export const layouts: LayoutDefinition[] = [
  {
    id: "landing",
    description: "Section hub: hero, child-route grid, status chips.",
    regions: [
      { region: "header", components: ["net-status"] },
      { region: "main", components: ["catalog-grid"] },
      { region: "footer", components: [] }
    ]
  },
  {
    id: "player",
    description: "Playback surface: player + schedule + transcript + story.",
    regions: [
      { region: "header", components: ["net-status"] },
      { region: "sidebar", components: ["station-list"] },
      { region: "main", components: ["player", "waveform", "transcript", "schedule-list"] },
      { region: "aside", components: ["wallet", "persona-select", "weather-widget"] },
      { region: "overlay", components: ["story-modal"] }
    ]
  },
  {
    id: "dashboard",
    description: "Data-dense operational view.",
    regions: [
      { region: "header", components: ["net-status"] },
      { region: "main", components: ["chart", "admin-table"] }
    ]
  },
  {
    id: "studio",
    description: "Creation surface: recording, editing, queueing.",
    regions: [
      { region: "sidebar", components: ["station-list"] },
      { region: "main", components: ["visualizer", "waveform", "transcript"] },
      { region: "aside", components: ["schedule-list"] }
    ]
  },
  {
    id: "article",
    description: "Long-form content page.",
    regions: [
      { region: "main", components: ["article"] },
      { region: "aside", components: ["timeline"] }
    ]
  },
  {
    id: "reader",
    description: "Focused reading (transcripts, courses).",
    regions: [{ region: "main", components: ["transcript", "article"] }]
  },
  {
    id: "fullscreen",
    description: "Chromeless surface (API docs, immersive views).",
    regions: [{ region: "main", components: [] }]
  },
  {
    id: "settings",
    description: "Account and preference forms.",
    regions: [{ region: "main", components: ["persona-select", "wallet"] }]
  },
  {
    id: "admin",
    description: "Operational admin with fail-closed gates.",
    regions: [
      { region: "header", components: ["net-status"] },
      { region: "main", components: ["admin-table"] }
    ]
  },
  {
    id: "modal",
    description: "Overlay dialog surface.",
    regions: [{ region: "overlay", components: ["story-modal"] }]
  }
];
