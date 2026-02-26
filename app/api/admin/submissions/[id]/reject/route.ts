import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;

    const submission = await prisma.artistSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.status !== "RECEIVED" && submission.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: `Cannot reject submission with status: ${submission.status}` },
        { status: 422 }
      );
    }

    let reason = "Rejected by admin";
    try {
      const body = await request.json();
      if (body?.reason && typeof body.reason === "string") {
        reason = body.reason;
      }
    } catch {
      // body is optional
    }

    await prisma.artistSubmission.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({
      ok: true,
      submissionStatus: "REJECTED",
      reason,
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/admin/submissions/[id]/reject]", err);
    return NextResponse.json(
      { error: "Failed to reject submission" },
      { status: 500 }
    );
  }
}
