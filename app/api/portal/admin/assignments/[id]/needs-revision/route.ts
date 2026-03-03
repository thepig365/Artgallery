import { NextRequest, NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { setNeedsRevision } from "@/lib/services/assessment-assignment";

/**
 * POST /api/portal/admin/assignments/[id]/needs-revision
 * Set assignment status to NEEDS_REVISION (admin only).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;

    await setNeedsRevision({
      assignmentId: id,
      adminAuthUid: user!.authUid!,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/portal/admin/assignments/[id]/needs-revision]", err);
    return NextResponse.json(
      { error: "Failed to set needs revision" },
      { status: 500 }
    );
  }
}
