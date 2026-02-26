import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { computeMendIndex } from "@/lib/mend-index";

const score = z.number().min(0, "Score must be >= 0").max(10, "Score must be <= 10");

const submitScoreSchema = z.object({
  auditSessionId: z.string().uuid(),
  B: score,
  P: score,
  M: score,
  S: score,
  notes: z.string().max(5000).optional(),
  isFinal: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");

    const body = await request.json();
    const validation = submitScoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { auditSessionId, B, P, M, S, notes } = validation.data;

    const session = await prisma.auditSession.findUnique({
      where: { id: auditSessionId },
    });
    if (!session) {
      return NextResponse.json(
        { error: "Audit session not found" },
        { status: 404 }
      );
    }

    if (session.status === "COMPLETED" || session.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Session is already finalized" },
        { status: 422 }
      );
    }

    const finalV = computeMendIndex({ B, P, M, S });

    const saved = await prisma.auditScore.upsert({
      where: {
        one_score_per_assessor_session: {
          auditSessionId,
          assessorUserId: user!.id,
        },
      },
      create: {
        auditSessionId,
        assessorUserId: user!.id,
        scoreB: B,
        scoreP: P,
        scoreM: M,
        scoreS: S,
        finalV,
        notes: notes || null,
      },
      update: {
        scoreB: B,
        scoreP: P,
        scoreM: M,
        scoreS: S,
        finalV,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      ok: true,
      scoreId: saved.id,
      scores: { B: saved.scoreB, P: saved.scoreP, M: saved.scoreM, S: saved.scoreS },
      finalV: saved.finalV,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/portal/assessor/scores]", err);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}
