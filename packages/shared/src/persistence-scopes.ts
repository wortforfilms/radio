import { universeRegistry } from "./universes";

export type PersistenceFormat = "json" | "csv" | "graphml" | "markdown" | "hkd";

export type PersistenceScope = {
  key: string;
  label: string;
  model: string | null;
  description: string;
  formats: PersistenceFormat[];
};

export type PersistenceScopeLanding = {
  features: string[];
  usps: string[];
  hkdSection: {
    title: string;
    description: string;
    exportPath: string;
    jsonPath: string;
    markdownPath: string;
  };
};

const allFormats: PersistenceFormat[] = ["json", "csv", "graphml", "markdown", "hkd"];

const modelScopes: PersistenceScope[] = [
  { key: "all", label: "Complete Runtime", model: null, description: "All graph nodes and graph edges.", formats: allFormats },
  { key: "pitra", label: "Pitra", model: "pitra", description: "Pitra records with provenance.", formats: allFormats },
  { key: "guru-maataa", label: "Guru Maataa", model: "guruMaataa", description: "Guru Maataa records with provenance.", formats: allFormats },
  { key: "rishi", label: "Rishi", model: "rishi", description: "Rishi records with provenance.", formats: allFormats },
  { key: "rishika", label: "Rishika", model: "rishika", description: "Rishika records with provenance.", formats: allFormats },
  { key: "civilizations", label: "Civilizations", model: "civilization", description: "Civilization taxonomy records.", formats: allFormats },
  { key: "subjects", label: "Subjects", model: "subject", description: "Subject taxonomy records.", formats: allFormats },
  { key: "texts", label: "Texts", model: "text", description: "Text records and source references.", formats: allFormats },
  { key: "timeline", label: "Timeline", model: "timelineEvent", description: "Timeline event records.", formats: allFormats },
  { key: "locations", label: "Geography", model: "location", description: "Location and geography records.", formats: allFormats },
  { key: "institutions", label: "Institutions", model: "institution", description: "Institution records.", formats: allFormats },
  { key: "discoveries", label: "Discoveries", model: "discovery", description: "Discovery records.", formats: allFormats },
  { key: "innovations", label: "Innovations", model: "innovation", description: "Innovation records.", formats: allFormats },
  { key: "media", label: "Media", model: "mediaAsset", description: "Media asset records.", formats: allFormats },
  { key: "research", label: "Research", model: "researchPaper", description: "Research paper records.", formats: allFormats },
  { key: "courses", label: "Courses", model: "course", description: "Course and syllabus records.", formats: allFormats },
  { key: "lineages", label: "Lineages", model: "lineage", description: "Lineage container records.", formats: allFormats },
  { key: "relationships", label: "Relationships", model: "relationship", description: "Relationship taxonomy records.", formats: allFormats },
  { key: "audit", label: "Audit Logs", model: "auditLog", description: "Audit action records.", formats: allFormats },
  { key: "sanskrit-dictionary", label: "Sanskrit Dictionary", model: "sanskritLexeme", description: "Sanskrit lexeme records.", formats: allFormats }
];

const universeScopeModels: Record<string, string | null> = {
  "pitra-universe": "pitra",
  "guru-maataa-universe": "guruMaataa",
  "rishi-universe": "rishi",
  "rishika-universe": "rishika",
  "civilization-universe": "civilization",
  "subject-universe": "subject",
  "text-universe": "text",
  "timeline-universe": "timelineEvent",
  "geography-universe": "location",
  "knowledge-graph-universe": null,
  "governance-universe": "auditLog",
  "education-universe": "course",
  "research-universe": "researchPaper",
  "media-universe": "mediaAsset",
  "parampara-universe": "lineage"
};

const universeScopes = universeRegistry.map((universe): PersistenceScope => ({
  key: universe.slug,
  label: universe.name,
  model: universeScopeModels[universe.slug] ?? null,
  description: universe.focus,
  formats: allFormats
}));

export const persistenceScopes = [...modelScopes, ...universeScopes] as const;

export function getPersistenceScope(key: string | null | undefined) {
  if (!key) return persistenceScopes.find((scope) => scope.key === "all") ?? persistenceScopes[0];
  return persistenceScopes.find((scope) => scope.key === key);
}

export function getPersistenceScopeLanding(scope: PersistenceScope): PersistenceScopeLanding {
  const modelLabel = scope.model ? readableModel(scope.model) : "graph runtime";
  return {
    features: [
      `Typed ${modelLabel} persistence with nullable unknown fields.`,
      "Source citation, provenance note, and verification status preserved on export.",
      "Search, analytics, and graph traversal can reference this scope without creating new claims.",
      "Import/export pathways support JSON, CSV, Markdown, GraphML where relevant, and HKD."
    ],
    usps: [
      "PHKD fail-closed semantics: unknowns stay NULL and unverifiable claims stay unpromoted.",
      "Scope-aware archival format: download only this universe/model or the complete runtime.",
      "Audit-ready handoff: exported records keep citations and provenance visible.",
      "Production-grade extension point: the same scope key works across UI, API, and storage."
    ],
    hkdSection: {
      title: `${scope.label} .hkd Archive`,
      description: `.hkd exports this scope as a plain-text persistence artifact with entity ids, labels, verification status, citations, provenance, and fail-closed PHKD metadata.`,
      exportPath: `/api/export?format=hkd&scope=${scope.key}`,
      jsonPath: `/api/export?format=json&scope=${scope.key}`,
      markdownPath: `/api/export?format=markdown&scope=${scope.key}`
    }
  };
}

function readableModel(model: string) {
  return model.replace(/([A-Z])/g, " $1").toLowerCase();
}
