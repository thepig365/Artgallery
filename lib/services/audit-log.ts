/**
 * Audit log service — records critical actions for compliance.
 */

import { prisma } from "@/lib/db/client";

export type AuditAction =
  | "ASSIGN_CREATE"
  | "ASSIGN_WITHDRAW"
  | "SCORE_SUBMIT"
  | "SCORE_EDIT"
  | "SCORE_DRAFT"
  | "VARIANCE_FLAG"
  | "NEEDS_REVISION"
  | "PUBLISH_ARCHIVE";

export type AuditEntityType = "assignment" | "score" | "artwork";

export async function writeAuditLog(params: {
  actorAuthUid: string;
  actorRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorAuthUid: params.actorAuthUid,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      meta: params.meta ?? undefined,
    },
  });
}
