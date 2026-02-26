import { NextRequest, NextResponse } from "next/server";
import { reviewClaimSchema } from "@/lib/validation/schemas";
import {
  approveOwnershipClaim,
  OwnershipClaimError,
} from "@/lib/services/ownership-claims";
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

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // body is optional for approve
    }

    const validation = reviewClaimSchema.safeParse(body);
    const notes = validation.success ? validation.data.notes : undefined;

    const claim = await approveOwnershipClaim(id, user!, user!.authUid, notes);

    return NextResponse.json(
      { id: claim.id, status: claim.status },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof OwnershipClaimError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("[POST /api/admin/claims/[id]/approve]", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
