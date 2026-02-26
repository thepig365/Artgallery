"use client";

import { useState, useMemo } from "react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryFilters } from "@/components/gallery/GalleryFilters";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface ArchiveClientProps {
  artworks: ArtworkWithVisibility[];
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
        <GalleryGrid artworks={filtered} />
      </div>
    </>
  );
}
