import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Bayview Hub Gallery",
  description: "Terms of use for Bayview Hub Art Gallery.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gallery-text tracking-tight mb-6">
        Terms of Use
      </h1>
      <div className="text-gallery-muted leading-relaxed space-y-4">
        <p>
          By using Bayview Hub Gallery, you agree to these terms. All
          assessments are curatorial opinions and do not constitute financial
          advice.
        </p>
        <p>
          For full terms of use, please refer to the main Bayview Hub site at{" "}
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
