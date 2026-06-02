import type { NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import { ok } from "../_lib";

function readPayload(payload: string | null) {
  if (!payload) {
    return {};
  }

  try {
    const parsed = JSON.parse(payload) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const sourceDictionary = request.nextUrl.searchParams.get("sourceDictionary")?.trim();
  const includeScripts = request.nextUrl.searchParams.get("includeScripts") === "true";

  const entries = await prisma.sanskritLexeme.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { headword: { contains: q } },
              { transliteration: { contains: q } },
              { normalizedHeadword: { contains: q.toLowerCase() } },
              { definition: { contains: q } }
            ]
          }
        : {}),
      ...(sourceDictionary ? { sourceDictionary } : {})
    },
    include: {
      language: true,
      node: true
    },
    orderBy: [{ normalizedHeadword: "asc" }, { sourceDictionary: "asc" }],
    take: 100
  });

  if (!includeScripts) {
    return ok({ entries });
  }

  const scriptNodes = await prisma.knowledgeNode.findMany({
    where: {
      id: {
        startsWith: "SCRIPT:ISO15924:"
      }
    },
    orderBy: {
      label: "asc"
    },
    take: 426
  });
  const scriptRegistry = scriptNodes.map((node) => {
    const payload = readPayload(node.payload);
    return {
      id: node.id,
      label: node.label,
      sourceCitation: node.sourceCitation,
      verificationStatus: node.verificationStatus,
      code: payload.code ?? null,
      numeric: payload.numeric ?? null,
      pva: payload.pva ?? null,
      unicodeVersion: payload.unicodeVersion ?? null,
      date: payload.date ?? null,
      requestedCapacity: payload.requestedCapacity ?? 426
    };
  });

  return ok({
    entries,
    scriptRegistry,
    scriptRegistrySummary: {
      sourced: scriptRegistry.length,
      requested: scriptRegistry[0]?.requestedCapacity ?? 426
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.headword || !body?.normalizedHeadword || !body?.sourceDictionary || !body?.sourceCitation) {
    return Response.json(
      {
        error: "headword, normalizedHeadword, sourceDictionary, and sourceCitation are required. Dictionary entries fail closed without provenance."
      },
      { status: 400 }
    );
  }

  const entry = await prisma.sanskritLexeme.create({
    data: {
      headword: body.headword,
      transliteration: body.transliteration ?? null,
      normalizedHeadword: body.normalizedHeadword,
      sourceDictionary: body.sourceDictionary,
      definition: body.definition ?? null,
      partOfSpeech: body.partOfSpeech ?? null,
      languageId: body.languageId ?? null,
      provenanceNote: body.provenanceNote ?? "User-created dictionary entry. Verification requires citation review.",
      sourceCitation: body.sourceCitation,
      verificationStatus: "UNVERIFIED"
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "created",
      entityType: "SanskritLexeme",
      entityId: entry.id,
      reason: "Created Sanskrit dictionary entry through API. Record remains UNVERIFIED until citation review.",
      citation: entry.sourceCitation
    }
  });

  return ok(entry);
}
