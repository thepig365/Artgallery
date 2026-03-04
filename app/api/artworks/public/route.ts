import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";
import { Prisma } from "@prisma/client";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Check which DB env vars are present (without exposing values)
function getPresentEnvKeys(): string[] {
  const keys = ["DATABASE_URL", "DIRECT_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];
  return keys.filter((k) => !!process.env[k]);
}

/**
 * GET /api/artworks/public
 *
 * Public endpoint — returns only visible artworks with explicit field selection.
 * Uses explicit select to avoid P2022 errors from missing columns.
 */
export async function GET() {
  // Pre-flight: check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("[GET /api/artworks/public] DATABASE_URL missing at runtime");
    return NextResponse.json(
      {
        error: "DATABASE_URL missing at runtime",
        presentEnvKeys: getPresentEnvKeys(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    // Use explicit select to avoid P2022 errors from schema/db column mismatches
    const artworks = await prisma.artwork.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        artistId: true,
        year: true,
        medium: true,
        dimensions: true,
        narrative: true,
        scoreB: true,
        scoreP: true,
        scoreM: true,
        scoreS: true,
        finalV: true,
        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const resolved = resolveArtworksToGalleryPublicUrls(artworks);
    return NextResponse.json(resolved, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[GET /api/artworks/public] Error:", err);

    // Extract Prisma error info safely
    let prismaCode: string | undefined;
    let message = "Unknown error";
    let meta: Record<string, unknown> | undefined;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      prismaCode = err.code;
      message = `Prisma error ${err.code}`;
      meta = err.meta as Record<string, unknown> | undefined;
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      prismaCode = "INIT_ERROR";
      message = "Database connection initialization failed";
    } else if (err instanceof Error) {
      message = err.message.slice(0, 100); // Truncate to avoid leaking secrets
    }

    return NextResponse.json(
      {
        error: "DB connection/query failed",
        prismaCode,
        message,
        meta,
        presentEnvKeys: getPresentEnvKeys(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
