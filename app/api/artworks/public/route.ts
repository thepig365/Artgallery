import { NextResponse } from "next/server";
import { getPublicArtworks } from "@/lib/services/artwork-visibility";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";

/**
 * GET /api/artworks/public
 *
 * Public endpoint — returns only visible artworks with artist data.
 * Backed by getPublicArtworks() which applies { isVisible: true } filter.
 * Double-protected by RLS policy `artworks_public_read` in Supabase.
 */
export async function GET() {
  try {
    const artworks = await getPublicArtworks({ take: 100 });
    const resolved = resolveArtworksToGalleryPublicUrls(artworks);
    return NextResponse.json(resolved);
  } catch (err) {
    console.error("[GET /api/artworks/public] Error:", err);
    return NextResponse.json(
      { error: "Service unavailable — database may not be configured" },
      { status: 503 }
    );
  }
}
