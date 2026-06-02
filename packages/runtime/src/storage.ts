export const storageArchitecture = {
  local: {
    database: "SQLite",
    url: "DATABASE_URL=file:./dev.db",
    use: "default local runtime, tests, offline archive"
  },
  optionalProduction: {
    database: "PostgreSQL",
    url: "DATABASE_URL=postgresql://...",
    use: "multi-user deployment; switch prisma datasource provider to postgresql in a production branch"
  },
  importFormats: ["JSON", "CSV", "Markdown", "HKD"],
  exportFormats: ["JSON", "CSV", "GraphML", "Markdown", "HKD"],
  packages: ["apps/web", "packages/graph", "packages/search", "packages/runtime", "packages/shared"]
} as const;
