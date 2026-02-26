import type {
  ArtistSubmission,
  AssessorSession,
  SubmissionEvidence,
  MaterialDeclaration,
  BlindSubmission,
} from "@/lib/types";

export const MOCK_SUBMISSION: ArtistSubmission = {
  id: "SUB-2024-0471",
  workTitle: "Erosion Study No. 7",
  medium: "Mixed media on prepared panel",
  year: 2024,
  dimensions: "120 × 90 cm",
  materials: ["Oil pigment", "Cold wax medium", "Iron oxide", "Raw canvas"],
  narrative:
    "This work investigates the material tension between synthetic binders and mineral pigments under controlled oxidation. The surface was developed over fourteen months through repeated layering and selective removal, allowing the substrate to participate in the final image.",
  evidenceUrls: [],
  consentGiven: false,
  status: "draft",
  submittedAt: null,
};

export const MOCK_ASSESSOR_SESSION: AssessorSession = {
  id: "AUD-2024-0093",
  submissionId: "SUB-2024-0471",
  assessorId: "ASR-BLIND",
  status: "in_progress",
  scores: { B: 7.2, P: 8.1, M: 6.5, S: 7.8 },
  notes: "",
  isDraft: true,
  varianceFlag: true,
  createdAt: "2024-11-15T10:30:00Z",
  completedAt: null,
};

export const MOCK_EVIDENCE: SubmissionEvidence[] = [
  {
    id: "EV-001",
    url: "https://placehold.co/800x600/111111/9A9A9A?text=Texture+Detail+001",
    label: "Surface texture macro — 40x magnification",
    type: "texture",
  },
  {
    id: "EV-002",
    url: "https://placehold.co/800x600/111111/9A9A9A?text=Process+Record+001",
    label: "Process documentation — Layer 7 application",
    type: "process",
  },
  {
    id: "EV-003",
    url: "https://placehold.co/800x600/111111/9A9A9A?text=Detail+View+001",
    label: "Detail view — Upper left quadrant patina",
    type: "detail",
  },
];

export const MOCK_MATERIALS: MaterialDeclaration[] = [
  { material: "Oil pigment (Cadmium Yellow)", source: "Kremer Pigmente", verified: false },
  { material: "Cold wax medium", source: "Gamblin Artists Colors", verified: false },
  { material: "Iron oxide (natural)", source: "Field-collected, Provence", verified: false },
  { material: "Raw linen canvas", source: "Claessens", verified: false },
];

/**
 * Blind submission is constructed independently — no reference to MOCK_SUBMISSION.
 * In production this is generated server-side with identity fields stripped.
 */
export const MOCK_BLIND_SUBMISSION: BlindSubmission = {
  id: "SUB-REDACTED",
  workTitle: "[REDACTED FOR BLIND REVIEW]",
  medium: "Mixed media on prepared panel",
  year: 2024,
  dimensions: "120 × 90 cm",
  materials: [
    "Oil pigment (Cadmium Yellow)",
    "Cold wax medium",
    "Iron oxide (natural)",
    "Raw linen canvas",
  ],
  narrative:
    "This work investigates the material tension between synthetic binders and mineral pigments under controlled oxidation. The surface was developed over fourteen months through repeated layering and selective removal, allowing the substrate to participate in the final image.",
  evidence: MOCK_EVIDENCE,
};
