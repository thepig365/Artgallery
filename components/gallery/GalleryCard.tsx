"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { EnquiryModalTrigger } from "@/components/enquiry/EnquiryModalTrigger";
import type { PublicArtwork } from "@/lib/services/public-artworks";

interface GalleryCardProps {
  artwork: PublicArtwork;
}

function buildArtworkAlt(artwork: PublicArtwork): string {
  const creator = artwork.artist?.name ?? "Unknown artist";
  const mediumYear = [artwork.medium, artwork.year].filter(Boolean).join(", ");
  return mediumYear
    ? `${creator} - ${artwork.title} (${mediumYear})`
    : `${creator} - ${artwork.title}`;
}

export function GalleryCard({ artwork }: GalleryCardProps) {
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !artwork.imageUrl || imgError;

  return (
    <div className="mb-6 break-inside-avoid sm:mb-7">
      <article className="overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card">
        <Link href={`/archive/${artwork.slug}`} className="group block">
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
              <Image
                  src={artwork.imageUrl!}
                  alt={buildArtworkAlt(artwork)}
                  width={1200}
                  height={900}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-auto block group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
            )}

            {artwork.finalV != null && (
              <div className="absolute right-2.5 top-2.5 rounded-sm border border-border bg-surface px-2 py-0.5 backdrop-blur-sm">
                <span className="text-[11px] font-semibold text-accent tabular-nums tracking-tight">
                  V {artwork.finalV.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border/70 px-4 py-3.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-fg transition-colors duration-200 group-hover:text-accent">
              {artwork.title}
            </h3>
            {artwork.artist && (
              <p className="mt-1 text-xs text-muted">
                {artwork.artist.name}
              </p>
            )}
            {(artwork.medium || artwork.year) && (
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-subtle">
                {[artwork.medium, artwork.year].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="mt-1 text-[10px] text-subtle">
              Available on enquiry • Viewings by appointment
            </p>
          </div>
        </Link>
        <div className="px-4 pb-4 pt-0.5">
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
