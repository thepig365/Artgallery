import { HeroSection } from "@/components/gallery/HeroSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      {/* Featured Works — placeholder grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
                Curated Picks
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight">
                Featured Works
              </h2>
            </div>
            <Link
              href="/archive"
              className="text-sm text-gallery-accent font-medium hover:text-gallery-accent-hover transition-colors hidden sm:block"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gallery-surface border border-gallery-border/60 rounded-lg overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gallery-surface-alt flex items-center justify-center">
                  <span className="text-xs text-subtle tracking-wide">
                    Awaiting imagery
                  </span>
                </div>
                <div className="p-5">
                  <div className="h-4 w-2/3 bg-gallery-surface-alt rounded mb-2" />
                  <div className="h-3 w-1/3 bg-gallery-surface-alt rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/archive"
              className="text-sm text-gallery-accent font-medium hover:text-gallery-accent-hover transition-colors"
            >
              View all works &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Medium */}
      <section className="py-16 sm:py-20 bg-gallery-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
            Explore by Medium
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-10">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Painting", "Sculpture", "Mixed Media", "Textile"].map(
              (medium) => (
                <Link
                  key={medium}
                  href="/archive"
                  className="bg-gallery-surface border border-gallery-border rounded-lg p-6 hover:shadow-md hover:border-gallery-accent/30 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gallery-text">
                    {medium}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Open Masterpieces Library */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                href="/portal/submit"
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
