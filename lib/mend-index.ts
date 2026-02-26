// ─────────────────────────────────────────────────────────────
// Mend Index — V = (B × 0.25) + (P × 0.20) + (M × 0.35) + (S × 0.20)
// ─────────────────────────────────────────────────────────────

const WEIGHTS = {
  B: 0.25,
  P: 0.2,
  M: 0.35,
  S: 0.2,
} as const;

const MIN_SCORE = 0;
const MAX_SCORE = 10;

export interface MendScores {
  B: number;
  P: number;
  M: number;
  S: number;
}

export class MendIndexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MendIndexError";
  }
}

/**
 * Validate a single score is a finite number within [0, 10].
 */
function validateScore(label: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new MendIndexError(
      `Invalid score for ${label}: must be a finite number, got ${String(value)}`
    );
  }
  if (value < MIN_SCORE || value > MAX_SCORE) {
    throw new MendIndexError(
      `Score ${label} out of range: ${value} (must be ${MIN_SCORE}–${MAX_SCORE})`
    );
  }
}

/**
 * Pure function: compute the Mend Index finalV from four axis scores.
 * Deterministic rounding to 2 decimal places.
 */
export function computeMendIndex(scores: MendScores): number {
  validateScore("B", scores.B);
  validateScore("P", scores.P);
  validateScore("M", scores.M);
  validateScore("S", scores.S);

  const raw =
    scores.B * WEIGHTS.B +
    scores.P * WEIGHTS.P +
    scores.M * WEIGHTS.M +
    scores.S * WEIGHTS.S;

  // Deterministic rounding to 2 decimal places
  return Math.round(raw * 100) / 100;
}

/**
 * Service-layer helper: compute finalV and return the fields to persist.
 * Intended for use in artwork or audit-score update operations.
 */
export function buildMendIndexFields(scores: MendScores) {
  const finalV = computeMendIndex(scores);
  return {
    scoreB: scores.B,
    scoreP: scores.P,
    scoreM: scores.M,
    scoreS: scores.S,
    finalV,
  };
}
