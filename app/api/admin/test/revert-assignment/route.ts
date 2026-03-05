import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const REVERT_CONFIRM_TEXT = "REVERT TEST TASK";

const bodySchema = z.object({
  testKey: z.string().trim().min(5),
  confirmText: z.string().trim(),
});

function getAuthStatus(error: AuthorizationError): 401 | 403 {
  return error.message === "Authentication required" ? 401 : 403;
}

function isRecoverableAssignmentTableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await resolveSessionUser();
    requireRole(sessionUser, "ADMIN");

    const payload = bodySchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: payload.error.issues },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { testKey, confirmText } = payload.data;
    if (confirmText !== REVERT_CONFIRM_TEXT) {
      return NextResponse.json(
        { error: `Confirmation text mismatch. Type exactly: ${REVERT_CONFIRM_TEXT}` },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const sessionMarker = `"testKey":"${testKey}"`;
    const assignmentMarker = `[TEST:${testKey}]`;

    const sessions = await prisma.auditSession.findMany({
      where: { notes: { contains: sessionMarker } },
      select: { id: true },
    });
    const auditSessionIds = sessions.map((s) => s.id);

    let assignmentIds: string[] = [];
    try {
      const assignments = await prisma.assessmentAssignment.findMany({
        where: { notesToAssessor: { contains: assignmentMarker } },
        select: { id: true },
      });
      assignmentIds = assignments.map((a) => a.id);
    } catch (error) {
      if (!isRecoverableAssignmentTableError(error)) {
        throw error;
      }
    }

    const deletedAuditScores = auditSessionIds.length
      ? await prisma.auditScore.deleteMany({
          where: { auditSessionId: { in: auditSessionIds } },
        })
      : { count: 0 };

    const deletedVarianceReviews = auditSessionIds.length
      ? await prisma.auditVarianceReview.deleteMany({
          where: { auditSessionId: { in: auditSessionIds } },
        })
      : { count: 0 };

    let deletedAssessmentScoresCount = 0;
    let deletedAssignmentsCount = 0;
    let assignmentWarning: string | undefined;

    if (assignmentIds.length > 0) {
      try {
        const deletedAssessmentScores = await prisma.assessmentScore.deleteMany({
          where: { assignmentId: { in: assignmentIds } },
        });
        deletedAssessmentScoresCount = deletedAssessmentScores.count;

        const deletedAssignments = await prisma.assessmentAssignment.deleteMany({
          where: { id: { in: assignmentIds } },
        });
        deletedAssignmentsCount = deletedAssignments.count;
      } catch (error) {
        if (isRecoverableAssignmentTableError(error)) {
          assignmentWarning =
            "assessment_assignments table/column mismatch while reverting; audit-session rows still reverted.";
        } else {
          throw error;
        }
      }
    }

    const deletedSessions = auditSessionIds.length
      ? await prisma.auditSession.deleteMany({
          where: { id: { in: auditSessionIds } },
        })
      : { count: 0 };

    return NextResponse.json(
      {
        ok: true,
        testKey,
        deleted: {
          auditScores: deletedAuditScores.count,
          auditVarianceReviews: deletedVarianceReviews.count,
          assessmentScores: deletedAssessmentScoresCount,
          assignments: deletedAssignmentsCount,
          auditSessions: deletedSessions.count,
        },
        warning: assignmentWarning,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: getAuthStatus(error), headers: { "Cache-Control": "no-store" } }
      );
    }
    console.error("[POST /api/admin/test/revert-assignment]", error);
    return NextResponse.json(
      { error: "Failed to revert test assignment task" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
