import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/client";
import { generatePublicSlug } from "@/lib/passport/wall-publication";

// ── Request validation ────────────────────────────────────────
const schema = z.object({
  action: z.enum(["publish", "unpublish"]),
});

/**
 * PATCH /api/admin/private-walls/[id]
 *
 * Admin-only endpoint. Publishes or unpublishes a HostPassport record
 * to/from the Public Private Walls page.
 *
 * publish:
 *   - Sets wallPublication = PUBLIC_PRIVATE_WALLS
 *   - Generates publicSlug if one does not already exist (slug is stable)
 *   - Records publishedAt and publishedBy (admin Supabase auth UID)
 *
 * unpublish:
 *   - Sets wallPublication = PRIVATE_ONLY
 *   - Does NOT clear publicSlug — slug is preserved for future re-publication
 *   - Does NOT clear publishedAt / publishedBy (audit trail)
 *
 * Note: this endpoint does NOT promote a work into the main curated archive.
 * Promotion to the main archive is a separate operation requiring a new Artwork record.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        { status: 422 }
      );
    }

    const { action } = parsed.data;

    // ── Look up the passport record ──────────────────────────
    const existing = await prisma.hostPassport.findUnique({
      where: { id: params.id },
      select: {
        id:           true,
        artworkTitle: true,
        artistName:   true,
        publicSlug:   true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    if (action === "publish") {
      // ── Generate slug if not yet set ──────────────────────
      // Slug is stable once generated: we only generate it on first publish.
      let slug = existing.publicSlug;
      if (!slug) {
        slug = await generatePublicSlug(
          existing.artworkTitle,
          existing.artistName,
          existing.id
        );
      }

      const updated = await prisma.hostPassport.update({
        where: { id: params.id },
        data: {
          wallPublication: "PUBLIC_PRIVATE_WALLS",
          publicSlug:      slug,
          publishedAt:     new Date(),
          publishedBy:     user!.authUid,
        },
        select: {
          id:              true,
          wallPublication: true,
          publicSlug:      true,
          publishedAt:     true,
        },
      });

      return NextResponse.json(updated, { status: 200 });
    }

    // ── Unpublish ─────────────────────────────────────────────
    // wallPublication → PRIVATE_ONLY. Slug is preserved. Audit fields kept.
    const updated = await prisma.hostPassport.update({
      where: { id: params.id },
      data: {
        wallPublication: "PRIVATE_ONLY",
        // publicSlug intentionally NOT cleared — stable once set
      },
      select: {
        id:              true,
        wallPublication: true,
        publicSlug:      true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[PATCH /api/admin/private-walls/[id]]", err);
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }
}
