"use client";

import { useState } from "react";
import Link from "next/link";

interface PassportActionsProps {
  qrDataUrl: string;
  passportUrl: string;
  passportId: string;
  contactEmail: string;
}

export function PassportActions({
  qrDataUrl,
  passportUrl,
  passportId,
  contactEmail,
}: PassportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);

  function handleDownloadQR() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `passport-qr-${passportId}.png`;
    a.click();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(passportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = passportUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const reviewSubject = `Review Request — ${passportId}`;
  const reviewBody = `Hello,\n\nI would like to request Bayview's consideration of the following Preliminary Passport for possible private viewing introductions or wider programme inclusion.\n\nPassport ID: ${passportId}\nRecord: ${passportUrl}\n\nPlease let me know how to proceed.\n\nKind regards`;
  const reviewHref = `mailto:${contactEmail}?subject=${encodeURIComponent(reviewSubject)}&body=${encodeURIComponent(reviewBody)}`;

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-16">

      {/* ── Primary actions ─────────────────────────────────────── */}
      <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
            Actions
          </p>
        </div>

        {/* Download + Copy — equal weight row */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 border border-gallery-border bg-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-text transition-colors hover:border-gallery-text hover:bg-gallery-surface-alt"
          >
            <span aria-hidden>↓</span>
            Download QR
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 border border-gallery-border bg-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-text transition-colors hover:border-gallery-text hover:bg-gallery-surface-alt"
          >
            {copied ? (
              <>
                <span aria-hidden>✓</span>
                Copied
              </>
            ) : (
              <>
                <span aria-hidden>⧉</span>
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Register another work — softer, full-width */}
        <Link
          href="/passport/register"
          className="flex w-full items-center justify-center gap-2 border border-gallery-border/50 bg-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-muted transition-colors hover:border-gallery-border hover:text-gallery-text"
        >
          <span aria-hidden>+</span>
          Register Another Work
        </Link>
      </div>

      {/* ── What happens next ───────────────────────────────────── */}
      <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
        <p className="mb-5 text-[10px] uppercase tracking-widest text-gallery-muted">
          What Happens Next
        </p>
        <ul className="space-y-4">
          {[
            {
              heading: "Your work is recorded.",
              body: "This Preliminary Passport is your starting point. It can be updated or built upon as the relationship with Bayview develops.",
            },
            {
              heading: "Share selectively.",
              body: "Use the QR code or record link to share this work with trusted contacts. This record is for invited interest only — not public broadcast.",
            },
            {
              heading: "Bayview can mediate.",
              body: "If you would like Bayview to consider this work for private viewing introductions or wider programme inclusion, you may request consideration. All enquiries remain Bayview-mediated.",
            },
            {
              heading: "You remain in control.",
              body: "Your contact details are never disclosed. Visibility and participation are always at your discretion.",
            },
          ].map(({ heading, body }) => (
            <li key={heading} className="flex gap-3">
              <span
                className="mt-0.5 flex-shrink-0 text-gallery-muted"
                aria-hidden
              >
                →
              </span>
              <p className="text-sm leading-relaxed text-gallery-muted">
                <strong className="font-medium text-gallery-text">
                  {heading}
                </strong>{" "}
                {body}
              </p>
            </li>
          ))}
        </ul>

        {/* Review callout */}
        {!reviewDismissed && (
          <div className="mt-6 border-t border-gallery-border pt-6">
            <p className="mb-4 text-sm text-gallery-muted">
              Interested in making this work available for private viewing?
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={reviewHref}
                className="inline-flex items-center border border-gallery-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-text transition-colors hover:border-gallery-text hover:bg-gallery-surface-alt"
              >
                Request Bayview Consideration
              </a>
              <button
                onClick={() => setReviewDismissed(true)}
                className="inline-flex items-center px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] text-gallery-muted transition-colors hover:text-gallery-text"
              >
                Keep as Is
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Secondary links ─────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 pb-4">
        <Link
          href="/passport"
          className="text-[11px] text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
        >
          Learn how private viewing works
        </Link>
        <a
          href={`mailto:${contactEmail}`}
          className="text-[11px] text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
        >
          Contact the gallery
        </a>
        <Link
          href="/passport"
          className="text-[11px] text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
        >
          About the Artwork Passport programme
        </Link>
      </div>
    </div>
  );
}
