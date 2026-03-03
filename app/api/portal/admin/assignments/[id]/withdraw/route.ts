import { NextRequest, NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { withdrawAssignment } from "@/lib/services/assessment-assignment";

/**
 * POST /api/portal/admin/assignments/[id]/withdraw
 * Withdraw assignment (admin only).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;

    const result = await withdrawAssignment({
      assignmentId: id,
      adminAuthUid: user!.authUid!,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/portal/admin/assignments/[id]/withdraw]", err);
    return NextResponse.json(
      { error: "Failed to withdraw assignment" },
      { status: 500 }
    );
  }
}
