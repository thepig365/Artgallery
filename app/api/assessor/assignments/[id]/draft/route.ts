import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { saveDraftScore } from "@/lib/services/assessment-score";
import { writeAuditLog } from "@/lib/services/audit-log";
import { mendScoresSchema } from "@/lib/validation/schemas";

const draftBodySchema = mendScoresSchema.extend({
  notes: z.string().max(5000).optional().nullable(),
});

/**
 * POST /api/assessor/assignments/[id]/draft
 * Save draft score for the assignment.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const { id: assignmentId } = await params;
    const body = await req.json();
    const validation = draftBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { B, P, M, S, notes } = validation.data;

    const result = await saveDraftScore({
      assignmentId,
      assessorAuthUid: user!.authUid!,
      B,
      P,
      M,
      S,
      notes,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 403 }
      );
    }

    if (typeof result === "object" && "error" in result) {
      return NextResponse.json(
        { error: (result as { error: string }).error },
        { status: 400 }
      );
    }

    const score = result as { id: string };
    await writeAuditLog({
      actorAuthUid: user!.authUid!,
      actorRole: user!.role === "ADMIN" ? "admin" : "assessor",
      action: "SCORE_DRAFT",
      entityType: "score",
      entityId: score.id,
      meta: { assignmentId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/assessor/assignments/[id]/draft]", err);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
