import type { Metadata } from "next";
import Link from "next/link";
import ArtistSubmitClient from "@/app/portal/submit/ArtistSubmitClient";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Submit Artwork | Bayview Hub Gallery",
  description:
    "Submit your artwork for optional Mend Index assessment and archive consideration.",
  alternates: { canonical: "/submit" },
  openGraph: {
    title: "Submit Artwork | Bayview Hub Gallery",
    description:
      "Submit your artwork for optional Mend Index assessment and archive consideration.",
    type: "website",
    url: "/submit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit Artwork | Bayview Hub Gallery",
    description:
      "Submit your artwork for optional Mend Index assessment and archive consideration.",
  },
};

export default function SubmitPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <header className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
          Submission
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-3">
          Submit Artwork
        </h1>
        <p className="text-sm text-gallery-muted max-w-2xl leading-relaxed">
          Submit your work for optional Mend Index assessment and archive
          consideration. Sign in to begin.
        </p>
      </header>

      {/* Submission Requirements — SSR so crawlers and no-JS users see it */}
      <section
        className="border border-gallery-border rounded-lg bg-gallery-surface-alt p-6 mb-10"
        aria-labelledby="submission-requirements-heading"
      >
        <h2
          id="submission-requirements-heading"
          className="text-sm font-semibold text-gallery-text uppercase tracking-widest mb-4"
        >
          Submission Requirements
        </h2>
        <ul className="text-sm text-gallery-muted space-y-2 list-disc list-inside max-w-2xl">
          <li>
            <strong className="text-gallery-text">Accepted formats:</strong> JPG,
            PNG, WebP (TIFF also accepted for archival quality).
          </li>
          <li>
            <strong className="text-gallery-text">Max file size:</strong> 50MB
            per image.
          </li>
          <li>
            <strong className="text-gallery-text">Recommended:</strong> 2000px+
            on the long edge, good lighting for assessment.
          </li>
          <li>
            <strong className="text-gallery-text">Larger files?</strong> Compress
            images, or provide a share link (Google Drive, Dropbox) in your
            narrative, or email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gallery-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            for alternative transfer.
          </li>
          <li>
            <strong className="text-gallery-text">Review timeline:</strong> 3–7
            business days for initial review.
          </li>
        </ul>
        <p className="mt-4 pt-4 border-t border-gallery-border/60 text-sm text-gallery-muted">
          <Link href="/takedown" className="text-gallery-accent hover:underline">
            Takedown / Removal
          </Link>
          {" · "}
          <Link href="/rights" className="text-gallery-accent hover:underline">
            Rights & Licensing
          </Link>
        </p>
      </section>

      <ArtistSubmitClient />
    </div>
  );
}
