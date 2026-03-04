import { prisma } from "@/lib/db/client";
import type { Prisma } from "@prisma/client";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";

export const publicArtworkSelect = {
  id: true,
  slug: true,
  title: true,
  imageUrl: true,
  artistId: true,
  year: true,
  medium: true,
  dimensions: true,
  materials: true,
  narrative: true,
  sourceUrl: true,
  scoreB: true,
  scoreP: true,
  scoreM: true,
  scoreS: true,
  finalV: true,
  isVisible: true,
  createdAt: true,
  updatedAt: true,
  artist: {
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
    },
  },
} as const;

export type PublicArtwork = Prisma.ArtworkGetPayload<{
  select: typeof publicArtworkSelect;
}>;

export async function getPublicArtworks(limit = 500): Promise<PublicArtwork[]> {
  const artworks = await prisma.artwork.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: publicArtworkSelect,
  });
  return resolveArtworksToGalleryPublicUrls(artworks);
}

export async function getPublicArtworkBySlug(
  slug: string
): Promise<PublicArtwork | null> {
  const artwork = await prisma.artwork.findFirst({
    where: { slug, isVisible: true },
    select: publicArtworkSelect,
  });
  if (!artwork) return null;
  return {
    ...artwork,
    imageUrl: resolveArtworksToGalleryPublicUrls([artwork])[0].imageUrl,
  };
}
