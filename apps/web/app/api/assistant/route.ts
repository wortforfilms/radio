import type { NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import { searchKnowledge } from "@search/index";
import { ok } from "../_lib";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { question?: string };
  const q = body.question?.trim() ?? "";
  const evidence = await searchKnowledge(prisma, { q });

  return ok({
    mode: "retrieval_only",
    answer: null,
    phkd: "No generative claim is produced by this endpoint. Use returned records as evidence context only.",
    evidence
  });
}
