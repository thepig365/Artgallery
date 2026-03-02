import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import type { Metadata } from "next";
import { MendScoreDisplay } from "@/components/gallery/MendScoreDisplay";
import { ArtworkOwnerActions } from "@/components/gallery/ArtworkOwnerActions";
import { EnquiryModalTrigger } from "@/components/enquiry/EnquiryModalTrigger";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworkBySlug } from "@/lib/services/artwork-visibility";
import { toGalleryPublicUrl } from "@/lib/supabase/gallery-public";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 60;

interface ArtworkDetailPageProps {
  params: Promise<{ slug: string }>;
}

function parseDimensionsToStructured(
  dimensions: string | null | undefined
): {
  width?: { "@type": "QuantitativeValue"; value: number; unitText?: string };
  height?: { "@type": "QuantitativeValue"; value: number; unitText?: string };
} {
  const raw = dimensions?.trim();
  if (!raw) return {};

  // Matches common formats like:
  // "100X80", "100 x 80 cm", "120/105cm"
  const match = raw.match(/(\d+(?:\.\d+)?)\s*[xX\/]\s*(\d+(?:\.\d+)?)(.*)?$/);
  if (!match) return {};

  const widthValue = Number(match[1]);
  const heightValue = Number(match[2]);
  if (!Number.isFinite(widthValue) || !Number.isFinite(heightValue)) return {};

  const unitRaw = (match[3] || "").trim().toLowerCase();
  const unitText =
    unitRaw.includes("cm") ? "cm" : unitRaw.includes("mm") ? "mm" : undefined;

  return {
    width: {
      "@type": "QuantitativeValue",
      value: widthValue,
      ...(unitText ? { unitText } : {}),
    },
    height: {
      "@type": "QuantitativeValue",
      value: heightValue,
      ...(unitText ? { unitText } : {}),
    },
  };
}

function buildArtworkAlt(artwork: {
  title: string;
  medium: string | null;
  year: number | null;
  artist?: { name: string } | null;
}): string {
  const creator = artwork.artist?.name ?? "Unknown artist";
  const mediumYear = [artwork.medium, artwork.year].filter(Boolean).join(", ");
  return mediumYear
    ? `${creator} - ${artwork.title} (${mediumYear})`
    : `${creator} - ${artwork.title}`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toCuratorNote(narrative: string | null | undefined): string | null {
  // Return null if no unique content - don't use a fallback that causes duplication
  const source = narrative?.trim();
  if (!source) return null;

  const words = source.split(/\s+/).filter(Boolean);
  const sliced = words.slice(0, 120).join(" ");
  const count = wordCount(sliced);
  
  // Only show curator note if we have substantial unique content (60+ words)
  if (count < 60) return null;
  return sliced;
}

export async function generateMetadata({
  params,
}: ArtworkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getPublicArtworkBySlug(slug);

  if (!artwork) {
    return {
      title: "Artwork not found | Bayview Hub Gallery",
      description: "The requested artwork could not be found.",
    };
  }

  const image = toGalleryPublicUrl(artwork.imageUrl) ?? undefined;
  const title = `${artwork.title} | Bayview Hub Gallery`;
  const description =
    artwork.narrative?.slice(0, 160) ||
    `View ${artwork.title} in the Bayview Hub gallery archive.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/archive/${artwork.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/archive/${artwork.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArtworkDetailPage({
  params,
}: ArtworkDetailPageProps) {
  const { slug } = await params;

  const artwork = await getPublicArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const resolvedImageUrl = toGalleryPublicUrl(artwork.imageUrl);

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
  const displayArtist = artwork.artist?.name?.trim() || "Chelsey";

  const sameAs =
    artwork.sourceUrl && artwork.sourceUrl.includes("chelseyartwork.com")
      ? artwork.sourceUrl
      : undefined;

  const dimensionsStructured = parseDimensionsToStructured(artwork.dimensions);
  
  // Deduplicate medium and materials - avoid showing "Mixed media on canvas / Mixed media on canvas"
  const mediumValue = artwork.medium?.trim() || null;
  const materialsValue = materials.length > 0 ? materials.join(", ") : null;
  
  // Only show materials if different from medium
  const showMaterials = materialsValue && 
    materialsValue.toLowerCase() !== mediumValue?.toLowerCase();
  
  const artworkFacts = {
    artist: displayArtist,
    title: artwork.title,
    year: artwork.year ? String(artwork.year) : null,
    medium: mediumValue,
    materials: showMaterials ? materialsValue : null,
    dimensions:
      dimensionsStructured.width && dimensionsStructured.height
        ? `${dimensionsStructured.width.value} x ${dimensionsStructured.height.value}${dimensionsStructured.width.unitText ? ` ${dimensionsStructured.width.unitText}` : ""}`
        : artwork.dimensions?.trim() || null,
    location: "Bayview Hub Gallery, Mornington Peninsula",
    availability: "Available on enquiry",
  };
  const curatorNote = toCuratorNote(artwork.narrative);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    ...(resolvedImageUrl ? { image: resolvedImageUrl } : {}),
    description:
      artwork.narrative ||
      `${artwork.title}${artwork.artist ? ` by ${artwork.artist.name}` : ""}`,
    creator: { "@type": "Person", name: displayArtist },
    ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
    ...(artwork.medium ? { artMedium: artwork.medium } : {}),
    ...(materials.length > 0 ? { material: materials } : {}),
    ...dimensionsStructured,
    ...(sameAs ? { sameAs } : {}),
    url: `${getSiteUrl()}/archive/${artwork.slug}`,
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
            {resolvedImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={resolvedImageUrl}
                alt={buildArtworkAlt(artwork)}
                width={1400}
                height={1050}
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

          {/* Artwork facts (matches JSON-LD fields) */}
          <div className="border border-gallery-border rounded-lg bg-gallery-surface-alt p-4">
            <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-3">
              Artwork Facts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Artist
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.artist}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Title
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Year
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.year || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Medium
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.medium || "—"}</p>
              </div>
              {artworkFacts.materials && (
                <div>
                  <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                    Materials
                  </p>
                  <p className="text-sm text-gallery-text">{artworkFacts.materials}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Dimensions
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.dimensions || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Location
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Availability
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.availability}</p>
              </div>
            </div>
          </div>

          {/* Curator note - only show if unique content exists */}
          {curatorNote && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                Curator Note
              </p>
              <p className="text-sm text-gallery-muted leading-relaxed">
                {curatorNote}
              </p>
            </div>
          )}

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

          <div className="border-t border-gallery-border pt-4">
            <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
              Viewing & Enquiries
            </p>
            <p className="text-sm text-gallery-muted leading-relaxed mb-4">
              Viewings are by appointment at Bayview Hub Gallery.
              <br />
              We respond within 1-2 business days.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <EnquiryModalTrigger
                ctaType="enquire"
                label="Enquire"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
              <EnquiryModalTrigger
                ctaType="viewing"
                label="Book a Viewing"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
              <EnquiryModalTrigger
                ctaType="price"
                label="Request Price & Availability"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
            </div>
          </div>
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
