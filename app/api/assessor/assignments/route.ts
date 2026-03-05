import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { getAssessorPortalItems } from "@/lib/services/assessment-assignment";

/**
 * GET /api/assessor/assignments
 * Returns assignments for the authenticated assessor (ASSIGNED, IN_REVIEW, NEEDS_REVISION).
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const { items, warning } = await getAssessorPortalItems({
      assessorAuthUid: user!.authUid!,
      assessorUserId: user!.id,
    });

    const payload = items.map((a) => ({
      id: a.id,
      source: a.source,
      sourceId: a.sourceId,
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
      score: a.scoreStatus ? { status: a.scoreStatus } : null,
      reviewHref: a.reviewHref,
    }));

    return NextResponse.json({ assignments: payload, warning });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/assessor/assignments]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
