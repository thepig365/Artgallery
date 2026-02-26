import type { Metadata } from "next";
import Link from "next/link";
import { MODERN_MASTERS_DATA } from "@/lib/data/modern-masters";
import { STUDY_PACKS_TOP50 } from "@/lib/data/study-packs-top50";
import { getSiteUrl } from "@/lib/site-url";
import { ArrowRight, ExternalLink } from "lucide-react";

const SITE_NAME = "Art Valuation Protocol";

const allStudyItems = [
  ...MODERN_MASTERS_DATA.map((m) => ({ slug: m.slug, name: m.name, blurb: m.blurb, institution: m.institution })),
  ...STUDY_PACKS_TOP50.map((p) => ({ slug: p.slug, name: p.name, blurb: p.shortBlurb, institution: null })),
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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
        Text-only study guides for modern and contemporary masters. No images are
        hosted — instead, learn how to evaluate and interpret their work through
        the Mend Index framework, then visit official collections.
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

      {/* Modern Masters — full study guides */}
      <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-4">
        Modern Masters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {MODERN_MASTERS_DATA.map((master) => (
          <Link
            key={master.slug}
            href={`/study/${master.slug}`}
            className="group bg-gallery-surface border border-gallery-border rounded-lg p-5 hover:border-gallery-accent/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gallery-text group-hover:text-gallery-accent transition-colors mb-1">
                  {master.name}
                </h3>
                <p className="text-xs text-gallery-muted mb-2">
                  {master.institution}
                </p>
                <p className="text-sm text-gallery-muted/80 leading-relaxed line-clamp-2">
                  {master.blurb}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gallery-muted/40 group-hover:text-gallery-accent shrink-0 mt-1 transition-colors" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>

      {/* Top 50 Artists — Study Packs (no hosted images) */}
      <div id="top50-study-packs">
        <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-1">
          Top 50 Artists — Study Packs
        </h2>
        <p className="text-xs text-gallery-muted mb-4">
          No hosted images. Text-only evaluation guides with official collection links.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STUDY_PACKS_TOP50.map((pack) => (
            <div
              key={pack.slug}
              className="bg-gallery-surface border border-gallery-border rounded-lg p-5 flex flex-col gap-3"
            >
              <div>
                <h3 className="text-base font-semibold text-gallery-text mb-1">
                  {pack.name}
                </h3>
                <p className="text-sm text-gallery-muted/80 leading-relaxed line-clamp-2">
                  {pack.shortBlurb}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/study/${pack.slug}`}
                  className="text-xs font-medium text-gallery-accent hover:underline"
                >
                  Study Guide
                </Link>
                <span className="text-gallery-border">·</span>
                <Link
                  href="/protocol"
                  className="text-xs font-medium text-gallery-accent hover:underline"
                >
                  Apply the Protocol
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {pack.officialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gallery-muted/70 hover:text-gallery-muted transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
