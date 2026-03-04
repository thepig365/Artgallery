import type { Metadata } from "next";
import Link from "next/link";
import { Scale, FileText, Shield, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Rights & Licensing | Bayview Hub Gallery",
  description:
    "Information about artwork rights, licensing, and content policies at Bayview Hub Gallery.",
  alternates: { canonical: "/rights" },
  openGraph: {
    title: "Rights & Licensing | Bayview Hub Gallery",
    description:
      "Information about artwork rights, licensing, and content policies at Bayview Hub Gallery.",
    type: "website",
    url: "/rights",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rights & Licensing | Bayview Hub Gallery",
    description:
      "Information about artwork rights, licensing, and content policies at Bayview Hub Gallery.",
  },
};

export default function RightsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-gallery-accent" strokeWidth={1.5} />
          <span className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
            Legal
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gallery-text tracking-tight mb-4">
          Rights & Licensing
        </h1>
        <p className="text-gallery-muted leading-relaxed">
          Information about artwork rights, content ownership, and licensing policies at Bayview Hub Gallery.
        </p>
      </div>

      <div className="space-y-8">
        {/* Artwork Ownership */}
        <section className="border border-gallery-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gallery-text mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gallery-muted" strokeWidth={1.5} />
            Artwork Ownership
          </h2>
          <div className="text-sm text-gallery-muted leading-relaxed space-y-3">
            <p>
              All artworks displayed in the Bayview Hub Gallery collection remain the intellectual property of their respective creators. The gallery does not claim ownership of any artwork unless explicitly transferred through a formal agreement.
            </p>
            <p>
              Artists who submit work through our portal retain full copyright and moral rights to their creations. By submitting, artists grant Bayview Hub Gallery a non-exclusive license to display, promote, and archive their work for curatorial purposes.
            </p>
          </div>
        </section>

        {/* Image Usage */}
        <section className="border border-gallery-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gallery-text mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gallery-muted" strokeWidth={1.5} />
            Image Usage & Reproduction
          </h2>
          <div className="text-sm text-gallery-muted leading-relaxed space-y-3">
            <p>
              Images of artworks displayed on this website are provided for informational and educational purposes only. Reproduction, distribution, or commercial use of any artwork image without explicit permission from the copyright holder is prohibited.
            </p>
            <p>
              For licensing inquiries or permission to reproduce artwork images, please contact the gallery directly through our enquiry system.
            </p>
          </div>
        </section>

        {/* Open Masterpieces */}
        <section className="border border-gallery-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Open Masterpieces Collection
          </h2>
          <div className="text-sm text-gallery-muted leading-relaxed space-y-3">
            <p>
              Works in our Open Masterpieces Library are sourced from museum open-access programs and are available under public domain licenses (CC0, Public Domain Mark, or equivalent). These works may be used freely without permission.
            </p>
            <p>
              Attribution to the source museum is appreciated but not required for public domain works. Source information and original museum links are provided on each masterpiece page.
            </p>
          </div>
        </section>

        {/* Mend Index Assessment */}
        <section className="border border-gallery-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Mend Index Assessment Disclaimer
          </h2>
          <div className="text-sm text-gallery-muted leading-relaxed space-y-3">
            <p>
              The Mend Index scoring system is a curatorial opinion tool designed to evaluate material sincerity across four axes: Body, Process, Material, and Surface. Assessment scores do not constitute financial appraisals, market valuations, or investment recommendations.
            </p>
            <p>
              Participation in the Mend Index assessment is entirely optional. Artists may submit work without requesting scoring, and existing scores may be removed upon artist request.
            </p>
          </div>
        </section>

        {/* Takedown Requests */}
        <section className="border border-gallery-border rounded-lg p-6 bg-gallery-surface-alt">
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Content Removal & Takedown Requests
          </h2>
          <div className="text-sm text-gallery-muted leading-relaxed space-y-3">
            <p>
              If you believe content displayed on this site infringes your rights or should be removed for any reason, you may submit a formal takedown request.
            </p>
            <Link
              href="/takedown"
              className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
            >
              Submit Takedown Request
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-gallery-border pt-6">
          <p className="text-sm text-gallery-muted">
            For questions about rights, licensing, or any legal matters, please contact us at{" "}
            <a href="mailto:gallery@bayviewhub.me" className="text-gallery-accent hover:underline">
              gallery@bayviewhub.me
            </a>{" "}
            or visit the gallery in person at Mornington Peninsula.
          </p>
        </section>
      </div>
    </div>
  );
}
