import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { createAssignment } from "@/lib/services/assessment-assignment";

const createSchema = z.object({
  artworkId: z.string().uuid(),
  assessorAuthUid: z.string().min(1),
  dueAt: z.string().datetime().optional().nullable(),
  notesToAssessor: z.string().max(5000).optional().nullable(),
});

/**
 * GET /api/portal/admin/assignments
 * List all assignments (admin only).
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const assignments = await prisma.assessmentAssignment.findMany({
      where: { status: { not: "WITHDRAWN" } },
      include: {
        artwork: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            varianceFlag: true,
          },
        },
        scores: {
          select: {
            id: true,
            scoreB: true,
            scoreP: true,
            scoreM: true,
            scoreS: true,
            totalScore: true,
            status: true,
            submittedAt: true,
            assessorAuthUid: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const payload = assignments.map((a) => ({
      id: a.id,
      artworkId: a.artworkId,
      artwork: a.artwork,
      assessorAuthUid: a.assessorAuthUid,
      status: a.status,
      dueAt: a.dueAt?.toISOString() ?? null,
      assignedAt: a.assignedAt.toISOString(),
      createdByAdminAuthUid: a.createdByAdminAuthUid,
      notesToAssessor: a.notesToAssessor,
      scores: a.scores.map((s) => ({
        id: s.id,
        B: Number(s.scoreB),
        P: Number(s.scoreP),
        M: Number(s.scoreM),
        S: Number(s.scoreS),
        totalScore: Number(s.totalScore),
        status: s.status,
        submittedAt: s.submittedAt?.toISOString() ?? null,
        assessorAuthUid: s.assessorAuthUid,
      })),
    }));

    return NextResponse.json({ assignments: payload });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/portal/admin/assignments]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/admin/assignments
 * Create assignment (admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const body = await req.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { artworkId, assessorAuthUid, dueAt, notesToAssessor } =
      validation.data;

    const assignment = await createAssignment({
      artworkId,
      assessorAuthUid,
      dueAt: dueAt ? new Date(dueAt) : null,
      createdByAdminAuthUid: user!.authUid!,
      notesToAssessor,
    });

    return NextResponse.json({
      ok: true,
      assignment: {
        id: assignment.id,
        artworkId: assignment.artworkId,
        assessorAuthUid: assignment.assessorAuthUid,
        status: assignment.status,
        assignedAt: assignment.assignedAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err && typeof err === "object" && "code" in err) {
      const prismaErr = err as { code?: string };
      if (prismaErr.code === "P2002") {
        return NextResponse.json(
          { error: "Assignment already exists for this artwork and assessor" },
          { status: 409 }
        );
      }
    }
    console.error("[POST /api/portal/admin/assignments]", err);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
