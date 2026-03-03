"use client";

import { useMemo } from "react";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface GalleryFiltersProps {
  artworks: ArtworkWithVisibility[];
  selectedMedium: string;
  onMediumChange: (medium: string) => void;
  sortOrder: "newest" | "highest" | "az";
  onSortChange: (sort: "newest" | "highest" | "az") => void;
  resultCount: number;
}

export function GalleryFilters({
  artworks,
  selectedMedium,
  onMediumChange,
  sortOrder,
  onSortChange,
  resultCount,
}: GalleryFiltersProps) {
  const mediums = useMemo(() => {
    const set = new Set<string>();
    artworks.forEach((a) => {
      if (!a.medium) return;
      const parts = a.medium
        .split(/[,;]/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length) parts.forEach((p) => set.add(p));
      else set.add(a.medium.trim());
    });
    return Array.from(set).sort();
  }, [artworks]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-gallery-border/60">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onMediumChange("")}
          className={`px-3.5 py-1.5 text-[11px] font-medium tracking-wide rounded-full border transition-all duration-200 ${
            selectedMedium === ""
              ? "bg-gallery-text text-white border-gallery-text"
              : "bg-transparent text-gallery-muted border-gallery-border hover:border-gallery-text hover:text-gallery-text"
          }`}
        >
          All <span className="tabular-nums">({artworks.length})</span>
        </button>
        {mediums.map((medium) => {
          const count = artworks.filter((a) =>
            a.medium?.toLowerCase().includes(medium.toLowerCase())
          ).length;
          return (
            <button
              key={medium}
              onClick={() => onMediumChange(medium)}
              className={`px-3.5 py-1.5 text-[11px] font-medium tracking-wide rounded-full border transition-all duration-200 ${
                selectedMedium === medium
                  ? "bg-gallery-text text-white border-gallery-text"
                  : "bg-transparent text-gallery-muted border-gallery-border hover:border-gallery-text hover:text-gallery-text"
              }`}
            >
              {medium} <span className="tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[11px] text-gallery-muted/70 tabular-nums">
          {resultCount} {resultCount === 1 ? "work" : "works"}
        </span>
        <select
          value={sortOrder}
          onChange={(e) =>
            onSortChange(e.target.value as "newest" | "highest" | "az")
          }
          className="text-[11px] bg-transparent border border-gallery-border rounded-md px-2.5 py-1.5 text-gallery-text appearance-none cursor-pointer hover:border-gallery-text transition-colors"
        >
          <option value="newest">Newest first</option>
          <option value="highest">Highest score</option>
          <option value="az">A — Z</option>
        </select>
      </div>
    </div>
  );
}
