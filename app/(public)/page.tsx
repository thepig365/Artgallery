import { HeroSection } from "@/components/gallery/HeroSection";
import { FeaturedSection } from "@/components/gallery/FeaturedSection";
import { getPublicArtworks } from "@/lib/services/artwork-visibility";
import { resolveArtworksToGalleryPublicUrls } from "@/lib/supabase/gallery-public";
import Link from "next/link";

export default async function HomePage() {
  let featuredArtworks: Awaited<ReturnType<typeof getPublicArtworks>> = [];
  try {
    const artworks = await getPublicArtworks({ take: 8 });
    featuredArtworks = resolveArtworksToGalleryPublicUrls(artworks);
  } catch (err) {
    console.error("[Home] Failed to load featured artworks:", err);
  }

  return (
    <div>
      <HeroSection />

      <FeaturedSection artworks={featuredArtworks} />

      {/* Browse by Medium */}
      <section className="py-16 sm:py-20 bg-gallery-surface-alt">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
            Explore by Medium
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-10">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Painting", filter: "painting" },
              { label: "Sculpture", filter: "sculpture" },
              { label: "Mixed Media", filter: "mixed-media" },
              { label: "Textile", filter: "textile" },
            ].map(({ label, filter }) => (
                <Link
                  key={filter}
                  href={`/archive?medium=${filter}`}
                  className="bg-gallery-surface border border-gallery-border rounded-lg p-6 hover:shadow-md hover:border-gallery-accent/30 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gallery-text">
                    {label}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Open Masterpieces Library */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gallery-surface border border-gallery-border rounded-xl p-8 sm:p-12 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-gallery-accent mb-3">
              Open-Access Collection
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-4">
              Open Masterpieces Library
            </h2>
            <p className="text-sm text-gallery-muted max-w-lg mx-auto leading-relaxed mb-6">
              Explore iconic works from The Met and the Art Institute of Chicago,
              all sourced from museum open-access programs under public-domain licenses.
            </p>
            <Link
              href="/masterpieces"
              className="inline-flex items-center px-6 py-3 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
            >
              Browse Open Masterpieces
            </Link>
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gallery-surface border border-gallery-border rounded-xl p-8 sm:p-12 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-gallery-accent mb-3">
              For Artists &amp; Practitioners
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-4">
              Submit Your Work
            </h2>
            <p className="text-sm text-gallery-muted max-w-lg mx-auto leading-relaxed mb-6">
              Share your practice with our curatorial community. Works may
              optionally be evaluated through the Mend Index scoring methodology.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center px-6 py-3 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
              >
                Submit Work
              </Link>
              <Link
                href="/protocol"
                className="inline-flex items-center px-6 py-3 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
              >
                Read Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
