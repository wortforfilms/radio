# Vaishviq Knowledge Runtime Folder Structure

```text
apps/web
  app/api/pitra
  app/api/guru-maataa
  app/api/rishi
  app/api/rishika
  app/api/subjects
  app/api/civilizations
  app/api/texts
  app/api/knowledge-graph
  app/api/timeline
  app/api/search
  app/api/analytics
  app/api/import
  app/api/export
  app/api/assistant
  app/dashboard
  app/admin
  app/lineage
packages/graph
  src/index.ts
packages/search
  src/index.ts
packages/runtime
  src/audit.ts
  src/db.ts
  src/exporters.ts
  src/importers.ts
  src/metrics.ts
  src/storage.ts
packages/shared
  src/phkd.ts
  src/taxonomy.ts
prisma
  schema.prisma
  seed.ts
  migrations/20260601000000_initial/migration.sql
tests
```

PHKD constraints:

- Unknown values are persisted as `NULL`.
- Seed datasets do not assert citations or verified lineage.
- `KnowledgeEdge` creation through the graph package fails closed unless `sourceCitation` is present and `verificationStatus` is `VERIFIED`.
- Audit actions support `created`, `updated`, `deleted`, `merged`, `cited`, and `verified`.
