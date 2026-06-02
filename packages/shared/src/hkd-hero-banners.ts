export type HkdHeroBannerShape =
  | "cube"
  | "tree"
  | "timeline"
  | "glyph"
  | "network"
  | "bars"
  | "dna"
  | "scales"
  | "temple"
  | "ui"
  | "shield"
  | "studio"
  | "portal"
  | "document"
  | "market";

export type HkdHeroBanner = {
  key: string;
  title: string;
  subtitle: string;
  headline: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  color: string;
  accent: string;
  shape: HkdHeroBannerShape;
  tags: string[];
  status: "absorbed_scaffold";
  provenance: string;
};

export const hkdHeroBannerProvenance = "/Users/vesahe/Downloads/preview (17).html";

type HkdHeroBannerRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  HkdHeroBannerShape,
  string[]
];

const hkdHeroBannerRows: HkdHeroBannerRow[] = [
  ["hkd", ".hkd", "Holistic Knowledge Document", "One File. Infinite Knowledge.", "Knowledge, UI, code, schemas, assets, workflows, timelines, runtime logic, and verifiable evidence inside one executable truth capsule.", "Explore HKD", "Status Matrix", "#22d3ee", "#fbbf24", "cube", ["PHKD", "Evidence", "Truth Capsule"]],
  ["maataa", "MAATAA", "Operating System of Humanity", "Build. Run. Evolve.", "AI, runtimes, protocols, memory, tools, and infrastructure for sovereign knowledge workflows.", "Enter Maataa", "Explore Stack", "#34d399", "#22d3ee", "tree", ["AI Runtime", "Memory", "Agents"]],
  ["tlp", "TLP", "Truth. Logic. Project.", "Plan with Truth. Execute with Logic.", "Film, production, project planning, schedules, assets, permissions, and evidence-backed execution.", "Go to TLP", "View Projects", "#a78bfa", "#60a5fa", "timeline", ["Projects", "Production", "Schedule"]],
  ["lipi", "LIPI", "Language of Infinite Possibilities", "Think. Write. Express.", "Scripts, glyphs, language intelligence, input tools, cultural archives, and living text systems.", "Open Lipi", "Scripts", "#fbbf24", "#fb7185", "glyph", ["Scripts", "Fonts", "Language"]],
  ["kbs", "KBS", "Knowledge Base System", "Organize Knowledge. Unlock Intelligence.", "Concepts, claims, evidence, search, graph traversal, and reusable knowledge capsules.", "Open KBS", "Graph", "#22c55e", "#86efac", "network", ["Graph", "Claims", "Search"]],
  ["investorhub", "INVESTORHUB", "Intelligence. Trust. Growth.", "Verify. Invest. Grow.", "Transparent due diligence, deal rooms, project capsules, funding signals, and investment evidence.", "Enter Hub", "Deals", "#60a5fa", "#22d3ee", "bars", ["Due Diligence", "Deals", "Trust"]],
  ["vaigyaaniq", "VAIGYAANIQ", "Science. Research. Discovery.", "Research Deeper. Discover Truth.", "AI-assisted research, data, scientific method, reproducible knowledge graphs, and explainable capsules.", "Open Lab", "Research", "#fb7185", "#a78bfa", "dna", ["Research", "Data", "Discovery"]],
  ["allb", "ALLB", "AI for Legal & Business", "Legal Intelligence. Business Clarity.", "Legal research, contracts, policies, compliance, and business logic represented as evidence-backed workflows.", "Open ALLB", "Tools", "#22d3ee", "#34d399", "scales", ["Legal", "Contracts", "Business"]],
  ["ayodhya", "AYODHYA AI", "Dharma. Heritage. Future.", "Preserve Heritage. Inspire Future.", "Culture, heritage, temples, pilgrimage, collections, and divine knowledge capsules.", "Explore Ayodhya", "Collections", "#f97316", "#fbbf24", "temple", ["Heritage", "Culture", "Dharma"]],
  ["themelab", "THEMELAB", "Design Systems. Experiences.", "Design Systems. Build Experiences.", "Theme generation, UI systems, brand kits, visual assets, and marketplace-ready design capsules.", "Open ThemeLab", "Systems", "#fbbf24", "#22d3ee", "ui", ["Themes", "Assets", "Market"]],
  ["braahmini", "BRAAHMINI", "Trust. Verification. Truth.", "Trust Everything. Verify Always.", "Authenticity, integrity, hashes, signatures, proofs, and tamper-aware evidence systems.", "Protocol", "Verify", "#60a5fa", "#34d399", "shield", ["Proof", "Signatures", "Anchoring"]],
  ["studio", "HKD STUDIO", "Create. Visualize. Ship.", "Build HKDs. No-Code. All-Powerful.", "Editor, graph, timeline, evidence view, validation view, and runtime preview in one studio.", "Open Studio", "Templates", "#a78bfa", "#22d3ee", "studio", ["Editor", "Graph", "Preview"]],
  ["runtimes", "HKD RUNTIMES", "Run Anything. Anywhere.", "Infinite Runtimes. One Standard.", "UI, logic, evidence, graph, sync, agent, shell, security, media, and offline runtime surfaces.", "Runtimes", "Registry", "#3b82f6", "#22d3ee", "portal", ["Execute", "Validate", "Export"]],
  ["evidence", "HKD EVIDENCE", "Evidence First. Always.", "Every Claim. Backed by Proof.", "Evidence libraries, provenance, validation, contradiction detection, and trust score surfaces.", "Evidence", "Library", "#22c55e", "#86efac", "document", ["Claims", "Proof", "Lineage"]],
  ["marketplace", "HKD MARKETPLACE", "Discover. Connect. Exchange.", "Build Together. Grow Together.", "Buy, sell, license, rate, fund, and distribute HKDs and runtime products.", "Marketplace", "Products", "#f97316", "#fbbf24", "market", ["Products", "Licensing", "Growth"]]
];

export const hkdHeroBanners: HkdHeroBanner[] = hkdHeroBannerRows.map(([key, title, subtitle, headline, description, primaryAction, secondaryAction, color, accent, shape, tags]) => ({
  key,
  title,
  subtitle,
  headline,
  description,
  primaryAction,
  secondaryAction,
  color,
  accent,
  shape,
  tags,
  status: "absorbed_scaffold",
  provenance: hkdHeroBannerProvenance
}));
