import type { PrismaClient } from "@prisma/client";
import { getPersistenceScope } from "@shared/persistence-scopes";

type ExportOptions = {
  scope?: string | null;
};

export async function exportJson(prisma: PrismaClient, options: ExportOptions = {}) {
  return JSON.stringify(await collectScope(prisma, options.scope), null, 2);
}

export async function exportCsv(prisma: PrismaClient, options: ExportOptions = {}) {
  const exportScope = await collectScope(prisma, options.scope);
  const rows = [
    ["scope", "entityType", "id", "label", "verificationStatus", "sourceCitation"],
    ...exportScope.records.map((record) => [
      exportScope.scope.key,
      record.entityType,
      record.id,
      record.label,
      record.verificationStatus,
      record.sourceCitation ?? "NULL"
    ])
  ];
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

export async function exportGraphMl(prisma: PrismaClient) {
  const [nodes, edges] = await Promise.all([prisma.knowledgeNode.findMany(), prisma.knowledgeEdge.findMany()]);
  return `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph id="VaishviqKnowledgeGraph" edgedefault="directed">
${nodes.map((n) => `    <node id="${n.id}"><data key="label">${escapeXml(n.label)}</data><data key="type">${n.type}</data></node>`).join("\n")}
${edges.map((e) => `    <edge id="${e.id}" source="${e.fromNodeId}" target="${e.toNodeId}"><data key="type">${e.type}</data></edge>`).join("\n")}
  </graph>
</graphml>`;
}

export async function exportMarkdown(prisma: PrismaClient, options: ExportOptions = {}) {
  const exportScope = await collectScope(prisma, options.scope);
  return [
    `# ${exportScope.scope.label} Persistence Export`,
    "",
    `- Scope: ${exportScope.scope.key}`,
    `- Format: Markdown`,
    `- Records: ${exportScope.records.length}`,
    "",
    ...exportScope.records.map(
      (record) =>
        `## ${record.label}\n\n- Entity: ${record.entityType}\n- ID: ${record.id}\n- Verification: ${record.verificationStatus}\n- Citation: ${record.sourceCitation ?? "NULL"}\n- Provenance: ${record.provenanceNote ?? "NULL"}`
    )
  ].join("\n");
}

export async function exportHkd(prisma: PrismaClient, options: ExportOptions = {}) {
  const exportScope = await collectScope(prisma, options.scope);
  return [
    "hkd: vaishviq.persistence.scope",
    `scope: ${exportScope.scope.key}`,
    `label: ${exportScope.scope.label}`,
    "format: .hkd",
    `records: ${exportScope.records.length}`,
    "phkd: fail_closed",
    "",
    ...exportScope.records.map((record) =>
      [
        "---",
        `entity: ${record.entityType}`,
        `id: ${record.id}`,
        `label: ${record.label}`,
        `verification: ${record.verificationStatus}`,
        `citation: ${record.sourceCitation ?? "NULL"}`,
        `provenance: ${record.provenanceNote ?? "NULL"}`
      ].join("\n")
    )
  ].join("\n");
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

async function collectScope(prisma: PrismaClient, key?: string | null) {
  const scope = getPersistenceScope(key) ?? getPersistenceScope("all");
  if (!scope) {
    throw new Error("No persistence scopes are registered.");
  }

  if (!scope.model) {
    const [nodes, edges] = await Promise.all([prisma.knowledgeNode.findMany(), prisma.knowledgeEdge.findMany()]);
    return {
      scope,
      records: [
        ...nodes.map((node) => normalizeRecord("KnowledgeNode", node.id, node.label, node)),
        ...edges.map((edge) => normalizeRecord("KnowledgeEdge", edge.id, edge.label ?? edge.type, edge))
      ]
    };
  }

  const delegate = prisma[scope.model as keyof typeof prisma] as {
    findMany(input?: unknown): Promise<Array<Record<string, unknown>>>;
  };
  const rows = await delegate.findMany();
  return {
    scope,
    records: rows.map((row) => normalizeRecord(scope.model ?? "record", String(row.id), labelFor(row), row))
  };
}

function normalizeRecord(entityType: string, id: string, label: string, row: Record<string, unknown>) {
  return {
    entityType,
    id,
    label,
    verificationStatus: String(row.verificationStatus ?? "UNKNOWN"),
    sourceCitation: row.sourceCitation === undefined || row.sourceCitation === null ? null : String(row.sourceCitation),
    provenanceNote: row.provenanceNote === undefined || row.provenanceNote === null ? null : String(row.provenanceNote)
  };
}

function labelFor(row: Record<string, unknown>) {
  const value = row.label ?? row.name ?? row.title ?? row.headword ?? row.key ?? row.action ?? row.id;
  return String(value ?? "NULL");
}
