// ─────────────────────────────────────────────────────────────
// Artwork Visibility Service — hide/unhide + audit logging
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";

export interface ToggleVisibilityParams {
  artworkId: string;
  isVisible: boolean;
  reason?: string;
  actorId: string;
}

export class VisibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisibilityError";
  }
}

/**
 * Toggle artwork visibility with audit trail.
 * When hiding: reason is required, hiddenAt/hiddenBy are set.
 * When unhiding: reason is optional, hiddenAt/hiddenBy are cleared.
 * Always writes a ProvenanceLog entry.
 */
export async function toggleArtworkVisibility(
  params: ToggleVisibilityParams
) {
  const { artworkId, isVisible, reason, actorId } = params;

  // Validate: reason required when hiding
  if (!isVisible && (!reason || reason.trim() === "")) {
    throw new VisibilityError("Reason is required when hiding an artwork");
  }

  const artworkUpdate: Prisma.ArtworkUpdateInput = isVisible
    ? {
        isVisible: true,
        hiddenReason: null,
        hiddenAt: null,
        hiddenBy: null,
      }
    : {
        isVisible: false,
        hiddenReason: reason!.trim(),
        hiddenAt: new Date(),
        hiddenBy: actorId,
      };

  // Transactional: update artwork + write provenance log
  const [artwork, log] = await prisma.$transaction([
    prisma.artwork.update({
      where: { id: artworkId },
      data: artworkUpdate,
      select: {
        id: true,
        isVisible: true,
        hiddenReason: true,
        hiddenAt: true,
        hiddenBy: true,
      },
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: isVisible ? "ARTWORK_UNHIDDEN" : "ARTWORK_HIDDEN",
        artworkId,
        actorId,
        detail: isVisible
          ? `Artwork made visible again${reason ? `: ${reason.trim()}` : ""}`
          : `Artwork hidden: ${reason!.trim()}`,
        metadata: { isVisible, reason: reason?.trim() ?? null },
      },
    }),
  ]);

  return { artwork, log };
}

/**
 * Query filter for public-facing artwork lists.
 * Only returns visible artworks.
 */
export function publicArtworkWhereClause(): Prisma.ArtworkWhereInput {
  return { isVisible: true };
}

/**
 * Fetch visible artworks for public display.
 */
export async function getPublicArtworks(
  options?: {
    take?: number;
    skip?: number;
    orderBy?: Prisma.ArtworkOrderByWithRelationInput;
  }
) {
  return prisma.artwork.findMany({
    where: publicArtworkWhereClause(),
    include: { artist: true },
    take: options?.take ?? 50,
    skip: options?.skip ?? 0,
    orderBy: options?.orderBy ?? { createdAt: "desc" },
  });
}

/**
 * Fetch a single visible artwork by slug.
 * Returns null if the artwork doesn't exist or is hidden.
 */
export async function getPublicArtworkBySlug(slug: string) {
  return prisma.artwork.findFirst({
    where: { ...publicArtworkWhereClause(), slug },
    include: { artist: true },
  });
}
