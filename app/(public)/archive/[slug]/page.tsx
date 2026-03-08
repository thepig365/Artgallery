import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import type { Metadata } from "next";
import { MendScoreDisplay } from "@/components/gallery/MendScoreDisplay";
import { ArtworkOwnerActions } from "@/components/gallery/ArtworkOwnerActions";
import { EnquiryModalTrigger } from "@/components/enquiry/EnquiryModalTrigger";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworkBySlug } from "@/lib/services/public-artworks";
import { toGalleryPublicUrl } from "@/lib/supabase/gallery-public";
import { getSiteUrl } from "@/lib/site-url";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ArtworkDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getArtworkBySlug(slug: string) {
  try {
    const artwork = await getPublicArtworkBySlug(slug);
    return { artwork, hasError: false as const };
  } catch (error) {
    console.error(`[archive/${slug}] Artwork query failed`, error);
    return { artwork: null, hasError: true as const };
  }
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

function buildMendRationale(scores: { B: number; P: number; M: number; S: number }): string[] {
  const lines: string[] = [];
  if (scores.M >= 7) lines.push("Material coherence is strong and supports the declared intent.");
  else lines.push("Material coherence is still developing and may need clearer disclosure.");

  if (scores.P >= 7) lines.push("Process evidence reads clearly across visible layers and handling.");
  else lines.push("Process evidence is partial; additional process documentation may help.");

  if (scores.B >= 7) lines.push("Body score indicates stable physical integrity for display and review.");
  else lines.push("Body score suggests structural or substrate concerns to monitor.");

  if (scores.S >= 7) lines.push("Surface finish aligns with the work's stated process and medium.");
  else lines.push("Surface coherence is mixed and may benefit from further refinement.");

  const avg = (scores.B + scores.P + scores.M + scores.S) / 4;
  lines.push(
    avg >= 7
      ? "Overall assessment indicates strong readiness for curated viewing."
      : "Overall assessment remains provisional and should be read with the protocol disclaimer."
  );
  return lines;
}

export async function generateMetadata({
  params,
}: ArtworkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { artwork, hasError } = await getArtworkBySlug(slug);

  if (hasError) {
    return {
      title: "Artwork temporarily unavailable | Bayview Hub Gallery",
      description: "This artwork record is temporarily unavailable. Please try again shortly.",
      robots: { index: false, follow: false },
      alternates: { canonical: `/archive/${slug}` },
    };
  }

  if (!artwork) {
    return {
      title: "Artwork not found | Bayview Hub Gallery",
      description: "The requested artwork could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const image = toGalleryPublicUrl(artwork.imageUrl) ?? undefined;
  const title = `${artwork.title} | Bayview Hub Gallery`;
  const description =
    artwork.narrative?.slice(0, 160) ||
    `View ${artwork.title} in the Bayview Hub gallery archive.`;
  const canonicalUrl = `${siteUrl}/archive/${artwork.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
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

  const { artwork, hasError } = await getArtworkBySlug(slug);

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-xl mx-auto border border-amber-300 bg-amber-50 rounded-lg p-6">
          <h1 className="text-lg font-semibold text-gallery-text mb-2">
            Artwork temporarily unavailable
          </h1>
          <p className="text-sm text-gallery-muted mb-4">
            We could not load this artwork right now. Please refresh shortly.
          </p>
          <Link href="/archive" className="text-sm text-gallery-accent hover:underline">
            Back to Archive
          </Link>
        </div>
      </div>
    );
  }

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
  const displayArtist = artwork.artist?.name?.trim() || "Bayview Art Gallery";

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
  const rationaleLines = scores ? buildMendRationale(scores) : [];
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    ...(resolvedImageUrl ? { image: resolvedImageUrl } : {}),
    description:
      (curatorNote ?? artwork.narrative) ||
      `${artwork.title}${artwork.artist ? ` by ${artwork.artist.name}` : ""}`,
    creator: { "@type": "Person", name: displayArtist },
    ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
    ...(artwork.medium ? { artMedium: artwork.medium } : {}),
    ...(materials.length > 0 ? { material: materials } : {}),
    ...dimensionsStructured,
    ...(sameAs ? { sameAs } : {}),
    url: `${siteUrl}/archive/${artwork.slug}`,
    isAccessibleForFree: true,
    contentLocation: {
      "@type": "Place",
      name: "Bayview Hub",
      address: { "@type": "PostalAddress", addressLocality: "Main Ridge", addressRegion: "VIC" },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Archive", item: `${siteUrl}/archive` },
      { "@type": "ListItem", position: 3, name: artwork.title, item: `${siteUrl}/archive/${artwork.slug}` },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
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
          <div className="hidden lg:block sticky top-24 z-10">
            <div className="border border-gallery-border rounded-lg bg-gallery-surface p-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-3">
                Enquiry
              </p>
              <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Desktop enquiry actions">
                <EnquiryModalTrigger
                  ctaType="enquire"
                  label="Enquire"
                  artworkId={artwork.id}
                  artworkSlug={artwork.slug}
                  artworkTitle={artwork.title}
                />
                <EnquiryModalTrigger
                  ctaType="viewing"
                  label="Book a viewing"
                  artworkId={artwork.id}
                  artworkSlug={artwork.slug}
                  artworkTitle={artwork.title}
                />
                <EnquiryModalTrigger
                  ctaType="price"
                  label="Request price & availability"
                  artworkId={artwork.id}
                  artworkSlug={artwork.slug}
                  artworkTitle={artwork.title}
                />
              </div>
            </div>
          </div>

          {/* Title + Artist */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {scores ? (
                <>
                  <span className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
                    Assessed Work
                  </span>
                  {artwork.finalV != null && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-gallery-accent/10 text-gallery-accent text-xs font-semibold rounded-md tabular-nums">
                      V {artwork.finalV.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-medium text-gallery-muted uppercase tracking-wide">
                  Assessment pending
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
                <p className="text-sm text-gallery-text">{artworkFacts.year || "Not disclosed"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">
                  Medium
                </p>
                <p className="text-sm text-gallery-text">{artworkFacts.medium || "Not disclosed"}</p>
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
                <p className="text-sm text-gallery-text">{artworkFacts.dimensions || "On request"}</p>
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

          <div className="border-t border-gallery-border pt-4 lg:hidden">
            <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
              Viewing & Enquiries
            </p>
            <p className="text-sm text-gallery-muted leading-relaxed mb-4">
              Viewings are by appointment at Bayview Hub Gallery.
              <br />
              We respond within 1-2 business days.
            </p>
            <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Enquiry actions">
              <EnquiryModalTrigger
                ctaType="enquire"
                label="Enquire"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
              <EnquiryModalTrigger
                ctaType="viewing"
                label="Book a viewing"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
              <EnquiryModalTrigger
                ctaType="price"
                label="Request price & availability"
                artworkId={artwork.id}
                artworkSlug={artwork.slug}
                artworkTitle={artwork.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mend Index summary */}
      <div className="mt-12 border border-gallery-border rounded-lg bg-gallery-surface p-5">
        <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-3">
          Mend Index Summary
        </h2>
        {scores ? (
          <>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-gallery-muted mb-1">Composite</p>
              <p className="text-lg font-semibold text-gallery-text tabular-nums">
                {artwork.finalV != null ? artwork.finalV.toFixed(2) : "Pending finalization"}
              </p>
              <p className="text-xs text-gallery-muted mt-1">
                Indicative protocol result only; not a valuation certificate.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-md border border-gallery-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-gallery-muted">Body</p>
                <p className="text-sm font-medium text-gallery-text">{scores.B.toFixed(1)}</p>
              </div>
              <div className="rounded-md border border-gallery-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-gallery-muted">Process</p>
                <p className="text-sm font-medium text-gallery-text">{scores.P.toFixed(1)}</p>
              </div>
              <div className="rounded-md border border-gallery-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-gallery-muted">Material</p>
                <p className="text-sm font-medium text-gallery-text">{scores.M.toFixed(1)}</p>
              </div>
              <div className="rounded-md border border-gallery-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-gallery-muted">Surface</p>
                <p className="text-sm font-medium text-gallery-text">{scores.S.toFixed(1)}</p>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gallery-muted">
              {rationaleLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-6">
              <MendScoreDisplay scores={scores} finalV={artwork.finalV ?? null} />
            </div>
          </>
        ) : (
          <div className="rounded-md border border-gallery-border bg-gallery-surface-alt p-4">
            <p className="text-sm font-medium text-gallery-text">Assessment pending / Not assessed</p>
            <p className="text-xs text-gallery-muted mt-1">
              This artwork does not currently display a complete Mend Index result.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-12 border-t border-gallery-border pt-6">
        <p className="text-[11px] text-gallery-muted/60 leading-relaxed max-w-4xl">
          {DISCLAIMERS.report}
        </p>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gallery-border bg-surface/95 backdrop-blur-sm p-3">
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Quick enquiry actions">
          <EnquiryModalTrigger
            ctaType="enquire"
            label="Enquire"
            artworkId={artwork.id}
            artworkSlug={artwork.slug}
            artworkTitle={artwork.title}
          />
          <EnquiryModalTrigger
            ctaType="viewing"
            label="Book a viewing"
            artworkId={artwork.id}
            artworkSlug={artwork.slug}
            artworkTitle={artwork.title}
          />
          <EnquiryModalTrigger
            ctaType="price"
            label="Request price & availability"
            artworkId={artwork.id}
            artworkSlug={artwork.slug}
            artworkTitle={artwork.title}
          />
        </div>
      </div>
    </div>
  );
}
