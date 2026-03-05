/**
 * Assessment assignment service — admin assigns artworks to assessors.
 * Assessors can only access their own assignments.
 */

import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { writeAuditLog } from "./audit-log";

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "NEEDS_REVISION"
  | "WITHDRAWN";

export interface AssessorPortalItem {
  id: string;
  source: "assignment" | "audit_session_fallback";
  sourceId: string;
  status: string;
  assignedAt: Date;
  dueAt: Date | null;
  reviewHref: string;
  artwork: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    medium: string | null;
    year: number | null;
  };
  scoreStatus: "DRAFT" | "SUBMITTED" | null;
}

export async function createAssignment(params: {
  artworkId: string;
  assessorAuthUid: string;
  dueAt?: Date | null;
  createdByAdminAuthUid: string;
  notesToAssessor?: string | null;
}) {
  const assignment = await prisma.assessmentAssignment.create({
    data: {
      artworkId: params.artworkId,
      assessorAuthUid: params.assessorAuthUid,
      status: "ASSIGNED",
      dueAt: params.dueAt ?? null,
      createdByAdminAuthUid: params.createdByAdminAuthUid,
      notesToAssessor: params.notesToAssessor ?? null,
    },
    include: { artwork: { select: { title: true, slug: true, imageUrl: true } } },
  });

  await writeAuditLog({
    actorAuthUid: params.createdByAdminAuthUid,
    actorRole: "admin",
    action: "ASSIGN_CREATE",
    entityType: "assignment",
    entityId: assignment.id,
    meta: {
      artworkId: params.artworkId,
      assessorAuthUid: params.assessorAuthUid,
    },
  });

  return assignment;
}

export async function withdrawAssignment(params: {
  assignmentId: string;
  adminAuthUid: string;
}) {
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: params.assignmentId },
  });
  if (!assignment) return null;

  await prisma.assessmentAssignment.update({
    where: { id: params.assignmentId },
    data: { status: "WITHDRAWN", withdrawnAt: new Date() },
  });

  await writeAuditLog({
    actorAuthUid: params.adminAuthUid,
    actorRole: "admin",
    action: "ASSIGN_WITHDRAW",
    entityType: "assignment",
    entityId: params.assignmentId,
    meta: { artworkId: assignment.artworkId },
  });

  return { ok: true };
}

export async function setNeedsRevision(params: {
  assignmentId: string;
  adminAuthUid: string;
}) {
  await prisma.assessmentAssignment.update({
    where: { id: params.assignmentId },
    data: { status: "NEEDS_REVISION" },
  });

  await writeAuditLog({
    actorAuthUid: params.adminAuthUid,
    actorRole: "admin",
    action: "NEEDS_REVISION",
    entityType: "assignment",
    entityId: params.assignmentId,
  });

  return { ok: true };
}

export async function getAssignmentsForAssessor(assessorAuthUid: string) {
  const assignments = await prisma.assessmentAssignment.findMany({
    where: {
      assessorAuthUid,
    },
    include: {
      artwork: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          medium: true,
          year: true,
        },
      },
      scores: { select: { id: true, status: true, submittedAt: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  const visibleStatuses = new Set(["ASSIGNED", "IN_REVIEW", "NEEDS_REVISION"]);
  return assignments.filter((a) => visibleStatuses.has(a.status));
}

function parseAssignedAssessors(
  raw: string | null
): string[] {
  if (!raw) return [];
  try {
    const json = JSON.parse(raw) as { assignedAssessors?: unknown };
    if (!Array.isArray(json.assignedAssessors)) return [];
    return json.assignedAssessors.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

/**
 * Stable assessor portal list:
 * 1) Try assignment-based flow (assessment_assignments)
 * 2) Fallback to audit-session assignment metadata for environments where
 *    assignment tables/columns may be unavailable or unseeded.
 */
export async function getAssessorPortalItems(params: {
  assessorAuthUid: string;
  assessorUserId: string;
}): Promise<{ items: AssessorPortalItem[]; warning?: string }> {
  const visibleStatuses = new Set(["ASSIGNED", "IN_REVIEW", "NEEDS_REVISION"]);
  const debugEnabled = process.env.ASSIGNMENT_DEBUG === "true";
  let prismaErrorCodeIfAny: string | null = null;
  let primaryUnexpectedError: unknown = null;
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const hasValidAssessorUserId = UUID_REGEX.test(params.assessorUserId);
  const safeAssessorUserId = hasValidAssessorUserId
    ? params.assessorUserId
    : "00000000-0000-0000-0000-000000000000";

  if (hasValidAssessorUserId) {
    try {
      const assignments = await prisma.assessmentAssignment.findMany({
        where: { assessorAuthUid: params.assessorAuthUid },
        select: {
          id: true,
          status: true,
          dueAt: true,
          assignedAt: true,
          artwork: {
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              medium: true,
              year: true,
            },
          },
          scores: {
            select: {
              status: true,
              submittedAt: true,
            },
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
        },
        orderBy: { assignedAt: "desc" },
      });

      const items = assignments
        .filter((a) => visibleStatuses.has(a.status))
        .map<AssessorPortalItem>((a) => ({
          id: a.id,
          source: "assignment",
          sourceId: a.id,
          status: a.status,
          assignedAt: a.assignedAt,
          dueAt: a.dueAt,
          reviewHref: `/portal/assessor/review/${a.id}`,
          artwork: a.artwork,
          scoreStatus: a.scores[0]?.status ?? null,
        }));

      if (items.length > 0) {
        if (debugEnabled) {
          console.info("[ASSIGNMENT_DEBUG] portal_items", {
            itemsCount: items.length,
            fallbackCount: 0,
            prismaErrorCodeIfAny,
          });
        }
        return { items };
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2021" || error.code === "P2022" || error.code === "P2023")
      ) {
        prismaErrorCodeIfAny = error.code;
        console.warn("[assessor portal] assignment schema mismatch fallback", {
          code: error.code,
        });
      } else {
        primaryUnexpectedError = error;
        console.warn("[assessor portal] primary assignment read failed, trying fallback");
      }
    }
  } else {
    prismaErrorCodeIfAny = "INVALID_ASSESSOR_USER_ID";
    if (debugEnabled) {
      console.info("[ASSIGNMENT_DEBUG] invalid_assessor_user_id", {
        hasValidAssessorUserId,
      });
    }
  }

  try {
    const sessions = await prisma.auditSession.findMany({
      where: { status: { in: ["DRAFT", "IN_PROGRESS"] } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        notes: true,
        artwork: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            medium: true,
            year: true,
          },
        },
        scores: {
          where: { assessorUserId: safeAssessorUserId },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const fallbackItems = sessions
      .filter((s) => parseAssignedAssessors(s.notes).includes(params.assessorUserId))
      .map<AssessorPortalItem>((s) => ({
        id: s.id,
        source: "audit_session_fallback",
        sourceId: s.id,
        status: s.status,
        assignedAt: s.createdAt,
        dueAt: null,
        reviewHref: `/portal/assessor/session/${s.id}`,
        artwork: s.artwork,
        scoreStatus: s.scores.length > 0 ? "SUBMITTED" : null,
      }));

    const result = {
      items: fallbackItems,
      warning:
        fallbackItems.length > 0
          ? "Portal is running in audit-session compatibility mode."
          : undefined,
    };
    if (debugEnabled) {
      console.info("[ASSIGNMENT_DEBUG] portal_items", {
        itemsCount: result.items.length,
        fallbackCount: result.items.filter((i) => i.source === "audit_session_fallback").length,
        prismaErrorCodeIfAny,
      });
    }
    return result;
  } catch (fallbackError) {
    if (debugEnabled) {
      console.info("[ASSIGNMENT_DEBUG] portal_items", {
        itemsCount: 0,
        fallbackCount: 0,
        prismaErrorCodeIfAny,
      });
    }
    if (primaryUnexpectedError) {
      console.error("[assessor portal] both primary and fallback reads failed", {
        primaryError: primaryUnexpectedError,
        fallbackError,
      });
    }
    throw fallbackError;
  }
}

export async function getAssignmentForAssessor(
  assignmentId: string,
  assessorAuthUid: string
) {
  return prisma.assessmentAssignment.findFirst({
    where: { id: assignmentId, assessorAuthUid },
    include: {
      artwork: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          medium: true,
          year: true,
          dimensions: true,
          materials: true,
          narrative: true,
          artistId: true,
          artist: { select: { name: true } },
        },
      },
      scores: true,
    },
  });
}

export async function setBlindMode(params: {
  assignmentId: string;
  blindMode: boolean;
  adminAuthUid: string;
}) {
  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { id: params.assignmentId },
  });
  if (!assignment) return null;

  await prisma.assessmentAssignment.update({
    where: { id: params.assignmentId },
    data: { blindMode: params.blindMode },
  });

  await writeAuditLog({
    actorAuthUid: params.adminAuthUid,
    actorRole: "admin",
    action: params.blindMode ? "BLIND_MODE_ON" : "BLIND_MODE_OFF",
    entityType: "assignment",
    entityId: params.assignmentId,
    meta: { artworkId: assignment.artworkId, blindMode: params.blindMode },
  });

  return { ok: true };
}
