"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { EnquiryModalTrigger } from "@/components/enquiry/EnquiryModalTrigger";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

interface GalleryCardProps {
  artwork: ArtworkWithVisibility;
}

function buildArtworkAlt(artwork: ArtworkWithVisibility): string {
  const creator = artwork.artist?.name ?? "Unknown artist";
  const mediumYear = [artwork.medium, artwork.year].filter(Boolean).join(", ");
  return mediumYear
    ? `${creator} - ${artwork.title} (${mediumYear})`
    : `${creator} - ${artwork.title}`;
}

/**
 * Image loading logic:
 * - showPlaceholder when: no imageUrl, OR image failed to load (imgError)
 * - imageUrl is resolved server-side to a fresh Supabase signed URL before reaching this component
 * - On refresh: state resets; if imageUrl exists, img loads; if it fails, onError → placeholder
 */
export function GalleryCard({ artwork }: GalleryCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);

  // Handle images that loaded before React hydration attached onLoad
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, []);

  const showPlaceholder = !artwork.imageUrl || imgError;

  const handleError = useCallback(() => {
    if (retryCount < 1) {
      setRetryCount((c) => c + 1);
      setImgError(false);
    } else {
      setImgError(true);
    }
  }, [retryCount]);

  return (
    <div className="break-inside-avoid mb-5 sm:mb-6">
      <article className="bg-surface rounded-lg overflow-hidden border border-border hover:border-accent transition-all duration-200">
        <Link href={`/archive/${artwork.slug}`} className="group block">
          {/* Image — natural aspect ratio */}
          <div className="relative overflow-hidden bg-surface-alt">
            {showPlaceholder ? (
              <div className="flex items-center justify-center w-full aspect-[4/3] bg-surface-alt/80">
                <ImageOff
                  className="w-8 h-8 text-subtle/40"
                  strokeWidth={1}
                  aria-hidden
                />
              </div>
            ) : (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-surface-alt animate-pulse" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  key={retryCount}
                  src={artwork.imageUrl!}
                  alt={buildArtworkAlt(artwork)}
                  width={1200}
                  height={900}
                  className={`w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500 ease-out ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  onLoad={() => {
                    setImgLoaded(true);
                    setImgError(false);
                  }}
                  onError={handleError}
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
            <p className="text-[10px] text-subtle mt-1">
              Available on enquiry • Viewings by appointment
            </p>
          </div>
        </Link>
        <div className="px-4 pb-4">
          <EnquiryModalTrigger
            ctaType="enquire"
            label="Enquire"
            compact
            artworkId={artwork.id}
            artworkSlug={artwork.slug}
            artworkTitle={artwork.title}
          />
        </div>
      </article>
    </div>
  );
}
