import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@runtime/db";
import { searchKnowledge } from "@search/index";
import { getExplorerGraph } from "@graph/index";
import { getObservatoryMetrics } from "@runtime/metrics";

export function ok(data: unknown) {
  return NextResponse.json(data);
}

export async function list(model: keyof typeof prisma, args?: unknown) {
  const delegate = prisma[model] as { findMany(input?: unknown): Promise<unknown> };
  return ok(await delegate.findMany(args));
}

export async function create(model: keyof typeof prisma, request: NextRequest) {
  const body = await request.json();
  const delegate = prisma[model] as { create(input: unknown): Promise<unknown> };
  return ok(await delegate.create({ data: body }));
}

export function searchParams(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}

export async function searchRoute(request: NextRequest) {
  return ok(await searchKnowledge(prisma, searchParams(request)));
}

export async function graphRoute(request: NextRequest) {
  const params = searchParams(request) as { type?: string; nodeId?: string };
  return ok(await getExplorerGraph(prisma, { type: params.type, nodeId: params.nodeId }));
}

export async function analyticsRoute() {
  return ok(await getObservatoryMetrics(prisma));
}
