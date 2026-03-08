import { GalleryCard } from "./GalleryCard";
import type { PublicArtwork } from "@/lib/services/public-artworks";
import Link from "next/link";

interface GalleryGridProps {
  artworks: PublicArtwork[];
}

export function GalleryGrid({ artworks }: GalleryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gallery-muted mb-2">No works found</p>
        <p className="text-xs text-subtle max-w-md mx-auto leading-relaxed">
          There are no publicly visible assessed works matching your criteria.
          Works enter the collection after completing the full assessment protocol.
        </p>
        <Link
          href="/archive"
          className="inline-flex mt-5 items-center justify-center border border-gallery-border px-4 py-2 text-xs font-medium tracking-wide uppercase text-gallery-text hover:border-gallery-accent hover:text-gallery-accent transition-colors"
        >
          Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {artworks.map((artwork) => (
        <GalleryCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
