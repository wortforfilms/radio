export type SprintStatus = "completed_scaffold" | "runtime_wired" | "evidence_pending";

export type SprintCompletion = {
  key: string;
  title: string;
  status: SprintStatus;
  outcome: string;
  surfaces: string[];
  evidenceState: string;
  nextHardening: string;
};

export const sprintCompletions: readonly SprintCompletion[] = [
  {
    key: "radio-landing-polish",
    title: "Radio Landing polish",
    status: "runtime_wired",
    outcome: "Radio now has a cinematic landing page, dedicated live runtime route, generated hero image, runtime navigation, and PHKD evidence copy.",
    surfaces: ["/radio", "/radio/runtime", "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html"],
    evidenceState: "Build verified; browser visual QA remains policy-dependent.",
    nextHardening: "Capture screenshots when localhost browser policy allows."
  },
  {
    key: "radio-creator-workflow",
    title: "Radio creator workflow",
    status: "runtime_wired",
    outcome: "Radio runtime can open Ayodhya AI project intake with track title, transliteration, type, language, source, and transcript payload.",
    surfaces: ["/radio/runtime", "/projects/new", "/ayodhya"],
    evidenceState: "Query intake preserves source values; persistence remains NULL until project schema is verified.",
    nextHardening: "Persist staged imports after project evidence tables are approved."
  },
  {
    key: "lyrics-scribe-upgrade",
    title: "Lyrics scribe upgrade",
    status: "completed_scaffold",
    outcome: "Synced lyrics scribe supports catalog transcript ingestion, playhead marking, line retiming, local persistence, LRC export, and HKD export.",
    surfaces: ["/radio/runtime#radioLyricsScribe"],
    evidenceState: "Lyric cues are local draft only and export with verification NULL.",
    nextHardening: "Add waveform editing and drag reorder once audio waveform storage is defined."
  },
  {
    key: "audio-visualizer-production",
    title: "Audio visualizer production pass",
    status: "runtime_wired",
    outcome: "Three.js visualizer includes advanced scenes, cinematic physics-inspired modes, shader lighting, shadows, microphone input, audio upload, screenshots, and video recording.",
    surfaces: ["/radio/runtime#radioVisualizer"],
    evidenceState: "Visual scenes are runtime effects, not claimed render-quality evidence.",
    nextHardening: "Add measured FPS and device capability reports."
  },
  {
    key: "ayodhya-ai-bridge",
    title: "Ayodhya AI bridge",
    status: "runtime_wired",
    outcome: "Ayodhya AI and project intake are linked from Radio landing/runtime, module pages, and sprint surfaces.",
    surfaces: ["/ayodhya", "/projects/new", "/radio"],
    evidenceState: "Creative imports are intake-only until verified project persistence exists.",
    nextHardening: "Add project save API after provenance schema approval."
  },
  {
    key: "universe-skeleton-hydration",
    title: "Universe skeleton hydration",
    status: "completed_scaffold",
    outcome: "Every universe has a unique skeleton blueprint with node types, edge types, views, import/export lanes, HKD sections, and evidence gates.",
    surfaces: ["/universes", "/universes/[slug]", "/api/export?format=hkd&scope=all"],
    evidenceState: "Skeletons are implementation scaffolds, not historical claims.",
    nextHardening: "Attach live API counts to each skeleton card."
  },
  {
    key: "admin-governance",
    title: "Admin + governance",
    status: "completed_scaffold",
    outcome: "Dashboard, scopes, admin, analytics, HKD export, and PHKD fail-closed copy expose governance surfaces.",
    surfaces: ["/admin", "/dashboard", "/scopes", "/api/analytics"],
    evidenceState: "Verification actions require audit records before promotion.",
    nextHardening: "Add write-enabled verification queue when auth is defined."
  },
  {
    key: "release-hardening",
    title: "Release hardening",
    status: "runtime_wired",
    outcome: "Build and test commands validate route generation, PHKD gates, skeleton coverage, dictionaries, Lipi matrix, exporters, HKD3D, and banners.",
    surfaces: ["npm test", "npm run build", "/sprints"],
    evidenceState: "Release readiness is command-evidence based; no manual approval is implied.",
    nextHardening: "Produce a signed release evidence bundle."
  }
];

export function sprintCompletionSummary() {
  return {
    total: sprintCompletions.length,
    runtimeWired: sprintCompletions.filter((sprint) => sprint.status === "runtime_wired").length,
    completedScaffold: sprintCompletions.filter((sprint) => sprint.status === "completed_scaffold").length,
    evidencePending: sprintCompletions.filter((sprint) => sprint.status === "evidence_pending").length
  };
}
