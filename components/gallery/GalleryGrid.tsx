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
          Works enter the archive after completing the full assessment protocol.
        </p>
        <Link
          href="/archive"
          className="inline-flex mt-5 items-center justify-center border border-gallery-border px-4 py-2 text-xs font-medium tracking-wide uppercase text-gallery-text hover:border-gallery-accent hover:text-gallery-accent transition-colors"
        >
          Back to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 sm:gap-6">
      {artworks.map((artwork) => (
        <GalleryCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
