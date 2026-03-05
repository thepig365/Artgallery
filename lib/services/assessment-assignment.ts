/**
 * Assessment assignment service — admin assigns artworks to assessors.
 * Assessors can only access their own assignments.
 */

import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "./audit-log";

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "NEEDS_REVISION"
  | "WITHDRAWN";

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
