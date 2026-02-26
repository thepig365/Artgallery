// ─────────────────────────────────────────────────────────────
// Legal Disclaimer Constants
// Reusable across server components, API responses, and reports
// ─────────────────────────────────────────────────────────────

export const DISCLAIMERS = {
  /**
   * Global site-wide disclaimer — display in footer or banner.
   */
  global: `This platform provides curatorial protocol assessments and material sincerity evaluations. All outputs are subjective opinions based on structured methodology. This platform does not constitute financial advice, investment recommendations, appraisal certification, or valuation guarantees. Users should not rely on any assessment as a basis for financial decisions.`,

  /**
   * Report-level disclaimer — display on every assessment report.
   */
  report: `This assessment is a curatorial opinion generated through the Mend Index protocol. It reflects a structured evaluation of material sincerity across four axes (Body, Provenance, Material, Surface) and does not represent a financial appraisal, market valuation, or investment recommendation. The score is not a price indicator. No warranty is made regarding accuracy, completeness, or fitness for any particular purpose.`,

  /**
   * Submission consent text — artist must accept before submitting work.
   */
  submissionConsent: `By submitting this work for assessment, you confirm that: (1) you are the creator or authorized representative of the work; (2) you grant the platform a non-exclusive license to display the submitted images for assessment and archival purposes; (3) you understand that assessments are curatorial opinions and not financial valuations; (4) you may request removal of your work at any time through the takedown process.`,

  /**
   * Assessor disclosure — shown to assessors before scoring.
   */
  assessorDisclosure: `As an assessor, your scores contribute to a protocol-based curatorial opinion. Your evaluation must be based solely on the material and contextual evidence presented. Do not reference market prices, auction results, or financial metrics in your assessment notes. All scoring is subject to variance review.`,

  /**
   * Takedown acknowledgment — shown in takedown request form.
   */
  takedownDeclaration: `I declare that the information provided in this takedown request is accurate to the best of my knowledge. I understand that submitting false claims may result in the rejection of this request and potential account action.`,
} as const;

export type DisclaimerKey = keyof typeof DISCLAIMERS;
