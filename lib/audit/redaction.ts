// ─────────────────────────────────────────────────────────────
// Blind scoring redaction service
// During BLIND_SCORING phase, identity/market fields are hidden
// ─────────────────────────────────────────────────────────────

/**
 * Fields to redact during blind scoring phase.
 * Structured for future extensibility (add fields here).
 */
const BLIND_REDACTED_FIELDS = [
  "artistName",
  "artistSlug",
  "artistBio",
  "artistWebsite",
  "sourceUrl",
  "sourcePlatform",
  "marketPrice",
  "sourceAttribution",
] as const;

const REDACTED_PLACEHOLDER = "[REDACTED — BLIND PHASE]";

type AuditPhase = "BLIND_SCORING" | "OPEN_REVIEW" | "VARIANCE_CHECK" | "FINALIZED";

export interface ArtworkWithArtist {
  id: string;
  title: string;
  slug: string;
  medium?: string | null;
  year?: number | null;
  dimensions?: string | null;
  materials?: string | null;
  narrative?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  sourceLicenseStatus?: string | null;
  scoreB?: number | null;
  scoreP?: number | null;
  scoreM?: number | null;
  scoreS?: number | null;
  finalV?: number | null;
  artist?: {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    website?: string | null;
  } | null;
  // Future-proof: optional market fields
  marketPrice?: number | null;
  sourcePlatform?: string | null;
  sourceAttribution?: string | null;
}

export interface RedactedArtwork {
  id: string;
  title: string;
  slug: string;
  medium?: string | null;
  year?: number | null;
  dimensions?: string | null;
  materials?: string | null;
  narrative?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  sourceLicenseStatus?: string | null;
  scoreB?: number | null;
  scoreP?: number | null;
  scoreM?: number | null;
  scoreS?: number | null;
  finalV?: number | null;
  artist?: {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    website?: string | null;
  } | null;
  marketPrice?: number | null;
  sourcePlatform?: string | null;
  sourceAttribution?: string | null;
  _redacted: boolean;
  _redactedFields: string[];
}

/**
 * Apply blind-phase redaction to an artwork record.
 * Returns a new object with identity/market fields replaced.
 *
 * Only redacts during BLIND_SCORING phase. All other phases return data as-is.
 */
export function redactForBlindScoring(
  artwork: ArtworkWithArtist,
  phase: AuditPhase
): RedactedArtwork {
  if (phase !== "BLIND_SCORING") {
    return { ...artwork, _redacted: false, _redactedFields: [] };
  }

  const redactedFields: string[] = [];

  const result: RedactedArtwork = {
    ...artwork,
    _redacted: true,
    _redactedFields: [],
  };

  // Redact artist identity
  if (result.artist) {
    result.artist = {
      id: result.artist.id,
      name: REDACTED_PLACEHOLDER,
      slug: REDACTED_PLACEHOLDER,
      bio: REDACTED_PLACEHOLDER,
      website: null,
    };
    redactedFields.push("artistName", "artistSlug", "artistBio", "artistWebsite");
  }

  // Redact source/market fields
  if (result.sourceUrl !== undefined && result.sourceUrl !== null) {
    result.sourceUrl = REDACTED_PLACEHOLDER;
    redactedFields.push("sourceUrl");
  }

  if (result.sourcePlatform !== undefined && result.sourcePlatform !== null) {
    result.sourcePlatform = REDACTED_PLACEHOLDER;
    redactedFields.push("sourcePlatform");
  }

  if (result.marketPrice !== undefined && result.marketPrice !== null) {
    result.marketPrice = null;
    redactedFields.push("marketPrice");
  }

  if (result.sourceAttribution !== undefined && result.sourceAttribution !== null) {
    result.sourceAttribution = REDACTED_PLACEHOLDER;
    redactedFields.push("sourceAttribution");
  }

  result._redactedFields = redactedFields;
  return result;
}

/**
 * Get the list of fields that are redacted during blind scoring.
 */
export function getBlindRedactedFields(): readonly string[] {
  return BLIND_REDACTED_FIELDS;
}

/**
 * Check if a given phase requires redaction.
 */
export function isBlindPhase(phase: AuditPhase): boolean {
  return phase === "BLIND_SCORING";
}
