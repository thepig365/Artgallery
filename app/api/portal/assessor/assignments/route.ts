import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { getAssignmentsForAssessor } from "@/lib/services/assessment-assignment";

/**
 * GET /api/portal/assessor/assignments
 * Returns assignments for the authenticated assessor (ASSIGNED, IN_REVIEW, NEEDS_REVISION).
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const assignments = await getAssignmentsForAssessor(user!.authUid!);

    const payload = assignments.map((a) => ({
      id: a.id,
      artwork: {
        id: a.artwork.id,
        title: a.artwork.title,
        slug: a.artwork.slug,
        imageUrl: a.artwork.imageUrl,
        medium: a.artwork.medium,
        year: a.artwork.year,
      },
      status: a.status,
      dueAt: a.dueAt?.toISOString() ?? null,
      assignedAt: a.assignedAt.toISOString(),
      notesToAssessor: a.notesToAssessor,
      score: a.scores[0]
        ? {
            id: a.scores[0].id,
            status: a.scores[0].status,
            submittedAt: a.scores[0].submittedAt?.toISOString() ?? null,
          }
        : null,
    }));

    return NextResponse.json({ assignments: payload });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/portal/assessor/assignments]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
