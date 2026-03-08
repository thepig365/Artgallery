import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworks, type PublicArtwork } from "@/lib/services/public-artworks";
import { GALLERY_EMAIL } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import { toGalleryPublicUrl } from "@/lib/supabase/gallery-public";
import { ArchiveClient } from "./archive-client";
import type { Metadata } from "next";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
// Force no caching - always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TITLE = "Collection | Bayview Hub Art Gallery";
const DESCRIPTION =
  "Browse publicly visible artworks assessed through the Mend Index protocol. Curated works at Bayview Hub Gallery, Main Ridge VIC.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/archive",
    siteName: "Bayview Hub Art Gallery",
    images: [{ url: "/images/bayview-estate-logo.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/bayview-estate-logo.jpg"],
  },
};

export default async function ArchivePage() {
  let publicArtworks: PublicArtwork[] = [];

  try {
    publicArtworks = await getPublicArtworks(500);
  } catch (err) {
    console.error("[Archive] Failed to load artworks:", err);
  }

  const siteUrl = getSiteUrl();
  const fallbackImage = `${siteUrl}/images/bayview-estate-logo.jpg`;
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bayview Hub Gallery Collection",
    description: "Curated artworks assessed through the Mend Index protocol.",
    numberOfItems: Math.min(publicArtworks.length, 24),
    itemListElement: publicArtworks.slice(0, 24).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: `${siteUrl}/archive/${a.slug}`,
      image: toGalleryPublicUrl(a.imageUrl) ?? fallbackImage,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Gallery", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Collection", item: `${siteUrl}/archive` },
    ],
  };

  return (
    <div className="pb-14 sm:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="bg-family-navy text-white">
        <div className="container mx-auto flex min-h-[100px] flex-col justify-center gap-4 px-4 py-5 md:min-h-[120px] md:flex-row md:items-center md:justify-between md:py-6">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
              Public Collection
            </p>
            <p className="text-sm text-white/90 md:text-base">
              Curated works assessed under the Mend Index, available by enquiry and private viewing.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`mailto:${GALLERY_EMAIL}?subject=Collection%20Enquiry`}
              className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-family-navy transition-colors hover:bg-white/90"
            >
              Enquire
            </a>
            <a
              href={`mailto:${GALLERY_EMAIL}?subject=Book%20a%20Viewing`}
              className="inline-flex items-center justify-center rounded-md border border-white/25 bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Book a viewing
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <ArchiveClient artworks={publicArtworks} />

        <footer className="mt-16 border-t border-gallery-border pt-6">
          <p className="max-w-4xl text-[11px] leading-relaxed text-gallery-muted/60">
            {DISCLAIMERS.report}
          </p>
        </footer>
      </div>
    </div>
  );
}
