import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SITE_URL } from "@/lib/site-url";
import { PrivateViewingRequestForm } from "./PrivateViewingRequestForm";

export const metadata: Metadata = {
  title: {
    absolute: "Private Viewing | Bayview Arts Gallery",
  },
  description:
    "Request private viewing access to the Bayview Arts Gallery collection. A mediated, trust-based path to viewing works in the Mend Index collection.",
  openGraph: {
    title: "Private Viewing | Bayview Arts Gallery",
    description: "Request private viewing access to the Bayview Arts Gallery collection.",
    url: "https://gallery.bayviewhub.me/private-viewing",
  },
  alternates: {
    canonical: "https://gallery.bayviewhub.me/private-viewing",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Bayview Arts Gallery Private Viewing",
  description:
    "Mediated private viewing access to the Bayview Arts Gallery collection, curated under the Mend Index Protocol.",
  provider: {
    "@type": "Organization",
    name: "Bayview Arts Gallery",
    url: "https://gallery.bayviewhub.me",
  },
  serviceType: "Private Art Viewing",
  areaServed: "Victoria, Australia",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://gallery.bayviewhub.me/private-viewing",
  },
};

export default function PrivateViewingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="bg-family-navy text-white">
        <Container className="py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 text-micro font-medium uppercase tracking-[0.22em] text-family-accent">
              Bayview Arts Gallery
            </p>
            <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              Private Viewing
            </h1>
            <p className="max-w-2xl text-body leading-relaxed text-white/75 sm:text-lead">
              The Bayview Arts Gallery does not operate as a public drop-in space. Viewing is mediated
              — arranged in advance, purposeful, and unhurried.
            </p>
            <p className="mt-5 max-w-2xl text-body leading-relaxed text-white/60">
              Works in the collection are selected and scored under the Mend Index Protocol. Private
              viewing is the primary way to encounter them in full. If you are a collector, a curator,
              or someone with a considered interest in the work, this is the right path.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-gallery-border">
        <Container className="py-14 sm:py-18">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
            <div className="space-y-8">
              <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
                <p className="mb-3 text-micro font-medium uppercase tracking-[0.2em] text-gallery-accent">
                  What to expect
                </p>
                <h2 className="font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
                  A mediated, in-person encounter
                </h2>
                <p className="mt-4 max-w-2xl text-body leading-relaxed text-gallery-muted">
                  A private viewing takes place at Bayview Hub, 365 Purves Road, Main Ridge, Victoria.
                  Duration is typically 60–90 minutes. You will have access to the works, the protocol
                  documentation, and a conversation with someone from the gallery.
                </p>
              </div>

              <div className="border border-gallery-border bg-gallery-surface-alt p-6 sm:p-8">
                <p className="mb-3 text-micro font-medium uppercase tracking-[0.2em] text-gallery-accent">
                  Why this path exists
                </p>
                <p className="max-w-2xl text-body leading-relaxed text-gallery-muted">
                  This is not a casual browse or a public gallery floor. It is a slower, trust-based path
                  designed for people who want to encounter the work with proper context, time, and
                  mediation.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
                <p className="mb-3 text-micro font-medium uppercase tracking-[0.2em] text-gallery-accent">
                  Request access
                </p>
                <h2 className="font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
                  Send a request
                </h2>
                <p className="mt-3 text-body leading-relaxed text-gallery-muted">
                  Submit your details below and the gallery will review your request for private viewing
                  access.
                </p>
                <div className="mt-6">
                  <PrivateViewingRequestForm sourceUrl={`${SITE_URL}/private-viewing`} />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption uppercase tracking-[0.16em] text-gallery-muted">
            <Link href="/archive" className="transition-colors hover:text-gallery-text">
              Browse the collection
            </Link>
            <span aria-hidden>·</span>
            <Link href="/open-your-wall" className="transition-colors hover:text-gallery-text">
              Open Your Wall
            </Link>
            <span aria-hidden>·</span>
            <Link href="/submit" className="transition-colors hover:text-gallery-text">
              Submit artwork
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
