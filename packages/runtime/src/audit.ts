import type { PrismaClient } from "@prisma/client";
import {
  getGovernanceActionRequirements,
  governanceAuditActions,
  isGovernanceAuditAction,
  type GovernanceAuditAction
} from "@shared/governance";

export type AuditAction = GovernanceAuditAction;

export type AuditInput = {
  action: AuditAction | string;
  entityType: string;
  entityId: string;
  userId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  citation?: string | null;
  reviewer?: string | null;
  reviewedAt?: string | null;
};

export function validateAuditInput(input: AuditInput) {
  const errors: string[] = [];
  if (!isGovernanceAuditAction(input.action)) {
    errors.push(`action must be one of: ${governanceAuditActions.join(", ")}`);
    return { ok: false, errors, action: null };
  }

  const requirements = getGovernanceActionRequirements(input.action);
  if (!input.entityType?.trim()) errors.push("entityType is required");
  if (!input.entityId?.trim()) errors.push("entityId is required");
  if (requirements.required.includes("citation") && !input.citation?.trim()) errors.push("citation is required");
  if (requirements.required.includes("reviewer") && !input.reviewer?.trim()) errors.push("reviewer is required");
  if (requirements.required.includes("reviewedAt") && !input.reviewedAt?.trim()) errors.push("reviewedAt is required");
  if (requirements.required.includes("reason") && !input.reason?.trim()) errors.push("reason is required");
  if (requirements.required.includes("before") && input.before === undefined) errors.push("before is required");
  if (requirements.required.includes("after") && input.after === undefined) errors.push("after is required");

  return {
    ok: errors.length === 0,
    errors,
    action: input.action,
    requirements
  };
}

export async function audit(prisma: PrismaClient, input: AuditInput) {
  const validation = validateAuditInput(input);
  if (!validation.ok || !validation.action) {
    throw new Error(`Audit failed closed: ${validation.errors.join("; ")}`);
  }

  return prisma.auditLog.create({
    data: {
      action: validation.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      before: input.before === undefined ? undefined : JSON.stringify(input.before),
      after: input.after === undefined
        ? undefined
        : JSON.stringify({
            value: input.after,
            reviewer: input.reviewer ?? null,
            reviewedAt: input.reviewedAt ?? null
          }),
      reason: input.reason ?? null,
      citation: input.citation ?? null
    }
  });
}
