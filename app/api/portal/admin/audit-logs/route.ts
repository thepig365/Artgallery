import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

/**
 * GET /api/portal/admin/audit-logs
 * List recent audit logs (admin only).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") ?? "100", 10), 1),
      500
    );

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const payload = logs.map((l) => ({
      id: l.id,
      actorAuthUid: l.actorAuthUid,
      actorRole: l.actorRole,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      meta: l.meta,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({ logs: payload });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/portal/admin/audit-logs]", err);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
