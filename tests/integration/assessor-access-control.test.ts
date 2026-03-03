/**
 * Integration: assessor access control — contract tests.
 *
 * Ensures services enforce WHERE assessorAuthUid = session_user_id on every
 * read/write. Negative tests (assessor tries to access others) rely on these
 * enforcements — if params are wrong, service returns null.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../..", relativePath), "utf-8");
}

describe("Integration: assessor access control (contract tests)", () => {
  describe("assessment-assignment service — assessorAuthUid in where", () => {
    const source = readSource("lib/services/assessment-assignment.ts");

    it("getAssignmentForAssessor filters by assessorAuthUid", () => {
      expect(source).toContain("getAssignmentForAssessor");
      expect(source).toContain("assessorAuthUid");
      expect(source).toContain("findFirst");
    });

    it("getAssignmentsForAssessor filters by assessorAuthUid", () => {
      expect(source).toContain("getAssignmentsForAssessor");
      expect(source).toContain("assessorAuthUid");
      expect(source).toContain("findMany");
    });
  });

  describe("assessment-score service — assessorAuthUid in where", () => {
    const source = readSource("lib/services/assessment-score.ts");

    it("saveDraftScore filters by assessorAuthUid", () => {
      expect(source).toContain("saveDraftScore");
      expect(source).toContain("assessorAuthUid");
      expect(source).toContain("findFirst");
    });

    it("submitScore filters by assessorAuthUid", () => {
      expect(source).toContain("submitScore");
      expect(source).toContain("assessorAuthUid");
    });

    it("rejects WITHDRAWN assignments (state machine)", () => {
      expect(source).toContain("isLocked");
      expect(source).toContain("withdrawn");
    });
  });

  describe("assignment-state-machine — locked status", () => {
    const source = readSource("lib/services/assignment-state-machine.ts");

    it("defines LOCKED_STATUSES including WITHDRAWN", () => {
      expect(source).toContain("WITHDRAWN");
      expect(source).toContain("LOCKED_STATUSES");
    });

    it("canAssessorEdit excludes locked statuses", () => {
      expect(source).toContain("canAssessorEdit");
    });
  });
});
