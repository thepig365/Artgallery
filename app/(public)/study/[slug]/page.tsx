import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODERN_MASTERS_DATA, getMasterBySlug } from "@/lib/data/modern-masters";
import { STUDY_PACKS_TOP50, getStudyPackBySlug } from "@/lib/data/study-packs-top50";
import { ExternalLink } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

const SITE_NAME = "Art Valuation Protocol";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    ...MODERN_MASTERS_DATA.map((m) => ({ slug: m.slug })),
    ...STUDY_PACKS_TOP50.map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const master = getMasterBySlug(slug);
  const pack = !master ? getStudyPackBySlug(slug) : null;
  const entry = master || pack;
  if (!entry) return { title: "Not Found" };

  const siteUrl = getSiteUrl();
  const blurb = "blurb" in entry ? entry.blurb : entry.shortBlurb;

  return {
    metadataBase: new URL(siteUrl),
    title: `${entry.name} Study Guide | ${SITE_NAME}`,
    description: `Learn how to evaluate and interpret ${entry.name}'s work using the Mend Index Protocol. Text-only guide with B/P/M/S analysis tips.`,
    alternates: { canonical: `/study/${slug}` },
    openGraph: {
      title: `${entry.name} Study Guide | ${SITE_NAME}`,
      description: blurb,
      url: `/study/${slug}`,
      siteName: SITE_NAME,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

const mendLabels: Record<string, string> = {
  B: "Body",
  P: "Process",
  M: "Material",
  S: "Surface",
};

export default async function StudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const master = getMasterBySlug(slug);
  const pack = !master ? getStudyPackBySlug(slug) : null;

  if (!master && !pack) notFound();

  const siteUrl = getSiteUrl();

  if (master) return renderModernMaster(master, siteUrl);
  return renderStudyPack(pack!, siteUrl);
}

function renderModernMaster(
  master: NonNullable<ReturnType<typeof getMasterBySlug>>,
  siteUrl: string
) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${master.name} Study Guide`,
    description: master.blurb,
    url: `${siteUrl}/study/${master.slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
    publisher: { "@type": "Organization", name: SITE_NAME },
    about: { "@type": "Person", name: master.name },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-2 text-xs text-gallery-muted mb-6">
        <Link href="/study" className="hover:text-gallery-accent transition-colors">
          Study Guides
        </Link>
        <span>/</span>
        <span className="text-gallery-text">{master.name}</span>
      </nav>

      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Study Guide
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-2">
        {master.name}
      </h1>
      <p className="text-sm text-gallery-muted mb-6">{master.institution}</p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-4">
          Why They Matter
        </h2>
        {master.why.split("\n\n").map((p, i) => (
          <p key={i} className="text-sm text-gallery-muted/90 leading-relaxed mb-4">
            {p}
          </p>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-4">
          Representative Works
        </h2>
        <div className="space-y-4">
          {master.phases.map((phase, i) => (
            <div
              key={i}
              className="bg-gallery-surface border border-gallery-border rounded-lg p-5"
            >
              <h3 className="text-sm font-semibold text-gallery-text mb-2">
                {phase.title}
              </h3>
              <p className="text-sm text-gallery-muted/80 leading-relaxed">
                {phase.description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gallery-muted/60 mt-3 italic">
          No images hosted — text descriptions only, in compliance with copyright.
        </p>
      </section>

      {renderMendTips(master.mendTips, master.name)}

      <section className="mb-10 bg-gallery-surface border border-gallery-border rounded-lg p-5">
        <p className="text-xs text-gallery-muted mb-2">
          Official collection — images not hosted here due to copyright
        </p>
        <a
          href={master.official}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gallery-accent hover:underline"
        >
          {master.institution}: {master.name}
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
        </a>
      </section>

      {renderFooterNav()}
    </div>
  );
}

function renderStudyPack(
  pack: NonNullable<ReturnType<typeof getStudyPackBySlug>>,
  siteUrl: string
) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${pack.name} Study Guide`,
    description: pack.shortBlurb,
    url: `${siteUrl}/study/${pack.slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
    publisher: { "@type": "Organization", name: SITE_NAME },
    about: { "@type": "Person", name: pack.name },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-2 text-xs text-gallery-muted mb-6">
        <Link href="/study" className="hover:text-gallery-accent transition-colors">
          Study Guides
        </Link>
        <span>/</span>
        <span className="text-gallery-text">{pack.name}</span>
      </nav>

      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Study Pack
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-2">
        {pack.name}
      </h1>

      <section className="mb-10">
        <p className="text-sm text-gallery-muted/90 leading-relaxed mb-4">
          {pack.shortBlurb}
        </p>
      </section>

      {renderMendTips(pack.protocolTips, pack.name)}

      <section className="mb-10 bg-gallery-surface border border-gallery-border rounded-lg p-5">
        <p className="text-xs text-gallery-muted mb-3">
          Official collection links — no images hosted here due to copyright
        </p>
        <div className="flex flex-col gap-2">
          {pack.officialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gallery-accent hover:underline"
            >
              {link.label}
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </section>

      {renderFooterNav()}
    </div>
  );
}

function renderMendTips(tips: { B: string; P: string; M: string; S: string }, artistName: string) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gallery-text tracking-tight mb-4">
        How to Read with the Mend Index
      </h2>
      <p className="text-sm text-gallery-muted/80 leading-relaxed mb-4">
        Apply these B/P/M/S interpretation tips when evaluating works attributed
        to {artistName}:
      </p>
      <div className="space-y-3">
        {(["B", "P", "M", "S"] as const).map((dim) => (
          <div
            key={dim}
            className="bg-gallery-surface border border-gallery-border rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gallery-accent/10 text-gallery-accent text-xs font-bold rounded">
                {dim}
              </span>
              <span className="text-xs font-medium text-gallery-text">
                {mendLabels[dim]}
              </span>
            </div>
            <p className="text-sm text-gallery-muted/80 leading-relaxed">
              {tips[dim]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderFooterNav() {
  return (
    <div className="flex flex-wrap gap-3 pt-6 border-t border-gallery-border">
      <Link
        href="/protocol"
        className="inline-flex items-center px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
      >
        Learn the Protocol
      </Link>
      <Link
        href="/masterpieces"
        className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
      >
        Open Masterpieces
      </Link>
      <Link
        href="/archive"
        className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
      >
        Browse Collection
      </Link>
      <Link
        href="/study"
        className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
      >
        All Study Guides
      </Link>
    </div>
  );
}
