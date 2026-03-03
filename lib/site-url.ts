const PRODUCTION_SITE_URL = "https://gallery.bayviewhub.me";

/**
 * Returns the public site URL for canonical, og:url, sitemap, etc.
 * Uses NEXT_PUBLIC_SITE_URL when set, otherwise falls back to production domain.
 * Handles env values like "artgallery.vercel.app" → "https://artgallery.vercel.app"
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}
