import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import { canManageArtwork } from "./ownership-claims";

export class OwnerVisibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnerVisibilityError";
  }
}

export interface OwnerToggleParams {
  artworkId: string;
  isVisible: boolean;
  reason?: string;
}

/**
 * Owner-only artwork visibility toggle with provenance logging.
 * Verifies ownership via canManageArtwork() before mutation.
 */
export async function ownerToggleArtworkVisibility(
  params: OwnerToggleParams,
  ownerAuthUid: string,
  ownerId: string
) {
  const isOwner = await canManageArtwork(ownerAuthUid, params.artworkId);
  if (!isOwner) {
    throw new OwnerVisibilityError(
      "You are not the verified owner of this artwork"
    );
  }

  if (!params.isVisible && (!params.reason || params.reason.trim() === "")) {
    throw new OwnerVisibilityError("Reason is required when hiding an artwork");
  }

  const artworkUpdate: Prisma.ArtworkUpdateInput = params.isVisible
    ? {
        isVisible: true,
        hiddenReason: null,
        hiddenAt: null,
        hiddenBy: null,
      }
    : {
        isVisible: false,
        hiddenReason: params.reason!.trim(),
        hiddenAt: new Date(),
        hiddenBy: ownerId,
      };

  const [artwork] = await prisma.$transaction([
    prisma.artwork.update({
      where: { id: params.artworkId },
      data: artworkUpdate,
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: params.isVisible ? "OWNER_UNHIDDEN" : "OWNER_HIDDEN",
        artworkId: params.artworkId,
        actorId: ownerId,
        detail: params.isVisible
          ? `Owner made artwork visible again${params.reason ? `: ${params.reason.trim()}` : ""}`
          : `Owner hidden: ${params.reason!.trim()}`,
        metadata: {
          isVisible: params.isVisible,
          reason: params.reason?.trim() ?? null,
          ownerAuthUid,
        },
      },
    }),
  ]);

  return artwork;
}
