import { describe, it, expect } from "vitest";
import { toBlindSubmission } from "@/lib/adapters/redaction-adapter";
import { createMockAssessorService } from "@/lib/services/mock-assessor";
import { getBlindRedactedFields } from "@/lib/audit/redaction";
import type { ArtworkWithArtist } from "@/lib/audit/redaction";
import { MOCK_EVIDENCE } from "@/lib/mocks/data";

// ─────────────────────────────────────────────────────────────
// Worst-case fixture: every identity/source/market field populated.
// If any of these values leak into the blind payload, the test fails.
// ─────────────────────────────────────────────────────────────

const FULLY_POPULATED_ARTWORK: ArtworkWithArtist = {
  id: "art-integration-001",
  title: "Corrosion Pattern Alpha",
  slug: "corrosion-pattern-alpha",
  medium: "Rust and acrylic on steel",
  year: 2025,
  dimensions: "200 × 150 cm",
  materials: "Ferric oxide, acrylic binder, steel plate",
  narrative: "An exploration of entropy in industrial materials.",
  sourceUrl: "https://gallery.example.com/corrosion-alpha",
  imageUrl: "https://images.example.com/corrosion-alpha.jpg",
  sourceLicenseStatus: "CC BY-SA 4.0",
  scoreB: 8.0,
  scoreP: 7.5,
  scoreM: 9.2,
  scoreS: 6.8,
  finalV: 8.07,
  artist: {
    id: "artist-secret-001",
    name: "Maria Gonzalez",
    slug: "maria-gonzalez",
    bio: "Award-winning sculptor based in Buenos Aires.",
    website: "https://mariagonzalez.art",
  },
  marketPrice: 42000,
  sourcePlatform: "Artsy",
  sourceAttribution: "Courtesy Gagosian Gallery",
};

/**
 * Strings that MUST NOT appear anywhere in a blind-phase payload.
 * Includes artist identity, source provenance, and market data.
 */
const SENSITIVE_VALUES = [
  // Artist identity
  "Maria Gonzalez",
  "maria-gonzalez",
  "Award-winning sculptor",
  "https://mariagonzalez.art",
  // Source provenance
  "https://gallery.example.com/corrosion-alpha",
  "Artsy",
  "Courtesy Gagosian Gallery",
  // Market data (serialized number)
  "42000",
];

// ─────────────────────────────────────────────────────────────
// Integration: full adapter path (service → adapter → redaction)
// ─────────────────────────────────────────────────────────────

describe("Integration: blind scoring payload protection", () => {
  describe("adapter path — BLIND_SCORING phase", () => {
    it("serialized payload contains zero sensitive identity/market values", () => {
      const payload = toBlindSubmission(
        FULLY_POPULATED_ARTWORK,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );

      const serialized = JSON.stringify(payload);

      for (const secret of SENSITIVE_VALUES) {
        expect(serialized).not.toContain(secret);
      }
    });

    it("marks payload as redacted with correct metadata", () => {
      const payload = toBlindSubmission(
        FULLY_POPULATED_ARTWORK,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );

      expect(payload._redacted).toBe(true);
      expect(payload._redactedFields.length).toBeGreaterThanOrEqual(4);
    });

    it("redacts workTitle to blind placeholder", () => {
      const payload = toBlindSubmission(
        FULLY_POPULATED_ARTWORK,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );

      expect(payload.workTitle).toBe("[REDACTED FOR BLIND REVIEW]");
      expect(payload.workTitle).not.toBe(FULLY_POPULATED_ARTWORK.title);
    });

    it("redacted fields list covers every declared blind-redactable field", () => {
      const payload = toBlindSubmission(
        FULLY_POPULATED_ARTWORK,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );

      const required = getBlindRedactedFields();

      for (const field of required) {
        expect(payload._redactedFields).toContain(field);
      }
    });

    it("preserves non-sensitive material assessment fields", () => {
      const payload = toBlindSubmission(
        FULLY_POPULATED_ARTWORK,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );

      expect(payload.medium).toBe("Rust and acrylic on steel");
      expect(payload.year).toBe(2025);
      expect(payload.dimensions).toBe("200 × 150 cm");
      expect(payload.materials).toContain("Ferric oxide");
      expect(payload.narrative).toContain("entropy");
      expect(payload.evidence).toHaveLength(MOCK_EVIDENCE.length);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Defense-in-depth: adapter strips fields from the UI shape
  // even if redaction were somehow bypassed.
  // ─────────────────────────────────────────────────────────

  describe("adapter structural guarantee — all phases", () => {
    const ALL_PHASES = [
      "BLIND_SCORING",
      "OPEN_REVIEW",
      "VARIANCE_CHECK",
      "FINALIZED",
    ] as const;

    for (const phase of ALL_PHASES) {
      it(`${phase}: returned object has no artist property`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect("artist" in payload).toBe(false);
      });

      it(`${phase}: returned object has no sourceUrl property`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect("sourceUrl" in payload).toBe(false);
      });

      it(`${phase}: returned object has no marketPrice property`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect("marketPrice" in payload).toBe(false);
      });

      it(`${phase}: returned object has no sourcePlatform property`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect("sourcePlatform" in payload).toBe(false);
      });

      it(`${phase}: returned object has no sourceAttribution property`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect("sourceAttribution" in payload).toBe(false);
      });
    }
  });

  // ─────────────────────────────────────────────────────────
  // Phase gating: non-blind phases preserve the work title
  // ─────────────────────────────────────────────────────────

  describe("phase gating — non-blind phases", () => {
    const NON_BLIND_PHASES = [
      "OPEN_REVIEW",
      "VARIANCE_CHECK",
      "FINALIZED",
    ] as const;

    for (const phase of NON_BLIND_PHASES) {
      it(`${phase}: preserves original work title`, () => {
        const payload = toBlindSubmission(
          FULLY_POPULATED_ARTWORK,
          phase,
          MOCK_EVIDENCE
        );

        expect(payload._redacted).toBe(false);
        expect(payload.workTitle).toBe(FULLY_POPULATED_ARTWORK.title);
      });
    }
  });

  // ─────────────────────────────────────────────────────────
  // Assessor service contract: the service-level entry point
  // ─────────────────────────────────────────────────────────

  describe("assessor service contract", () => {
    it("getBlindSubmission returns a redacted payload", async () => {
      const service = createMockAssessorService();
      const payload = await service.getBlindSubmission("any-session-id");

      expect(payload.workTitle).toBe("[REDACTED FOR BLIND REVIEW]");
    });

    it("getBlindSubmission payload has no artist field at runtime", async () => {
      const service = createMockAssessorService();
      const payload = await service.getBlindSubmission("any-session-id");

      expect("artist" in payload).toBe(false);
      expect("sourceUrl" in payload).toBe(false);
      expect("marketPrice" in payload).toBe(false);
    });

    it("getBlindSubmission payload serializes cleanly with no identity leaks", async () => {
      const service = createMockAssessorService();
      const payload = await service.getBlindSubmission("any-session-id");

      const serialized = JSON.stringify(payload);

      // The mock has these real values in MOCK_ARTWORK_RECORD —
      // they must not survive the adapter pipeline
      expect(serialized).not.toContain("Artist Name Redacted");
      expect(serialized).not.toContain("artist-name-redacted");
      expect(serialized).not.toContain("https://example.com/gallery/erosion-7");
      expect(serialized).not.toContain("https://example.com/artist");
    });
  });
});
