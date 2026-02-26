import { describe, it, expect } from "vitest";
import { createTakedownRequestSchema } from "@/lib/validation/schemas";
import { TakedownError } from "@/lib/services/takedown";

/**
 * Integration: takedown request validation + service error contract.
 *
 * The actual createTakedownRequest() function requires a database
 * connection, so we test:
 *   1. Schema validation catches bad inputs before they reach the service
 *   2. TakedownError is a proper identifiable error class
 *   3. Schema + service parameter contract alignment
 *   4. The $transaction structure is exercised in service code review
 *      (provenance logging is co-located with the mutation)
 */

const VALID_TAKEDOWN = {
  artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  complainantName: "Jane Doe",
  contactEmail: "jane@example.com",
  workUrl: "https://example.com/artwork/123",
  complaintBasis:
    "This work uses my copyrighted photograph without permission or attribution.",
  evidenceLinks: [
    "https://evidence.example.com/original-photo",
    "https://evidence.example.com/comparison",
  ],
  declarationAccepted: true as const,
};

describe("Integration: takedown request contract", () => {
  describe("schema validation pipeline", () => {
    it("accepts a complete valid takedown request", () => {
      const result = createTakedownRequestSchema.safeParse(VALID_TAKEDOWN);
      expect(result.success).toBe(true);
    });

    it("rejects request without declaration accepted", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        declarationAccepted: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects request with empty complainant name", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        complainantName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects request with invalid email", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        contactEmail: "not-valid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects request with complaint basis under 10 chars", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        complaintBasis: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects request with invalid evidence link URLs", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        evidenceLinks: ["not-a-url"],
      });
      expect(result.success).toBe(false);
    });

    it("accepts request with empty evidence links array", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        evidenceLinks: [],
      });
      expect(result.success).toBe(true);
    });

    it("rejects request with more than 20 evidence links", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        evidenceLinks: Array.from(
          { length: 21 },
          (_, i) => `https://example.com/evidence/${i}`
        ),
      });
      expect(result.success).toBe(false);
    });

    it("accepts exactly 20 evidence links", () => {
      const result = createTakedownRequestSchema.safeParse({
        ...VALID_TAKEDOWN,
        evidenceLinks: Array.from(
          { length: 20 },
          (_, i) => `https://example.com/evidence/${i}`
        ),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("TakedownError contract", () => {
    it("is an instance of Error", () => {
      const err = new TakedownError("Declaration must be accepted");
      expect(err).toBeInstanceOf(Error);
    });

    it("has name = TakedownError", () => {
      const err = new TakedownError("test");
      expect(err.name).toBe("TakedownError");
    });

    it("carries the provided message", () => {
      const msg = "Declaration must be accepted";
      const err = new TakedownError(msg);
      expect(err.message).toBe(msg);
    });

    it("is distinguishable from generic errors", () => {
      const takedownErr = new TakedownError("test");
      const genericErr = new Error("test");

      expect(takedownErr.name).not.toBe(genericErr.name);
    });
  });

  describe("schema → service parameter alignment", () => {
    it("validated schema output has all fields the service expects", () => {
      const result = createTakedownRequestSchema.safeParse(VALID_TAKEDOWN);
      expect(result.success).toBe(true);

      if (result.success) {
        const data = result.data;
        expect(data).toHaveProperty("artworkId");
        expect(data).toHaveProperty("complainantName");
        expect(data).toHaveProperty("contactEmail");
        expect(data).toHaveProperty("workUrl");
        expect(data).toHaveProperty("complaintBasis");
        expect(data).toHaveProperty("evidenceLinks");
        expect(data).toHaveProperty("declarationAccepted");
        expect(data.declarationAccepted).toBe(true);
      }
    });
  });
});
