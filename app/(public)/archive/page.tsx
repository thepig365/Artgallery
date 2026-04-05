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
  "Bayview Arts Gallery curates and exhibits artworks assessed under the Mend Index Protocol — a four-axis framework evaluating Body, Process, Material, and Surface. Enquiry-first gallery with no online checkout.";

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
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    "name": "Bayview Arts Gallery",
    "description": "Bayview Arts Gallery curates and exhibits artworks assessed under the Mend Index Protocol — a four-axis framework evaluating Body, Process, Material, and Surface. Enquiry-first gallery with no online checkout.",
    "url": "https://gallery.bayviewhub.me",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "365 Purves Road",
      "addressLocality": "Main Ridge",
      "addressRegion": "VIC",
      "postalCode": "3928",
      "addressCountry": "AU"
    },
    "email": "gallery@bayviewhub.me",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Bayview Hub",
      "url": "https://www.bayviewhub.me"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Bayview Arts Gallery Collection",
      "url": "https://gallery.bayviewhub.me/archive"
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "name": "Private Viewing",
        "url": "https://gallery.bayviewhub.me/private-viewing",
        "description": "Mediated private viewing of gallery collection by appointment at the estate."
      },
      {
        "@type": "Offer",
        "name": "Artwork Submission for Assessment",
        "url": "https://gallery.bayviewhub.me/submit",
        "description": "Artists may submit works for Mend Index Protocol assessment and potential inclusion in the gallery collection."
      }
    ]
  };
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
          __html: JSON.stringify(gallerySchema).replace(/</g, "\\u003c"),
        }}
      />
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
            <p className="mb-1 text-caption uppercase tracking-[0.2em] text-white/70">
              Public Collection
            </p>
            <p className="text-body text-white/90 md:text-nav">
              Curated works assessed under the Mend Index, available by enquiry and private viewing.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`mailto:${GALLERY_EMAIL}?subject=Collection%20Enquiry`}
              className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white px-4 py-2 text-caption font-medium uppercase tracking-wide text-family-navy transition-colors hover:bg-white/90"
            >
              Enquire
            </a>
            <a
              href={`mailto:${GALLERY_EMAIL}?subject=Book%20a%20Viewing`}
              className="inline-flex items-center justify-center rounded-md border border-white/25 bg-transparent px-4 py-2 text-caption font-medium uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Book a viewing
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <ArchiveClient artworks={publicArtworks} />

        <footer className="mt-16 border-t border-gallery-border pt-6">
          <p className="max-w-4xl text-micro leading-relaxed text-gallery-muted/60">
            {DISCLAIMERS.report}
          </p>
        </footer>
      </div>
    </div>
  );
}
