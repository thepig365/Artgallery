import { createClient } from "@supabase/supabase-js";

const PUBLIC_BUCKET = "gallery-public";
const LEGACY_PROXY_PREFIX = "/api/storage/";

function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return null;
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function normalizeGalleryPublicPath(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  if (v.startsWith(LEGACY_PROXY_PREFIX)) {
    return v.slice(LEGACY_PROXY_PREFIX.length);
  }

  if (v.startsWith("/")) {
    return v.replace(/^\/+/, "");
  }

  if (v.startsWith("http://") || v.startsWith("https://")) {
    try {
      const u = new URL(v);
      const publicPrefix = `/storage/v1/object/public/${PUBLIC_BUCKET}/`;
      const idx = u.pathname.indexOf(publicPrefix);
      if (idx >= 0) {
        return decodeURIComponent(u.pathname.slice(idx + publicPrefix.length));
      }
      return null;
    } catch {
      return null;
    }
  }

  return v;
}

export function toGalleryPublicUrl(
  objectPath: string | null | undefined
): string | null {
  const normalized = normalizeGalleryPublicPath(objectPath);
  if (!normalized) return null;
  const supabase = getSupabasePublicClient();
  if (!supabase) return null;
  const { data } = supabase.storage
    .from(PUBLIC_BUCKET)
    .getPublicUrl(normalized);
  return data.publicUrl || null;
}

export function resolveArtworksToGalleryPublicUrls<
  T extends { imageUrl?: string | null }
>(artworks: T[]): T[] {
  return artworks.map((artwork) => ({
    ...artwork,
    imageUrl: toGalleryPublicUrl(artwork.imageUrl),
  }));
}
