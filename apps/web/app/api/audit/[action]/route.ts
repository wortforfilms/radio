import type { NextRequest } from "next/server";
import { audit, validateAuditInput } from "@runtime/audit";
import { prisma } from "@runtime/db";
import { getGovernanceActionRequirements, isGovernanceAuditAction } from "@shared/governance";

type RouteProps = {
  params: Promise<{ action: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { action } = await params;
  if (!isGovernanceAuditAction(action)) {
    return Response.json({ error: "Unknown audit action", action }, { status: 404 });
  }

  const take = Math.min(Math.max(Number(request.nextUrl.searchParams.get("take") ?? 50), 1), 200);
  const records = await prisma.auditLog.findMany({
    where: { action },
    orderBy: { createdAt: "desc" },
    take,
    include: { user: true }
  });

  return Response.json({
    action,
    requirements: getGovernanceActionRequirements(action),
    counts: { records: records.length },
    records
  });
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const { action } = await params;
  if (!isGovernanceAuditAction(action)) {
    return Response.json({ error: "Unknown audit action", action }, { status: 404 });
  }

  const body = await request.json();
  const input = { ...body, action };
  const validation = validateAuditInput(input);

  if (!validation.ok) {
    return Response.json({
      error: "PHKD_FAIL_CLOSED",
      messages: validation.errors,
      requirements: validation.requirements ?? getGovernanceActionRequirements(action)
    }, { status: 400 });
  }

  return Response.json({
    phkd: {
      policy: "fail_closed",
      note: `${action} audit record created from focused endpoint.`
    },
    record: await audit(prisma, input)
  });
}
