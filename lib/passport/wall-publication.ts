import "server-only";
import { prisma } from "@/lib/db/client";

// ─────────────────────────────────────────────────────────────
// Wall publication helpers
//
// Handles slug generation for the Public Private Walls programme.
// Slugs are stable once generated and are never cleared on unpublish.
// ─────────────────────────────────────────────────────────────

/**
 * Derive a URL-safe base slug from artwork title and artist name.
 * Strips special characters, collapses whitespace to hyphens, and
 * truncates to 80 chars. Produces a clean, readable slug.
 */
function deriveBaseSlug(artworkTitle: string, artistName: string): string {
  return `${artworkTitle} ${artistName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")      // keep alphanum, space, hyphen
    .trim()
    .replace(/\s+/g, "-")              // spaces → hyphens
    .replace(/-+/g, "-")               // collapse repeated hyphens
    .slice(0, 80)
    .replace(/^-|-$/g, "");            // trim leading/trailing hyphens
}

/**
 * Generate a unique public slug for a HostPassport record.
 *
 * Strategy:
 *   1. Try the clean base slug derived from title + artist.
 *   2. If taken, append the first 6 chars of the record's UUID.
 *   3. If still taken (extremely unlikely), append the full short UUID.
 *
 * Returns a slug that does not currently exist in the database.
 */
export async function generatePublicSlug(
  artworkTitle: string,
  artistName: string,
  recordId: string
): Promise<string> {
  const base = deriveBaseSlug(artworkTitle, artistName);

  // Attempt 1 — clean base
  const exists1 = await prisma.hostPassport.findUnique({
    where: { publicSlug: base },
    select: { id: true },
  });
  if (!exists1) return base;

  // Attempt 2 — base + short ID suffix
  const shortId = recordId.replace(/-/g, "").slice(0, 6);
  const candidate2 = `${base}-${shortId}`;
  const exists2 = await prisma.hostPassport.findUnique({
    where: { publicSlug: candidate2 },
    select: { id: true },
  });
  if (!exists2) return candidate2;

  // Fallback — base + full first segment of UUID (extremely unlikely collision)
  return `${base}-${recordId.split("-")[0]}`;
}
