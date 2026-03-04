import { NextResponse } from "next/server";
import { getPublicArtworks } from "@/lib/services/artwork-visibility";
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
 * Public endpoint — returns only visible artworks with artist data.
 * Backed by getPublicArtworks() which applies { isVisible: true } filter.
 * Double-protected by RLS policy `artworks_public_read` in Supabase.
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
    const artworks = await getPublicArtworks({ take: 100 });
    const resolved = resolveArtworksToGalleryPublicUrls(artworks);
    return NextResponse.json(resolved, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[GET /api/artworks/public] Error:", err);

    // Extract Prisma error code if available
    let prismaCode: string | undefined;
    let message = "Unknown error";
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      prismaCode = err.code;
      message = `Prisma error ${err.code}`;
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
        presentEnvKeys: getPresentEnvKeys(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
