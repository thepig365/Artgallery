import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy | Bayview Hub Gallery",
  description:
    "How Bayview Hub Gallery collects, uses, and protects your data. Privacy policy for submissions, assessments, and site usage.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Bayview Hub Gallery",
    description:
      "How Bayview Hub Gallery collects, uses, and protects your data.",
    type: "website",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <span className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
          Legal
        </span>
        <h1 className="text-3xl font-bold text-gallery-text tracking-tight mt-2 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gallery-muted leading-relaxed">
          Last updated: March 2026. Bayview Hub Gallery operates this site for
          curatorial assessment and archival purposes.
        </p>
      </div>

      <div className="space-y-8 text-gallery-muted leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Who we are
          </h2>
          <p>
            Bayview Hub Gallery is an art protocol and archive platform. For
            questions about this policy, contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gallery-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            What data we collect
          </h2>
          <p>We collect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Submission content:</strong> Work title, artist name,
              medium, materials, dimensions, narrative, and images you upload.
              Submitted images may be displayed for assessment and archival
              purposes under your consent.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, and
              timestamps for security and troubleshooting.
            </li>
            <li>
              <strong>Cookies:</strong> Session and functional cookies to
              operate the site. No advertising or tracking cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Why we collect it
          </h2>
          <p>
            We use this data to run the assessment protocol, maintain the
            archive, secure the platform, and comply with legal obligations. We
            do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Sharing
          </h2>
          <p>
            We share data only with service providers (hosting, storage, email)
            necessary to operate the platform. We do not sell or rent your data
            to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            International transfers
          </h2>
          <p>
            Our hosting and content delivery infrastructure may be located
            outside Australia. By using this site, you consent to such
            transfers. We take reasonable steps to protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Retention
          </h2>
          <p>
            Submission data is retained while the work remains in our archive.
            You may request removal at any time. Technical logs are kept for
            security purposes as long as reasonably needed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Your rights
          </h2>
          <p>
            You may request access, correction, or deletion of your personal
            data. To request removal of your work from the archive, use our{" "}
            <Link href="/takedown" className="text-gallery-accent hover:underline">
              takedown process
            </Link>
            . Contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gallery-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            for other requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Security
          </h2>
          <p>
            We use industry-standard measures to protect your data. No system is
            perfectly secure; we encourage strong passwords and prompt reporting
            of suspicious activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gallery-text mb-3">
            Governing law
          </h2>
          <p>
            This policy is governed by the laws of Victoria, Australia. Any
            disputes are subject to the exclusive jurisdiction of the courts of
            Victoria.
          </p>
        </section>

        <section className="border-t border-gallery-border pt-6">
          <p className="text-sm">
            See also:{" "}
            <Link href="/rights" className="text-gallery-accent hover:underline">
              Rights & Licensing
            </Link>
            {" · "}
            <Link href="/takedown" className="text-gallery-accent hover:underline">
              Takedown
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
