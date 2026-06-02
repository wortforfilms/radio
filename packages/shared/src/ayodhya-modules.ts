export type AyodhyaModule = {
  key: string;
  icon: string;
  name: string;
  href: string;
  description: string;
  actions: string[];
};

export const ayodhyaModules: AyodhyaModule[] = [
  {
    key: "scripts",
    icon: "SCRIPT",
    name: "Script Engine",
    href: "/ayodhya/scripts",
    description: "Stories, scripts, dialogue, scene breakdowns, translations, and script review.",
    actions: ["Create", "Translate", "Review"]
  },
  {
    key: "storyboards",
    icon: "BOARD",
    name: "Storyboard Engine",
    href: "/ayodhya/storyboards",
    description: "Shot plans, boards, camera flow, panels, and sequence planning.",
    actions: ["Plan", "Sequence", "Evidence"]
  },
  {
    key: "images",
    icon: "IMAGE",
    name: "Image Engine",
    href: "/ayodhya/images",
    description: "Concept art, characters, locations, props, and visual references.",
    actions: ["Concept", "Variants", "Archive"]
  },
  {
    key: "videos",
    icon: "VIDEO",
    name: "Video Engine",
    href: "/ayodhya/videos",
    description: "Motion scenes, cinematic outputs, trailers, and render review.",
    actions: ["Render", "Review", "Release"]
  },
  {
    key: "voice",
    icon: "VOICE",
    name: "Voice Engine",
    href: "/ayodhya/voice",
    description: "Narration, dubbing, devotional audio, and voice direction.",
    actions: ["Record", "Dub", "Verify"]
  },
  {
    key: "lipsync",
    icon: "SYNC",
    name: "Lip Sync Engine",
    href: "/ayodhya/lipsync",
    description: "Speech, expression, timing, and performance synchronization.",
    actions: ["Align", "Preview", "Audit"]
  },
  {
    key: "assets",
    icon: "ASSET",
    name: "Asset Runtime",
    href: "/ayodhya/assets",
    description: "Assets, tags, versions, reuse, and file provenance.",
    actions: ["Catalog", "Version", "Export"]
  },
  {
    key: "characters",
    icon: "CHAR",
    name: "Character Builder",
    href: "/ayodhya/characters",
    description: "Character sheets, costumes, variants, relationships, and continuity.",
    actions: ["Design", "Variant", "Lineage"]
  },
  {
    key: "locations",
    icon: "PLACE",
    name: "Location Builder",
    href: "/ayodhya/locations",
    description: "Temples, kingdoms, forests, sets, geographies, and visual anchors.",
    actions: ["Map", "Reference", "Set"]
  },
  {
    key: "bhakti",
    icon: "BHAKTI",
    name: "Bhakti Runtime",
    href: "/ayodhya/bhakti",
    description: "Aarti, mantra, stotra, devotional media, and sacred-text provenance.",
    actions: ["Chant", "Cite", "Preserve"]
  },
  {
    key: "ramayana",
    icon: "RAMA",
    name: "Ramayana Runtime",
    href: "/ayodhya/ramayana",
    description: "Episodes, maps, lineage, references, characters, and scene continuity.",
    actions: ["Episode", "Map", "Evidence"]
  },
  {
    key: "phkd",
    icon: "PHKD",
    name: "PHKD Runtime",
    href: "/ayodhya/phkd",
    description: "Evidence, traceability, source prompts, verification status, and no fake metrics.",
    actions: ["Audit", "Trace", "Export"]
  },
  {
    key: "studio",
    icon: "STUDIO",
    name: "Ayodhya Studio",
    href: "/ayodhya/studio",
    description: "Unified studio surface for creative briefs, modules, outputs, and project operations.",
    actions: ["Open", "Operate", "Ship"]
  },
  {
    key: "status",
    icon: "STATUS",
    name: "Runtime Status",
    href: "/ayodhya/status",
    description: "Module health, PHKD policy visibility, source state, and readiness boundaries.",
    actions: ["Inspect", "Gate", "Report"]
  }
];
