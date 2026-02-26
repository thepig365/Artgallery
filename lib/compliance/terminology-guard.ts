// ─────────────────────────────────────────────────────────────
// Terminology Guard — flags banned financial language
// ─────────────────────────────────────────────────────────────

/**
 * Banned phrases that must not appear in public-facing content.
 * Case-insensitive matching. Ordered longest-first to avoid partial match issues.
 */
const BANNED_PHRASES = [
  "guaranteed appreciation",
  "expected return",
  "investment value",
  "investment opportunity",
  "financial advice",
  "buy signal",
  "sell signal",
  "undervalued",
  "overvalued",
  "market value",
  "fair market value",
  "price target",
  "profit potential",
  "return on investment",
  "capital gains",
  "asset appreciation",
  "wealth building",
  "portfolio diversification",
  "speculative value",
  "alpha",
] as const;

export interface TerminologyMatch {
  phrase: string;
  index: number;
  context: string;
}

export interface TerminologyCheckResult {
  clean: boolean;
  matches: TerminologyMatch[];
}

/**
 * Scan a string for banned financial terminology.
 * Returns all matches with their position and surrounding context.
 */
export function checkTerminology(text: string): TerminologyCheckResult {
  if (!text || text.trim() === "") {
    return { clean: true, matches: [] };
  }

  const matches: TerminologyMatch[] = [];
  const lowerText = text.toLowerCase();

  for (const phrase of BANNED_PHRASES) {
    const lowerPhrase = phrase.toLowerCase();
    let searchFrom = 0;

    while (searchFrom < lowerText.length) {
      const idx = lowerText.indexOf(lowerPhrase, searchFrom);
      if (idx === -1) break;

      // For single-word terms like "alpha", require word boundaries
      if (lowerPhrase.split(" ").length === 1) {
        const before = idx > 0 ? lowerText[idx - 1] : " ";
        const after = idx + lowerPhrase.length < lowerText.length
          ? lowerText[idx + lowerPhrase.length]
          : " ";
        if (/\w/.test(before) || /\w/.test(after)) {
          searchFrom = idx + 1;
          continue;
        }
      }

      // Extract surrounding context (40 chars each side)
      const ctxStart = Math.max(0, idx - 40);
      const ctxEnd = Math.min(text.length, idx + phrase.length + 40);
      const context = text.slice(ctxStart, ctxEnd);

      matches.push({
        phrase,
        index: idx,
        context,
      });

      searchFrom = idx + lowerPhrase.length;
    }
  }

  // Sort by position
  matches.sort((a, b) => a.index - b.index);

  return {
    clean: matches.length === 0,
    matches,
  };
}

/**
 * Get the full list of banned phrases (useful for UI display).
 */
export function getBannedPhrases(): readonly string[] {
  return BANNED_PHRASES;
}

/**
 * Quick boolean check — is the text free of banned terminology?
 */
export function isTerminologyClean(text: string): boolean {
  return checkTerminology(text).clean;
}
