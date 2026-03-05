import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { resolveAuthUser, resolveSessionUser } from "@/lib/auth/session";
import { AuthorizationError, requireRole } from "@/lib/auth/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ASSIGN_CONFIRM_TEXT = "ASSIGN TEST TASK";

const bodySchema = z.object({
  assessorEmail: z.string().email().optional(),
  artworkSlug: z.string().trim().min(1).optional(),
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

    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = bodySchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: payload.error.issues },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { assessorEmail, artworkSlug, confirmText } = payload.data;
    if (confirmText !== ASSIGN_CONFIRM_TEXT) {
      return NextResponse.json(
        { error: `Confirmation text mismatch. Type exactly: ${ASSIGN_CONFIRM_TEXT}` },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const targetEmail = (assessorEmail ?? authUser.email ?? "").trim().toLowerCase();
    if (!targetEmail) {
      return NextResponse.json(
        {
          error:
            "No assessorEmail provided and current admin session has no email. Provide assessorEmail.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const assessor = await prisma.assessorUser.findFirst({
      where: {
        email: { equals: targetEmail, mode: "insensitive" },
        isActive: true,
      },
      select: {
        id: true,
        authUid: true,
        email: true,
      },
    });

    if (!assessor) {
      return NextResponse.json(
        { error: `No active assessor user found for email: ${targetEmail}` },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!assessor.authUid) {
      return NextResponse.json(
        {
          error:
            "Assessor user exists but has no authUid linked yet. Cannot create assignment flow.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const artwork =
      (artworkSlug
        ? await prisma.artwork.findFirst({
            where: { slug: artworkSlug.trim(), isVisible: true },
            select: { id: true, slug: true, title: true, createdAt: true },
          })
        : null) ??
      (await prisma.artwork.findFirst({
        where: {
          isVisible: true,
          OR: [
            { slug: { contains: "chelsey", mode: "insensitive" } },
            { title: { contains: "chelsey", mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, createdAt: true },
      })) ??
      (await prisma.artwork.findFirst({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, slug: true, title: true, createdAt: true },
      }));

    if (!artwork) {
      return NextResponse.json(
        { error: "No visible artwork found to create a test task." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const testKey = `test-${randomUUID()}`;
    const notes = JSON.stringify({
      test: true,
      testKey,
      assignedAssessors: [assessor.id],
      createdByAuthUid: sessionUser!.authUid,
      createdAt: new Date().toISOString(),
    });

    const auditSession = await prisma.auditSession.create({
      data: {
        artworkId: artwork.id,
        phase: "BLIND_SCORING",
        status: "IN_PROGRESS",
        notes,
      },
      select: {
        id: true,
        artworkId: true,
      },
    });

    let assignmentId: string | null = null;
    let assignmentWarning: string | undefined;

    try {
      const assignment = await prisma.assessmentAssignment.create({
        data: {
          artworkId: artwork.id,
          assessorAuthUid: assessor.authUid,
          status: "ASSIGNED",
          createdByAdminAuthUid: sessionUser!.authUid,
          notesToAssessor: `[TEST:${testKey}] Generated from /api/admin/test/assign-assessor`,
          blindMode: true,
        },
        select: { id: true },
      });
      assignmentId = assignment.id;
    } catch (error) {
      if (isRecoverableAssignmentTableError(error)) {
        assignmentWarning =
          "assessment_assignments table/column mismatch; created audit-session fallback task only.";
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        assignmentWarning =
          "Assignment already exists for this artwork and assessor. Created audit-session fallback task only.";
      } else {
        throw error;
      }
    }

    const reviewHref = assignmentId
      ? `/portal/assessor/review/${assignmentId}`
      : `/portal/assessor/session/${auditSession.id}`;

    return NextResponse.json(
      {
        ok: true,
        testKey,
        auditSessionId: auditSession.id,
        assignmentId,
        artworkSlug: artwork.slug,
        reviewHref,
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
    console.error("[POST /api/admin/test/assign-assessor]", error);
    return NextResponse.json(
      { error: "Failed to create test assignment task" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
