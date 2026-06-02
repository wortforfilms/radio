import type { PrismaClient } from "@prisma/client";
import { assertVerifiableLineageClaim } from "@shared/phkd";

export async function createVerifiedEdge(prisma: PrismaClient, input: unknown) {
  const claim = assertVerifiableLineageClaim(input);
  return prisma.knowledgeEdge.create({
    data: {
      type: claim.type,
      fromNodeId: claim.fromNodeId,
      toNodeId: claim.toNodeId,
      sourceCitation: claim.sourceCitation,
      provenanceNote: claim.provenanceNote ?? null,
      verificationStatus: claim.verificationStatus
    }
  });
}

export async function getExplorerGraph(prisma: PrismaClient, filter?: { type?: string; nodeId?: string }) {
  const edgeWhere = {
    ...(filter?.type ? { type: filter.type } : {}),
    ...(filter?.nodeId ? { OR: [{ fromNodeId: filter.nodeId }, { toNodeId: filter.nodeId }] } : {})
  };

  const [nodes, edges] = await Promise.all([
    prisma.knowledgeNode.findMany({ orderBy: { label: "asc" }, take: 500 }),
    prisma.knowledgeEdge.findMany({ where: edgeWhere, orderBy: { createdAt: "desc" }, take: 1000 })
  ]);

  return { nodes, edges };
}

export async function traceLineage(prisma: PrismaClient, rootNodeId: string, maxDepth = 6) {
  const visited = new Set<string>();
  const levels: Array<{ depth: number; nodeId: string }> = [{ depth: 0, nodeId: rootNodeId }];
  const edges = [];

  for (const item of levels) {
    if (item.depth >= maxDepth || visited.has(item.nodeId)) continue;
    visited.add(item.nodeId);
    const outgoing = await prisma.knowledgeEdge.findMany({
      where: { fromNodeId: item.nodeId, type: { in: ["teacher_of", "student_of", "continued", "preserved"] } }
    });
    edges.push(...outgoing);
    for (const edge of outgoing) levels.push({ depth: item.depth + 1, nodeId: edge.toNodeId });
  }

  return { rootNodeId, visited: [...visited], edges };
}
