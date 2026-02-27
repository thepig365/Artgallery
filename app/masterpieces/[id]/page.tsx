import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const SITE_NAME = "Art Valuation Protocol";

const SOURCE_LABELS: Record<string, string> = {
  met: "The Metropolitan Museum of Art",
  aic: "Art Institute of Chicago",
  rijks: "Rijksmuseum",
};

const LICENSE_URLS: Record<string, string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  PDM: "https://creativecommons.org/publicdomain/mark/1.0/",
  PublicDomain: "https://creativecommons.org/publicdomain/mark/1.0/",
};

const LICENSE_LABELS: Record<string, { label: string; description: string }> = {
  CC0: {
    label: "CC0 1.0",
    description: "This work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights (Creative Commons Zero).",
  },
  PDM: {
    label: "Public Domain Mark",
    description: "This work has been identified as being free of known restrictions under copyright law (Public Domain Mark).",
  },
  PublicDomain: {
    label: "Public Domain",
    description: "This work is in the public domain in its country of origin and other countries where the copyright term is the author's life plus 100 years or fewer.",
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const metadataBase = new URL(getSiteUrl());

  const masterpiece = await prisma.masterpiece.findUnique({
    where: { id },
    select: {
      title: true,
      artist: true,
      source: true,
      license: true,
      imageUrl: true,
      thumbnailUrl: true,
    },
  });

  if (!masterpiece || !["CC0", "PDM", "PublicDomain"].includes(masterpiece.license)) {
    return {
      metadataBase,
      title: "Not Found | Open Masterpieces Library",
      robots: { index: false, follow: false },
    };
  }

  const sourceName = SOURCE_LABELS[masterpiece.source] || masterpiece.source;
  const licenseLabel = LICENSE_LABELS[masterpiece.license]?.label || masterpiece.license;
  const artistSuffix = masterpiece.artist ? ` by ${masterpiece.artist}` : "";
  const title = `${masterpiece.title}${artistSuffix} | Open Masterpieces Library`;
  const description = `${masterpiece.title}${artistSuffix} — sourced from ${sourceName} under ${licenseLabel}. View full details, provenance, and licensing information.`;
  const ogImage = masterpiece.thumbnailUrl || masterpiece.imageUrl;

  return {
    metadataBase,
    title,
    description,
    alternates: { canonical: `/masterpieces/${id}` },
    openGraph: {
      title,
      description,
      url: `/masterpieces/${id}`,
      siteName: SITE_NAME,
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, alt: masterpiece.title }] } : {}),
    },
    twitter: ogImage
      ? { card: "summary_large_image", title, description, images: [ogImage] }
      : { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function MasterpieceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const masterpiece = await prisma.masterpiece.findUnique({
    where: { id },
  });

  if (!masterpiece) {
    notFound();
  }

  if (!["CC0", "PDM", "PublicDomain"].includes(masterpiece.license)) {
    notFound();
  }

  const licenseInfo = LICENSE_LABELS[masterpiece.license];
  const sourceName = SOURCE_LABELS[masterpiece.source] || masterpiece.source;
  const siteUrl = getSiteUrl();

  const artworkJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: masterpiece.title,
    url: `${siteUrl}/masterpieces/${id}`,
    isBasedOn: masterpiece.sourceUrl,
    provider: {
      "@type": "Organization",
      name: sourceName,
    },
  };

  if (masterpiece.artist) {
    artworkJsonLd.creator = { "@type": "Person", name: masterpiece.artist };
  }
  if (masterpiece.date) {
    artworkJsonLd.dateCreated = masterpiece.date;
  }
  if (masterpiece.medium) {
    artworkJsonLd.artMedium = masterpiece.medium;
  }
  if (masterpiece.dimensions) {
    artworkJsonLd.size = masterpiece.dimensions;
  }
  if (masterpiece.imageUrl) {
    artworkJsonLd.image = masterpiece.imageUrl;
  }
  if (LICENSE_URLS[masterpiece.license]) {
    artworkJsonLd.license = LICENSE_URLS[masterpiece.license];
  }
  if (masterpiece.creditLine) {
    artworkJsonLd.creditText = masterpiece.creditLine;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkJsonLd) }}
      />
      <Link
        href="/masterpieces"
        className="inline-flex items-center gap-1.5 text-sm text-gallery-muted hover:text-gallery-accent transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to Masterpieces
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Image */}
        <div className="lg:col-span-7">
          <div className="relative bg-gallery-surface-alt rounded-lg overflow-hidden border border-gallery-border">
            {masterpiece.imageUrl ? (
              <Image
                src={masterpiece.imageUrl}
                alt={masterpiece.title}
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                className="w-full h-auto block"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full aspect-[4/3] gap-3">
                <ImageOff className="w-12 h-12 text-gallery-muted/30" strokeWidth={1} />
                <span className="text-sm text-gallery-muted/50">Image unavailable</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-2">
              {masterpiece.title}
            </h1>
            {masterpiece.artist && (
              <p className="text-base text-gallery-muted">{masterpiece.artist}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {masterpiece.date && (
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm text-gallery-text">{masterpiece.date}</p>
              </div>
            )}
            {masterpiece.medium && (
              <div>
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">Medium</p>
                <p className="text-sm text-gallery-text">{masterpiece.medium}</p>
              </div>
            )}
            {masterpiece.dimensions && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-1">Dimensions</p>
                <p className="text-sm text-gallery-text">{masterpiece.dimensions}</p>
              </div>
            )}
          </div>

          {/* Source & Attribution */}
          <div className="border-t border-gallery-border pt-4">
            <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
              Source Institution
            </p>
            <p className="text-sm text-gallery-text mb-2">{sourceName}</p>
            <a
              href={masterpiece.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gallery-accent hover:underline"
            >
              View at {sourceName}
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          </div>

          {/* Credit Line */}
          {masterpiece.creditLine && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                Credit Line
              </p>
              <p className="text-sm text-gallery-muted leading-relaxed">
                {masterpiece.creditLine}
              </p>
            </div>
          )}

          {/* License */}
          {licenseInfo && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                License
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <span className="inline-flex items-center text-sm font-semibold text-green-700 mb-2">
                  {licenseInfo.label}
                </span>
                <p className="text-xs text-green-800/70 leading-relaxed">
                  {licenseInfo.description}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {masterpiece.tags.length > 0 && (
            <div className="border-t border-gallery-border pt-4">
              <p className="text-xs font-medium text-gallery-muted uppercase tracking-wide mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {masterpiece.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 bg-gallery-surface-alt border border-gallery-border rounded text-xs text-gallery-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversion CTAs */}
      <div className="mt-12 bg-gallery-surface border border-gallery-border rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gallery-text font-medium mb-1">
              Explore curatorial assessment
            </p>
            <p className="text-xs text-gallery-muted leading-relaxed max-w-md">
              Learn how the Mend Index evaluates material sincerity across
              four scoring axes, or submit your own work for review.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/protocol"
              className="inline-flex items-center px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
            >
              Learn the Mend Index Protocol
            </Link>
            <Link
              href="/portal/submit"
              className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
            >
              Submit Work for Review
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gallery-border/50">
          <Link
            href="/archive"
            className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
          >
            Browse the Archive &rarr;
          </Link>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="mt-12 border-t border-gallery-border pt-6">
        <p className="text-[11px] text-gallery-muted/60 leading-relaxed max-w-4xl">
          This image is sourced from the open-access program of {sourceName} and
          is used under the {licenseInfo?.label || masterpiece.license} license.
          The platform does not claim ownership of this work. For full provenance
          and rights information, please visit the{" "}
          <a
            href={masterpiece.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gallery-accent hover:underline"
          >
            source institution page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
