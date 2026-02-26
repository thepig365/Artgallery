import { NextResponse } from "next/server";
import { listOwnershipClaimsForAdmin } from "@/lib/services/ownership-claims";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const claims = await listOwnershipClaimsForAdmin();
    return NextResponse.json(claims);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/admin/claims]", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
