import { describe, it, expect } from "vitest";
import {
  checkTerminology,
  isTerminologyClean,
  getBannedPhrases,
} from "@/lib/compliance/terminology-guard";

describe("checkTerminology", () => {
  it("returns clean for safe curatorial language", () => {
    const result = checkTerminology(
      "This work demonstrates strong material sincerity and process integrity."
    );
    expect(result.clean).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it("flags 'investment value'", () => {
    const result = checkTerminology(
      "This piece has significant investment value for collectors."
    );
    expect(result.clean).toBe(false);
    expect(result.matches.length).toBeGreaterThanOrEqual(1);
    expect(result.matches[0].phrase).toBe("investment value");
  });

  it("flags 'buy signal'", () => {
    const result = checkTerminology("Strong buy signal based on current trends.");
    expect(result.clean).toBe(false);
    expect(result.matches.some((m) => m.phrase === "buy signal")).toBe(true);
  });

  it("flags 'guaranteed appreciation'", () => {
    const result = checkTerminology(
      "We see guaranteed appreciation in this category."
    );
    expect(result.clean).toBe(false);
    expect(
      result.matches.some((m) => m.phrase === "guaranteed appreciation")
    ).toBe(true);
  });

  it("flags 'expected return'", () => {
    const result = checkTerminology("The expected return on similar works is 15%.");
    expect(result.clean).toBe(false);
  });

  it("flags 'undervalued'", () => {
    const result = checkTerminology("This artist is currently undervalued.");
    expect(result.clean).toBe(false);
  });

  it("flags 'overvalued'", () => {
    const result = checkTerminology("The market considers this overvalued.");
    expect(result.clean).toBe(false);
  });

  it("flags multiple violations in one text", () => {
    const result = checkTerminology(
      "This is a strong buy signal with guaranteed appreciation and high investment value."
    );
    expect(result.clean).toBe(false);
    expect(result.matches.length).toBeGreaterThanOrEqual(3);
  });

  it("is case-insensitive", () => {
    const result = checkTerminology("INVESTMENT VALUE is important.");
    expect(result.clean).toBe(false);
  });

  it("requires word boundary for single-word terms like 'alpha'", () => {
    // "alpha" as standalone word should flag
    const result1 = checkTerminology("This generates alpha for portfolios.");
    expect(result1.clean).toBe(false);

    // "alphabet" should NOT flag
    const result2 = checkTerminology("The alphabet of visual language.");
    expect(result2.clean).toBe(true);
  });

  it("returns empty matches for empty string", () => {
    const result = checkTerminology("");
    expect(result.clean).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it("provides context around each match", () => {
    const result = checkTerminology(
      "According to experts, this represents a strong buy signal in the current market cycle."
    );
    expect(result.matches[0].context).toContain("buy signal");
    expect(result.matches[0].index).toBeGreaterThan(0);
  });
});

describe("isTerminologyClean", () => {
  it("returns true for clean text", () => {
    expect(isTerminologyClean("Beautiful material work.")).toBe(true);
  });

  it("returns false for flagged text", () => {
    expect(isTerminologyClean("Great investment value.")).toBe(false);
  });
});

describe("getBannedPhrases", () => {
  it("returns a non-empty list", () => {
    const phrases = getBannedPhrases();
    expect(phrases.length).toBeGreaterThan(0);
  });

  it("includes key financial terms", () => {
    const phrases = getBannedPhrases();
    expect(phrases).toContain("investment value");
    expect(phrases).toContain("buy signal");
    expect(phrases).toContain("guaranteed appreciation");
  });
});
