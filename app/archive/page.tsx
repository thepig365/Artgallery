import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworks } from "@/lib/services/artwork-visibility";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";
import { ArchiveClient } from "./archive-client";
import type { Metadata } from "next";

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
  let publicArtworks: Awaited<ReturnType<typeof getPublicArtworks>> = [];
  try {
    const artworks = await getPublicArtworks({ take: 500 });
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
