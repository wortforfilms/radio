import { universeRegistry, type UniverseSlug } from "./universes";

export type UniverseSkeleton = {
  slug: UniverseSlug;
  title: string;
  archetype: string;
  nodeTypes: string[];
  edgeTypes: string[];
  views: string[];
  evidenceGates: string[];
  importers: string[];
  exporters: string[];
  hkdSections: string[];
};

type SkeletonSeed = Omit<UniverseSkeleton, "slug">;

const sharedEvidenceGates = [
  "unknown fields remain NULL",
  "lineage claims require supplied citation",
  "verification cannot be inferred from tradition label"
];

const skeletonSeeds: Record<UniverseSlug, SkeletonSeed> = {
  "universal-knowledge-lineage-explorer": {
    title: "Universal Knowledge Lineage Skeleton",
    archetype: "Cross-universe traversal shell for people, texts, places, subjects, time, and graph evidence.",
    nodeTypes: ["KnowledgeNode", "PersonNode", "TextNode", "LocationNode", "TimelineEvent", "EvidenceRecord"],
    edgeTypes: ["teacher_of", "student_of", "influenced", "authored", "translated", "preserved"],
    views: ["Node explorer", "Lineage explorer", "Influence explorer", "Timeline explorer", "Evidence center"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["identity", "graph", "timeline", "provenance", "audit"]
  },
  "pitra-universe": {
    title: "Pitra Continuity Skeleton",
    archetype: "Ancestral memory shell for gratitude, stewardship, inherited knowledge, and preservation duties.",
    nodeTypes: ["Pitra", "FamilyRecord", "RitualMemory", "Location", "PreservationNote"],
    edgeTypes: ["preserved", "continued", "belongs_to", "influenced"],
    views: ["Ancestor index", "Continuity map", "Place memory", "Preservation ledger"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "Markdown", "HKD"],
    hkdSections: ["identity", "ancestral-context", "provenance", "verification"]
  },
  "guru-maataa-universe": {
    title: "Guru Maataa Care-Lineage Skeleton",
    archetype: "Maternal teacher shell for guidance, learning care, ethical transmission, and mentorship context.",
    nodeTypes: ["GuruMaataa", "TeachingRecord", "CarePractice", "StudentCircle", "Institution"],
    edgeTypes: ["teacher_of", "student_of", "inspired", "preserved", "collaborated_with"],
    views: ["Teacher circle", "Care network", "Transmission map", "Guidance archive"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["identity", "teaching-context", "care-context", "audit"]
  },
  "rishi-universe": {
    title: "Rishi Knowledge Skeleton",
    archetype: "Rishi record shell for domains, attributed teachings, texts, and citation-bound lineage.",
    nodeTypes: ["Rishi", "KnowledgeDomain", "Text", "Lineage", "Citation"],
    edgeTypes: ["authored", "teacher_of", "student_of", "discovered", "influenced"],
    views: ["Rishi index", "Domain map", "Text associations", "Lineage gate"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["identity", "domains", "texts", "lineage", "citations"]
  },
  "rishika-universe": {
    title: "Rishika Authorship Skeleton",
    archetype: "Rishika shell for authored markers, subject links, commentary, and evidence-safe discovery.",
    nodeTypes: ["Rishika", "Text", "Subject", "Citation", "ResearchNote"],
    edgeTypes: ["authored", "inspired", "belongs_to", "preserved"],
    views: ["Rishika index", "Authorship map", "Subject bridge", "Citation review"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["identity", "authorship", "subjects", "provenance"]
  },
  "parampara-universe": {
    title: "Parampara Transmission Skeleton",
    archetype: "Tradition-chain shell for teacher-student continuity, institutional memory, and practice preservation.",
    nodeTypes: ["Lineage", "Teacher", "Student", "Practice", "Institution", "Citation"],
    edgeTypes: ["teacher_of", "student_of", "continued", "preserved", "belongs_to"],
    views: ["Lineage chain", "Transmission graph", "Practice ledger", "Institution map"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["lineage", "relationships", "institutions", "audit"]
  },
  "civilization-universe": {
    title: "Civilization Matrix Skeleton",
    archetype: "Civilizational taxonomy shell for regions, scripts, languages, literature, and continuity metrics.",
    nodeTypes: ["Civilization", "Religion", "Language", "Script", "Text", "Location"],
    edgeTypes: ["belongs_to", "influenced", "preserved", "translated"],
    views: ["Civilization explorer", "Religion explorer", "Script matrix", "Inscription map"],
    evidenceGates: [...sharedEvidenceGates, "scripts are associated with civilizations; ownership is not assumed"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["civilization", "language", "script", "literature", "locations"]
  },
  "knowledge-universe": {
    title: "Knowledge Node Skeleton",
    archetype: "Domain shell for nodes, discoveries, innovations, unknowns, and verification status.",
    nodeTypes: ["KnowledgeNode", "Discovery", "Innovation", "Subject", "Citation"],
    edgeTypes: ["discovered", "inspired", "continued", "belongs_to"],
    views: ["Knowledge atlas", "Discovery ledger", "Innovation chain", "Unknowns register"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["nodes", "domains", "discoveries", "verification"]
  },
  "subject-universe": {
    title: "Subject Taxonomy Skeleton",
    archetype: "Subject shell for taxonomy, prerequisites, learning pathways, and graph-scoped filtering.",
    nodeTypes: ["Subject", "Course", "KnowledgeDomain", "Text", "ResearchPaper"],
    edgeTypes: ["belongs_to", "continued", "influenced"],
    views: ["Subject tree", "Pathway explorer", "Course bridge", "Graph filter"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["taxonomy", "pathways", "texts", "courses"]
  },
  "text-universe": {
    title: "Text Provenance Skeleton",
    archetype: "Text shell for language, translation, authorship claims, manuscript context, and citation metadata.",
    nodeTypes: ["Text", "Language", "Script", "Translation", "Citation", "MediaAsset"],
    edgeTypes: ["authored", "translated", "preserved", "belongs_to"],
    views: ["Text catalog", "Translation map", "Script view", "Citation panel"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["text", "language", "translation", "citation", "media"]
  },
  "timeline-universe": {
    title: "Timeline Variance Skeleton",
    archetype: "Chronology shell for events, ranges, uncertainty, calendars, and time-aware lineage inspection.",
    nodeTypes: ["TimelineEvent", "Period", "CalendarSystem", "Location", "EvidenceRecord"],
    edgeTypes: ["continued", "influenced", "preserved", "belongs_to"],
    views: ["Timeline explorer", "Variance chart", "Event ledger", "Chronology audit"],
    evidenceGates: [...sharedEvidenceGates, "date uncertainty is preserved as ranges or NULL"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["events", "ranges", "calendar", "uncertainty"]
  },
  "geography-universe": {
    title: "Geography Context Skeleton",
    archetype: "Place shell for locations, institutions, regional traditions, and map-aware discovery.",
    nodeTypes: ["Location", "Institution", "Civilization", "Text", "MediaAsset"],
    edgeTypes: ["belongs_to", "founded", "preserved", "influenced"],
    views: ["Location explorer", "Institution map", "Regional lineage", "Geo evidence"],
    evidenceGates: [...sharedEvidenceGates, "coordinates remain NULL unless supplied"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["locations", "institutions", "regions", "coordinates"]
  },
  "knowledge-graph-universe": {
    title: "Knowledge Graph Skeleton",
    archetype: "Graph shell for nodes, typed relationships, traversal, lineage analytics, and fail-closed claims.",
    nodeTypes: ["KnowledgeNode", "KnowledgeEdge", "Relationship", "Lineage", "AuditLog"],
    edgeTypes: ["teacher_of", "student_of", "influenced", "inspired", "collaborated_with", "founded"],
    views: ["Node explorer", "Edge inspector", "Influence explorer", "Lineage analytics"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "GraphML", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["nodes", "edges", "relationships", "analytics", "audit"]
  },
  "education-universe": {
    title: "Education Pathway Skeleton",
    archetype: "Learning shell for courses, syllabi, institutions, lessons, and knowledge progression.",
    nodeTypes: ["Course", "Subject", "Institution", "Text", "Assessment"],
    edgeTypes: ["belongs_to", "continued", "inspired", "founded"],
    views: ["Course catalog", "Syllabus map", "Institution bridge", "Learning graph"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["courses", "syllabi", "institutions", "progression"]
  },
  "research-universe": {
    title: "Research Evidence Skeleton",
    archetype: "Research shell for papers, citations, discoveries, verification review, and evidence queues.",
    nodeTypes: ["ResearchPaper", "Citation", "Discovery", "Innovation", "ReviewerNote"],
    edgeTypes: ["authored", "cited", "discovered", "inspired", "collaborated_with"],
    views: ["Paper catalog", "Citation count", "Verification queue", "Discovery review"],
    evidenceGates: [...sharedEvidenceGates, "citation count derives only from stored citations"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["papers", "citations", "reviews", "discoveries"]
  },
  "community-universe": {
    title: "Community Stewardship Skeleton",
    archetype: "Participation shell for contributors, collaboration records, moderation, and stewardship audit trails.",
    nodeTypes: ["User", "Community", "Contribution", "AuditLog", "Institution"],
    edgeTypes: ["collaborated_with", "preserved", "founded", "belongs_to"],
    views: ["Contributor graph", "Collaboration ledger", "Stewardship board", "Audit trail"],
    evidenceGates: sharedEvidenceGates,
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["contributors", "collaboration", "moderation", "audit"]
  },
  "media-universe": {
    title: "Media Provenance Skeleton",
    archetype: "Asset shell for media files, source paths, checksums, captions, and cultural memory surfaces.",
    nodeTypes: ["MediaAsset", "Text", "Location", "Creator", "ChecksumRecord"],
    edgeTypes: ["authored", "preserved", "belongs_to", "inspired"],
    views: ["Asset browser", "Source ledger", "Caption queue", "Checksum review"],
    evidenceGates: [...sharedEvidenceGates, "asset quality is not claimed without evidence"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["assets", "sources", "checksums", "captions"]
  },
  "ai-universe": {
    title: "AI Assistant Guardrail Skeleton",
    archetype: "Assistant shell for retrieval-only answers, citation boundaries, refusal logic, and auditability.",
    nodeTypes: ["AssistantQuery", "RetrievedContext", "Citation", "AuditLog", "KnowledgeNode"],
    edgeTypes: ["cited", "belongs_to", "inspired"],
    views: ["Assistant console", "Retrieval trace", "Citation panel", "Refusal log"],
    evidenceGates: [...sharedEvidenceGates, "assistant output cannot promote unverified claims"],
    importers: ["JSON", "Markdown", "HKD"],
    exporters: ["JSON", "Markdown", "HKD"],
    hkdSections: ["query", "retrieval", "citations", "guardrails", "audit"]
  },
  "observatory-universe": {
    title: "Observatory Metrics Skeleton",
    archetype: "Metrics shell for node counts, edge counts, verification state, citations, and runtime health.",
    nodeTypes: ["Metric", "AuditLog", "VerificationStatus", "RuntimeSurface", "Report"],
    edgeTypes: ["belongs_to", "continued", "preserved"],
    views: ["Metrics dashboard", "Verification chart", "Citation count", "Runtime health"],
    evidenceGates: [...sharedEvidenceGates, "counts derive from persisted records only"],
    importers: ["JSON", "HKD"],
    exporters: ["JSON", "Markdown", "HKD"],
    hkdSections: ["metrics", "health", "verification", "reports"]
  },
  "future-knowledge-universe": {
    title: "Future Knowledge Unknowns Skeleton",
    archetype: "Future-facing shell for hypotheses, unknown horizons, blocked evidence, and explicit non-claims.",
    nodeTypes: ["Unknown", "Hypothesis", "ResearchQuestion", "EvidenceGap", "AuditLog"],
    edgeTypes: ["inspired", "continued", "belongs_to"],
    views: ["Unknowns register", "Hypothesis board", "Evidence gap map", "Future horizon"],
    evidenceGates: [...sharedEvidenceGates, "future statements remain draft until verified evidence exists"],
    importers: ["JSON", "Markdown", "HKD"],
    exporters: ["JSON", "Markdown", "HKD"],
    hkdSections: ["unknowns", "hypotheses", "evidence-gaps", "status"]
  },
  "governance-universe": {
    title: "Governance Audit Skeleton",
    archetype: "Policy shell for audit logs, merge decisions, verification actions, and enforcement records.",
    nodeTypes: ["AuditLog", "Policy", "VerificationAction", "MergeDecision", "User"],
    edgeTypes: ["verified", "merged", "preserved", "belongs_to"],
    views: ["Audit log", "Verification queue", "Merge ledger", "Policy matrix"],
    evidenceGates: [...sharedEvidenceGates, "manual override requires explicit audit record"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "Markdown", "HKD"],
    hkdSections: ["audit", "policy", "verification", "merge-decisions"]
  },
  "universal-command-center": {
    title: "Universal Command Center Skeleton",
    archetype: "Operations shell for admin surfaces, imports, exports, search, analytics, and runtime control.",
    nodeTypes: ["RuntimeSurface", "ImportJob", "ExportJob", "SearchIndex", "AuditLog"],
    edgeTypes: ["belongs_to", "continued", "preserved"],
    views: ["Admin panel", "Import wizard", "Export center", "Analytics cockpit", "Search console"],
    evidenceGates: [...sharedEvidenceGates, "destructive actions require audit confirmation"],
    importers: ["JSON", "CSV", "Markdown", "HKD"],
    exporters: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
    hkdSections: ["admin", "import-export", "search", "analytics", "audit"]
  }
};

export const universeSkeletons = universeRegistry.map((universe) => ({
  slug: universe.slug,
  ...skeletonSeeds[universe.slug]
})) satisfies UniverseSkeleton[];

export function getUniverseSkeleton(slug: string) {
  return universeSkeletons.find((skeleton) => skeleton.slug === slug);
}
