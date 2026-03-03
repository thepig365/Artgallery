/**
 * Assessment score service — save draft, submit score, check variance.
 * Enforces state machine: no edits on WITHDRAWN; edit window for SUBMITTED.
 */

import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/client";
import { computeMendIndex } from "@/lib/mend-index";
import { writeAuditLog } from "./audit-log";
import { checkAndFlagVariance } from "./variance";
import { canAssessorEdit, isLocked } from "./assignment-state-machine";

const EDIT_WINDOW_MINUTES = 10;

export async function saveDraftScore(params: {
  assignmentId: string;
  assessorAuthUid: string;
  B: number;
  P: number;
  M: number;
  S: number;
  notes?: string | null;
}) {
  const assignment = await prisma.assessmentAssignment.findFirst({
    where: { id: params.assignmentId, assessorAuthUid: params.assessorAuthUid },
    include: { scores: true },
  });
  if (!assignment) return null;

  if (isLocked(assignment.status as "WITHDRAWN")) {
    return { error: "Assignment withdrawn; edits not allowed" };
  }
  if (!canAssessorEdit(assignment.status as Parameters<typeof canAssessorEdit>[0])) {
    return { error: "Assignment status does not allow draft edits" };
  }

  const totalScore = computeMendIndex({
    B: params.B,
    P: params.P,
    M: params.M,
    S: params.S,
  });

  const existing = assignment.scores[0];
  if (existing) {
    if (existing.status === "SUBMITTED") return { error: "Score already submitted" };
    return prisma.assessmentScore.update({
      where: { id: existing.id },
      data: {
        scoreB: new Decimal(params.B),
        scoreP: new Decimal(params.P),
        scoreM: new Decimal(params.M),
        scoreS: new Decimal(params.S),
        totalScore: new Decimal(totalScore),
        notes: params.notes ?? null,
      },
    });
  }

  return prisma.assessmentScore.create({
    data: {
      assignmentId: params.assignmentId,
      artworkId: assignment.artworkId,
      assessorAuthUid: params.assessorAuthUid,
      scoreB: new Decimal(params.B),
      scoreP: new Decimal(params.P),
      scoreM: new Decimal(params.M),
      scoreS: new Decimal(params.S),
      totalScore: new Decimal(totalScore),
      notes: params.notes ?? null,
      status: "DRAFT",
    },
  });
}

export async function submitScore(params: {
  assignmentId: string;
  assessorAuthUid: string;
  B: number;
  P: number;
  M: number;
  S: number;
  notes?: string | null;
}) {
  const assignment = await prisma.assessmentAssignment.findFirst({
    where: { id: params.assignmentId, assessorAuthUid: params.assessorAuthUid },
    include: { scores: true, artwork: true },
  });
  if (!assignment) return null;

  if (isLocked(assignment.status as "WITHDRAWN")) {
    return { error: "Assignment withdrawn; edits not allowed" };
  }

  const existing = assignment.scores[0];
  if (existing?.status === "SUBMITTED") {
    const submittedAt = existing.submittedAt;
    if (submittedAt) {
      const elapsed = (Date.now() - submittedAt.getTime()) / 60000;
      if (elapsed > EDIT_WINDOW_MINUTES) return { error: "Edit window expired" };
    }
  }

  const totalScore = computeMendIndex({
    B: params.B,
    P: params.P,
    M: params.M,
    S: params.S,
  });

  const now = new Date();

  let scoreId: string;
  if (existing) {
    await prisma.assessmentScore.update({
      where: { id: existing.id },
      data: {
        scoreB: new Decimal(params.B),
        scoreP: new Decimal(params.P),
        scoreM: new Decimal(params.M),
        scoreS: new Decimal(params.S),
        totalScore: new Decimal(totalScore),
        notes: params.notes ?? null,
        status: "SUBMITTED",
        submittedAt: now,
      },
    });
    scoreId = existing.id;
  } else {
    const created = await prisma.assessmentScore.create({
      data: {
        assignmentId: params.assignmentId,
        artworkId: assignment.artworkId,
        assessorAuthUid: params.assessorAuthUid,
        scoreB: new Decimal(params.B),
        scoreP: new Decimal(params.P),
        scoreM: new Decimal(params.M),
        scoreS: new Decimal(params.S),
        totalScore: new Decimal(totalScore),
        notes: params.notes ?? null,
        status: "SUBMITTED",
        submittedAt: now,
      },
    });
    scoreId = created.id;
  }

  await prisma.assessmentAssignment.update({
    where: { id: params.assignmentId },
    data: { status: "SUBMITTED" },
  });

  await writeAuditLog({
    actorAuthUid: params.assessorAuthUid,
    actorRole: "assessor",
    action: existing?.status === "SUBMITTED" ? "SCORE_EDIT" : "SCORE_SUBMIT",
    entityType: "score",
    entityId: scoreId,
    meta: {
      assignmentId: params.assignmentId,
      artworkId: assignment.artworkId,
      B: params.B,
      P: params.P,
      M: params.M,
      S: params.S,
      totalScore,
    },
  });

  await checkAndFlagVariance(assignment.artworkId);

  return { ok: true };
}
