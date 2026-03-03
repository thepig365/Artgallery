import { NextRequest, NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { getAssignmentForAssessor } from "@/lib/services/assessment-assignment";

/**
 * GET /api/portal/assessor/assignments/[id]
 * Returns assignment with blind artwork metadata (no artist identity).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const { id } = await params;

    const assignment = await getAssignmentForAssessor(id, user!.authUid!);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 403 }
      );
    }

    const score = assignment.scores[0];
    const blindArtwork = {
      id: assignment.artwork.id,
      title: assignment.artwork.title,
      slug: assignment.artwork.slug,
      imageUrl: assignment.artwork.imageUrl,
      medium: assignment.artwork.medium,
      year: assignment.artwork.year,
      dimensions: assignment.artwork.dimensions,
      materials: assignment.artwork.materials,
      narrative: assignment.artwork.narrative,
    };

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        status: assignment.status,
        dueAt: assignment.dueAt?.toISOString() ?? null,
        assignedAt: assignment.assignedAt.toISOString(),
        notesToAssessor: assignment.notesToAssessor,
      },
      artwork: blindArtwork,
      score: score
        ? {
            id: score.id,
            B: Number(score.scoreB),
            P: Number(score.scoreP),
            M: Number(score.scoreM),
            S: Number(score.scoreS),
            totalScore: Number(score.totalScore),
            notes: score.notes,
            status: score.status,
            submittedAt: score.submittedAt?.toISOString() ?? null,
          }
        : null,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/portal/assessor/assignments/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}
