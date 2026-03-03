/**
 * Assignment state machine — enforced transitions for assessor/admin.
 *
 * Allowed transitions:
 * - ASSIGNED -> IN_REVIEW (assessor starts review)
 * - ASSIGNED -> WITHDRAWN (admin withdraw)
 * - IN_REVIEW -> SUBMITTED (assessor submit score)
 * - IN_REVIEW -> WITHDRAWN (admin)
 * - IN_REVIEW -> NEEDS_REVISION (admin)
 * - NEEDS_REVISION -> IN_REVIEW (assessor re-opens)
 * - NEEDS_REVISION -> WITHDRAWN (admin)
 * - SUBMITTED -> (no further transitions; edit window only)
 */

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "NEEDS_REVISION"
  | "WITHDRAWN";

/** Statuses where assessor can save draft or submit */
export const ASSESSOR_EDITABLE_STATUSES: AssignmentStatus[] = [
  "ASSIGNED",
  "IN_REVIEW",
  "NEEDS_REVISION",
];

/** Statuses excluded from all edits (including admin score edits) */
export const LOCKED_STATUSES: AssignmentStatus[] = ["WITHDRAWN"];

export function canAssessorEdit(status: AssignmentStatus): boolean {
  return ASSESSOR_EDITABLE_STATUSES.includes(status) && !LOCKED_STATUSES.includes(status);
}

export function isLocked(status: AssignmentStatus): boolean {
  return LOCKED_STATUSES.includes(status);
}
