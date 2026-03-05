import type { Prisma } from "@prisma/client";

export const adminArtworkSelect = {
  id: true,
  slug: true,
  title: true,
  imageUrl: true,
  medium: true,
  year: true,
  isVisible: true,
  hiddenReason: true,
  hiddenAt: true,
  hiddenBy: true,
  createdAt: true,
  updatedAt: true,
  artist: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

export type AdminArtwork = Prisma.ArtworkGetPayload<{
  select: typeof adminArtworkSelect;
}>;
