import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { prisma } from "@/lib/db/client";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";
import { ArchiveClient } from "./archive-client";
import type { Metadata } from "next";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
// Force no caching - always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Collection | Bayview Hub Art Gallery",
  description:
    "Browse publicly visible artworks assessed through the Mend Index protocol.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "Collection | Bayview Hub Art Gallery",
    description:
      "Browse publicly visible artworks assessed through the Mend Index protocol.",
    type: "website",
    url: "/archive",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collection | Bayview Hub Art Gallery",
    description:
      "Browse publicly visible artworks assessed through the Mend Index protocol.",
  },
};

export default async function ArchivePage() {
  let publicArtworks: {
    id: string;
    slug: string;
    title: string;
    imageUrl: string | null;
    artistId: string | null;
    year: number | null;
    medium: string | null;
    dimensions: string | null;
    narrative: string | null;
    scoreB: number | null;
    scoreP: number | null;
    scoreM: number | null;
    scoreS: number | null;
    finalV: number | null;
    isVisible: boolean;
    artist: { id: string; name: string; slug: string } | null;
  }[] = [];

  try {
    // Use explicit select to match /api/artworks/public and avoid P2022 errors
    const artworks = await prisma.artwork.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        artistId: true,
        year: true,
        medium: true,
        dimensions: true,
        narrative: true,
        scoreB: true,
        scoreP: true,
        scoreM: true,
        scoreS: true,
        finalV: true,
        isVisible: true,
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    publicArtworks = resolveArtworksToGalleryPublicUrls(artworks);
  } catch (err) {
    console.error("[Archive] Failed to load artworks:", err);
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <header className="mb-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
          Public Collection
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-3">
          Public Collection
        </h1>
        <p className="text-sm text-gallery-muted max-w-xl leading-relaxed">
          Browse works evaluated through the Mend Index protocol. Each piece has
          undergone structured, blind assessment across four material-sincerity
          axes.
        </p>
      </header>

      <ArchiveClient artworks={publicArtworks} />

      <footer className="mt-16 border-t border-gallery-border pt-6">
        <p className="text-[11px] text-gallery-muted/60 leading-relaxed max-w-4xl">
          {DISCLAIMERS.report}
        </p>
      </footer>
    </div>
  );
}
