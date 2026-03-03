import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

/**
 * GET /api/portal/admin/assessors
 * List assessors (users with auth_uid and ASSESSOR role) for assignment dropdown.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const assessors = await prisma.assessorUser.findMany({
      where: {
        authUid: { not: null },
        role: "ASSESSOR",
        isActive: true,
      },
      select: {
        id: true,
        authUid: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    const payload = assessors
      .filter((a): a is typeof a & { authUid: string } => a.authUid != null)
      .map((a) => ({
        id: a.id,
        authUid: a.authUid,
        name: a.name,
        email: a.email,
      }));

    return NextResponse.json({ assessors: payload });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/portal/admin/assessors]", err);
    return NextResponse.json(
      { error: "Failed to fetch assessors" },
      { status: 500 }
    );
  }
}
