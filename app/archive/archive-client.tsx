"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageIcon, ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface ArchiveClientProps {
  artworks: ArtworkWithVisibility[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gallery-accent/10 flex items-center justify-center mb-6">
        <ImageIcon className="w-8 h-8 text-gallery-accent" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-gallery-text mb-2">
        Collection Coming Soon
      </h2>
      <p className="text-sm text-gallery-muted max-w-md mb-6 leading-relaxed">
        We&apos;re curating our first collection of works assessed through the Mend Index protocol.
        Artists are invited to submit their work for consideration.
      </p>
      <Link
        href="/submit"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent/90 transition-colors"
      >
        Submit Your Work
        <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="text-xs text-gallery-muted/60 mt-4">
        Or explore the{" "}
        <Link href="/protocol" className="text-gallery-accent hover:underline">
          assessment protocol
        </Link>{" "}
        to learn how works are evaluated.
      </p>
    </div>
  );
}

export function ArchiveClient({ artworks }: ArchiveClientProps) {
  const [selectedMedium, setSelectedMedium] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "highest" | "az">(
    "newest"
  );

  const filtered = useMemo(() => {
    let result = artworks;

    if (selectedMedium) {
      result = result.filter((a) =>
        a.medium?.toLowerCase().includes(selectedMedium.toLowerCase())
      );
    }

    return result.slice().sort((a, b) => {
      if (sortOrder === "highest") {
        return (b.finalV ?? 0) - (a.finalV ?? 0);
      }
      if (sortOrder === "az") {
        return a.title.localeCompare(b.title);
      }
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [artworks, selectedMedium, sortOrder]);

  // Show empty state if no artworks at all
  if (artworks.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <GalleryFilters
        artworks={artworks}
        selectedMedium={selectedMedium}
        onMediumChange={setSelectedMedium}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        resultCount={filtered.length}
      />

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gallery-muted">
              No works match your filter. Try adjusting your selection.
            </p>
          </div>
        ) : (
          <GalleryGrid artworks={filtered} />
        )}
      </div>
    </>
  );
}
