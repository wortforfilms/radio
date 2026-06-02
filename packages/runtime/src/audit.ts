import type { PrismaClient } from "@prisma/client";

type AuditAction = "created" | "updated" | "deleted" | "merged" | "cited" | "verified";

type AuditInput = {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  citation?: string | null;
};

export async function audit(prisma: PrismaClient, input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      before: input.before === undefined ? undefined : JSON.stringify(input.before),
      after: input.after === undefined ? undefined : JSON.stringify(input.after),
      reason: input.reason ?? null,
      citation: input.citation ?? null
    }
  });
}
