import { NextRequest, NextResponse } from "next/server";
import { getOwnershipStatus } from "@/lib/services/ownership-claims";
import { resolveAuthUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const artworkId = request.nextUrl.searchParams.get("artworkId");
  if (!artworkId) {
    return NextResponse.json(
      { error: "artworkId is required" },
      { status: 400 }
    );
  }

  const authUser = await resolveAuthUser();
  const status = await getOwnershipStatus(
    authUser?.authUid ?? null,
    artworkId
  );

  return NextResponse.json({
    authenticated: !!authUser,
    ownershipStatus: status,
  });
}
