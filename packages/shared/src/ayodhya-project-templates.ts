export type AyodhyaProjectStage =
  | "brief"
  | "script"
  | "storyboard"
  | "visuals"
  | "voice"
  | "video"
  | "assets"
  | "phkd"
  | "release";

export type AyodhyaProjectTemplate = {
  key: string;
  name: string;
  category: string;
  description: string;
  defaultLanguage: string;
  stages: AyodhyaProjectStage[];
};

export const ayodhyaProjectStages: Array<{ key: AyodhyaProjectStage; label: string; description: string }> = [
  { key: "brief", label: "Brief", description: "Import title, synopsis, intent, source, and creative constraints." },
  { key: "script", label: "Script", description: "Import lyrics, screenplay, dialogue, scene text, or translation drafts." },
  { key: "storyboard", label: "Storyboard", description: "Import shot lists, panels, camera beats, and sequence maps." },
  { key: "visuals", label: "Visuals", description: "Import concept images, references, characters, locations, and style frames." },
  { key: "voice", label: "Voice", description: "Import narration notes, dubbing references, voice prompts, and audio direction." },
  { key: "video", label: "Video", description: "Import render notes, scene outputs, trailers, and edit references." },
  { key: "assets", label: "Assets", description: "Import reusable files, tags, versions, covers, and media inventory." },
  { key: "phkd", label: "PHKD", description: "Import source prompts, citations, verification status, and audit notes." },
  { key: "release", label: "Release", description: "Import captions, credits, publishing notes, and delivery checklist." }
];

export const ayodhyaProjectTemplates: AyodhyaProjectTemplate[] = [
  {
    key: "devotional-song",
    name: "Devotional Song",
    category: "Devotional",
    description: "Bhakti song, kirtan, mantra, or stotra-inspired music project.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "assets", "phkd", "release"]
  },
  {
    key: "bhajan",
    name: "Bhajan",
    category: "Devotional",
    description: "Call-and-response devotional composition with lyrics, tune notes, and source discipline.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "phkd", "release"]
  },
  {
    key: "aarti",
    name: "Aarti",
    category: "Devotional",
    description: "Aarti performance package with verses, chorus, visual ritual notes, and provenance.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "voice", "video", "phkd"]
  },
  {
    key: "mantra-chant",
    name: "Mantra Chant",
    category: "Devotional",
    description: "Chanting project with pronunciation notes, repetition structure, and verification status.",
    defaultLanguage: "Sanskrit",
    stages: ["brief", "script", "voice", "phkd"]
  },
  {
    key: "stotra-recitation",
    name: "Stotra Recitation",
    category: "Devotional",
    description: "Recitation project for stotra text, pronunciation, audio, and cited source record.",
    defaultLanguage: "Sanskrit",
    stages: ["brief", "script", "voice", "phkd", "release"]
  },
  {
    key: "sufi-devotional",
    name: "Sufi Devotional",
    category: "Devotional",
    description: "Sufi-inspired song, qawwali draft, or devotional poetry project with source boundaries.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "assets", "phkd", "release"]
  },
  {
    key: "film",
    name: "Film",
    category: "Cinema",
    description: "Long-form film project with script, storyboard, production assets, and release checklist.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "voice", "video", "assets", "phkd", "release"]
  },
  {
    key: "short-film",
    name: "Short Film",
    category: "Cinema",
    description: "Compact narrative film with scene plan, shots, characters, and delivery notes.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "video", "phkd", "release"]
  },
  {
    key: "animation",
    name: "Animation",
    category: "Cinema",
    description: "Animated production with visual style, boards, voice, motion, and asset tracking.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "voice", "video", "assets", "phkd"]
  },
  {
    key: "music-video",
    name: "Music Video",
    category: "Cinema",
    description: "Song-led visual production with beat map, shots, styling, and release metadata.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "video", "assets", "release"]
  },
  {
    key: "documentary",
    name: "Documentary",
    category: "Research",
    description: "Evidence-first documentary package with sources, narration, scenes, and interviews.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "voice", "video", "assets", "phkd", "release"]
  },
  {
    key: "docu-drama",
    name: "Docu-Drama",
    category: "Research",
    description: "Hybrid documentary and dramatized scenes with clear fact/fiction boundaries.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "video", "assets", "phkd"]
  },
  {
    key: "ramayana-episode",
    name: "Ramayana Episode",
    category: "Itihasa",
    description: "Episode planning surface for Ramayana scenes, characters, locations, and citations.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "voice", "video", "assets", "phkd"]
  },
  {
    key: "mahabharata-episode",
    name: "Mahabharata Episode",
    category: "Itihasa",
    description: "Episode package for Mahabharata stories with lineage and source caution.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "assets", "phkd"]
  },
  {
    key: "purana-story",
    name: "Purana Story",
    category: "Itihasa",
    description: "Puranic story adaptation with explicit source and version tracking.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "voice", "phkd"]
  },
  {
    key: "character-sheet",
    name: "Character Sheet",
    category: "Design",
    description: "Character bio, costume, variants, relationships, and continuity notes.",
    defaultLanguage: "Hindi",
    stages: ["brief", "visuals", "assets", "phkd"]
  },
  {
    key: "location-pack",
    name: "Location Pack",
    category: "Design",
    description: "Temple, forest, kingdom, city, or set design with geography and reference notes.",
    defaultLanguage: "Hindi",
    stages: ["brief", "visuals", "storyboard", "assets", "phkd"]
  },
  {
    key: "concept-art-pack",
    name: "Concept Art Pack",
    category: "Design",
    description: "Visual exploration package for style frames, costumes, props, and world mood.",
    defaultLanguage: "Hindi",
    stages: ["brief", "visuals", "assets", "phkd"]
  },
  {
    key: "voiceover",
    name: "Voiceover",
    category: "Audio",
    description: "Narration, intro, explainer, or poetic voice track with direction and pronunciation.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "phkd", "release"]
  },
  {
    key: "podcast-episode",
    name: "Podcast Episode",
    category: "Audio",
    description: "Spoken episode with outline, script, source notes, and publishing metadata.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "assets", "phkd", "release"]
  },
  {
    key: "radio-drama",
    name: "Radio Drama",
    category: "Audio",
    description: "Multi-character audio drama with dialogue, sound cues, and voice planning.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "voice", "assets", "phkd", "release"]
  },
  {
    key: "trailer",
    name: "Trailer",
    category: "Marketing",
    description: "Teaser or trailer package with hook, shots, copy, voice, and release notes.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "voice", "video", "assets", "release"]
  },
  {
    key: "social-reel",
    name: "Social Reel",
    category: "Marketing",
    description: "Short social video with hook, beat map, captions, and platform copy.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "video", "assets", "release"]
  },
  {
    key: "poster-campaign",
    name: "Poster Campaign",
    category: "Marketing",
    description: "Poster, key art, copy, variants, and release asset checklist.",
    defaultLanguage: "Hindi",
    stages: ["brief", "visuals", "assets", "release"]
  },
  {
    key: "educational-lesson",
    name: "Educational Lesson",
    category: "Education",
    description: "Lesson script, teaching notes, visuals, assessment, and citations.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "visuals", "voice", "phkd", "release"]
  },
  {
    key: "course-module",
    name: "Course Module",
    category: "Education",
    description: "Structured course unit with learning goals, lesson flow, assets, and evidence.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "visuals", "assets", "phkd", "release"]
  },
  {
    key: "research-brief",
    name: "Research Brief",
    category: "Research",
    description: "Evidence-first research note with citations, claims, status, and export target.",
    defaultLanguage: "English",
    stages: ["brief", "script", "phkd", "release"]
  },
  {
    key: "hkd-document",
    name: "HKD Document",
    category: "PHKD",
    description: "Holistic Knowledge Document with schemas, content, evidence, and runtime notes.",
    defaultLanguage: "English",
    stages: ["brief", "assets", "phkd", "release"]
  },
  {
    key: "archive-import",
    name: "Archive Import",
    category: "PHKD",
    description: "Import existing files, lyrics, references, covers, or catalogs at any workflow stage.",
    defaultLanguage: "Hindi",
    stages: ["brief", "script", "storyboard", "visuals", "voice", "video", "assets", "phkd", "release"]
  }
];
