import "server-only";

// ─────────────────────────────────────────────────────────────
// Server-side Supabase Storage URL resolution
//
// Converts stored proxy paths ("/api/storage/<objectPath>")
// into fresh signed URLs at request time. This avoids the
// 302-redirect approach that caused CORB failures when
// expired signed URLs returned non-image content.
// ─────────────────────────────────────────────────────────────

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * @deprecated Legacy signed-url utilities for old /api/storage references.
 * Prefer `lib/supabase/gallery-public.ts` for permanent public URLs.
 */
const BUCKET = "artist-submissions-evidence";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days
const PROXY_PREFIX = "/api/storage/";

/**
 * Resolve a stored proxy path (e.g. "/api/storage/some/path.jpg")
 * into a fresh Supabase signed URL. Server-side only.
 *
 * Returns null when the path is missing or signing fails.
 * Passes through full URLs (http/https) unchanged.
 */
export async function resolveStorageUrl(
  imageUrl: string | null | undefined
): Promise<string | null> {
  if (!imageUrl) return null;

  if (!imageUrl.startsWith(PROXY_PREFIX)) {
    // Already a full URL or unknown format — return as-is
    return imageUrl;
  }

  const objectPath = imageUrl.slice(PROXY_PREFIX.length);
  if (!objectPath) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL);

    if (error || !data?.signedUrl) {
      console.error("[resolveStorageUrl] Signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[resolveStorageUrl] Exception:", err);
    return null;
  }
}

/**
 * Resolve imageUrl for an array of artworks, returning a new array
 * with imageUrl replaced by fresh signed URLs.
 */
export async function resolveArtworkImageUrls<
  T extends { imageUrl?: string | null }
>(artworks: T[]): Promise<T[]> {
  return Promise.all(
    artworks.map(async (artwork) => ({
      ...artwork,
      imageUrl: await resolveStorageUrl(artwork.imageUrl),
    }))
  );
}
