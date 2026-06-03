export type ExtractedFrame = {
  key: string;
  label: string;
  type: string;
  purpose: string;
  selectors: string[];
};

export type ExtractedDataFrame = {
  key: string;
  label: string;
  fields: string[];
  source: string;
};

export type ExtractedLayout = {
  key: string;
  label: string;
  structure: string;
  responsiveRule: string;
};

export type ExtractedWireframeGroup = {
  key: string;
  title: string;
  description: string;
  items: Array<{
    code: string;
    name: string;
    category: string;
  }>;
};

export const radioImageHtmlExtraction = {
  sourceFile: "/Users/vesahe/Downloads/radio_vaigyaaniq_image_to_html.html",
  title: "Radio Vaigyaaniq Dashboard - Image to HTML",
  provenance: "Local downloaded HTML prototype supplied by user. Extracted as interface scaffold only.",
  verificationStatus: "draft_extracted",
  typeSystem: [
    "app-shell",
    "side-rail-navigation",
    "three-column-runtime-grid",
    "yantra-visual-frame",
    "sonic-library-list",
    "quantum-tuner-card",
    "station-grid-card",
    "samaya-status-card",
    "telemetry-radar-frame",
    "spectrum-bars-frame",
    "fixed-player-footer",
    "control-stalk-overlay"
  ],
  frames: [
    {
      key: "radio-shell",
      label: "Radio app shell",
      type: "foundation-frame",
      purpose: "Owns cosmic background, grid overlay, left rail offset, and fixed player padding.",
      selectors: ["app", "wrap", "grid"]
    },
    {
      key: "side-rail",
      label: "Icon side rail",
      type: "navigation-frame",
      purpose: "Fixed vertical icon navigation with active state and compact menu affordance.",
      selectors: ["sidebar", "menu", "nav", "ico", "active"]
    },
    {
      key: "yantra-frame",
      label: "Yantra visual frame",
      type: "ambient-frame",
      purpose: "Low-opacity sacred geometry visual background for the left runtime column.",
      selectors: ["yantra"]
    },
    {
      key: "sonic-library",
      label: "Sonic Library",
      type: "data-frame",
      purpose: "Compact track list with number, title, rate/live state, and active styling.",
      selectors: ["library", "tracks", "track", "n", "rate"]
    },
    {
      key: "brand-tuner",
      label: "Central brand and tuner",
      type: "control-frame",
      purpose: "Radio identity, frequency dial, quantum tuner label, play control, and guidance pill.",
      selectors: ["brand", "logo", "tuner", "freq", "label", "play", "pill"]
    },
    {
      key: "station-grid",
      label: "Resonance station grid",
      type: "catalog-frame",
      purpose: "Eight station cards mixing icon-only and named station states.",
      selectors: ["stations", "station-grid", "station", "icon", "mini-play", "status"]
    },
    {
      key: "samaya-state",
      label: "Current Samaya state",
      type: "temporal-frame",
      purpose: "Earth marker, computed time state, draft/NULL badges, and Hemant Samwat panel.",
      selectors: ["right-top", "earth", "time", "samaya", "badges", "draft"]
    },
    {
      key: "telemetry-radar",
      label: "Catalyst telemetry radar",
      type: "visualization-frame",
      purpose: "Circular radar visualization frame for operational telemetry.",
      selectors: ["radar-wrap", "radar"]
    },
    {
      key: "live-spectrum",
      label: "Live Spectrum",
      type: "visualization-frame",
      purpose: "Generated 34-bar spectrum frame for audio activity.",
      selectors: ["spectrum", "bar"]
    },
    {
      key: "control-stalk",
      label: "Control stalk",
      type: "hardware-overlay-frame",
      purpose: "Physical input module status overlay with operational badge.",
      selectors: ["stalk", "ok"]
    },
    {
      key: "fixed-player",
      label: "Fixed player footer",
      type: "transport-frame",
      purpose: "Bottom live player with cover, title, controls, like/save/gift actions, and MSAR footer.",
      selectors: ["player", "song", "cover", "live", "controls", "pause", "actions", "footer"]
    }
  ] satisfies ExtractedFrame[],
  dataFrames: [
    {
      key: "track-row",
      label: "Sonic library row",
      fields: ["index", "title", "rateOrLive", "activeState"],
      source: "Five visible rows in .tracks plus active row state."
    },
    {
      key: "station-card",
      label: "Station catalog card",
      fields: ["iconOrName", "trackCount", "activeStatus", "miniPlay"],
      source: "Eight .station.card elements."
    },
    {
      key: "samaya-badges",
      label: "Samaya badge set",
      fields: ["draft", "nullState", "computedState"],
      source: "Right column .badges and .draft values."
    },
    {
      key: "spectrum-bars",
      label: "Live spectrum bars",
      fields: ["barIndex", "height", "gradient"],
      source: "Client script generates 34 bars."
    },
    {
      key: "player-action",
      label: "Player action set",
      fields: ["like", "save", "gift", "transport"],
      source: "Fixed .player footer."
    }
  ] satisfies ExtractedDataFrame[],
  layouts: [
    {
      key: "desktop-three-column",
      label: "Desktop three-column runtime",
      structure: "left ambient/library column + central tuner/stations + right samaya/telemetry column",
      responsiveRule: "At max-width 1000px, collapse to single column."
    },
    {
      key: "fixed-rail-fixed-player",
      label: "Fixed rail and player",
      structure: "72px fixed side rail plus fixed 76px bottom player",
      responsiveRule: "Rail hidden on small screens; player becomes single-column auto height."
    },
    {
      key: "station-card-grid",
      label: "Station card grid",
      structure: "Four equal columns for station cards",
      responsiveRule: "At max-width 1000px, collapse to two columns."
    }
  ] satisfies ExtractedLayout[],
  counts: {
    visibleTrackRows: 5,
    stationCards: 8,
    generatedSpectrumBars: 34,
    sourceLines: 69
  }
} as const;

export const ayodhyaWireframeBoardExtraction = {
  sourceFile: "/Users/vesahe/Downloads/preview (18).html",
  title: "Ayodhya AI Unique Wireframe Board",
  provenance: "Local downloaded HTML prototype supplied by user. Extracted as reusable UX architecture scaffold.",
  verificationStatus: "draft_extracted",
  summary: {
    uniqueWireframes: 41,
    declaredPages: "176+",
    declaredRuntimes: "26+",
    categories: 8
  },
  groups: [
    {
      key: "foundation",
      title: "Foundation",
      description: "Core global layouts and system-level experiences.",
      items: [
        { code: "UW-001", name: "Landing Hero", category: "Foundation" },
        { code: "UW-002", name: "Dashboard", category: "Foundation" },
        { code: "UW-003", name: "Workspace", category: "Foundation" },
        { code: "UW-004", name: "Search", category: "Foundation" },
        { code: "UW-005", name: "Command Center", category: "Foundation" },
        { code: "UW-006", name: "Notification Center", category: "Foundation" },
        { code: "UW-007", name: "Status Matrix", category: "Foundation" },
        { code: "UW-008", name: "Profile", category: "Foundation" }
      ]
    },
    {
      key: "management",
      title: "Management",
      description: "Data handling and management patterns used across all modules.",
      items: [
        { code: "UW-009", name: "List View", category: "Management" },
        { code: "UW-010", name: "Detail View", category: "Management" },
        { code: "UW-011", name: "Create Form", category: "Management" },
        { code: "UW-012", name: "Edit Form", category: "Management" },
        { code: "UW-013", name: "Kanban Board", category: "Management" },
        { code: "UW-014", name: "Timeline View", category: "Management" },
        { code: "UW-015", name: "Calendar View", category: "Management" },
        { code: "UW-016", name: "Analytics View", category: "Management" }
      ]
    },
    {
      key: "creation",
      title: "Creation",
      description: "Content and knowledge creation workspaces.",
      items: [
        { code: "UW-017", name: "Script Editor", category: "Creation" },
        { code: "UW-018", name: "Prompt Studio", category: "Creation" },
        { code: "UW-019", name: "Rich Text Workspace", category: "Creation" },
        { code: "UW-020", name: "Multi-panel Creator", category: "Creation" }
      ]
    },
    {
      key: "media",
      title: "Media",
      description: "Media generation, editing, comparison and preview experiences.",
      items: [
        { code: "UW-021", name: "Asset Gallery", category: "Media" },
        { code: "UW-022", name: "Asset Viewer", category: "Media" },
        { code: "UW-023", name: "Comparison View", category: "Media" },
        { code: "UW-024", name: "Generation Studio", category: "Media" },
        { code: "UW-025", name: "Timeline Editor", category: "Media" }
      ]
    },
    {
      key: "builders",
      title: "Builders",
      description: "Build entities, worlds and immersive environments.",
      items: [
        { code: "UW-026", name: "Character Builder", category: "Builders" },
        { code: "UW-027", name: "Location Builder", category: "Builders" },
        { code: "UW-028", name: "Scene Builder", category: "Builders" },
        { code: "UW-029", name: "World Builder", category: "Builders" }
      ]
    },
    {
      key: "knowledge",
      title: "Knowledge",
      description: "Explore, connect and learn from knowledge in intelligent ways.",
      items: [
        { code: "UW-030", name: "Knowledge Graph", category: "Knowledge" },
        { code: "UW-031", name: "Explorer", category: "Knowledge" },
        { code: "UW-032", name: "Learning Dashboard", category: "Knowledge" }
      ]
    },
    {
      key: "specialized",
      title: "Specialized",
      description: "Special purpose experiences for advanced workflows.",
      items: [
        { code: "UW-033", name: "Storyboard Canvas", category: "Specialized" },
        { code: "UW-034", name: "3D Designer", category: "Specialized" },
        { code: "UW-035", name: "Rig Designer", category: "Specialized" },
        { code: "UW-036", name: "Animation Designer", category: "Specialized" },
        { code: "UW-037", name: "Scene Composer", category: "Specialized" },
        { code: "UW-038", name: "Runtime Observatory", category: "Specialized" },
        { code: "UW-039", name: "Telemetry Monitor", category: "Specialized" }
      ]
    },
    {
      key: "governance",
      title: "Governance",
      description: "Trust, evidence and compliance workspaces.",
      items: [
        { code: "UW-040", name: "Evidence Viewer", category: "Governance" },
        { code: "UW-041", name: "Audit Timeline", category: "Governance" }
      ]
    }
  ] satisfies ExtractedWireframeGroup[]
} as const;

export const extractedWireframeTotals = {
  radioFrames: radioImageHtmlExtraction.frames.length,
  radioDataFrames: radioImageHtmlExtraction.dataFrames.length,
  radioLayouts: radioImageHtmlExtraction.layouts.length,
  ayodhyaWireframes: ayodhyaWireframeBoardExtraction.groups.reduce((total, group) => total + group.items.length, 0),
  ayodhyaGroups: ayodhyaWireframeBoardExtraction.groups.length
} as const;
