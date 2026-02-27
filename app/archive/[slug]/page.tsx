import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import { MendScoreDisplay } from "@/components/gallery/MendScoreDisplay";
import { ArtworkOwnerActions } from "@/components/gallery/ArtworkOwnerActions";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworkBySlug } from "@/lib/services/artwork-visibility";

export const revalidate = 60;

interface ArtworkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtworkDetailPage({
  params,
}: ArtworkDetailPageProps) {
  const { slug } = await params;

  const artwork = await getPublicArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const hasScores =
    artwork.scoreB != null &&
    artwork.scoreP != null &&
    artwork.scoreM != null &&
    artwork.scoreS != null;

  const scores = hasScores
    ? {
        B: artwork.scoreB!,
        P: artwork.scoreP!,
        M: artwork.scoreM!,
        S: artwork.scoreS!,
      }
    : null;

  const materials = artwork.materials
    ? artwork.materials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 text-sm text-gallery-muted hover:text-gallery-accent transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to Archive
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Image — dominant left column */}
        <div className="lg:col-span-7">
          <div className="relative bg-gallery-surface-alt rounded-lg overflow-hidden border border-gallery-border">
            {artwork.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-auto block"
                loading="eager"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full aspect-[4/3] gap-3">
                <ImageOff
                  className="w-12 h-12 text-gallery-muted/30"
                  strokeWidth={1}
                />
                <span className="text-sm text-gallery-muted/50">
                  Image not yet available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details — right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title + Artist */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
                Assessed Work
              </span>
              {artwork.finalV != null && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gallery-accent/10 text-gallery-accent text-xs font-semibold rounded-md tabular-nums">
                  V {artwork.finalV.toFixed(2)}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-2">
              {artwork.title}
            </h1>
            {artwork.artist && (
              <p className="text-base text-gallery-muted">
                {artwork.artist.name}
              </p>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                Medium
              </p>
              <p className="text-sm text-gallery-text">
                {artwork.medium ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                Year
              </p>
              <p className="text-sm text-gallery-text">
                {artwork.year ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                Dimensions
              </p>
              <p className="text-sm text-gallery-text">
                {artwork.dimensions ?? "—"}
              </p>
            </div>
          </div>

          {/* Materials */}
          {materials.length > 0 && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                Declared Materials
              </p>
              <div className="flex flex-wrap gap-2">
                {materials.map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 bg-gallery-surface-alt border border-gallery-border rounded-md text-xs text-gallery-text"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Narrative */}
          {artwork.narrative && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                Process Narrative
              </p>
              <p className="text-sm text-gallery-muted leading-relaxed">
                {artwork.narrative}
              </p>
            </div>
          )}

          {/* Artist bio */}
          {artwork.artist?.bio && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                About the Artist
              </p>
              <p className="text-sm text-gallery-muted leading-relaxed">
                {artwork.artist.bio}
              </p>
            </div>
          )}

          <ArtworkOwnerActions
            artworkId={artwork.id}
            isVisible={artwork.isVisible}
          />
        </div>
      </div>

      {/* Scores section */}
      {scores && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-6">
            Mend Index Assessment
          </h2>
          <MendScoreDisplay scores={scores} finalV={artwork.finalV ?? null} />
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 border-t border-gallery-border pt-6">
        <p className="text-[11px] text-gallery-muted/60 leading-relaxed max-w-4xl">
          {DISCLAIMERS.report}
        </p>
      </div>
    </div>
  );
}
