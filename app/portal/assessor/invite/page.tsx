import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";

export default function AssessorInvitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Invitation
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-3">
        Art Specialist Invitation
      </h1>
      <p className="text-sm text-gallery-muted leading-relaxed mb-10 max-w-2xl">
        You have been identified as a qualified specialist and are invited to
        join the Mend Index assessment panel. Please review the following
        information carefully before accepting.
      </p>

      <div className="space-y-10">
        {/* Purpose */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Purpose of the Mend Index
          </h2>
          <p className="text-sm text-gallery-text leading-relaxed">
            The Mend Index is a structured curatorial protocol that evaluates
            the material sincerity of contemporary artworks across four axes:
            Body (physical integrity), Process (material evidence), Material
            (sincerity index), and Surface (forensic coherence). Each axis
            is scored on a 0–10 scale and combined into a composite value (V).
            The resulting assessment is a curatorial opinion — it is not a
            financial appraisal, market valuation, or authentication service.
          </p>
        </section>

        {/* What is an Art Specialist */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Who Are Art Specialists?
          </h2>
          <p className="text-sm text-gallery-text leading-relaxed mb-4">
            Art Specialists are external assessors selected for their domain
            expertise in materials, conservation, art historical context, or
            studio practice. They form the independent panel that generates
            Mend Index scores under the blind review protocol.
          </p>
          <div className="border border-gallery-border rounded-lg p-5 bg-gallery-surface-alt">
            <p className="text-xs font-semibold uppercase tracking-widest text-gallery-muted mb-3">
              Selection Criteria
            </p>
            <ul className="space-y-2.5">
              {[
                "Demonstrated expertise in at least one relevant domain: materials science, art conservation, studio practice, or art historical analysis.",
                "Minimum 5 years of professional or academic engagement with contemporary art materials and processes.",
                "No active commercial relationship with the artists or galleries whose works are under assessment.",
                "Commitment to evidence-based evaluation free from market-oriented reasoning.",
                "Willingness to adhere to the blind review protocol and variance review process.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gallery-text leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gallery-accent mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Expectations */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Expectations
          </h2>
          <p className="text-sm text-gallery-text leading-relaxed mb-3">
            As an Art Specialist on the Mend Index panel, you will:
          </p>
          <ul className="space-y-2.5">
            {[
              "Review submitted artworks through a blind assessment interface — artist identity is redacted during scoring.",
              "Evaluate material evidence (high-resolution images, process documentation, declared materials) against the four B/P/M/S axes.",
              "Provide a numeric score (0–10) for each axis along with written justification notes.",
              "Participate in variance review if your scores diverge significantly from other panel members.",
              "Maintain objectivity: scores must reflect material and contextual evidence only.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-gallery-text leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gallery-border mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Time Commitment */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Time Commitment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Per Assessment",
                value: "30–60 min",
                detail: "Review evidence, score four axes, write notes",
              },
              {
                label: "Frequency",
                value: "2–4 / month",
                detail: "Sessions are assigned on a rolling basis",
              },
              {
                label: "Variance Review",
                value: "~15 min",
                detail: "Only when flagged; not every session",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-gallery-border rounded-lg p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gallery-muted mb-1">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-gallery-text mb-1">
                  {item.value}
                </p>
                <p className="text-xs text-gallery-muted leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Confidentiality */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Confidentiality
          </h2>
          <div className="border border-gallery-border rounded-lg p-5 bg-gallery-surface-alt">
            <ul className="space-y-2.5">
              {[
                "All submission materials, scores, and assessment notes are confidential and must not be shared outside the platform.",
                "Artist identities are redacted during blind scoring phases. Deliberate attempts to identify submitters are a violation of the protocol.",
                "Your individual scores are visible only to platform administrators and are aggregated before publication.",
                "You may not use information obtained through the assessment process for personal commercial advantage.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gallery-text leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gallery-accent/60 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Compliance Disclaimer */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gallery-accent mb-3">
            Compliance &amp; Disclaimer
          </h2>
          <div className="border border-gallery-accent/20 bg-gallery-accent/5 rounded-lg p-5">
            <p className="text-sm text-gallery-text leading-relaxed mb-3">
              {DISCLAIMERS.assessorDisclosure}
            </p>
            <div className="border-t border-gallery-accent/10 pt-3 mt-3">
              <p className="text-xs text-gallery-muted leading-relaxed">
                {DISCLAIMERS.report}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gallery-border pt-8">
          <p className="text-sm text-gallery-text leading-relaxed mb-6">
            If you would like to accept this invitation, please contact the
            platform administrator to complete onboarding and receive your
            assessor credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:admin@artprotocol.dev?subject=Art%20Specialist%20Invitation%20—%20Acceptance"
              className="inline-flex items-center justify-center bg-gallery-accent text-white text-sm font-medium rounded-lg px-6 py-3 hover:bg-gallery-accent-hover transition-colors duration-200"
            >
              Accept Invitation
            </a>
            <Link
              href="/protocol"
              className="inline-flex items-center justify-center border border-gallery-border text-gallery-text text-sm font-medium rounded-lg px-6 py-3 hover:bg-gallery-surface-alt transition-colors duration-200"
            >
              Learn About the Protocol
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
