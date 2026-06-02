import type { PrismaClient } from "@prisma/client";

export type SearchFilters = {
  q?: string;
  subjectId?: string;
  civilizationId?: string;
  languageId?: string;
  verificationStatus?: "UNKNOWN" | "UNVERIFIED" | "VERIFIED" | "DISPUTED" | "REJECTED";
};

export async function searchKnowledge(prisma: PrismaClient, filters: SearchFilters) {
  const q = filters.q?.trim();
  const nodeWhere = {
    ...(q ? { OR: [{ label: { contains: q } }, { summary: { contains: q } }, { provenanceNote: { contains: q } }] } : {}),
    ...(filters.verificationStatus ? { verificationStatus: filters.verificationStatus } : {})
  };

  const [nodes, texts, subjects, civilizations, sanskritLexemes] = await Promise.all([
    prisma.knowledgeNode.findMany({ where: nodeWhere, take: 50, orderBy: { updatedAt: "desc" } }),
    prisma.text.findMany({
      where: {
        ...(q ? { OR: [{ title: { contains: q } }, { summary: { contains: q } }, { contentMarkdown: { contains: q } }] } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.civilizationId ? { civilizationId: filters.civilizationId } : {}),
        ...(filters.languageId ? { languageId: filters.languageId } : {})
      },
      take: 50
    }),
    prisma.subject.findMany({ where: q ? { name: { contains: q } } : {}, take: 50 }),
    prisma.civilization.findMany({ where: q ? { name: { contains: q } } : {}, take: 50 }),
    prisma.sanskritLexeme.findMany({
      where: q
        ? {
            OR: [
              { headword: { contains: q } },
              { transliteration: { contains: q } },
              { normalizedHeadword: { contains: q.toLowerCase() } },
              { definition: { contains: q } }
            ]
          }
        : {},
      take: 50,
      orderBy: { normalizedHeadword: "asc" }
    })
  ]);

  return { nodes, texts, subjects, civilizations, sanskritLexemes };
}
