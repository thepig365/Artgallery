"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageIcon, ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import type { PublicArtwork } from "@/lib/services/public-artworks";

interface ArchiveClientProps {
  artworks: PublicArtwork[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gallery-accent/10">
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
        className="inline-flex items-center gap-2 rounded-md bg-family-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-family-navy-deep"
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
  const [query, setQuery] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");
  const [yearBucket, setYearBucket] = useState<"all" | "2020s" | "2010s" | "older">("all");
  const [sizeBucket, setSizeBucket] = useState<"all" | "small" | "medium" | "large">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "az">(
    "newest"
  );

  const mediums = useMemo(() => {
    const set = new Set<string>();
    artworks.forEach((a) => {
      if (!a.medium) return;
      a.medium
        .split(/[,;]/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((part) => set.add(part));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [artworks]);

  function parseArea(dimensions: string | null): number | null {
    if (!dimensions) return null;
    const m = dimensions.match(/(\d+(?:\.\d+)?)\s*[xX\/]\s*(\d+(?:\.\d+)?)/);
    if (!m) return null;
    return Number(m[1]) * Number(m[2]);
  }

  const filtered = useMemo(() => {
    let result = artworks;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }

    if (selectedMedium) {
      result = result.filter((a) =>
        a.medium?.toLowerCase().includes(selectedMedium.toLowerCase())
      );
    }

    if (yearBucket !== "all") {
      result = result.filter((a) => {
        if (!a.year) return false;
        if (yearBucket === "2020s") return a.year >= 2020;
        if (yearBucket === "2010s") return a.year >= 2010 && a.year < 2020;
        return a.year < 2010;
      });
    }

    if (sizeBucket !== "all") {
      result = result.filter((a) => {
        const area = parseArea(a.dimensions);
        if (!area) return false;
        if (sizeBucket === "small") return area < 8000;
        if (sizeBucket === "medium") return area >= 8000 && area < 18000;
        return area >= 18000;
      });
    }

    return result.slice().sort((a, b) => {
      if (sortOrder === "az") {
        return a.title.localeCompare(b.title);
      }
      return (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0);
    });
  }, [artworks, query, selectedMedium, yearBucket, sizeBucket, sortOrder]);

  // Show empty state if no artworks at all
  if (artworks.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <section className="rounded-lg border border-gallery-border bg-gallery-surface p-4 shadow-card sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search works by title"
            className="md:col-span-2 w-full rounded-full border border-gallery-border bg-white px-4 py-2.5 text-sm text-gallery-text outline-none transition-colors focus:border-family-accent"
          />
          <select
            value={selectedMedium}
            onChange={(e) => setSelectedMedium(e.target.value)}
            className="w-full rounded-full border border-gallery-border bg-white px-4 py-2.5 text-sm text-gallery-text outline-none transition-colors focus:border-family-accent"
          >
            <option value="">All media</option>
            {mediums.map((medium) => (
              <option key={medium} value={medium}>
                {medium}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "az")}
            className="w-full rounded-full border border-gallery-border bg-white px-4 py-2.5 text-sm text-gallery-text outline-none transition-colors focus:border-family-accent"
          >
            <option value="newest">Newest</option>
            <option value="az">Title A-Z</option>
          </select>
          <select
            value={yearBucket}
            onChange={(e) =>
              setYearBucket(e.target.value as "all" | "2020s" | "2010s" | "older")
            }
            className="w-full rounded-full border border-gallery-border bg-white px-4 py-2.5 text-sm text-gallery-text outline-none transition-colors focus:border-family-accent"
          >
            <option value="all">All years</option>
            <option value="2020s">2020s</option>
            <option value="2010s">2010s</option>
            <option value="older">Before 2010</option>
          </select>
          <select
            value={sizeBucket}
            onChange={(e) =>
              setSizeBucket(e.target.value as "all" | "small" | "medium" | "large")
            }
            className="w-full rounded-full border border-gallery-border bg-white px-4 py-2.5 text-sm text-gallery-text outline-none transition-colors focus:border-family-accent"
          >
            <option value="all">All sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <div className="w-full rounded-full border border-gallery-border bg-gallery-surface-alt px-4 py-2.5 text-sm text-gallery-muted">
            Availability: Available on enquiry
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.08em] text-gallery-muted">
          {filtered.length} of {artworks.length} works
        </p>
      </section>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gallery-muted">
              No works match your current filters.
            </p>
            <p className="text-xs text-gallery-muted/70 mt-2">
              Try broader filters or start from all media and all years.
            </p>
          </div>
        ) : (
          <GalleryGrid artworks={filtered} />
        )}
      </div>
    </>
  );
}
