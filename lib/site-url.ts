/**
 * Returns the public site URL, ensuring it has a protocol (https://).
 * Handles env values like "artgallery.vercel.app" → "https://artgallery.vercel.app"
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}
