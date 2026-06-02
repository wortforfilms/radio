import type { NextRequest } from "next/server";
import { graphRoute } from "../_lib";
import { prisma } from "@runtime/db";
import { createVerifiedEdge } from "@graph/index";
import { ok } from "../_lib";

export async function GET(request: NextRequest) {
  return graphRoute(request);
}

export async function POST(request: NextRequest) {
  return ok(await createVerifiedEdge(prisma, await request.json()));
}
