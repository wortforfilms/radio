import type { NextRequest } from "next/server";
import { audit, validateAuditInput } from "@runtime/audit";
import { prisma } from "@runtime/db";
import { governanceAuditActions } from "@shared/governance";

function takeFrom(request: NextRequest) {
  const parsed = Number(request.nextUrl.searchParams.get("take") ?? 50);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 200) : 50;
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") ?? undefined;
  const entityType = request.nextUrl.searchParams.get("entityType") ?? undefined;
  const where = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {})
  };
  const [records, actionCounts] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: takeFrom(request),
      include: { user: true }
    }),
    Promise.all(governanceAuditActions.map(async (item) => ({
      action: item,
      count: await prisma.auditLog.count({ where: { action: item } })
    })))
  ]);

  return Response.json({
    phkd: {
      policy: "fail_closed",
      note: "Audit records are persisted evidence of local runtime actions. Absence of a record means the action remains NULL."
    },
    filters: { action: action ?? null, entityType: entityType ?? null },
    counts: Object.fromEntries(actionCounts.map((item) => [item.action, item.count])),
    records
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validateAuditInput(body);

  if (!validation.ok) {
    return Response.json({
      error: "PHKD_FAIL_CLOSED",
      messages: validation.errors,
      requirements: validation.requirements ?? null
    }, { status: 400 });
  }

  const record = await audit(prisma, body);
  return Response.json({
    phkd: {
      policy: "fail_closed",
      note: "Audit record created. Verification is still limited to the supplied citation and reviewer evidence."
    },
    record
  });
}
