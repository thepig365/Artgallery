import type { Metadata } from "next";
import Link from "next/link";
import { MODERN_MASTERS_DATA } from "@/lib/data/modern-masters";
import { STUDY_PACKS_TOP50 } from "@/lib/data/study-packs-top50";
import { getSiteUrl } from "@/lib/site-url";
import { StudyLibraryClient } from "@/components/study/StudyLibraryClient";

const SITE_NAME = "Art Valuation Protocol";

const allStudyItems = [
  ...MODERN_MASTERS_DATA.map((m) => ({
    slug: m.slug,
    name: m.name,
    blurb: m.blurb,
    institution: m.institution,
    kind: "master" as const,
  })),
  ...STUDY_PACKS_TOP50.map((p) => ({
    slug: p.slug,
    name: p.name,
    blurb: p.shortBlurb,
    institution: null,
    kind: "pack" as const,
  })),
];

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `Modern Masters Study Guides | ${SITE_NAME}`,
  description:
    "Text-only study guides for modern and contemporary masters. Learn how to read Picasso, Rothko, Warhol, and more through the Mend Index Protocol.",
  alternates: { canonical: "/study" },
  openGraph: {
    title: `Modern Masters Study Guides | ${SITE_NAME}`,
    description:
      "In-depth study guides for modern masters — learn how to evaluate and interpret their work using the Mend Index framework.",
    url: "/study",
    siteName: SITE_NAME,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function StudyIndexPage() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Modern Masters Study Guides",
    description: metadata.description,
    url: `${siteUrl}/study`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allStudyItems.length,
      itemListElement: allStudyItems.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/study/${m.slug}`,
        name: `${m.name} Study Guide`,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Study Guides
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-3">
        Modern Masters Study Guides
      </h1>
      <p className="text-sm text-gallery-muted leading-relaxed max-w-2xl mb-8">
        Search-first museum study library for modern and contemporary masters.
        Use filters to explore institutions, artists, and curated study packs.
      </p>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/protocol"
          className="inline-flex items-center px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
        >
          Learn the Protocol
        </Link>
        <Link
          href="/archive"
          className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
        >
          Browse Archive
        </Link>
        <Link
          href="/masterpieces"
          className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
        >
          Open Masterpieces
        </Link>
      </div>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-1">
          Curated Study Packs
        </h2>
        <p className="text-xs text-gallery-muted">
          Start with highlighted packs, then search across the full library.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {STUDY_PACKS_TOP50.slice(0, 3).map((pack) => (
          <Link
            key={pack.slug}
            href={`/study/${pack.slug}`}
            className="bg-gallery-surface border border-gallery-border rounded-lg p-4 hover:border-gallery-accent/40 transition-colors"
          >
            <p className="text-sm font-semibold text-gallery-text mb-1">{pack.name}</p>
            <p className="text-xs text-gallery-muted line-clamp-2">{pack.shortBlurb}</p>
          </Link>
        ))}
      </div>

      <StudyLibraryClient items={allStudyItems} />
    </div>
  );
}
