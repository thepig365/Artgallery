import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { computeMendIndex } from "@/lib/mend-index";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ auditSessionId: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { auditSessionId } = await params;

    const session = await prisma.auditSession.findUnique({
      where: { id: auditSessionId },
      include: { scores: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Audit session not found" },
        { status: 404 }
      );
    }

    if (session.scores.length === 0) {
      return NextResponse.json(
        { error: "No scores submitted for this session" },
        { status: 422 }
      );
    }

    const n = session.scores.length;
    const avgB = session.scores.reduce((s, r) => s + r.scoreB, 0) / n;
    const avgP = session.scores.reduce((s, r) => s + r.scoreP, 0) / n;
    const avgM = session.scores.reduce((s, r) => s + r.scoreM, 0) / n;
    const avgS = session.scores.reduce((s, r) => s + r.scoreS, 0) / n;

    const roundedB = Math.round(avgB * 100) / 100;
    const roundedP = Math.round(avgP * 100) / 100;
    const roundedM = Math.round(avgM * 100) / 100;
    const roundedS = Math.round(avgS * 100) / 100;

    const finalV = computeMendIndex({
      B: roundedB,
      P: roundedP,
      M: roundedM,
      S: roundedS,
    });

    await prisma.$transaction([
      prisma.artwork.update({
        where: { id: session.artworkId },
        data: {
          scoreB: roundedB,
          scoreP: roundedP,
          scoreM: roundedM,
          scoreS: roundedS,
          finalV,
        },
      }),
      prisma.auditSession.update({
        where: { id: auditSessionId },
        data: {
          phase: "FINALIZED",
          status: "COMPLETED",
        },
      }),
      prisma.provenanceLog.create({
        data: {
          eventType: "AUDIT_SESSION_COMPLETED",
          artworkId: session.artworkId,
          actorId: user!.id,
          detail: `Mend Index finalized: V=${finalV} (B=${roundedB}, P=${roundedP}, M=${roundedM}, S=${roundedS}) from ${n} assessor(s)`,
          metadata: {
            auditSessionId,
            assessorCount: n,
            scores: { B: roundedB, P: roundedP, M: roundedM, S: roundedS, V: finalV },
          },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      artworkId: session.artworkId,
      assessorCount: n,
      aggregated: {
        B: roundedB,
        P: roundedP,
        M: roundedM,
        S: roundedS,
        V: finalV,
      },
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/admin/audit-sessions/[id]/finalize]", err);
    return NextResponse.json(
      { error: "Failed to finalize session" },
      { status: 500 }
    );
  }
}
