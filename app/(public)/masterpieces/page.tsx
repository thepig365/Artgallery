import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { ImageOff, ExternalLink, X, BookOpen } from "lucide-react";
import { STUDY_PACKS_TOP50 } from "@/lib/data/study-packs-top50";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_NAME = "Art Valuation Protocol";
const PAGE_SIZE = 24;
const JSONLD_MAX_ITEMS = 24;
const FEATURED_LIMIT = 12;

const FEATURED_ARTISTS = [
  { key: "monet", name: "Claude Monet" },
  { key: "vangogh", name: "Vincent van Gogh" },
  { key: "gauguin", name: "Paul Gauguin" },
] as const;

const ARTIST_TAG_LABELS: Record<string, string> = {
  "artist:monet": "Claude Monet",
  "artist:vangogh": "Vincent van Gogh",
  "artist:gauguin": "Paul Gauguin",
  "artist:rembrandt": "Rembrandt van Rijn",
  "artist:vermeer": "Johannes Vermeer",
  "artist:caravaggio": "Caravaggio",
  "artist:turner": "J. M. W. Turner",
  "artist:hokusai": "Katsushika Hokusai",
  "artist:degas": "Edgar Degas",
  "artist:renoir": "Pierre-Auguste Renoir",
  "artist:cezanne": "Paul Cézanne",
  "artist:manet": "Édouard Manet",
  "artist:el-greco": "El Greco",
  "artist:velazquez": "Diego Velázquez",
  "artist:raphael": "Raphael",
  "artist:botticelli": "Sandro Botticelli",
  "artist:titian": "Titian",
  "artist:rubens": "Peter Paul Rubens",
  "artist:constable": "John Constable",
  "artist:courbet": "Gustave Courbet",
  "artist:pissarro": "Camille Pissarro",
  "artist:sisley": "Alfred Sisley",
  "artist:cassatt": "Mary Cassatt",
  "artist:toulouse-lautrec": "Henri de Toulouse-Lautrec",
  "artist:whistler": "James McNeill Whistler",
  "artist:homer": "Winslow Homer",
  "artist:sargent": "John Singer Sargent",
  "artist:klimt": "Gustav Klimt",
  "artist:munch": "Edvard Munch",
  "artist:kandinsky": "Wassily Kandinsky",
  "artist:mondrian": "Piet Mondrian",
  "artist:klee": "Paul Klee",
  "artist:canaletto": "Canaletto",
  "artist:tiepolo": "Giovanni Battista Tiepolo",
  "artist:durer": "Albrecht Dürer",
  "artist:holbein": "Hans Holbein the Younger",
  "artist:bruegel": "Pieter Bruegel the Elder",
  "artist:gainsborough": "Thomas Gainsborough",
  "artist:delacroix": "Eugène Delacroix",
  "artist:corot": "Jean-Baptiste-Camille Corot",
  "artist:okeefe": "Georgia O'Keeffe",
  "artist:hopper": "Edward Hopper",
  "artist:chagall": "Marc Chagall",
  "artist:miro": "Joan Miró",
  "artist:hiroshige": "Utagawa Hiroshige",
  "artist:bonnard": "Pierre Bonnard",
  "artist:vuillard": "Édouard Vuillard",
  "artist:rousseau": "Henri Rousseau",
  "artist:seurat": "Georges Seurat",
  "artist:signac": "Paul Signac",
};

async function getArtistTagCounts(): Promise<Map<string, number>> {
  try {
    const rows = await prisma.$queryRaw<Array<{ tag: string; cnt: bigint }>>(
      Prisma.sql`SELECT t AS tag, COUNT(*) AS cnt
                 FROM masterpieces, unnest(tags) AS t
                 WHERE t LIKE 'artist:%'
                 GROUP BY t
                 ORDER BY cnt DESC`
    );
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.tag, Number(r.cnt));
    return map;
  } catch (error) {
    console.error("[masterpieces] Failed to load artist tag counts", error);
    return new Map<string, number>();
  }
}

const MODERN_MASTERS = [
  { name: "Pablo Picasso", slug: "picasso", institution: "MoMA", official: "https://www.moma.org/collection/artists/4609" },
  { name: "Joan Mitchell", slug: "joan-mitchell", institution: "Joan Mitchell Foundation", official: "https://www.joanmitchellfoundation.org/joan-mitchell/rights-reproductions" },
  { name: "Mark Rothko", slug: "rothko", institution: "Tate", official: "https://www.tate.org.uk/art/artists/mark-rothko-1875" },
  { name: "Andy Warhol", slug: "warhol", institution: "The Andy Warhol Museum", official: "https://www.warhol.org/" },
  { name: "Vasily Kandinsky", slug: "kandinsky", institution: "Guggenheim", official: "https://www.guggenheim.org/artwork/artist/vasily-kandinsky" },
  { name: "Georgia O'Keeffe", slug: "georgia-okeeffe", institution: "Georgia O'Keeffe Museum", official: "https://www.okeeffemuseum.org/" },
];

const SOURCE_LABELS: Record<string, string> = {
  met: "The Metropolitan Museum of Art",
  aic: "Art Institute of Chicago",
  rijks: "Rijksmuseum",
};

const LICENSE_LABELS: Record<string, string> = {
  CC0: "CC0",
  PDM: "Public Domain Mark",
  PublicDomain: "Public Domain",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const metadataBase = new URL(getSiteUrl());
  const sp = await searchParams;
  const tag = typeof sp.tag === "string" ? sp.tag : null;
  const artistLabel = tag ? ARTIST_TAG_LABELS[tag] : null;

  if (artistLabel) {
    return {
      metadataBase,
      title: `${artistLabel} — Open Masterpieces Library | ${SITE_NAME}`,
      description: `Browse open-access works by ${artistLabel} from museum public-domain programs, available under CC0 and Public Domain licenses.`,
      alternates: { canonical: `/masterpieces?tag=${tag}` },
      openGraph: {
        title: `${artistLabel} — Open Masterpieces Library | ${SITE_NAME}`,
        description: `Explore public-domain masterpieces by ${artistLabel}.`,
        url: `/masterpieces?tag=${tag}`,
        siteName: SITE_NAME,
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  }

  return {
    metadataBase,
    title: `Open Masterpieces Library | ${SITE_NAME}`,
    description:
      "Browse iconic works from The Met and the Art Institute of Chicago — all sourced from museum open-access and public-domain programs. Explore masterpieces under CC0 and Public Domain licenses.",
    alternates: { canonical: "/masterpieces" },
    openGraph: {
      title: `Open Masterpieces Library | ${SITE_NAME}`,
      description:
        "Explore open-access masterpieces from world-renowned museums, available under public-domain licenses.",
      url: "/masterpieces",
      siteName: SITE_NAME,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function MasterpiecesPage({ searchParams }: PageProps) {
  const siteUrl = getSiteUrl();
  const sp = await searchParams;
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const sourceFilter = typeof sp.source === "string" ? sp.source : "";

  const tagFilter = typeof sp.tag === "string" ? sp.tag : null;
  const activeArtistLabel = tagFilter ? ARTIST_TAG_LABELS[tagFilter] : null;

  const baseWhere = {
    license: { in: ["CC0", "PDM", "PublicDomain"] as string[] },
    ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
    ...(sourceFilter ? { source: sourceFilter } : {}),
    ...(tagFilter ? { tags: { has: tagFilter } } : {}),
  };

  const showFeatured = !tagFilter;
  let hasDataError = false;
  let totalCount = 0;
  let featuredData: Array<{
    key: (typeof FEATURED_ARTISTS)[number]["key"];
    name: (typeof FEATURED_ARTISTS)[number]["name"];
    works: Awaited<ReturnType<typeof prisma.masterpiece.findMany>>;
  }> = [];
  let artistTagCounts = new Map<string, number>();
  let masterpieces: Awaited<ReturnType<typeof prisma.masterpiece.findMany>> = [];
  let totalPages = 1;
  let currentPage = 1;

  try {
    totalCount = await prisma.masterpiece.count({ where: baseWhere });
    totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    currentPage = Math.min(page, totalPages);

    if (showFeatured) {
      featuredData = await Promise.all(
        FEATURED_ARTISTS.map(async (artist) => {
          const works = await prisma.masterpiece.findMany({
            where: {
              license: { in: ["CC0", "PDM", "PublicDomain"] },
              tags: { hasEvery: ["featured", `artist:${artist.key}`] },
            },
            orderBy: { createdAt: "desc" },
            take: FEATURED_LIMIT,
          });
          return { ...artist, works };
        })
      );
      artistTagCounts = await getArtistTagCounts();
    }

    masterpieces = await prisma.masterpiece.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch (error) {
    hasDataError = true;
    console.error("[masterpieces] Failed to load page data", error);
  }

  const top50Chips = showFeatured
    ? Object.entries(ARTIST_TAG_LABELS)
        .map(([tag, label]) => ({
          tag,
          key: tag.replace("artist:", ""),
          label,
          count: artistTagCounts.get(tag) ?? 0,
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    : [];

  const bySource: Record<string, number> = {};
  masterpieces.forEach((m) => {
    bySource[m.source] = (bySource[m.source] || 0) + 1;
  });

  const params = new URLSearchParams();
  if (tagFilter) params.set("tag", tagFilter);
  if (query) params.set("q", query);
  if (sourceFilter) params.set("source", sourceFilter);
  const baseQuery = params.toString();
  const paginationBase = baseQuery ? `/masterpieces?${baseQuery}` : "/masterpieces";

  function paginationHref(p: number): string {
    const q = new URLSearchParams(baseQuery);
    if (p > 1) q.set("page", String(p));
    else q.delete("page");
    const s = q.toString();
    return s ? `/masterpieces?${s}` : "/masterpieces";
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeArtistLabel
      ? `${activeArtistLabel} — Open Masterpieces Library`
      : "Open Masterpieces Library",
    description:
      "Browse iconic works from The Met and the Art Institute of Chicago — all sourced from museum open-access and public-domain programs.",
    url: `${siteUrl}${paginationBase}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalCount,
      itemListElement: masterpieces.slice(0, JSONLD_MAX_ITEMS).map((m, i) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PAGE_SIZE + i + 1,
        url: `${siteUrl}/masterpieces/${m.id}`,
        name: m.artist ? `${m.title} by ${m.artist}` : m.title,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <div className="mb-10">
        {hasDataError && (
          <div className="mb-5 border border-amber-300 bg-amber-50 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-900 leading-relaxed">
              Masterpieces data is temporarily unavailable. Please refresh shortly.
            </p>
          </div>
        )}
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
          {activeArtistLabel ? "Featured Artist" : "Open-Access Collection"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-3">
          {activeArtistLabel || "Masterpieces"}
        </h1>
        {activeArtistLabel ? (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-gallery-muted leading-relaxed">
              Showing public-domain works by {activeArtistLabel}.
            </p>
            <Link
              href="/masterpieces"
              className="inline-flex items-center gap-1 text-xs text-gallery-accent hover:underline"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Clear filter
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gallery-muted leading-relaxed max-w-2xl mb-4">
            All works shown here are sourced from museum open-access / public-domain
            programs. Each image is used under its respective open license (CC0 or
            Public Domain) and links back to the source institution.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gallery-muted">
          {Object.entries(bySource).map(([source, count]) => (
            <span
              key={source}
              className="inline-flex items-center gap-1.5 bg-gallery-surface-alt border border-gallery-border rounded-md px-2.5 py-1"
            >
              {SOURCE_LABELS[source] || source}
              <span className="font-semibold text-gallery-text">{count}</span>
            </span>
          ))}
          <span className="text-gallery-muted/60">
            Page {currentPage} of {totalPages} &middot; {totalCount} works
          </span>
        </div>
      </div>

      <form className="mb-8 border border-gallery-border rounded-lg bg-gallery-surface p-4 sm:p-5">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gallery-text">
            Library Filters
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label htmlFor="masterpieces-search" className="mb-1 block text-xs font-medium text-gallery-text">
              Search title
            </label>
            <input
              id="masterpieces-search"
              name="q"
              defaultValue={query}
              placeholder="Search masterpiece title"
              className="w-full rounded-md border border-gallery-border bg-white px-3 py-2 text-sm text-gallery-text"
            />
          </div>
          <div>
            <label htmlFor="masterpieces-source" className="mb-1 block text-xs font-medium text-gallery-text">
              Institution
            </label>
            <select
              id="masterpieces-source"
              name="source"
              defaultValue={sourceFilter}
              className="w-full rounded-md border border-gallery-border bg-white px-3 py-2 text-sm text-gallery-text"
            >
              <option value="">All institutions</option>
              <option value="aic">Art Institute of Chicago</option>
              <option value="met">The Metropolitan Museum of Art</option>
              <option value="rijks">Rijksmuseum</option>
            </select>
          </div>
          <div className="flex gap-2">
            {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
            <button
              type="submit"
              className="w-full rounded-md bg-gallery-accent text-white px-3 py-2 text-sm font-medium hover:bg-gallery-accent-hover transition-colors"
            >
              Search
            </button>
            <Link
              href="/masterpieces"
              className="inline-flex items-center justify-center rounded-md border border-gallery-border px-3 py-2 text-sm text-gallery-muted hover:text-gallery-text"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {!tagFilter && (
        <div className="mb-10 bg-gallery-surface border border-gallery-border rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gallery-text font-medium mb-1">
              Interested in curatorial assessment?
            </p>
            <p className="text-xs text-gallery-muted leading-relaxed max-w-md">
              Explore how the Mend Index evaluates material sincerity, or submit
              your own work for review.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/protocol"
              className="inline-flex items-center px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
            >
              Learn the Protocol
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center px-5 py-2.5 border border-gallery-border text-gallery-text text-sm font-medium rounded-lg hover:bg-gallery-surface-alt transition-colors duration-200"
            >
              Submit Work
            </Link>
            <Link
              href="/archive"
              className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
            >
              Browse Contemporary Collection &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Featured Artists — only on unfiltered view */}
      {showFeatured && featuredData.some((f) => f.works.length > 0) && (
        <div className="mb-14 space-y-12">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-1">
              Curated Selections
            </p>
            <h2 className="text-2xl font-bold text-gallery-text tracking-tight">
              Featured Artists
            </h2>
          </div>

          {featuredData.map((artist) =>
            artist.works.length > 0 ? (
              <section key={artist.key}>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gallery-text">
                    {artist.name}
                  </h3>
                  <Link
                    href={`/masterpieces?tag=artist:${artist.key}`}
                    className="text-xs text-gallery-accent hover:underline"
                  >
                    See all {artist.name} &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {artist.works.map((m) => (
                    <Link
                      key={m.id}
                      href={`/masterpieces/${m.id}`}
                      className="group block"
                    >
                      <div className="bg-gallery-surface rounded-lg overflow-hidden border border-gallery-border/60 hover:border-gallery-border hover:shadow-md transition-all duration-300">
                        <div className="relative overflow-hidden bg-gallery-surface-alt aspect-square">
                          {m.thumbnailUrl || m.imageUrl ? (
                            <Image
                              src={m.thumbnailUrl || m.imageUrl}
                              alt={m.title}
                              width={200}
                              height={200}
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <ImageOff className="w-6 h-6 text-gallery-muted/30" strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-gallery-text leading-snug line-clamp-2">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-gallery-muted/70 mt-0.5">
                            {SOURCE_LABELS[m.source] || m.source}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null
          )}

          {/* Modern Masters Study Kit */}
          <section>
            <h3 className="text-lg font-semibold text-gallery-text mb-1">
              Modern Masters Study Kit
            </h3>
            <p className="text-xs text-gallery-muted mb-4">
              We don&apos;t host images here due to copyright. Use these official sources, then apply the Mend Index Protocol.
            </p>
            <div className="mb-5">
              <Link
                href="/protocol"
                className="inline-flex items-center px-5 py-2.5 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
              >
                Learn the Protocol
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODERN_MASTERS.map((master) => (
                <div
                  key={master.slug}
                  className="bg-gallery-surface border border-gallery-border rounded-lg p-5 flex flex-col gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gallery-text">{master.name}</p>
                    <p className="text-xs text-gallery-muted">{master.institution}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/protocol"
                      className="text-xs font-medium text-gallery-accent hover:underline"
                    >
                      Apply the Protocol
                    </Link>
                    <span className="text-gallery-border">·</span>
                    <Link
                      href="/archive"
                      className="text-xs font-medium text-gallery-accent hover:underline"
                    >
                      Browse Collection
                    </Link>
                    <span className="text-gallery-border">·</span>
                    <Link
                      href={`/study/${master.slug}`}
                      className="text-xs font-medium text-gallery-accent hover:underline"
                    >
                      Study Guide
                    </Link>
                  </div>
                  <a
                    href={master.official}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gallery-muted/70 hover:text-gallery-muted transition-colors mt-auto"
                  >
                    Official collection
                    <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Top 50 Artists — compact chips with counts */}
      {showFeatured && top50Chips.length > 0 && (
        <div className="mb-14">
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-1">
              Browse by Artist
            </p>
            <h2 className="text-2xl font-bold text-gallery-text tracking-tight">
              Top 50 Artists
            </h2>
            <p className="text-xs text-gallery-muted mt-1">
              Counts grow over time as we ingest more public-domain works.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {top50Chips.map((chip) => (
              <Link
                key={chip.key}
                href={`/masterpieces?tag=${chip.tag}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gallery-surface border border-gallery-border rounded-full text-sm text-gallery-text hover:bg-gallery-surface-alt hover:border-gallery-accent/40 transition-all duration-200 group"
              >
                <span className="group-hover:text-gallery-accent transition-colors">
                  {chip.label}
                </span>
                <span className="text-[10px] font-semibold bg-gallery-surface-alt group-hover:bg-gallery-accent/10 text-gallery-muted group-hover:text-gallery-accent border border-gallery-border/60 rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center transition-colors">
                  {chip.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Study Packs for Artists Not Yet Ingested */}
      {showFeatured && STUDY_PACKS_TOP50.length > 0 && (
        <div className="mb-14">
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-1">
              Text-Only Guides
            </p>
            <h2 className="text-2xl font-bold text-gallery-text tracking-tight">
              Study Packs for Artists Not Yet Ingested
            </h2>
            <p className="text-xs text-gallery-muted mt-1">
              No public-domain images available yet. Use these guides to study
              their work through the Mend Index Protocol.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STUDY_PACKS_TOP50.slice(0, 12).map((pack) => (
              <div
                key={pack.slug}
                className="bg-gallery-surface border border-gallery-border rounded-lg p-4 flex flex-col gap-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-gallery-text">
                    {pack.name}
                  </p>
                  <p className="text-xs text-gallery-muted/80 leading-relaxed line-clamp-2 mt-1">
                    {pack.shortBlurb}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/study/${pack.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gallery-accent hover:underline"
                  >
                    <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                    Study Guide
                  </Link>
                  <span className="text-gallery-border">·</span>
                  <Link
                    href="/protocol"
                    className="text-xs font-medium text-gallery-accent hover:underline"
                  >
                    Apply the Protocol
                  </Link>
                  <span className="text-gallery-border">·</span>
                  <Link
                    href="/archive"
                    className="text-xs font-medium text-gallery-accent hover:underline"
                  >
                    Browse Collection
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {pack.officialLinks.slice(0, 2).map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-gallery-muted/60 hover:text-gallery-muted transition-colors"
                    >
                      {link.label}
                      <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {STUDY_PACKS_TOP50.length > 12 && (
            <div className="mt-4 text-center">
              <Link
                href="/study#top50-study-packs"
                className="text-xs text-gallery-accent hover:underline"
              >
                View all study packs &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* All Works Grid */}
      {!activeArtistLabel && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gallery-text tracking-tight">
            All Works
          </h2>
        </div>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        {masterpieces.map((m) => (
          <Link
            key={m.id}
            href={`/masterpieces/${m.id}`}
            className="group block break-inside-avoid mb-5"
          >
            <article className="bg-gallery-surface rounded-lg overflow-hidden border border-gallery-border/60 hover:border-gallery-border hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden bg-gallery-surface-alt">
                {m.thumbnailUrl || m.imageUrl ? (
                  <Image
                    src={m.thumbnailUrl || m.imageUrl}
                    alt={m.title}
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center aspect-[4/3]">
                    <ImageOff className="w-8 h-8 text-gallery-muted/30" strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="p-3">
                <h2 className="text-sm font-medium text-gallery-text leading-snug line-clamp-2 mb-1">
                  {m.title}
                </h2>
                {m.artist && (
                  <p className="text-xs text-gallery-muted truncate">{m.artist}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gallery-muted/70">
                    {SOURCE_LABELS[m.source] || m.source}
                  </span>
                  {LICENSE_LABELS[m.license] && (
                    <span className="text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5">
                      {LICENSE_LABELS[m.license]}
                    </span>
                  )}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {!hasDataError && masterpieces.length === 0 && (
        <div className="mt-8 border border-gallery-border rounded-lg bg-gallery-surface p-6">
          <h3 className="text-lg font-semibold text-gallery-text mb-2">
            Library is being curated
          </h3>
          <p className="text-sm text-gallery-muted mb-4">
            We are expanding the museum library. In the meantime, explore study packs
            and subscribe for updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/study"
              className="inline-flex items-center px-4 py-2 bg-gallery-accent text-white text-sm rounded-md"
            >
              Browse Study Packs
            </Link>
            <a
              href="mailto:gallery@bayviewhub.me?subject=Masterpieces%20Library%20Updates"
              className="inline-flex items-center px-4 py-2 border border-gallery-border text-sm text-gallery-text rounded-md"
            >
              Subscribe for updates
            </a>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-10 flex items-center justify-center gap-3"
        >
          {currentPage > 1 ? (
            <Link
              href={paginationHref(currentPage - 1)}
              className="inline-flex items-center px-4 py-2 border border-gallery-border text-sm font-medium text-gallery-text rounded-lg hover:bg-gallery-surface-alt transition-colors"
            >
              &larr; Previous
            </Link>
          ) : (
            <span className="inline-flex items-center px-4 py-2 border border-gallery-border/40 text-sm font-medium text-gallery-muted/40 rounded-lg cursor-not-allowed">
              &larr; Previous
            </span>
          )}

          <span className="text-sm text-gallery-muted tabular-nums">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={paginationHref(currentPage + 1)}
              className="inline-flex items-center px-4 py-2 border border-gallery-border text-sm font-medium text-gallery-text rounded-lg hover:bg-gallery-surface-alt transition-colors"
            >
              Next &rarr;
            </Link>
          ) : (
            <span className="inline-flex items-center px-4 py-2 border border-gallery-border/40 text-sm font-medium text-gallery-muted/40 rounded-lg cursor-not-allowed">
              Next &rarr;
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
