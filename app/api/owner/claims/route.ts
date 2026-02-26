import { NextRequest, NextResponse } from "next/server";
import { createOwnershipClaimSchema } from "@/lib/validation/schemas";
import {
  createOwnershipClaim,
  OwnershipClaimError,
} from "@/lib/services/ownership-claims";
import { resolveAuthUser, resolveSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = createOwnershipClaimSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: validation.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 422 }
      );
    }

    const sessionUser = await resolveSessionUser();
    const { declarationAccepted: _, ...claimData } = validation.data;
    const claim = await createOwnershipClaim(
      claimData,
      authUser.authUid,
      sessionUser?.id
    );

    return NextResponse.json(
      { id: claim.id, status: claim.status },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof OwnershipClaimError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("[POST /api/owner/claims]", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
