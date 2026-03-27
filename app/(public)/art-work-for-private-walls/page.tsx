// ─────────────────────────────────────────────────────────────
// Works for Private Walls — Public listing page
//
// CACHING STRATEGY: force-dynamic
//   Images are served via short-lived Supabase signed URLs generated at
//   request time. Static or ISR caching would serve stale/expired signed
//   URLs. Every render is fully server-side, generating fresh signed URLs.
// ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getPassportImageUrl } from "@/lib/passport/storage";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Works for Private Walls | Bayview Hub",
  description:
    "A public selection of works made visible through BayviewHub's Private Viewing Network. Distinct from the main curated collection.",
};

const TYPE_LABELS: Record<string, string> = {
  ORIGINAL:      "Original",
  EDITION:       "Limited Edition",
  DIGITAL_PRINT: "Digital Print",
  REPRODUCTION:  "Reproduction",
};

export default async function WorksForPrivateWallsPage() {
  // ── Data ─────────────────────────────────────────────────────
  const works = await prisma.hostPassport.findMany({
    where: { wallPublication: "PUBLIC_PRIVATE_WALLS" },
    orderBy: { publishedAt: "desc" },
    select: {
      id:           true,
      publicSlug:   true,
      artworkTitle: true,
      artistName:   true,
      medium:       true,
      dimensions:   true,
      artworkYear:  true,
      artworkType:  true,
      significance: true,
      mainImagePath: true,
      publishedAt:  true,
    },
  });

  // ── Fresh signed URLs — generated per render (no caching) ────
  const worksWithUrls = await Promise.all(
    works.map(async (w) => ({
      ...w,
      imageUrl: await getPassportImageUrl(w.mainImagePath),
    }))
  );

  return (
    <div className="min-h-screen bg-gallery-bg">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="border-b border-gallery-border bg-family-navy">
        <Container className="py-14 sm:py-20">
          <p className="mb-3 text-micro font-medium uppercase tracking-[0.22em] text-family-accent">
            Bayview Hub · Private Viewing Network
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Works for Private Walls
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            A public selection of works made visible through BayviewHub&apos;s
            Private Viewing Network. These works are presented here by host
            choice and BayviewHub publication. Viewing and enquiries remain
            Bayview-mediated.
          </p>
        </Container>
      </div>

      {/* ── Programme explanation ─────────────────────────────── */}
      <div className="border-b border-gallery-border bg-gallery-surface">
        <Container className="py-8">
          <div className="max-w-2xl space-y-2 text-sm leading-relaxed text-gallery-muted">
            <p>
              Works for Private Walls is a distinct public layer within
              BayviewHub&apos;s Private Viewing Network. Works listed here have
              been registered through the Artwork Passport programme and made
              publicly visible by host opt-in and BayviewHub publication.
            </p>
            <p>
              Inclusion here does not place a work in BayviewHub&apos;s main
              curated collection. All viewing interest is handled exclusively
              through BayviewHub — host details are never disclosed.
            </p>
          </div>
        </Container>
      </div>

      {/* ── Works grid ────────────────────────────────────────── */}
      <Container className="py-12 sm:py-16">
        {worksWithUrls.length === 0 ? (
          <div className="border border-gallery-border bg-gallery-surface px-8 py-16 text-center">
            <p className="text-micro uppercase tracking-widest text-gallery-muted">
              No works are currently listed through this programme.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {worksWithUrls.map((work) => (
              <article
                key={work.id}
                className="group border border-gallery-border bg-gallery-surface transition-shadow hover:shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gallery-surface-alt">
                  {work.imageUrl ? (
                    <Image
                      src={work.imageUrl}
                      alt={work.artworkTitle}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-micro uppercase tracking-widest text-gallery-muted">
                        Image not available
                      </p>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1.5 border border-white/20 bg-family-navy/80 px-2 py-1 text-micro font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-family-accent" />
                      Private Walls
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <p className="font-serif text-base font-semibold leading-snug text-gallery-text">
                    {work.artworkTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-gallery-muted">
                    {work.artistName}
                  </p>
                  <p className="mt-1 text-xs text-gallery-muted">
                    {[work.medium, work.dimensions, work.artworkYear]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-0.5 text-micro uppercase tracking-widest text-gallery-muted">
                    {TYPE_LABELS[work.artworkType] ?? work.artworkType}
                  </p>
                  {work.significance && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gallery-muted">
                      {work.significance}
                    </p>
                  )}
                  <div className="mt-4">
                    {work.publicSlug ? (
                      <Link
                        href={`/art-work-for-private-walls/${work.publicSlug}`}
                        className="inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-widest text-gallery-accent transition-colors hover:text-gallery-text"
                      >
                        View work →
                      </Link>
                    ) : (
                      <span className="text-micro uppercase tracking-widest text-gallery-muted">
                        By request
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>

      {/* ── How works become visible ──────────────────────────── */}
      <div className="border-t border-gallery-border bg-gallery-surface">
        <Container className="py-10">
          <div className="max-w-lg">
            <p className="mb-3 text-micro font-semibold uppercase tracking-widest text-gallery-muted">
              How works become listed here
            </p>
            <p className="text-sm leading-relaxed text-gallery-muted">
              Hosts register a work through the Artwork Passport programme and
              may opt in to public listing. BayviewHub then reviews and publishes
              selected works to this page. Host opt-in does not automatically
              produce a public listing — Bayview publication is always required.
            </p>
          </div>
        </Container>
      </div>

      {/* ── Enquiry CTA ───────────────────────────────────────── */}
      <div className="border-t border-gallery-border bg-family-navy">
        <Container className="py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-lg font-semibold text-white">
                Interested in a work?
              </p>
              <p className="mt-1 text-sm text-white/60">
                All enquiries are handled through BayviewHub. Host details are
                never disclosed directly.
              </p>
            </div>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gallery@bayviewhub.me"}?subject=Works for Private Walls — Enquiry`}
              className="inline-flex flex-shrink-0 items-center gap-2 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Enquire via Bayview →
            </a>
          </div>
        </Container>
      </div>

    </div>
  );
}
