import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/client";

/**
 * GET /api/admin/private-walls
 *
 * Admin-only. Returns all HostPassport records with fields
 * needed for the Private Walls management UI.
 * Host name and email are included for internal admin review only —
 * they are never forwarded to any public page.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const records = await prisma.hostPassport.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id:              true,
        passportId:      true,
        shareToken:      true,
        status:          true,
        artworkTitle:    true,
        artistName:      true,
        medium:          true,
        dimensions:      true,
        artworkYear:     true,
        artworkType:     true,
        hostRegion:      true,
        hostName:        true,     // internal admin view only
        hostEmail:       true,     // internal admin view only
        hostPublicOptIn: true,
        wallPublication: true,
        publicSlug:      true,
        publishedAt:     true,
        publishedBy:     true,
        createdAt:       true,
      },
    });

    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/admin/private-walls]", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
