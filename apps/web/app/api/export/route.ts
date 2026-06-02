import type { NextRequest } from "next/server";
import { exportCsv, exportGraphMl, exportHkd, exportJson, exportMarkdown } from "@runtime/exporters";
import { prisma } from "@runtime/db";
import { getPersistenceScope } from "@shared/persistence-scopes";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const scope = request.nextUrl.searchParams.get("scope") ?? "all";
  const exportScope = getPersistenceScope(scope);

  if (!exportScope) {
    return Response.json({ error: `Unknown persistence scope: ${scope}` }, { status: 400 });
  }

  const body =
    format === "csv"
      ? await exportCsv(prisma, { scope })
      : format === "graphml"
        ? await exportGraphMl(prisma)
        : format === "markdown"
          ? await exportMarkdown(prisma, { scope })
          : format === "hkd"
            ? await exportHkd(prisma, { scope })
            : await exportJson(prisma, { scope });

  const contentType =
    format === "csv"
      ? "text/csv"
      : format === "graphml"
        ? "application/graphml+xml"
        : format === "hkd"
          ? "application/x-hkd; charset=utf-8"
        : format === "json"
          ? "application/json"
          : "text/plain";

  const extension = format === "markdown" ? "md" : format === "graphml" ? "graphml" : format;

  return new Response(body, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${exportScope.key}.${extension}"`
    }
  });
}
