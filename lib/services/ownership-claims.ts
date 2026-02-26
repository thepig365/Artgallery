import { prisma } from "@/lib/db/client";
import type { SessionUser } from "@/lib/auth/roles";

export class OwnershipClaimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnershipClaimError";
  }
}

export interface CreateClaimParams {
  artworkId: string;
  claimantName: string;
  claimantEmail: string;
  relationshipToArtwork: "ARTIST" | "OWNER" | "AGENT" | "RIGHTS_HOLDER" | "OTHER";
  evidenceText: string;
}

/**
 * Any authenticated Supabase user can create a claim.
 * actorId is set only if the user has an assessor_users row;
 * otherwise the authUid is stored in metadata for traceability.
 */
export async function createOwnershipClaim(
  params: CreateClaimParams,
  authUid: string,
  assessorId?: string | null
) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.artworkId },
  });
  if (!artwork) {
    throw new OwnershipClaimError("Artwork not found");
  }

  const existingPending = await prisma.ownershipClaim.findFirst({
    where: {
      artworkId: params.artworkId,
      claimantAuthUid: authUid,
      status: "PENDING",
    },
  });
  if (existingPending) {
    throw new OwnershipClaimError(
      "You already have a pending ownership claim for this artwork"
    );
  }

  const [claim] = await prisma.$transaction([
    prisma.ownershipClaim.create({
      data: {
        artworkId: params.artworkId,
        claimantAuthUid: authUid,
        claimantEmail: params.claimantEmail,
        claimantName: params.claimantName,
        relationshipToArtwork: params.relationshipToArtwork,
        evidenceText: params.evidenceText,
      },
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: "OWNERSHIP_CLAIMED",
        artworkId: params.artworkId,
        actorId: assessorId ?? null,
        detail: `Ownership claimed by ${params.claimantName} (${params.relationshipToArtwork})`,
        metadata: {
          authUid,
          claimantEmail: params.claimantEmail,
          relationship: params.relationshipToArtwork,
        },
      },
    }),
  ]);

  return claim;
}

export async function listOwnershipClaimsForAdmin() {
  return prisma.ownershipClaim.findMany({
    include: { artwork: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function approveOwnershipClaim(
  claimId: string,
  adminUser: SessionUser,
  adminAuthUid: string,
  notes?: string
) {
  const claim = await prisma.ownershipClaim.findUnique({
    where: { id: claimId },
  });
  if (!claim) throw new OwnershipClaimError("Claim not found");
  if (claim.status !== "PENDING") {
    throw new OwnershipClaimError(`Claim is already ${claim.status.toLowerCase()}`);
  }

  const [updated] = await prisma.$transaction([
    prisma.ownershipClaim.update({
      where: { id: claimId },
      data: {
        status: "APPROVED",
        reviewedByAuthUid: adminAuthUid,
        reviewNotes: notes ?? null,
        reviewedAt: new Date(),
      },
    }),
    prisma.artwork.update({
      where: { id: claim.artworkId },
      data: { ownerAuthUid: claim.claimantAuthUid },
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: "OWNERSHIP_APPROVED",
        artworkId: claim.artworkId,
        actorId: adminUser.id,
        detail: `Ownership approved for ${claim.claimantName}`,
        metadata: { claimId, notes: notes ?? null },
      },
    }),
  ]);

  return updated;
}

export async function rejectOwnershipClaim(
  claimId: string,
  adminUser: SessionUser,
  adminAuthUid: string,
  reason: string
) {
  const claim = await prisma.ownershipClaim.findUnique({
    where: { id: claimId },
  });
  if (!claim) throw new OwnershipClaimError("Claim not found");
  if (claim.status !== "PENDING") {
    throw new OwnershipClaimError(`Claim is already ${claim.status.toLowerCase()}`);
  }

  const [updated] = await prisma.$transaction([
    prisma.ownershipClaim.update({
      where: { id: claimId },
      data: {
        status: "REJECTED",
        reviewedByAuthUid: adminAuthUid,
        reviewNotes: reason,
        reviewedAt: new Date(),
      },
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: "OWNERSHIP_REJECTED",
        artworkId: claim.artworkId,
        actorId: adminUser.id,
        detail: `Ownership rejected for ${claim.claimantName}: ${reason}`,
        metadata: { claimId, reason },
      },
    }),
  ]);

  return updated;
}

/**
 * Server-side ownership check.
 * Returns true only if the user's auth UID matches the artwork's ownerAuthUid.
 */
export async function canManageArtwork(
  authUid: string,
  artworkId: string
): Promise<boolean> {
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { ownerAuthUid: true },
  });
  if (!artwork || !artwork.ownerAuthUid) return false;
  return artwork.ownerAuthUid === authUid;
}

/**
 * Get the ownership status for a user + artwork pair.
 * Used by the UI to decide which buttons to show.
 */
export async function getOwnershipStatus(
  authUid: string | null,
  artworkId: string
): Promise<"none" | "pending" | "approved" | "rejected"> {
  if (!authUid) return "none";

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { ownerAuthUid: true },
  });
  if (artwork?.ownerAuthUid === authUid) return "approved";

  const claim = await prisma.ownershipClaim.findFirst({
    where: { artworkId, claimantAuthUid: authUid },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  if (!claim) return "none";
  return claim.status.toLowerCase() as "pending" | "approved" | "rejected";
}
