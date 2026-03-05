import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ auditSessionId: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const { auditSessionId } = await params;

    const session = await prisma.auditSession.findUnique({
      where: { id: auditSessionId },
      select: {
        id: true,
        status: true,
        phase: true,
        artwork: {
          select: {
            id: true,
            title: true,
            medium: true,
            year: true,
            dimensions: true,
            materials: true,
            narrative: true,
            imageUrl: true,
          },
        },
        scores: {
          where: { assessorUserId: user!.id },
          select: {
            scoreB: true,
            scoreP: true,
            scoreM: true,
            scoreS: true,
            finalV: true,
            notes: true,
          },
          take: 1,
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Audit session not found" },
        { status: 404 }
      );
    }

    const artwork = session.artwork;
    const myScore = session.scores[0] || null;
    const materials = artwork.materials
      ? artwork.materials.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        phase: session.phase,
        isFinalized:
          session.status === "COMPLETED" || session.phase === "FINALIZED",
      },
      submission: {
        id: artwork.id,
        workTitle: artwork.title,
        medium: artwork.medium || "Not specified",
        year: artwork.year || 0,
        dimensions: artwork.dimensions || "Not specified",
        materials,
        narrative: artwork.narrative || "",
        evidence: artwork.imageUrl
          ? [
              {
                id: "img-1",
                url: artwork.imageUrl,
                label: artwork.title,
                type: "detail" as const,
              },
            ]
          : [],
      },
      myScore: myScore
        ? {
            B: myScore.scoreB,
            P: myScore.scoreP,
            M: myScore.scoreM,
            S: myScore.scoreS,
            finalV: myScore.finalV,
            notes: myScore.notes || "",
          }
        : null,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2021" || err.code === "P2022")
    ) {
      console.error("[GET /api/portal/assessor/session/[id]] schema mismatch", {
        code: err.code,
      });
      return NextResponse.json(
        { error: "Session data is temporarily unavailable" },
        { status: 503 }
      );
    }
    console.error("[GET /api/portal/assessor/session/[id]]", err);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}
