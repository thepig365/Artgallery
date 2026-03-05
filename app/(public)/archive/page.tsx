import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { getPublicArtworks, type PublicArtwork } from "@/lib/services/public-artworks";
import { GALLERY_EMAIL } from "@/lib/brand";
import { ArchiveClient } from "./archive-client";
import type { Metadata } from "next";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
// Force no caching - always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Collection | Bayview Hub Art Gallery",
  description:
    "Browse publicly visible artworks assessed through the Mend Index protocol.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "Collection | Bayview Hub Art Gallery",
    description:
      "Browse publicly visible artworks assessed through the Mend Index protocol.",
    type: "website",
    url: "/archive",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collection | Bayview Hub Art Gallery",
    description:
      "Browse publicly visible artworks assessed through the Mend Index protocol.",
  },
};

export default async function ArchivePage() {
  let publicArtworks: PublicArtwork[] = [];

  try {
    publicArtworks = await getPublicArtworks(500);
  } catch (err) {
    console.error("[Archive] Failed to load artworks:", err);
  }

  return (
    <div className="pb-14 sm:pb-20">
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
              href={`mailto:${GALLERY_EMAIL}?subject=Archive%20Enquiry`}
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
