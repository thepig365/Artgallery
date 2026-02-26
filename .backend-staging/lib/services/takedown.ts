// ─────────────────────────────────────────────────────────────
// Takedown Request Service — MVP intake + provenance logging
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db/client";

export interface CreateTakedownParams {
  artworkId: string;
  complainantName: string;
  contactEmail: string;
  workUrl: string;
  complaintBasis: string;
  evidenceLinks: string[];
  declarationAccepted: true;
}

export class TakedownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TakedownError";
  }
}

/**
 * Create a new takedown request and log it to provenance.
 */
export async function createTakedownRequest(params: CreateTakedownParams) {
  if (!params.declarationAccepted) {
    throw new TakedownError("Declaration must be accepted");
  }

  const [request, log] = await prisma.$transaction([
    prisma.takedownRequest.create({
      data: {
        artworkId: params.artworkId,
        complainantName: params.complainantName,
        contactEmail: params.contactEmail,
        workUrl: params.workUrl,
        complaintBasis: params.complaintBasis,
        evidenceLinks: params.evidenceLinks,
        declarationAccepted: params.declarationAccepted,
        status: "OPEN",
      },
    }),
    prisma.provenanceLog.create({
      data: {
        eventType: "TAKEDOWN_REQUESTED",
        artworkId: params.artworkId,
        detail: `Takedown requested by ${params.complainantName}`,
        metadata: {
          contactEmail: params.contactEmail,
          workUrl: params.workUrl,
          complaintBasis: params.complaintBasis,
        },
      },
    }),
  ]);

  return { request, log };
}

/**
 * Resolve a takedown request (admin action).
 */
export async function resolveTakedownRequest(
  requestId: string,
  resolution: {
    status: "REVIEWED" | "RESOLVED" | "REJECTED";
    reviewNotes?: string;
    actorId: string;
  }
) {
  const now = new Date();
  const data: Record<string, unknown> = {
    status: resolution.status,
    reviewNotes: resolution.reviewNotes ?? null,
    reviewedAt: now,
  };

  if (resolution.status === "RESOLVED" || resolution.status === "REJECTED") {
    data.resolvedAt = now;
  }

  const [request] = await prisma.$transaction(async (tx) => {
    const updated = await tx.takedownRequest.update({
      where: { id: requestId },
      data,
    });

    const log = await tx.provenanceLog.create({
      data: {
        eventType: "TAKEDOWN_RESOLVED",
        artworkId: updated.artworkId,
        actorId: resolution.actorId,
        detail: `Takedown ${resolution.status.toLowerCase()}: ${resolution.reviewNotes ?? "No notes"}`,
        metadata: {
          requestId,
          status: resolution.status,
        },
      },
    });

    return [updated, log] as const;
  });

  return request;
}
