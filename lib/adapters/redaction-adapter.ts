import type { ArtworkWithArtist, RedactedArtwork } from "@/lib/audit/redaction";
import { redactForBlindScoring } from "@/lib/audit/redaction";
import type { BlindSubmission, SubmissionEvidence } from "@/lib/types";

type AuditPhase = "BLIND_SCORING" | "OPEN_REVIEW" | "VARIANCE_CHECK" | "FINALIZED";

/**
 * Maps backend ArtworkWithArtist shape to the UI BlindSubmission shape,
 * applying blind-scoring redaction when appropriate.
 *
 * Field mapping:
 *   backend.title        → ui.workTitle
 *   backend.materials    → ui.materials (split by comma from flat string)
 *   backend.artist.name  → redacted in BLIND_SCORING phase
 *   backend.slug         → not exposed to UI
 */
export function toBlindSubmission(
  artwork: ArtworkWithArtist,
  phase: AuditPhase,
  evidence: SubmissionEvidence[]
): BlindSubmission & { _redacted: boolean; _redactedFields: string[] } {
  const redacted: RedactedArtwork = redactForBlindScoring(artwork, phase);

  return {
    id: redacted.id,
    workTitle: redacted._redacted ? "[REDACTED FOR BLIND REVIEW]" : redacted.title,
    medium: redacted.medium ?? "",
    year: redacted.year ?? 0,
    dimensions: redacted.dimensions ?? "",
    materials: parseMaterialsList(redacted.materials),
    narrative: redacted.narrative ?? "",
    evidence,
    _redacted: redacted._redacted,
    _redactedFields: redacted._redactedFields,
  };
}

function parseMaterialsList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
