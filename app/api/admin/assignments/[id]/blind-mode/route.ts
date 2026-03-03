import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { setBlindMode } from "@/lib/services/assessment-assignment";

const bodySchema = z.object({ blindMode: z.boolean() });

/**
 * PATCH /api/admin/assignments/[id]/blind-mode
 * Toggle blind mode on assignment (admin only).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;
    const body = await req.json();
    const validation = bodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await setBlindMode({
      assignmentId: id,
      blindMode: validation.data.blindMode,
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
    console.error("[PATCH /api/admin/assignments/[id]/blind-mode]", err);
    return NextResponse.json(
      { error: "Failed to update blind mode" },
      { status: 500 }
    );
  }
}
