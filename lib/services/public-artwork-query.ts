// ─────────────────────────────────────────────────────────────
// Public Artwork Query — visibility-filtered access layer
//
// Pure-function equivalents of the Prisma-backed service in
// .backend-staging/lib/services/artwork-visibility.ts.
//
// These MUST stay in sync with:
//   Prisma:  publicArtworkWhereClause()  → { isVisible: true }
//   RLS:     artworks_public_read        → USING (is_visible = true)
// ─────────────────────────────────────────────────────────────

import type { ArtworkWithArtist } from "@/lib/audit/redaction";

/**
 * Artwork extended with visibility fields, matching the Prisma Artwork model.
 */
export interface ArtworkWithVisibility extends ArtworkWithArtist {
  isVisible: boolean;
  hiddenReason?: string | null;
  hiddenAt?: Date | string | null;
  hiddenBy?: string | null;
}

/**
 * The visibility predicate used by public-facing queries.
 *
 * Single source of truth for the in-memory filter.
 * Equivalent to: Prisma WHERE { isVisible: true }
 *                RLS    USING (is_visible = true)
 */
export function isPubliclyVisible(artwork: ArtworkWithVisibility): boolean {
  return artwork.isVisible === true;
}

/**
 * Filter a list of artworks to only those publicly visible.
 * In-memory equivalent of getPublicArtworks().
 */
export function filterPublicArtworks<T extends ArtworkWithVisibility>(
  artworks: T[]
): T[] {
  return artworks.filter(isPubliclyVisible);
}

/**
 * Find a single artwork by ID, returning it only if publicly visible.
 * Returns null if the artwork doesn't exist or is hidden.
 *
 * This is the contract for public detail pages:
 * a hidden artwork MUST return null, not the hidden record.
 */
export function findPublicArtworkById<T extends ArtworkWithVisibility>(
  artworks: T[],
  id: string
): T | null {
  const artwork = artworks.find((a) => a.id === id);
  if (!artwork || !isPubliclyVisible(artwork)) return null;
  return artwork;
}
