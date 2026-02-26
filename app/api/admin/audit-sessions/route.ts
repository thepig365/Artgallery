import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

const createSessionSchema = z.object({
  artworkId: z.string().uuid(),
  assessorIds: z.array(z.string().uuid()).optional(),
  notes: z.string().max(5000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { artworkId, assessorIds, notes } = validation.data;

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });
    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    const session = await prisma.auditSession.create({
      data: {
        artworkId,
        phase: "BLIND_SCORING",
        status: "IN_PROGRESS",
        notes: JSON.stringify({
          adminNotes: notes || null,
          assignedAssessors: assessorIds || [],
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      auditSessionId: session.id,
      artworkId: session.artworkId,
      status: session.status,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/admin/audit-sessions]", err);
    return NextResponse.json(
      { error: "Failed to create audit session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const sessions = await prisma.auditSession.findMany({
      include: {
        artwork: { select: { id: true, title: true, slug: true } },
        scores: {
          select: { id: true, assessorUserId: true, finalV: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/admin/audit-sessions]", err);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
