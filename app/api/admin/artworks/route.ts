import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { adminArtworkSelect } from "@/lib/services/admin-artworks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/artworks
 *
 * Admin-only endpoint — returns ALL artworks (including hidden) with artist data.
 * Used by the admin visibility panel to list and manage artwork visibility.
 * Fail-closed: returns 401 when auth is not configured.
 */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const artworks = await prisma.artwork.findMany({
      select: adminArtworkSelect,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(artworks, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json(
        { error: err.message },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    console.error("[GET /api/admin/artworks] Error:", err);
    return NextResponse.json(
      { error: "Service unavailable — database or auth may not be configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
