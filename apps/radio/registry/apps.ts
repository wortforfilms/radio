// Multi-app workspace registry. One root registry describes every product;
// app-level registries (like this Radio one) own their route prefixes.
// Statuses are evidence-backed: only Radio is a standalone product today;
// Lipi/Maataa/Corpus exist as umbrella-app modules; the rest are planned.
import type { WorkspaceApp } from "./types.ts";

export const workspaceApps: WorkspaceApp[] = [
  {
    id: "radio",
    name: "Radio Vaigyaaniq",
    description: "Online/offline science radio with rights-aware commerce.",
    status: "built",
    implementedBy: ["apps/radio", "apps/web/app/radio", "apps/radio-backend"],
    routePrefixes: ["public", "radio", "premium", "user", "search", "admin", "cms", "studio", "analytics", "api"]
  },
  {
    id: "nlm",
    name: "NLM",
    description: "National Library of Music integration.",
    status: "planned",
    implementedBy: [],
    routePrefixes: ["ecosystem.nlm"]
  },
  {
    id: "cic",
    name: "CIC Communicator",
    description: "Communicator product lane.",
    status: "planned",
    implementedBy: [],
    routePrefixes: ["ecosystem.cic"]
  },
  {
    id: "lipi",
    name: "Lipi",
    description: "Script/civilisation explorer (exists as umbrella-app module).",
    status: "partial",
    implementedBy: ["apps/web/app/lipi", "lipi/civilizations"],
    routePrefixes: ["ecosystem.lipi"]
  },
  {
    id: "corpus",
    name: "Corpus",
    description: "Reference corpus (exists as shared package).",
    status: "partial",
    implementedBy: ["packages/shared/src/reference-corpus.ts"],
    routePrefixes: ["ecosystem.corpus"]
  },
  {
    id: "shree-kautilya",
    name: "Shree Kautilya",
    description: "Kautilya product lane.",
    status: "planned",
    implementedBy: [],
    routePrefixes: ["ecosystem.shree-kautilya"]
  },
  {
    id: "maataa",
    name: "Maataa UI",
    description: "Guru-Maataa surface (exists as umbrella API module).",
    status: "partial",
    implementedBy: ["apps/web/app/api/guru-maataa"],
    routePrefixes: ["ecosystem.maataa"]
  },
  {
    id: "academy",
    name: "Academy",
    description: "Courses, quizzes, certificates (flag-gated section).",
    status: "planned",
    implementedBy: [],
    routePrefixes: ["academy"]
  },
  {
    id: "investors-hub",
    name: "Investors Hub",
    description: "Future investor-facing product.",
    status: "planned",
    implementedBy: [],
    routePrefixes: []
  }
];
