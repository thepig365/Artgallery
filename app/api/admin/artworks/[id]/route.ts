import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

/**
 * PATCH /api/admin/artworks/[id]
 *
 * Admin-only — update artwork fields (e.g. imageUrl for artworks missing images).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    const { id } = await params;
    const body = await request.json();

    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : undefined;

    if (imageUrl === undefined) {
      return NextResponse.json(
        { error: "No valid imageUrl provided" },
        { status: 400 }
      );
    }

    const artwork = await prisma.artwork.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json({
      ok: true,
      artwork: {
        id: artwork.id,
        imageUrl: artwork.imageUrl,
      },
    });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[PATCH /api/admin/artworks/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update artwork" },
      { status: 500 }
    );
  }
}
