import { preservedUniverses } from "./taxonomy";

export type UniverseSlug = (typeof universeRegistry)[number]["slug"];

const tones = [
  "emerald",
  "copper",
  "indigo",
  "teal",
  "maroon",
  "olive",
  "blue",
  "saffron"
] as const;

const focusByUniverse: Record<string, string> = {
  "Universal Knowledge Lineage Explorer": "Unified traversal across people, texts, subjects, places, time, provenance, and graph edges.",
  "Pitra Universe": "Ancestral records, inherited knowledge, preservation duties, and provenance-first continuity.",
  "Guru Maataa Universe": "Maternal teacher lineages, guidance records, care networks, and transmission ethics.",
  "Rishi Universe": "Rishi records, knowledge domains, textual associations, and verified relationship edges.",
  "Rishika Universe": "Rishika records, authored knowledge markers, subject links, and citation-safe discovery.",
  "Parampara Universe": "Tradition chains, teacher-student continuity, institutional memory, and preserved practices.",
  "Civilization Universe": "Civilizational taxonomy, regional knowledge streams, and cultural continuity metrics.",
  "Knowledge Universe": "Knowledge nodes, domains, discoveries, innovations, and verification states.",
  "Subject Universe": "Subject taxonomy, learning pathways, research domains, and graph-scoped filtering.",
  "Text Universe": "Texts, languages, translations, authorship claims, and citation-bearing metadata.",
  "Timeline Universe": "Events, period labels, chronology, and time-based lineage inspection.",
  "Geography Universe": "Locations, institutions, regional traditions, and place-aware knowledge discovery.",
  "Knowledge Graph Universe": "Nodes, edges, relationship taxonomy, graph traversal, and fail-closed lineage claims.",
  "Education Universe": "Courses, syllabi, institutions, learning structures, and knowledge progression.",
  "Research Universe": "Research papers, discoveries, citations, verification, and evidence review.",
  "Community Universe": "Community participation, collaboration records, stewardship, and contribution audit trails.",
  "Media Universe": "Media assets, source files, checksums, provenance, and cultural memory surfaces.",
  "AI Universe": "Retrieval-only assistant flows, evidence boundaries, and non-fabrication controls.",
  "Observatory Universe": "Runtime metrics, verification status, graph counts, and operational visibility.",
  "Future Knowledge Universe": "Forward-looking knowledge placeholders, unknowns, and explicitly unverified horizons.",
  "Governance Universe": "Audit logs, verification actions, merge decisions, and policy enforcement.",
  "Universal Command Center": "Administrative overview, import/export controls, search, graph, and analytics access."
};

const soundtrackByUniverse: Record<string, { title: string; path: string }> = {
  "Universal Knowledge Lineage Explorer": {
    title: "Radio Sanatan Vaigyanik",
    path: "/universe-soundtracks/universal-knowledge-lineage-explorer.mp3"
  },
  "Pitra Universe": {
    title: "Om Pitron Ko Bulao",
    path: "/universe-soundtracks/pitra-universe.mp3"
  },
  "Guru Maataa Universe": {
    title: "Mata",
    path: "/universe-soundtracks/guru-maataa-universe.mp3"
  },
  "Rishi Universe": {
    title: "Om Agnimile Purohitam",
    path: "/universe-soundtracks/rishi-universe.mp3"
  },
  "Rishika Universe": {
    title: "Suno Ri Sakhiyon",
    path: "/universe-soundtracks/rishika-universe.mp3"
  },
  "Parampara Universe": {
    title: "Badi Purani Baat Hai",
    path: "/universe-soundtracks/parampara-universe.mp3"
  },
  "Civilization Universe": {
    title: "Yahi Bharat Ki Pehchaan",
    path: "/universe-soundtracks/civilization-universe.mp3"
  },
  "Knowledge Universe": {
    title: "Satya Sanatan Vaigyanik Ka Gyan",
    path: "/universe-soundtracks/knowledge-universe.mp3"
  },
  "Subject Universe": {
    title: "Sandarbh Ki Paribhasha",
    path: "/universe-soundtracks/subject-universe.mp3"
  },
  "Text Universe": {
    title: "Tamaso Ma Jyotirgamaya",
    path: "/universe-soundtracks/text-universe.mp3"
  },
  "Timeline Universe": {
    title: "Frequency of Future-Past",
    path: "/universe-soundtracks/timeline-universe.mp3"
  },
  "Geography Universe": {
    title: "Dharti Ka Noon",
    path: "/universe-soundtracks/geography-universe.mp3"
  },
  "Knowledge Graph Universe": {
    title: "Rekhayein",
    path: "/universe-soundtracks/knowledge-graph-universe.mp3"
  },
  "Education Universe": {
    title: "Nachiketa",
    path: "/universe-soundtracks/education-universe.mp3"
  },
  "Research Universe": {
    title: "Antarman",
    path: "/universe-soundtracks/research-universe.mp3"
  },
  "Community Universe": {
    title: "Mere Yaar Pyaare",
    path: "/universe-soundtracks/community-universe.mp3"
  },
  "Media Universe": {
    title: "Cosmic Chant",
    path: "/universe-soundtracks/media-universe.mp3"
  },
  "AI Universe": {
    title: "Neural Jogi",
    path: "/universe-soundtracks/ai-universe.mp3"
  },
  "Observatory Universe": {
    title: "Cosmic Awakening",
    path: "/universe-soundtracks/observatory-universe.mp3"
  },
  "Future Knowledge Universe": {
    title: "Future-Past Clearance",
    path: "/universe-soundtracks/future-knowledge-universe.mp3"
  },
  "Governance Universe": {
    title: "Aawazon Ki Adaalat",
    path: "/universe-soundtracks/governance-universe.mp3"
  },
  "Universal Command Center": {
    title: "Divya Shankhnaad",
    path: "/universe-soundtracks/universal-command-center.mp3"
  }
};

export const universeRegistry = preservedUniverses.map((name, index) => ({
  name,
  slug: slugifyUniverse(name),
  tone: tones[index % tones.length],
  focus: focusByUniverse[name],
  metricHint: metricHintFor(name),
  primaryPath: primaryPathFor(name),
  heroImagePath: `/universe-heroes/${slugifyUniverse(name)}.svg`,
  soundtrack: soundtrackByUniverse[name]
}));

export function slugifyUniverse(name: string) {
  return name.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getUniverseBySlug(slug: string) {
  return universeRegistry.find((universe) => universe.slug === slug);
}

function metricHintFor(name: string) {
  if (name.includes("Graph")) return "graph edges";
  if (name.includes("Timeline")) return "timeline events";
  if (name.includes("Civilization")) return "civilizations";
  if (name.includes("Subject")) return "subjects";
  if (name.includes("Rishi")) return "rishi records";
  if (name.includes("Rishika")) return "rishika records";
  if (name.includes("Observatory")) return "runtime metrics";
  if (name.includes("Governance")) return "audit actions";
  return "knowledge nodes";
}

function primaryPathFor(name: string) {
  if (name.includes("Command")) return "/admin";
  if (name.includes("Observatory")) return "/api/analytics";
  if (name.includes("Graph")) return "/api/knowledge-graph";
  if (name.includes("Timeline")) return "/api/timeline";
  if (name.includes("Civilization")) return "/api/civilizations";
  if (name.includes("Subject")) return "/api/subjects";
  if (name.includes("Text")) return "/api/texts";
  if (name.includes("Rishika")) return "/api/rishika";
  if (name.includes("Rishi")) return "/api/rishi";
  if (name.includes("Guru")) return "/api/guru-maataa";
  if (name.includes("Pitra")) return "/api/pitra";
  return "/api/search";
}
