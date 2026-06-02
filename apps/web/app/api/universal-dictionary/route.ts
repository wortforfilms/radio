import type { NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import {
  filterUniversalDictionaryEntries,
  getUniversalDictionaryStaticEntries,
  universalDictionaryPhkdNote,
  type UniversalDictionaryEntry
} from "@shared/universal-dictionary";

function readVerificationStatus(status: string): UniversalDictionaryEntry["verificationStatus"] {
  return ["UNKNOWN", "UNVERIFIED", "VERIFIED", "DISPUTED", "REJECTED"].includes(status)
    ? (status as UniversalDictionaryEntry["verificationStatus"])
    : "UNKNOWN";
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const sanskritLexemes = await prisma.sanskritLexeme.findMany({
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
    include: { language: true },
    orderBy: [{ normalizedHeadword: "asc" }, { sourceDictionary: "asc" }],
    take: 100
  });

  const lexemeEntries: UniversalDictionaryEntry[] = sanskritLexemes.map((entry) => ({
    id: `lexeme:${entry.id}`,
    term: entry.headword,
    category: "lexeme",
    language: entry.language?.name ?? "Sanskrit",
    location: "Indian Subcontinent",
    tradition: null,
    definition: entry.definition ?? "NULL",
    sourceCitation: entry.sourceCitation,
    verificationStatus: readVerificationStatus(entry.verificationStatus),
    phkdNote: entry.provenanceNote ?? universalDictionaryPhkdNote,
    transliteration: entry.transliteration
  }));

  const staticEntries = filterUniversalDictionaryEntries(getUniversalDictionaryStaticEntries(), q);
  const entries = [...lexemeEntries, ...staticEntries];

  return Response.json({
    phkd: universalDictionaryPhkdNote,
    query: q ?? null,
    counts: {
      total: entries.length,
      lexeme: entries.filter((entry) => entry.category === "lexeme").length,
      script: entries.filter((entry) => entry.category === "script").length,
      text: entries.filter((entry) => entry.category === "text").length,
      lipi: entries.filter((entry) => entry.category === "lipi").length
    },
    entries
  });
}
