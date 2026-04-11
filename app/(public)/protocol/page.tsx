import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { Divider } from "@/components/ui/Divider";
import { Badge } from "@/components/ui/Badge";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { SITE_URL } from "@/lib/site-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Mend Index Protocol | Bayview Hub Gallery" },
  description:
    "The Mend Index Protocol is Bayview Arts Gallery's proprietary curatorial framework. It evaluates artworks across four forensic axes — Body, Process, Material, Surface — to assess material sincerity and coherence between declared intent and material reality.",
  alternates: { canonical: "/protocol" },
  openGraph: {
    title: "Mend Index Protocol | Bayview Hub Gallery",
    description:
      "The Mend Index Protocol is Bayview Arts Gallery's proprietary curatorial framework. It evaluates artworks across four forensic axes — Body, Process, Material, Surface — to assess material sincerity and coherence between declared intent and material reality.",
    type: "article",
    url: "/protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mend Index Protocol | Bayview Hub Gallery",
    description:
      "The Mend Index Protocol is Bayview Arts Gallery's proprietary curatorial framework. It evaluates artworks across four forensic axes — Body, Process, Material, Surface — to assess material sincerity and coherence between declared intent and material reality.",
  },
};

const AXES = [
  {
    key: "B",
    name: "Body",
    subtitle: "Physical Integrity",
    weight: "25%",
    description:
      "Evaluates the physical constitution of the work — structural soundness, substrate quality, and the relationship between material body and intended form. Assesses whether the physical presence of the work is coherent with its declared medium and dimensions.",
  },
  {
    key: "P",
    name: "Process",
    subtitle: "Material Evidence",
    weight: "20%",
    description:
      "Examines the evidence of artistic process embedded in the work — layering, surface development, tool marks, and temporal accumulation. Evaluates whether the process narrative is materially verifiable through forensic observation.",
  },
  {
    key: "M",
    name: "Material",
    subtitle: "Sincerity Index",
    weight: "35%",
    description:
      "The primary axis. Assesses the correspondence between declared materials and observed material reality. Evaluates sourcing transparency, material authenticity, and the coherence between artistic intent and material choice. This axis carries the highest weight in the composite index.",
  },
  {
    key: "S",
    name: "Surface",
    subtitle: "Forensic Coherence",
    weight: "20%",
    description:
      "Analyzes the finished surface as a forensic record — patina development, aging consistency, surface chemistry, and the relationship between surface appearance and underlying process. Evaluates whether the surface tells a coherent material story.",
  },
] as const;

const protocolTechArticleLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Mend Index Protocol",
  name: "Mend Index Protocol",
  description:
    "The Mend Index Protocol is Bayview Arts Gallery's proprietary curatorial framework. It evaluates artworks across four forensic axes — Body, Process, Material, Surface.",
  url: `${SITE_URL}/protocol`,
  inLanguage: "en-AU",
  author: {
    "@type": "Organization",
    name: "Bayview Arts Gallery",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "Bayview Arts Gallery",
    url: SITE_URL,
  },
  about: {
    "@type": "Thing",
    name: "Mend Index Protocol",
    description:
      "Curatorial evaluation framework with axes Body, Process, Material, and Surface.",
  },
  isAccessibleForFree: true,
};

const protocolBreadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Gallery", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Mend Index Protocol", item: `${SITE_URL}/protocol` },
  ],
};

export default function ProtocolPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(protocolTechArticleLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(protocolBreadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-h3 font-medium tracking-forensic text-noir-text md:text-h2">
            Mend Index Protocol
          </h1>
          <Badge variant="muted">Mend Index V1</Badge>
        </div>
        <p className="text-helper text-noir-muted leading-relaxed max-w-2xl">
          The Mend Index is a structured curatorial evaluation framework that
          assesses material sincerity across four forensic axes. It produces a
          composite score reflecting the coherence between declared intent and
          material reality.
        </p>
      </div>

      {/* Legal framing */}
      <div className="border border-noir-accent/20 bg-noir-accent/5 p-4 mb-8">
        <p className="text-micro text-noir-accent tracking-widest uppercase font-medium mb-2">
          Important Disclosure
        </p>
        <p className="text-caption text-noir-muted leading-relaxed">
          {DISCLAIMERS.global}
        </p>
      </div>

      <Divider label="Evaluation Axes" className="mb-6" />

      {/* B / P / M / S axes */}
      <div className="space-y-4 mb-8">
        {AXES.map((axis) => (
          <Panel key={axis.key}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 border border-noir-border bg-noir-bg flex items-center justify-center">
                <span className="text-body font-medium text-noir-text">
                  {axis.key}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-nav font-medium text-noir-text">
                    {axis.name}
                  </h2>
                  <span className="text-micro text-noir-muted tracking-widest uppercase">
                    — {axis.subtitle}
                  </span>
                  <Badge variant="muted" className="ml-auto">
                    {axis.weight}
                  </Badge>
                </div>
                <p className="text-helper text-noir-muted leading-relaxed">
                  {axis.description}
                </p>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Divider label="Composite Calculation" className="mb-6" />

      {/* Formula */}
      <Panel className="mb-8">
        <div className="text-center py-4">
          <p className="text-micro text-noir-muted tracking-widest uppercase mb-3">
            Mend Index Formula
          </p>
          <p className="text-body text-noir-text font-medium tracking-wide font-mono">
            V = (B × 0.25) + (P × 0.20) + (M × 0.35) + (S × 0.20)
          </p>
          <p className="text-micro text-noir-muted mt-3 leading-relaxed max-w-lg mx-auto">
            Each axis is scored on a 0–10 scale by independent assessors under
            blind review protocol. The composite Mend Index (V) is rounded to
            two decimal places. Material (M) carries the highest weight,
            reflecting the protocol&apos;s emphasis on material sincerity.
          </p>
        </div>
      </Panel>

      <Divider label="Scoring Protocol" className="mb-6" />

      <Panel className="mb-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-caption font-medium text-noir-text tracking-widest uppercase mb-1.5">
              Blind Review
            </h3>
            <p className="text-helper text-noir-muted leading-relaxed">
              During the initial scoring phase, assessors evaluate work without
              access to artist identity, market history, or source attribution.
              This ensures that scores reflect material evidence alone, not
              external reputation or commercial standing.
            </p>
          </div>
          <Divider />
          <div>
            <h3 className="text-caption font-medium text-noir-text tracking-widest uppercase mb-1.5">
              Variance Review
            </h3>
            <p className="text-helper text-noir-muted leading-relaxed">
              When significant scoring variance is detected between assessors,
              the session is flagged for variance review. Assessors are prompted
              to provide additional justification. The variance threshold and
              resolution process are documented in the assessment audit log.
            </p>
          </div>
          <Divider />
          <div>
            <h3 className="text-caption font-medium text-noir-text tracking-widest uppercase mb-1.5">
              Score Range
            </h3>
            <p className="text-helper text-noir-muted leading-relaxed">
              All axis scores use a 0.0–10.0 continuous scale with 0.1
              granularity. A score of 0 indicates no evidence of the assessed
              quality. A score of 10 represents exceptional coherence across all
              evaluated criteria within that axis.
            </p>
          </div>
        </div>
      </Panel>

      <Divider label="Legal Framework" className="mb-6" />

      {/* Disclaimers */}
      <div className="space-y-3 mb-8">
        <Panel>
          <p className="text-micro text-noir-muted tracking-widest uppercase font-medium mb-2">
            Assessment Disclaimer
          </p>
          <p className="text-caption text-noir-muted/70 leading-relaxed">
            {DISCLAIMERS.report}
          </p>
        </Panel>
        <Panel>
          <p className="text-micro text-noir-muted tracking-widest uppercase font-medium mb-2">
            Assessor Disclosure
          </p>
          <p className="text-caption text-noir-muted/70 leading-relaxed">
            {DISCLAIMERS.assessorDisclosure}
          </p>
        </Panel>
        <Panel>
          <p className="text-micro text-noir-muted tracking-widest uppercase font-medium mb-2">
            Submission Consent
          </p>
          <p className="text-caption text-noir-muted/70 leading-relaxed">
            {DISCLAIMERS.submissionConsent}
          </p>
        </Panel>
      </div>

      <footer className="border-t border-noir-border pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption uppercase tracking-[0.16em] text-noir-muted">
          <a
            href="https://www.bayviewhub.me/about"
            className="transition-colors hover:text-noir-text"
          >
            About Bayview Hub
          </a>
          <span aria-hidden>·</span>
          <a
            href="https://www.bayviewhub.me/mendpress"
            className="transition-colors hover:text-noir-text"
          >
            Mendpress
          </a>
          <span aria-hidden>·</span>
          <Link href="/submit" className="transition-colors hover:text-noir-text">
            Submit artwork
          </Link>
        </div>
      </footer>
    </div>
  );
}
