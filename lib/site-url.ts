/**
 * Single source of truth for canonical, og:url, sitemap, metadataBase.
 * Uses NEXT_PUBLIC_SITE_URL when set and NOT vercel.app; otherwise gallery.bayviewhub.me.
 * Ensures metadata never emits vercel.app even when Vercel sets wrong env.
 */
const ENV_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const SITE_URL =
  ENV_URL && !ENV_URL.includes("vercel.app")
    ? ENV_URL.startsWith("http")
      ? ENV_URL
      : `https://${ENV_URL}`
    : "https://gallery.bayviewhub.me";

/** @deprecated Use SITE_URL — kept for backwards compatibility */
export function getSiteUrl(): string {
  return SITE_URL;
}
