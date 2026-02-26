import { describe, it, expect } from "vitest";
import {
  validateIdentity,
  validateNarrative,
  validateMaterials,
  toCreateArtworkPayload,
} from "@/lib/adapters/submission-adapter";
import { createArtworkSchema } from "@/lib/validation/schemas";

/**
 * Integration: submission adapter validation + field-mapping pipeline.
 * Verifies that UI form data flows correctly through adapter validation
 * and maps cleanly to backend contract field names.
 */

describe("Integration: submission adapter pipeline", () => {
  describe("validateIdentity — schema-backed field validation", () => {
    it("passes with complete valid data", () => {
      const result = validateIdentity({
        workTitle: "Erosion Study No. 7",
        medium: "oil",
        year: "2024",
        dimensions: "120 × 90 cm",
      });

      expect(result.success).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("fails with empty title", () => {
      const result = validateIdentity({
        workTitle: "",
        medium: "oil",
        year: "2024",
        dimensions: "120 × 90 cm",
      });

      expect(result.success).toBe(false);
      expect(result.errors.workTitle).toBeDefined();
    });

    it("fails with year out of range", () => {
      const result = validateIdentity({
        workTitle: "Test",
        medium: "oil",
        year: "999",
        dimensions: "120 × 90 cm",
      });

      expect(result.success).toBe(false);
      expect(result.errors.year).toBeDefined();
    });

    it("fails with year = non-numeric string", () => {
      const result = validateIdentity({
        workTitle: "Test",
        medium: "oil",
        year: "circa 2020",
        dimensions: "120 × 90 cm",
      });

      expect(result.success).toBe(false);
      expect(result.errors.year).toBeDefined();
    });

    it("fails with title exceeding 300 chars", () => {
      const result = validateIdentity({
        workTitle: "A".repeat(301),
        medium: "oil",
        year: "2024",
        dimensions: "120 cm",
      });

      expect(result.success).toBe(false);
      expect(result.errors.workTitle).toBeDefined();
    });

    it("collects multiple errors for multiple invalid fields", () => {
      const result = validateIdentity({
        workTitle: "",
        medium: "",
        year: "",
        dimensions: "",
      });

      expect(result.success).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("validateNarrative (optional)", () => {
    it("passes with text", () => {
      const result = validateNarrative("A".repeat(100));
      expect(result.success).toBe(true);
    });

    it("passes with empty string (field is optional)", () => {
      const result = validateNarrative("");
      expect(result.success).toBe(true);
    });

    it("fails with more than 10000 characters", () => {
      const result = validateNarrative("A".repeat(10001));
      expect(result.success).toBe(false);
    });
  });

  describe("validateMaterials (optional checkbox-based)", () => {
    it("passes with selected materials", () => {
      const result = validateMaterials({
        selectedMaterials: ["Oil paint", "Canvas"],
        materialsOther: "",
      });
      expect(result.success).toBe(true);
    });

    it("passes with empty selection (step is optional)", () => {
      const result = validateMaterials({
        selectedMaterials: [],
        materialsOther: "",
      });
      expect(result.success).toBe(true);
    });

    it("passes with only other text", () => {
      const result = validateMaterials({
        selectedMaterials: [],
        materialsOther: "Found driftwood",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("toCreateArtworkPayload — field mapping", () => {
    it("maps workTitle to title", () => {
      const payload = toCreateArtworkPayload({
        workTitle: "Erosion Study",
        medium: "oil",
        year: "2024",
        dimensions: "120 × 90 cm",
      });

      expect(payload.title).toBe("Erosion Study");
      expect("workTitle" in payload).toBe(false);
    });

    it("converts year string to number", () => {
      const payload = toCreateArtworkPayload({
        workTitle: "Test",
        medium: "oil",
        year: "2024",
        dimensions: "120 cm",
      });

      expect(payload.year).toBe(2024);
      expect(typeof payload.year).toBe("number");
    });

    it("sets medium and dimensions as optional strings", () => {
      const payload = toCreateArtworkPayload({
        workTitle: "Test",
        medium: "",
        year: "",
        dimensions: "",
      });

      expect(payload.medium).toBeUndefined();
      expect(payload.dimensions).toBeUndefined();
      expect(payload.year).toBeUndefined();
    });

    it("adapter output aligns with backend createArtworkSchema field names", () => {
      const payload = toCreateArtworkPayload({
        workTitle: "Erosion Study",
        medium: "oil",
        year: "2024",
        dimensions: "120 × 90 cm",
      });

      const backendInput = {
        ...payload,
        slug: "erosion-study",
        artistId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      };

      const result = createArtworkSchema.safeParse(backendInput);
      expect(result.success).toBe(true);
    });
  });
});
