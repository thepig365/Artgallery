import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { submitScore } from "@/lib/services/assessment-score";
import { mendScoresSchema } from "@/lib/validation/schemas";

const submitBodySchema = mendScoresSchema.extend({
  notes: z.string().max(5000).optional().nullable(),
});

/**
 * POST /api/portal/assessor/assignments/[id]/submit
 * Submit score for the assignment (final submit, locks after 10min edit window).
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
    const validation = submitBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { B, P, M, S, notes } = validation.data;

    const result = await submitScore({
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
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/portal/assessor/assignments/[id]/submit]", err);
    return NextResponse.json(
      { error: "Failed to submit score" },
      { status: 500 }
    );
  }
}
