import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Bayview Hub Gallery",
  description: "Privacy policy for Bayview Hub Art Gallery.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gallery-text tracking-tight mb-6">
        Privacy Policy
      </h1>
      <div className="text-gallery-muted leading-relaxed space-y-4">
        <p>
          Bayview Hub Gallery respects your privacy. We collect only the
          information necessary to provide assessment and archival services.
        </p>
        <p>
          For full privacy policy details, please refer to the main Bayview Hub
          site at{" "}
          <a
            href="https://bayviewhub.me"
            className="text-gallery-accent hover:underline"
          >
            bayviewhub.me
          </a>
          .
        </p>
      </div>
    </div>
  );
}
