import { describe, it, expect } from "vitest";
import {
  redactForBlindScoring,
  getBlindRedactedFields,
  isBlindPhase,
} from "@/lib/audit/redaction";
import type { ArtworkWithArtist } from "@/lib/audit/redaction";

const mockArtwork: ArtworkWithArtist = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  title: "Erosion Study No. 7",
  slug: "erosion-study-no-7",
  medium: "Oil and iron oxide on raw linen",
  year: 2024,
  dimensions: "48 × 36 in",
  materials: "Oil pigment, cold wax, iron oxide, raw linen",
  narrative: "An investigation into material degradation.",
  sourceUrl: "https://source.example.com/erosion-study-7",
  imageUrl: "https://images.example.com/erosion-study-7.jpg",
  sourceLicenseStatus: "CC BY-NC 4.0",
  scoreB: 7.2,
  scoreP: 8.1,
  scoreM: 6.5,
  scoreS: 7.8,
  finalV: 7.26,
  artist: {
    id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    name: "Elena Vasquez",
    slug: "elena-vasquez",
    bio: "Mixed-media artist.",
    website: "https://elenavasquez.example.com",
  },
  sourcePlatform: "ArtStation",
  marketPrice: 15000,
  sourceAttribution: "Courtesy of the artist",
};

describe("redactForBlindScoring", () => {
  it("redacts artist identity during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");

    expect(result._redacted).toBe(true);
    expect(result.artist?.name).toBe("[REDACTED — BLIND PHASE]");
    expect(result.artist?.slug).toBe("[REDACTED — BLIND PHASE]");
    expect(result.artist?.bio).toBe("[REDACTED — BLIND PHASE]");
    expect(result.artist?.website).toBeNull();
  });

  it("redacts sourceUrl during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result.sourceUrl).toBe("[REDACTED — BLIND PHASE]");
  });

  it("redacts sourcePlatform during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result.sourcePlatform).toBe("[REDACTED — BLIND PHASE]");
  });

  it("nullifies marketPrice during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result.marketPrice).toBeNull();
  });

  it("redacts sourceAttribution during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result.sourceAttribution).toBe("[REDACTED — BLIND PHASE]");
  });

  it("tracks redacted fields list", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result._redactedFields).toContain("artistName");
    expect(result._redactedFields).toContain("sourceUrl");
    expect(result._redactedFields).toContain("marketPrice");
    expect(result._redactedFields.length).toBeGreaterThanOrEqual(4);
  });

  it("preserves non-identity fields during BLIND_SCORING", () => {
    const result = redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(result.title).toBe("Erosion Study No. 7");
    expect(result.medium).toBe("Oil and iron oxide on raw linen");
    expect(result.imageUrl).toBe(
      "https://images.example.com/erosion-study-7.jpg"
    );
    expect(result.scoreB).toBe(7.2);
    expect(result.finalV).toBe(7.26);
  });

  it("does NOT redact during OPEN_REVIEW", () => {
    const result = redactForBlindScoring(mockArtwork, "OPEN_REVIEW");
    expect(result._redacted).toBe(false);
    expect(result.artist?.name).toBe("Elena Vasquez");
    expect(result.sourceUrl).toBe(
      "https://source.example.com/erosion-study-7"
    );
  });

  it("does NOT redact during FINALIZED", () => {
    const result = redactForBlindScoring(mockArtwork, "FINALIZED");
    expect(result._redacted).toBe(false);
    expect(result._redactedFields).toHaveLength(0);
  });

  it("does NOT redact during VARIANCE_CHECK", () => {
    const result = redactForBlindScoring(mockArtwork, "VARIANCE_CHECK");
    expect(result._redacted).toBe(false);
  });

  it("does not mutate the original object", () => {
    redactForBlindScoring(mockArtwork, "BLIND_SCORING");
    expect(mockArtwork.artist?.name).toBe("Elena Vasquez");
    expect(mockArtwork.sourceUrl).toBe(
      "https://source.example.com/erosion-study-7"
    );
  });

  it("handles artwork without artist gracefully", () => {
    const noArtist = { ...mockArtwork, artist: null };
    const result = redactForBlindScoring(noArtist, "BLIND_SCORING");
    expect(result._redacted).toBe(true);
    expect(result.artist).toBeNull();
    // Should still redact other fields
    expect(result.sourceUrl).toBe("[REDACTED — BLIND PHASE]");
  });
});

describe("getBlindRedactedFields", () => {
  it("returns a non-empty list of field names", () => {
    const fields = getBlindRedactedFields();
    expect(fields.length).toBeGreaterThan(0);
    expect(fields).toContain("artistName");
    expect(fields).toContain("sourceUrl");
    expect(fields).toContain("marketPrice");
  });
});

describe("isBlindPhase", () => {
  it("returns true for BLIND_SCORING", () => {
    expect(isBlindPhase("BLIND_SCORING")).toBe(true);
  });

  it("returns false for other phases", () => {
    expect(isBlindPhase("OPEN_REVIEW")).toBe(false);
    expect(isBlindPhase("FINALIZED")).toBe(false);
    expect(isBlindPhase("VARIANCE_CHECK")).toBe(false);
  });
});
