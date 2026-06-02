import { parse } from "csv-parse/sync";
import type { PrismaClient } from "@prisma/client";

export async function importJsonNodes(prisma: PrismaClient, json: string, provenanceNote: string) {
  const rows = JSON.parse(json) as Array<{ type: string; label: string; summary?: string; sourceCitation?: string | null }>;
  return Promise.all(
    rows.map((row) =>
      prisma.knowledgeNode.create({
        data: {
          type: row.type as never,
          label: row.label,
          summary: row.summary ?? null,
          sourceCitation: row.sourceCitation ?? null,
          provenanceNote,
          verificationStatus: row.sourceCitation ? "UNVERIFIED" : "UNKNOWN"
        }
      })
    )
  );
}

export async function importCsvNodes(prisma: PrismaClient, csv: string, provenanceNote: string) {
  const records = parse(csv, { columns: true, skip_empty_lines: true }) as Array<Record<string, string>>;
  return importJsonNodes(prisma, JSON.stringify(records), provenanceNote);
}

export function importMarkdownDocument(markdown: string) {
  const title = markdown.split(/\r?\n/).find((line) => line.startsWith("# "))?.replace(/^#\s+/, "") ?? null;
  return { title, contentMarkdown: markdown };
}

export function importHkdDocument(hkd: string) {
  return {
    format: "HKD",
    contentMarkdown: hkd,
    claims: hkd.match(/^claim:\s*(.+)$/gim)?.map((line) => line.replace(/^claim:\s*/i, "")) ?? []
  };
}
