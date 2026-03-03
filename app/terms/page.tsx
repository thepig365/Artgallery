import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Use | Bayview Hub Gallery",
  description:
    "Terms of use for Bayview Hub Gallery. Submission rules, intellectual property, and user obligations.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use | Bayview Hub Gallery",
    description:
      "Terms of use for Bayview Hub Gallery. Submission rules, intellectual property, and user obligations.",
    type: "website",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <span className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
          Legal
        </span>
        <h1 className="text-3xl font-bold text-gallery-text tracking-tight mt-2 mb-4">
          Terms of Use
        </h1>
        <p className="text-gallery-muted leading-relaxed">
          Last updated: March 2025. By using this site, you agree to these
          terms.
        </p>
      </div>

      <div className="space-y-8 text-gallery-muted leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Acceptance
          </h2>
          <p>
            By accessing or using Bayview Hub Gallery, you agree to these Terms
            of Use and our{" "}
            <Link href="/privacy" className="text-gallery-accent hover:underline">
              Privacy Policy
            </Link>
            . If you do not agree, do not use this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Eligibility and access
          </h2>
          <p>
            You must be at least 16 years of age and have authority to submit
            work on behalf of yourself or the rights holder. Portal and assessor
            areas are restricted to authorised users. Unauthorised access is
            prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Submissions
          </h2>
          <p>
            When you submit work, you confirm that: (1) you own or have
            authority to grant rights; (2) the work does not infringe third-party
            rights; (3) you grant Bayview Hub Gallery a non-exclusive, royalty-free
            license to display, assess, and archive the work and its images for
            curatorial purposes; (4) you have read and accept our submission
            consent terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Prohibited content
          </h2>
          <p>
            Do not submit content that infringes copyright, is illegal, harmful,
            defamatory, or otherwise violates these terms. We may remove such
            content without notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Assessments are opinions — not advice
          </h2>
          <p>
            Mend Index assessments are subjective curatorial opinions based on
            the protocol. They are not financial appraisals, market valuations,
            or investment recommendations. Do not rely on them for financial
            decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Intellectual property
          </h2>
          <p>
            Site content (design, text, software) is owned by the platform.
            Artists retain ownership of their artworks. By submitting, you
            grant the license described above. You may request removal via our{" "}
            <Link href="/takedown" className="text-gallery-accent hover:underline">
              takedown process
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, Bayview Hub Gallery is not
            liable for any indirect, incidental, or consequential losses arising
            from your use of this site or reliance on any content. Our liability
            is limited to the maximum extent permitted under applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Changes to terms
          </h2>
          <p>
            We may update these terms. Continued use after changes constitutes
            acceptance. We recommend reviewing this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Governing law
          </h2>
          <p>
            These terms are governed by the laws of Victoria, Australia. Disputes
            are subject to the exclusive jurisdiction of the courts of Victoria.
          </p>
        </section>

        <section className="border-t border-gallery-border pt-6">
          <p className="text-sm">
            Contact:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gallery-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            {" · "}
            <Link href="/takedown" className="text-gallery-accent hover:underline">
              Takedown
            </Link>
            {" · "}
            <Link href="/rights" className="text-gallery-accent hover:underline">
              Rights & Licensing
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
