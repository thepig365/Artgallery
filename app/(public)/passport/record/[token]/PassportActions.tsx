"use client";

import { useState } from "react";
import Link from "next/link";

interface PassportActionsProps {
  qrDataUrl: string;
  passportUrl: string;
  passportId: string;
  artworkTitle: string;
  contactEmail: string;
}

// ── Curatorial interest options ───────────────────────────────────
type CuratorialOption = "private" | "online" | "inperson" | "both";

const CURATORIAL_OPTIONS: {
  value: CuratorialOption;
  label: string;
  sublabel: string;
  emailLabel: string;
}[] = [
  {
    value: "private",
    label: "Keep this as a private record only",
    sublabel:
      "No curatorial interest expressed — this record remains entirely private.",
    emailLabel: "",
  },
  {
    value: "online",
    label: "Consider for online curation",
    sublabel:
      "I would like Bayview to consider this work for future online presentation through Bayview Hub.",
    emailLabel: "Online curation",
  },
  {
    value: "inperson",
    label: "Consider for future in-person exhibition programming",
    sublabel:
      "I would like Bayview to consider this work for future physical presentation at Bayview Hub, when relevant programming is active.",
    emailLabel: "Future in-person exhibition programming",
  },
  {
    value: "both",
    label: "Consider for both",
    sublabel:
      "I would like Bayview to consider this work for both online curation and future in-person exhibition programming.",
    emailLabel:
      "Both online curation and future in-person exhibition programming",
  },
];

export function PassportActions({
  qrDataUrl,
  passportUrl,
  passportId,
  artworkTitle,
  contactEmail,
}: PassportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [curatorialSelection, setCuratorialSelection] =
    useState<CuratorialOption>("private");
  const [emailOpened, setEmailOpened] = useState(false);

  // ── QR download ────────────────────────────────────────────────
  function handleDownloadQR() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `passport-qr-${passportId}.png`;
    a.click();
  }

  // ── Copy link ──────────────────────────────────────────────────
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(passportUrl);
    } catch {
      const input = document.createElement("input");
      input.value = passportUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Express curatorial interest via mailto ────────────────────
  function handleExpressInterest() {
    const selected = CURATORIAL_OPTIONS.find(
      (o) => o.value === curatorialSelection
    );
    if (!selected || selected.value === "private") return;

    const subject = `Curatorial Interest — ${passportId} — ${artworkTitle}`;
    const body = [
      "Hello,",
      "",
      "I would like to express curatorial interest in the following work.",
      "",
      `Passport ID: ${passportId}`,
      `Artwork: ${artworkTitle}`,
      `Interest: ${selected.emailLabel}`,
      "",
      "Please let me know if you need any further information.",
      "",
      "Kind regards",
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setEmailOpened(true);
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-16">

      {/* ── Primary actions ──────────────────────────────────────── */}
      <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
        <p className="mb-5 text-[10px] uppercase tracking-widest text-gallery-muted">
          Actions
        </p>

        {/* Download + Copy */}
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

        {/* Register another work */}
        <Link
          href="/passport/register"
          className="flex w-full items-center justify-center gap-2 border border-gallery-border/50 bg-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-muted transition-colors hover:border-gallery-border hover:text-gallery-text"
        >
          <span aria-hidden>+</span>
          Register Another Work
        </Link>
      </div>

      {/* ── What happens next ────────────────────────────────────── */}
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
              <span className="mt-0.5 flex-shrink-0 text-gallery-muted" aria-hidden>
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
      </div>

      {/* ── Curatorial consideration ─────────────────────────────── */}
      <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-gallery-muted">
          Curatorial Consideration
        </p>
        <p className="mb-2 font-serif text-lg font-semibold leading-snug text-gallery-text">
          Would you like this work to be considered by Bayview?
        </p>
        <p className="mb-6 text-sm leading-relaxed text-gallery-muted">
          Your Preliminary Passport is now live as a private record. If you
          would like Bayview Hub to consider this work for future online
          curation or future in-person exhibition programming, you can express
          interest below. Opting in does not guarantee selection, display,
          sale, or representation. All consideration remains curatorial and
          discretionary.
        </p>

        {/* Radio options */}
        <fieldset className="space-y-3">
          <legend className="sr-only">Curatorial consideration preference</legend>
          {CURATORIAL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer gap-3 border p-4 transition-colors ${
                curatorialSelection === opt.value
                  ? "border-gallery-text bg-gallery-surface-alt"
                  : "border-gallery-border hover:border-gallery-text/50"
              }`}
            >
              <input
                type="radio"
                name="curatorialInterest"
                value={opt.value}
                checked={curatorialSelection === opt.value}
                onChange={() => {
                  setCuratorialSelection(opt.value);
                  setEmailOpened(false);
                }}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-gallery-text">
                  {opt.label}
                </span>
                <span className="block text-[11px] leading-relaxed text-gallery-muted">
                  {opt.sublabel}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {/* Action area */}
        <div className="mt-5 space-y-3">
          {curatorialSelection === "private" ? (
            <p className="text-[11px] text-gallery-muted">
              No action required — this record remains private by default.
            </p>
          ) : (
            <>
              <button
                onClick={handleExpressInterest}
                className="flex w-full items-center justify-center gap-2 border border-gallery-border bg-transparent px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-gallery-text transition-colors hover:border-gallery-text hover:bg-gallery-surface-alt"
              >
                Express Interest via Email →
              </button>
              {emailOpened && (
                <p className="text-[11px] text-gallery-muted">
                  Your email client has been opened with a pre-filled message
                  to the gallery.
                </p>
              )}
            </>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-5 border-t border-gallery-border pt-4 text-[10px] leading-relaxed text-gallery-muted">
          Expressing interest does not guarantee selection, display, sale, or
          representation. All curatorial decisions remain entirely at Bayview
          Hub&rsquo;s discretion.
        </p>
      </div>

      {/* ── Secondary links ──────────────────────────────────────── */}
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
