import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/db/client";
import { getPassportImageUrl } from "@/lib/passport/storage";
import { Container } from "@/components/layout/Container";
import { PassportActions } from "./PassportActions";

// ── Routing ──────────────────────────────────────────────────────
// This page is reached via /passport/record/[shareToken].
// shareToken is an unguessable UUID — not the human-readable passportId.
// The page must NOT be indexed by search engines.

export const metadata: Metadata = {
  title: "Artwork Record | Bayview Hub",
  robots: { index: false, follow: false },
};

// ── Status label ─────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  PRELIMINARY:  "Preliminary",
  UNDER_REVIEW: "Under Review",
  REVIEWED:     "Reviewed",
  HIDDEN:       "Not Available",
};

// ── Artwork type label ────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  ORIGINAL:      "Original",
  EDITION:       "Limited Edition",
  DIGITAL_PRINT: "Digital Print",
  REPRODUCTION:  "Reproduction",
};

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "gallery@bayviewhub.me";

// ── Page ─────────────────────────────────────────────────────────
export default async function PassportRecordPage({
  params,
}: {
  params: { token: string };
}) {
  // Look up by shareToken — never by passportId or internal UUID
  const passport = await prisma.hostPassport
    .findUnique({ where: { shareToken: params.token } })
    .catch(() => null);

  if (!passport || passport.status === "HIDDEN") {
    notFound();
  }

  // ── Signed image URL — generated fresh per render ─────────────
  const imageUrl = await getPassportImageUrl(passport.mainImagePath);

  // ── QR code — generated server-side, no external service ─────
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gallery.bayviewhub.me";
  const passportUrl = `${siteUrl}/passport/record/${passport.shareToken}`;
  const qrDataUrl = await QRCode.toDataURL(passportUrl, {
    margin: 2,
    width: 180,
    color: { dark: "#1a1408", light: "#fafaf8" },
  });

  // ── Formatted date ────────────────────────────────────────────
  const createdDate = passport.createdAt.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusLabel = STATUS_LABELS[passport.status] ?? passport.status;
  const artworkType = TYPE_LABELS[passport.artworkType] ?? passport.artworkType;

  return (
    <div className="min-h-screen bg-gallery-surface-alt">

      {/* ── Minimal header ──────────────────────────────────────── */}
      <div className="border-b border-gallery-border bg-family-navy">
        <Container className="py-5">
          <Link
            href="/passport"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-family-accent transition-colors hover:text-white"
          >
            ← Bayview Hub · Artwork Passport
          </Link>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-lg space-y-6">

          {/* ── Success confirmation ─────────────────────────────── */}
          <div className="border border-gallery-border bg-gallery-surface px-6 py-5 sm:px-8">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-gallery-muted">
              Preliminary Passport Created
            </p>
            <p className="font-serif text-lg font-semibold leading-snug text-gallery-text sm:text-xl">
              Your work is now recorded and ready for selective sharing.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gallery-muted">
              This record is not publicly listed or indexed. It is intended for
              selective sharing by link or QR code, and Bayview can mediate
              interest on your behalf.
            </p>
          </div>

          {/* ── Passport card ───────────────────────────────────── */}
          <div className="border border-gallery-border bg-gallery-surface">

            {/* Artwork image */}
            <div className="border-b border-gallery-border">
              {imageUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gallery-surface-alt">
                  <Image
                    src={imageUrl}
                    alt={passport.artworkTitle}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, 512px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gallery-surface-alt">
                  <p className="text-[11px] uppercase tracking-widest text-gallery-muted">
                    Image not available
                  </p>
                </div>
              )}
            </div>

            {/* Artwork metadata */}
            <div className="p-6 sm:p-8">
              <div className="mb-5 space-y-1.5">
                <p className="font-serif text-xl font-semibold leading-snug text-gallery-text sm:text-2xl">
                  {passport.artworkTitle}
                </p>
                <p className="text-sm text-gallery-muted">
                  {passport.artistName}
                </p>
                <p className="text-xs text-gallery-muted">
                  {[passport.medium, passport.dimensions, passport.artworkYear]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-gallery-muted">
                  {artworkType}
                </p>
              </div>

              {/* Host note */}
              <div className="mb-5 border-l-2 border-accent/40 pl-3">
                <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                  Host note
                </p>
                <p className="mt-1 text-sm italic leading-relaxed text-gallery-muted">
                  &ldquo;{passport.significance}&rdquo;
                </p>
              </div>

              {/* Passport identity + QR */}
              <div className="border-t border-gallery-border pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                        Passport ID
                      </p>
                      <p className="break-all font-mono text-xs text-gallery-text">
                        {passport.passportId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                        Status
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gallery-muted">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            passport.status === "PRELIMINARY"
                              ? "bg-accent"
                              : passport.status === "REVIEWED"
                              ? "bg-green-500"
                              : "bg-gallery-muted"
                          }`}
                        />
                        {statusLabel}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                        Registered
                      </p>
                      <p className="text-xs text-gallery-muted">
                        {createdDate}
                      </p>
                    </div>
                  </div>

                  {/* QR code */}
                  <div className="flex-shrink-0 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={`QR code for Passport ${passport.passportId}`}
                      width={90}
                      height={90}
                      className="border border-gallery-border"
                    />
                    <p className="mt-1.5 text-[9px] leading-snug text-gallery-muted">
                      Scan to view · use beside the work
                      <br />
                      or for invited sharing
                    </p>
                  </div>
                </div>
              </div>

              {/* Preliminary disclaimer */}
              <div className="mt-5 border-t border-gallery-border pt-5">
                <div className="border border-accent/20 bg-accent/5 p-3">
                  <p className="text-[10px] leading-relaxed text-gallery-muted">
                    <strong className="font-semibold text-gallery-text">
                      Preliminary Record.
                    </strong>{" "}
                    This record was generated from information submitted by the
                    host on {createdDate}. It has not been reviewed, verified,
                    or authenticated by Bayview Hub and does not constitute a
                    certificate of provenance, authentication, or title. Host
                    contact details are not disclosed through this record. All
                    viewing enquiries remain Bayview-mediated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Actions + What happens next + Secondary links ────── */}
          {/* Rendered as a client component — handles Download QR,   */}
          {/* Copy Link, and Keep as Is dismiss interactions.         */}
        </div>
      </Container>

      {/* ── Client action layer — outside Container for full width  */}
      {/* control but still visually centred via inner max-w-lg     */}
      <div className="bg-gallery-surface-alt pb-4">
        <Container>
          <PassportActions
            qrDataUrl={qrDataUrl}
            passportUrl={passportUrl}
            passportId={passport.passportId}
            contactEmail={CONTACT_EMAIL}
          />
        </Container>
      </div>
    </div>
  );
}
