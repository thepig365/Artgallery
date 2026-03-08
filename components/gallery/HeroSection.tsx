import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-gallery-surface-alt overflow-hidden">
      <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gallery-accent mb-4">
            Curated Gallery &bull; Optional Mend Index
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gallery-text leading-tight tracking-tight mb-6">
            Discover Material
            <br />
            Sincerity in Art
          </h1>
          <p className="text-lg text-gallery-muted leading-relaxed mb-8 max-w-lg">
            A curated gallery of contemporary artworks. Browse the collection,
            explore artists, or submit your own practice for optional Mend Index
            assessment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/archive"
              className="inline-flex items-center px-6 py-3 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
            >
              Browse Collection
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center px-6 py-3 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
            >
              Submit Work
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gallery-border/30 to-transparent pointer-events-none hidden lg:block" />
    </section>
  );
}
