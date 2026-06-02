import type { NextRequest } from "next/server";
import { importCsvNodes, importHkdDocument, importJsonNodes, importMarkdownDocument } from "@runtime/importers";
import { prisma } from "@runtime/db";
import { ok } from "../_lib";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const provenanceNote = request.headers.get("x-provenance-note") ?? "Imported document; verification pending.";
  const raw = await request.text();

  if (contentType.includes("json")) return ok(await importJsonNodes(prisma, raw, provenanceNote));
  if (contentType.includes("csv")) return ok(await importCsvNodes(prisma, raw, provenanceNote));
  if (contentType.includes("x-hkd")) return ok(importHkdDocument(raw));
  return ok(importMarkdownDocument(raw));
}
