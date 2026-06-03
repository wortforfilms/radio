export type RadioStoryboardStatus = "implemented" | "draft" | "blocked";

export type RadioStoryboardShot = {
  id: string;
  title: string;
  surface: string;
  route: string;
  userIntent: string;
  primaryUi: string[];
  motion: string;
  dataState: string;
  phkdGuardrail: string;
  nextAction: string;
  status: RadioStoryboardStatus;
};

export type RadioStoryboardSequence = {
  key: string;
  title: string;
  route: string;
  summary: string;
  shots: RadioStoryboardShot[];
};

export const radioStoryboardSequences: readonly RadioStoryboardSequence[] = [
  {
    key: "landing-command",
    title: "Landing Command Surface",
    route: "/radio",
    summary: "First viewport turns the Radio landing page into an operator shell with runtime routing, PHKD state, and module access.",
    shots: [
      {
        id: "RV-SB-001",
        title: "Operator Enters Radio",
        surface: "App rail and command topbar",
        route: "/radio",
        userIntent: "Understand the radio system and choose a runtime path.",
        primaryUi: ["RV mark", "Live nav", "Frame nav", "Prototype nav", "Ayodhya nav", "Evidence nav", "LOCAL/DRAFT status chip"],
        motion: "Static rail with immersive grid background and hero image reveal.",
        dataState: "Static route links and local PHKD status.",
        phkdGuardrail: "The surface marks verification as DRAFT and does not imply production broadcast evidence.",
        nextAction: "Open Live Runtime or Three Frame.",
        status: "implemented"
      },
      {
        id: "RV-SB-002",
        title: "Broadcast Hero Locks Context",
        surface: "Hero banner",
        route: "/radio",
        userIntent: "See the current broadcast promise and available live route.",
        primaryUi: ["Hero image", "102.5 MHz label", "Headline", "Description", "Open Live Runtime", "Three Frame", "Now Routed card"],
        motion: "Full-bleed banner with dark overlay and fixed action cluster.",
        dataState: "Marketing copy plus route pointers; no claimed live signal.",
        phkdGuardrail: "Frequency and now-routed copy are presentation state, not verified radio telemetry.",
        nextAction: "Launch runtime.",
        status: "implemented"
      },
      {
        id: "RV-SB-003",
        title: "Console Confirms Evidence Posture",
        surface: "Tuner, Samaya, and proof cards",
        route: "/radio",
        userIntent: "Check what can be operated and what remains unverified.",
        primaryUi: ["Quantum Resonance Tuner", "28 spectrum bars", "Hemant Samwat Samaya", "Fail Closed card", "Open Media Scope"],
        motion: "Spectrum bars create scan-like visual rhythm.",
        dataState: "Computed display only; evidence remains NULL until attached.",
        phkdGuardrail: "No fabricated audio, citations, checkout, or verification claims.",
        nextAction: "Inspect media scope or runtime modules.",
        status: "implemented"
      }
    ]
  },
  {
    key: "runtime-broadcast",
    title: "Live Runtime Broadcast",
    route: "/radio/runtime",
    summary: "Interactive dashboard for station selection, track context, browser TTS, visualizers, lyric scribing, social actions, and project creation.",
    shots: [
      {
        id: "RV-SB-004",
        title: "Catalog Loads Into Runtime",
        surface: "Runtime sidebar and hero",
        route: "/radio/runtime",
        userIntent: "Start from the loaded catalog and see the active station.",
        primaryUi: ["RSSI stats", "DATA RATE stats", "Sidebar shortcuts", "Current Samaya clock", "Frequency display", "Track HUD"],
        motion: "Clock updates once per second; station hero changes with selection.",
        dataState: "Catalog parsed from the preserved Radio HTML prototype.",
        phkdGuardrail: "Catalog loading failure is surfaced as a modal instead of silently inventing data.",
        nextAction: "Select a station.",
        status: "implemented"
      },
      {
        id: "RV-SB-005",
        title: "Operator Tunes Station",
        surface: "Station grid",
        route: "/radio/runtime",
        userIntent: "Switch station and reset the track list.",
        primaryUi: ["Station image buttons", "Active station state", "Track count labels"],
        motion: "Active card state changes; frequency recalculates from station index.",
        dataState: "Uses catalog shows and song counts.",
        phkdGuardrail: "Track counts are catalog-derived; missing images fall back to empty image source rather than invented artwork.",
        nextAction: "Choose a track.",
        status: "implemented"
      },
      {
        id: "RV-SB-006",
        title: "Operator Selects Track",
        surface: "Station track list and footer player",
        route: "/radio/runtime",
        userIntent: "Set current track for TTS, lyrics, project intake, and social actions.",
        primaryUi: ["Track list buttons", "Duration labels", "Footer LIVE tag", "Create Project", "Like", "Save", "Speak", "Gift"],
        motion: "Active track state updates footer and downstream panels.",
        dataState: "Track title, duration, audio, cover, transcript, and transliteration come from catalog where present.",
        phkdGuardrail: "Unknown duration/transcript values remain placeholders or NULL in generated project descriptions.",
        nextAction: "Speak announcement, scribe lyrics, or create project.",
        status: "implemented"
      }
    ]
  },
  {
    key: "tts-samaya",
    title: "Samaya Announcement TTS",
    route: "/radio/runtime#radioSamaya",
    summary: "Persona-driven browser speech synthesis for announcements, vishaya vaachan, mantra prompt, utsav, and muhurt display.",
    shots: [
      {
        id: "RV-SB-007",
        title: "Samaya Panel Generates Local Context",
        surface: "Hemant Samwat Samaya panel",
        route: "/radio/runtime#radioSamaya",
        userIntent: "Read local announcement context before speaking it.",
        primaryUi: ["Samwat day", "Announcement copy", "Vishaya Vaachan", "Mantra prompt", "Utsav", "Muhurt"],
        motion: "Text updates when station or track changes.",
        dataState: "Computed from station, track, station index, track index, and local clock.",
        phkdGuardrail: "Samaya text is marked local draft guidance, not verified panchang evidence.",
        nextAction: "Select persona and voice.",
        status: "implemented"
      },
      {
        id: "RV-SB-008",
        title: "Persona Voice Speaks Announcement",
        surface: "TTS controls",
        route: "/radio/runtime#radioSamaya",
        userIntent: "Speak the announcement using an available browser voice.",
        primaryUi: ["Persona select", "Browser voice select", "Speak button", "Stop button", "TTS status line"],
        motion: "Status changes through ready, speaking, stopped, or error states.",
        dataState: "Uses browser SpeechSynthesis voices only.",
        phkdGuardrail: "Server audio evidence remains NULL; missing speech synthesis fails closed.",
        nextAction: "Stop speech or continue to visualizer.",
        status: "implemented"
      }
    ]
  },
  {
    key: "visualizer",
    title: "3D Audio Visualizer Pro",
    route: "/radio/runtime#radioVisualizer",
    summary: "Three.js and Web Audio runtime with mic input, upload, scene switching, recording, and WebM download.",
    shots: [
      {
        id: "RV-SB-009",
        title: "Visualizer Scene Opens",
        surface: "Three.js canvas",
        route: "/radio/runtime#radioVisualizer",
        userIntent: "See audio translated into cinematic motion.",
        primaryUi: ["Canvas", "Scene status", "Audio element", "Scene buttons"],
        motion: "Animated sphere, bars, particles, waveform, terrain, rings, mandala, physics-inspired and shader scenes.",
        dataState: "Driven by mic, uploaded file, or local audio element where available.",
        phkdGuardrail: "Visual quality is not presented as verified audio quality or performance evidence.",
        nextAction: "Choose scene or attach audio input.",
        status: "implemented"
      },
      {
        id: "RV-SB-010",
        title: "Operator Selects Advanced Scene",
        surface: "Visualizer controls",
        route: "/radio/runtime#radioVisualizer",
        userIntent: "Switch visualization mode for cinematic output.",
        primaryUi: ["Sphere", "Bars", "Particles", "Waveform", "Terrain", "Rings", "Mandala", "Gravity", "Cloth", "Vortex", "Shockwave", "Shader", "Shadow", "Liquid"],
        motion: "Scene name changes active renderer behavior.",
        dataState: "Browser runtime state only.",
        phkdGuardrail: "Physics/shader scenes are visual simulation, not scientific measurement claims.",
        nextAction: "Record or export.",
        status: "implemented"
      },
      {
        id: "RV-SB-011",
        title: "Operator Records Visual Output",
        surface: "Recording controls",
        route: "/radio/runtime#radioVisualizer",
        userIntent: "Capture the canvas as a draft media artifact.",
        primaryUi: ["Mic Input", "Upload Audio", "Record", "Stop", "Download WebM"],
        motion: "MediaRecorder captures canvas stream when available.",
        dataState: "Local WebM object URL is generated after recording.",
        phkdGuardrail: "Downloaded WebM is a local draft artifact until source, creator, and verification evidence are attached.",
        nextAction: "Download WebM or export HKD scope.",
        status: "implemented"
      }
    ]
  },
  {
    key: "lyrics",
    title: "Synced Lyrics Scribe",
    route: "/radio/runtime#radioLyricsScribe",
    summary: "Lyric cue workflow for draft line marking, LRC import, seekable timing, LRC export, and HKD JSON export.",
    shots: [
      {
        id: "RV-SB-012",
        title: "Lyrics Scribe Opens Track",
        surface: "Lyrics scribe header and audio player",
        route: "/radio/runtime#radioLyricsScribe",
        userIntent: "Load the current track transcript for timing.",
        primaryUi: ["Track title", "Status", "Lines metric", "Synced metric", "Audio controls"],
        motion: "Progress bar moves with audio time updates.",
        dataState: "Track transcript initializes lines where available.",
        phkdGuardrail: "Lyrics are draft local lines unless citation and performance evidence exist.",
        nextAction: "Mark or import timed lines.",
        status: "implemented"
      },
      {
        id: "RV-SB-013",
        title: "Operator Marks Draft Line",
        surface: "Draft line tools",
        route: "/radio/runtime#radioLyricsScribe",
        userIntent: "Attach text to the current playhead time.",
        primaryUi: ["Draft line textarea", "Mark Line @ Playhead", "Clock", "Progress bar"],
        motion: "New cue appears in the line list at current audio time.",
        dataState: "Stored in local browser storage by track key.",
        phkdGuardrail: "Cue source stays draft and verified status remains NULL.",
        nextAction: "Set time, seek, delete, or export.",
        status: "implemented"
      },
      {
        id: "RV-SB-014",
        title: "Operator Imports And Exports Lyrics",
        surface: "Import/export tools",
        route: "/radio/runtime#radioLyricsScribe",
        userIntent: "Bring in LRC/transcript text and produce portable files.",
        primaryUi: ["Import timed lines", "Import textarea", "Import LRC / Transcript", "Export LRC", "Export HKD"],
        motion: "Details panel expands; generated download links update from current cue state.",
        dataState: "Exports local cue set as LRC and HKD JSON.",
        phkdGuardrail: "HKD export includes draft provenance and does not mark cues verified.",
        nextAction: "Attach exported artifact to project evidence.",
        status: "implemented"
      }
    ]
  },
  {
    key: "social-project",
    title: "Social, Gift, And Project Intake",
    route: "/radio/runtime",
    summary: "Local like/save state, gift intent modal, and Ayodhya project creation with track metadata.",
    shots: [
      {
        id: "RV-SB-015",
        title: "Operator Saves Or Likes Track",
        surface: "Footer social actions",
        route: "/radio/runtime",
        userIntent: "Mark a track locally for later follow-up.",
        primaryUi: ["Like button", "Save button", "Footer track metadata"],
        motion: "Button labels toggle between Like/Liked and Save/Saved.",
        dataState: "Stored in localStorage under encoded track key.",
        phkdGuardrail: "Local social state is not published engagement evidence.",
        nextAction: "Create project or continue listening.",
        status: "implemented"
      },
      {
        id: "RV-SB-016",
        title: "Gift Intent Opens Modal",
        surface: "Gift modal",
        route: "/radio/runtime",
        userIntent: "Stage a gift action without implying checkout completion.",
        primaryUi: ["Gift button", "Modal title", "Gift evidence warning", "Close button"],
        motion: "Modal appears over runtime and closes on click.",
        dataState: "No payment state is created.",
        phkdGuardrail: "Checkout, payment, wallet, receipt, and delivery evidence are explicitly NULL until verified.",
        nextAction: "Close modal or move to project intake.",
        status: "implemented"
      },
      {
        id: "RV-SB-017",
        title: "Create Project From Track",
        surface: "Ayodhya project intake link",
        route: "/projects/new",
        userIntent: "Convert current track context into a project draft.",
        primaryUi: ["Create Project link", "URL query parameters", "Project wizard fields"],
        motion: "Navigates to project intake with title, transliteration, type, language, source, and description.",
        dataState: "Derived from current station and track metadata.",
        phkdGuardrail: "Missing values are rendered as NULL or Unknown; no fabricated citations are inserted.",
        nextAction: "Import evidence at any project stage.",
        status: "implemented"
      }
    ]
  },
  {
    key: "archive-export",
    title: "Archive, Frame, And Export",
    route: "/radio/frame",
    summary: "Preserved HTML prototype, absorbed Three.js frame, and media-universe export route stay reachable from Radio.",
    shots: [
      {
        id: "RV-SB-018",
        title: "Open Absorbed Three Frame",
        surface: "React Three.js frame",
        route: "/radio/frame",
        userIntent: "Inspect the absorbed uploaded HTML as a cinematic React/Three scene.",
        primaryUi: ["Three canvas", "Absorbed rail", "Brand tuner", "Station grid", "Samaya card", "Player footer"],
        motion: "Animated torus, waveform, particles, and radar elements.",
        dataState: "Backed by extracted uploaded HTML frame data.",
        phkdGuardrail: "Absorbed frame remains a UI interpretation, not a new evidence source.",
        nextAction: "Return to runtime or wireframe registry.",
        status: "implemented"
      },
      {
        id: "RV-SB-019",
        title: "Open Original HTML Prototype",
        surface: "Static HTML archive",
        route: "/radio-html/Radio_Vaigyaaniq_UX_Dashboard.html",
        userIntent: "Compare React runtime against original supplied HTML.",
        primaryUi: ["Prototype dashboard", "Sidebar", "Tuner", "Cards", "Footer player"],
        motion: "Prototype animations remain in the static HTML surface.",
        dataState: "Served from public radio-html archive.",
        phkdGuardrail: "Prototype is preserved as design evidence, not production runtime proof.",
        nextAction: "Return to React runtime.",
        status: "implemented"
      },
      {
        id: "RV-SB-020",
        title: "Export Media Universe HKD",
        surface: "Media scope export",
        route: "/api/export?format=hkd&scope=media-universe",
        userIntent: "Download scoped HKD data for media runtime evidence review.",
        primaryUi: ["HKD Export module", "Open Media Scope", "API export link"],
        motion: "Navigation/download action.",
        dataState: "Export endpoint returns scoped persistence data.",
        phkdGuardrail: "Export preserves provenance and unknowns; it does not upgrade verification state.",
        nextAction: "Attach external evidence or continue hardening.",
        status: "implemented"
      }
    ]
  }
];

export const radioStoryboardSummary = {
  sequences: radioStoryboardSequences.length,
  shots: radioStoryboardSequences.reduce((count, sequence) => count + sequence.shots.length, 0),
  implemented: radioStoryboardSequences.flatMap((sequence) => sequence.shots).filter((shot) => shot.status === "implemented").length,
  draft: radioStoryboardSequences.flatMap((sequence) => sequence.shots).filter((shot) => shot.status === "draft").length,
  blocked: radioStoryboardSequences.flatMap((sequence) => sequence.shots).filter((shot) => shot.status === "blocked").length
} as const;
