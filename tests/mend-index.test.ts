import { describe, it, expect } from "vitest";
import {
  computeMendIndex,
  buildMendIndexFields,
  MendIndexError,
} from "@/lib/mend-index";

describe("computeMendIndex", () => {
  it("computes correct weighted sum for standard scores", () => {
    // V = (7.2 * 0.25) + (8.1 * 0.20) + (6.5 * 0.35) + (7.8 * 0.20)
    // V = 1.80 + 1.62 + 2.275 + 1.56 = 7.255 → 7.26 (rounded)
    const result = computeMendIndex({ B: 7.2, P: 8.1, M: 6.5, S: 7.8 });
    expect(result).toBe(7.26);
  });

  it("returns 0 for all-zero scores", () => {
    expect(computeMendIndex({ B: 0, P: 0, M: 0, S: 0 })).toBe(0);
  });

  it("returns 10 for all-ten scores", () => {
    // 10*0.25 + 10*0.20 + 10*0.35 + 10*0.20 = 2.5+2.0+3.5+2.0 = 10.0
    expect(computeMendIndex({ B: 10, P: 10, M: 10, S: 10 })).toBe(10);
  });

  it("rounds to exactly 2 decimal places", () => {
    // B=1, P=1, M=1, S=1 → 0.25+0.20+0.35+0.20 = 1.00
    expect(computeMendIndex({ B: 1, P: 1, M: 1, S: 1 })).toBe(1);

    // B=3.33, P=6.67, M=4.44, S=8.88
    // 3.33*0.25=0.8325, 6.67*0.20=1.334, 4.44*0.35=1.554, 8.88*0.20=1.776
    // sum = 5.4965 → 5.50
    const result = computeMendIndex({ B: 3.33, P: 6.67, M: 4.44, S: 8.88 });
    expect(result).toBe(5.5);
  });

  it("handles boundary values (0 and 10 mixed)", () => {
    // B=0, P=10, M=0, S=10
    // 0 + 2.0 + 0 + 2.0 = 4.0
    expect(computeMendIndex({ B: 0, P: 10, M: 0, S: 10 })).toBe(4);
  });

  it("handles M-dominant weighting correctly", () => {
    // Only M is high, rest are 0
    // 0 + 0 + 10*0.35 + 0 = 3.5
    expect(computeMendIndex({ B: 0, P: 0, M: 10, S: 0 })).toBe(3.5);
  });

  // ── Error cases ─────────────────────────────────────────

  it("rejects negative scores", () => {
    expect(() => computeMendIndex({ B: -1, P: 5, M: 5, S: 5 })).toThrow(
      MendIndexError
    );
  });

  it("rejects scores above 10", () => {
    expect(() => computeMendIndex({ B: 5, P: 5, M: 11, S: 5 })).toThrow(
      MendIndexError
    );
  });

  it("rejects NaN", () => {
    expect(() => computeMendIndex({ B: NaN, P: 5, M: 5, S: 5 })).toThrow(
      MendIndexError
    );
  });

  it("rejects Infinity", () => {
    expect(() =>
      computeMendIndex({ B: 5, P: Infinity, M: 5, S: 5 })
    ).toThrow(MendIndexError);
  });

  it("rejects -Infinity", () => {
    expect(() =>
      computeMendIndex({ B: 5, P: 5, M: -Infinity, S: 5 })
    ).toThrow(MendIndexError);
  });
});

describe("buildMendIndexFields", () => {
  it("returns all score fields plus computed finalV", () => {
    const result = buildMendIndexFields({ B: 7, P: 8, M: 6, S: 7 });
    expect(result).toEqual({
      scoreB: 7,
      scoreP: 8,
      scoreM: 6,
      scoreS: 7,
      finalV: expect.any(Number),
    });
    // V = 7*0.25 + 8*0.20 + 6*0.35 + 7*0.20 = 1.75+1.60+2.10+1.40 = 6.85
    expect(result.finalV).toBe(6.85);
  });
});
