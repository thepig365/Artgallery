"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface GalleryCardProps {
  artwork: ArtworkWithVisibility;
}

export function GalleryCard({ artwork }: GalleryCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !artwork.imageUrl || imgError;

  return (
    <Link
      href={`/archive/${artwork.slug}`}
      className="group block break-inside-avoid mb-5 sm:mb-6"
    >
      <article className="bg-surface rounded-lg overflow-hidden border border-border hover:border-accent transition-all duration-200">
        {/* Image — natural aspect ratio */}
        <div className="relative overflow-hidden bg-surface-alt">
          {showPlaceholder ? (
            <div className="flex flex-col items-center justify-center w-full aspect-[4/3] gap-2">
              <ImageOff
                className="w-7 h-7 text-subtle"
                strokeWidth={1}
              />
              <span className="text-[11px] text-subtle tracking-wide">
                Awaiting imagery
              </span>
            </div>
          ) : (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 bg-surface-alt animate-pulse" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.imageUrl!}
                alt={artwork.title}
                className={`w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500 ease-out ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </>
          )}

          {/* Score badge — subtle overlay */}
          {artwork.finalV != null && (
            <div className="absolute top-2.5 right-2.5 bg-surface backdrop-blur-sm px-2 py-0.5 rounded border border-border">
              <span className="text-[11px] font-semibold text-accent tabular-nums tracking-tight">
                V {artwork.finalV.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="px-4 py-3.5">
          <h3 className="text-[13px] font-semibold text-fg leading-snug group-hover:text-accent transition-colors duration-200 line-clamp-2">
            {artwork.title}
          </h3>
          {artwork.artist && (
            <p className="text-[11px] text-muted mt-1">
              {artwork.artist.name}
            </p>
          )}
          {(artwork.medium || artwork.year) && (
            <p className="text-[10px] text-subtle mt-1.5 tracking-wide">
              {[artwork.medium, artwork.year].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
