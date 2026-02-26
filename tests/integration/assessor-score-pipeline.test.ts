import { describe, it, expect } from "vitest";
import { createMockAssessorService } from "@/lib/services/mock-assessor";
import { mendScoresSchema } from "@/lib/validation/schemas";
import { computeMendIndex } from "@/lib/mend-index";
import type { BPMSScores } from "@/lib/types";

/**
 * Integration: exercises the full assessor scoring pipeline:
 *   service.getSession() → score editing → mendScoresSchema.safeParse()
 *   → computeMendIndex() → service.submitFinal()
 *
 * This validates the end-to-end contract between the service layer,
 * validation schemas, and computation logic.
 */

describe("Integration: assessor score validation + submission pipeline", () => {
  describe("full scoring lifecycle", () => {
    it("session → validate → compute → submit: happy path", async () => {
      const service = createMockAssessorService();
      const sessionId = "test-session-001";

      const session = await service.getSession(sessionId);
      expect(session.isDraft).toBe(true);
      expect(session.scores).toBeDefined();

      const newScores: BPMSScores = { B: 8.0, P: 7.5, M: 9.2, S: 6.8 };

      const validation = mendScoresSchema.safeParse(newScores);
      expect(validation.success).toBe(true);

      const mendIndex = computeMendIndex(newScores);
      expect(mendIndex).toBeGreaterThan(0);
      expect(mendIndex).toBeLessThanOrEqual(10);

      await service.submitFinal(sessionId, newScores, "Assessment notes");

      const updatedSession = await service.getSession(sessionId);
      expect(updatedSession.isDraft).toBe(false);
      expect(updatedSession.status).toBe("completed");
      expect(updatedSession.scores).toEqual(newScores);
    });

    it("validation rejects out-of-range scores before submission", async () => {
      const badScores = { B: 11, P: -1, M: 5, S: 5 };
      const validation = mendScoresSchema.safeParse(badScores);
      expect(validation.success).toBe(false);

      if (!validation.success) {
        expect(validation.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("computeMendIndex rejects scores that pass schema edge", () => {
      expect(() =>
        computeMendIndex({ B: NaN, P: 5, M: 5, S: 5 })
      ).toThrow();
      expect(() =>
        computeMendIndex({ B: Infinity, P: 5, M: 5, S: 5 })
      ).toThrow();
    });
  });

  describe("draft save does not finalize", () => {
    it("saveDraft keeps session in draft state", async () => {
      const service = createMockAssessorService();
      const sessionId = "test-session-002";

      const scores: BPMSScores = { B: 6.0, P: 6.5, M: 7.0, S: 7.5 };
      await service.saveDraft(sessionId, scores, "Draft notes");

      const session = await service.getSession(sessionId);
      expect(session.isDraft).toBe(true);
      expect(session.scores).toEqual(scores);
      expect(session.notes).toBe("Draft notes");
    });
  });

  describe("blind submission + scoring are independent paths", () => {
    it("blind submission is available regardless of score state", async () => {
      const service = createMockAssessorService();

      const blind = await service.getBlindSubmission("test-session-003");
      expect(blind).toBeDefined();
      expect(blind.workTitle).toBe("[REDACTED FOR BLIND REVIEW]");

      await service.submitFinal(
        "test-session-003",
        { B: 5, P: 5, M: 5, S: 5 },
        ""
      );

      const blindAfter = await service.getBlindSubmission("test-session-003");
      expect(blindAfter).toBeDefined();
      expect(blindAfter.workTitle).toBe("[REDACTED FOR BLIND REVIEW]");
    });
  });

  describe("mend index computation alignment with weights", () => {
    it("equal scores produce expected weighted average", () => {
      const scores: BPMSScores = { B: 8, P: 8, M: 8, S: 8 };
      expect(computeMendIndex(scores)).toBe(8);
    });

    it("material axis (M) has highest weight (0.35)", () => {
      const highM: BPMSScores = { B: 5, P: 5, M: 10, S: 5 };
      const highB: BPMSScores = { B: 10, P: 5, M: 5, S: 5 };

      const indexHighM = computeMendIndex(highM);
      const indexHighB = computeMendIndex(highB);

      expect(indexHighM).toBeGreaterThan(indexHighB);
    });

    it("boundary scores (0,0,0,0) and (10,10,10,10) produce 0 and 10", () => {
      expect(computeMendIndex({ B: 0, P: 0, M: 0, S: 0 })).toBe(0);
      expect(computeMendIndex({ B: 10, P: 10, M: 10, S: 10 })).toBe(10);
    });
  });
});
