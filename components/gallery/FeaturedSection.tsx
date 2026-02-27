"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface FeaturedSectionProps {
  artworks: ArtworkWithVisibility[];
}

function FeaturedImage({
  artwork,
  priority,
  className,
}: {
  artwork: ArtworkWithVisibility;
  priority?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!artwork.imageUrl || error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gallery-surface-alt gap-2 ${className ?? ""}`}
      >
        <ImageOff className="w-8 h-8 text-subtle" strokeWidth={1} />
        <span className="text-[11px] text-subtle tracking-wide">
          Awaiting imagery
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gallery-surface-alt ${className ?? ""}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gallery-surface-alt animate-pulse" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artwork.imageUrl}
        alt={artwork.title}
        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export function FeaturedSection({ artworks }: FeaturedSectionProps) {
  const featured = artworks.slice(0, 4);

  if (featured.length === 0) return null;

  const hero = featured[0];
  const rest = featured.slice(1);

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
              Recently Assessed
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight">
              Featured Works
            </h2>
          </div>
          <Link
            href="/archive"
            className="text-sm text-gallery-accent font-medium hover:text-gallery-accent-hover transition-colors hidden sm:block"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Editorial layout: hero left + stack right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Hero card — spans 7 columns */}
          <Link
            href={`/archive/${hero.slug}`}
            className="group lg:col-span-7 block bg-gallery-surface rounded-lg overflow-hidden border border-gallery-border/60 hover:border-gallery-border hover:shadow-xl transition-all duration-300"
          >
            <FeaturedImage
              artwork={hero}
              priority
              className="w-full aspect-[4/3] sm:aspect-[16/10]"
            />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gallery-text group-hover:text-gallery-accent transition-colors duration-200 leading-snug">
                    {hero.title}
                  </h3>
                  {hero.artist && (
                    <p className="text-sm text-gallery-muted mt-1">
                      {hero.artist.name}
                    </p>
                  )}
                  {(hero.medium || hero.year) && (
                    <p className="text-xs text-subtle mt-2 tracking-wide">
                      {[hero.medium, hero.year].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                {hero.finalV != null && (
                  <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 bg-gallery-accent/10 text-gallery-accent text-xs font-semibold rounded-md tabular-nums">
                    V {hero.finalV.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Secondary cards — stack in remaining 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {rest.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/archive/${artwork.slug}`}
                className="group flex bg-gallery-surface rounded-lg overflow-hidden border border-gallery-border/60 hover:border-gallery-border hover:shadow-lg transition-all duration-300"
              >
                <FeaturedImage
                  artwork={artwork}
                  className="w-28 sm:w-36 flex-shrink-0 aspect-square"
                />
                <div className="flex flex-col justify-center px-4 py-3 min-w-0">
                  <h3 className="text-[13px] sm:text-sm font-semibold text-gallery-text group-hover:text-gallery-accent transition-colors duration-200 leading-snug line-clamp-2">
                    {artwork.title}
                  </h3>
                  {artwork.artist && (
                    <p className="text-[11px] sm:text-xs text-gallery-muted mt-1">
                      {artwork.artist.name}
                    </p>
                  )}
                  <p className="text-[10px] text-subtle mt-1.5 tracking-wide">
                    {[artwork.medium, artwork.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {artwork.finalV != null && (
                    <span className="inline-flex self-start items-center mt-2 px-2 py-0.5 bg-gallery-accent/10 text-gallery-accent text-[10px] font-semibold rounded tabular-nums">
                      V {artwork.finalV.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/archive"
            className="text-sm text-gallery-accent font-medium hover:text-gallery-accent-hover transition-colors"
          >
            View all works &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
