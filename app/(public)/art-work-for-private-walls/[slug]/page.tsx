// ─────────────────────────────────────────────────────────────
// Works for Private Walls — Public detail page
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
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db/client";
import { getPassportImageUrl } from "@/lib/passport/storage";
import { Container } from "@/components/layout/Container";

// ── Type labels ──────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  ORIGINAL:      "Original",
  EDITION:       "Limited Edition",
  DIGITAL_PRINT: "Digital Print",
  REPRODUCTION:  "Reproduction",
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const work = await prisma.hostPassport.findUnique({
    where: { publicSlug: params.slug },
    select: { artworkTitle: true, artistName: true },
  });
  if (!work) return { title: "Work Not Found | Bayview Hub" };
  return {
    title: `${work.artworkTitle} — ${work.artistName} | Works for Private Walls`,
    description: `${work.artworkTitle} by ${work.artistName}, visible through BayviewHub's Private Viewing Network.`,
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  // ── Data ─────────────────────────────────────────────────────
  // Only serve works that are currently PUBLIC_PRIVATE_WALLS.
  // If unpublished the slug still exists but the work is private.
  const work = await prisma.hostPassport.findUnique({
    where: { publicSlug: params.slug },
    select: {
      id:           true,
      passportId:   true,
      publicSlug:   true,
      artworkTitle: true,
      artistName:   true,
      medium:       true,
      dimensions:   true,
      artworkYear:  true,
      artworkType:  true,
      significance: true,
      mainImagePath: true,
      wallPublication: true,
      publishedAt:  true,
    },
  });

  if (!work || work.wallPublication !== "PUBLIC_PRIVATE_WALLS") {
    notFound();
  }

  // ── Fresh signed URL ─────────────────────────────────────────
  const imageUrl = await getPassportImageUrl(work.mainImagePath);

  // ── QR — points to this public detail page ───────────────────
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gallery.bayviewhub.me";
  const publicUrl = `${siteUrl}/art-work-for-private-walls/${work.publicSlug}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 2,
    width: 160,
    color: { dark: "#1a1408", light: "#fafaf8" },
  });

  const artworkType = TYPE_LABELS[work.artworkType] ?? work.artworkType;
  const CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gallery@bayviewhub.me";

  return (
    <div className="min-h-screen bg-gallery-bg">

      {/* ── Minimal header ──────────────────────────────────────── */}
      <div className="border-b border-gallery-border bg-family-navy">
        <Container className="py-5">
          <Link
            href="/art-work-for-private-walls"
            className="text-micro font-medium uppercase tracking-[0.2em] text-family-accent transition-colors hover:text-white"
          >
            ← Works for Private Walls
          </Link>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">

          {/* ── Artwork image ──────────────────────────────────────── */}
          <div className="border border-gallery-border bg-gallery-surface">
            {imageUrl ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gallery-surface-alt">
                <Image
                  src={imageUrl}
                  alt={work.artworkTitle}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 672px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center bg-gallery-surface-alt">
                <p className="text-micro uppercase tracking-widest text-gallery-muted">
                  Image not available
                </p>
              </div>
            )}

            {/* Artwork details */}
            <div className="p-6 sm:p-8">

              {/* Badge */}
              <p className="mb-3 text-micro font-semibold uppercase tracking-widest text-gallery-accent">
                Private Walls · By Request
              </p>

              <div className="mb-5 space-y-1.5">
                <h1 className="font-serif text-2xl font-semibold leading-snug text-gallery-text sm:text-3xl">
                  {work.artworkTitle}
                </h1>
                <p className="text-sm text-gallery-muted">{work.artistName}</p>
                <p className="text-xs text-gallery-muted">
                  {[work.medium, work.dimensions, work.artworkYear]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-micro uppercase tracking-widest text-gallery-muted">
                  {artworkType}
                </p>
              </div>

              {/* Host note */}
              {work.significance && (
                <div className="mb-6 border-l-2 border-accent/40 pl-3">
                  <p className="text-micro uppercase tracking-widest text-gallery-muted">
                    Host note
                  </p>
                  <p className="mt-1 text-sm italic leading-relaxed text-gallery-muted">
                    &ldquo;{work.significance}&rdquo;
                  </p>
                </div>
              )}

              {/* Enquiry CTA */}
              <div className="border-t border-gallery-border pt-5">
                <p className="mb-3 text-sm leading-relaxed text-gallery-muted">
                  To express interest in viewing this work, please contact
                  BayviewHub directly. All enquiries are mediated — host details
                  are not disclosed.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Private Walls Enquiry — ${encodeURIComponent(work.artworkTitle)}`}
                  className="inline-flex items-center gap-2 border border-gallery-border bg-family-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-family-navy/80"
                >
                  Enquire via Bayview →
                </a>
              </div>
            </div>
          </div>

          {/* ── Private Walls Record module ────────────────────────── */}
          {/* Secondary identity layer — QR is not the hero element.   */}
          <div className="mt-4 border border-gallery-border bg-gallery-surface p-6 sm:p-8">
            <p className="mb-1 text-micro font-semibold uppercase tracking-widest text-gallery-muted">
              Private Walls Record
            </p>
            <p className="mb-4 font-serif text-base font-semibold text-gallery-text">
              {work.artworkTitle}
            </p>

            <div className="flex items-start gap-6">
              {/* QR — secondary, not dominant */}
              <div className="flex-shrink-0 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${work.artworkTitle}`}
                  width={80}
                  height={80}
                  className="border border-gallery-border"
                />
                <p className="mt-1.5 text-micro leading-snug text-gallery-muted">
                  Scan to view or share
                  <br />
                  this work through the
                  <br />
                  Private Walls programme.
                </p>
              </div>

              {/* Record copy */}
              <div className="min-w-0 space-y-3 text-micro leading-relaxed text-gallery-muted">
                <p>
                  This work is publicly visible through BayviewHub&apos;s
                  Private Viewing Network.
                </p>
                <p>
                  Inclusion here does not place this work in BayviewHub&apos;s
                  main curated collection. It is presented through the Private
                  Walls programme, distinct from the main archive.
                </p>
                {work.passportId && (
                  <p className="font-mono text-micro text-gallery-muted/70">
                    Passport ID: {work.passportId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Back link ─────────────────────────────────────────── */}
          <div className="mt-6">
            <Link
              href="/art-work-for-private-walls"
              className="text-micro uppercase tracking-widest text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
            >
              ← All works for private walls
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
}
