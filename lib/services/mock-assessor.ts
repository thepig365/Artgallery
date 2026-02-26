import type { AssessorService } from "./assessor";
import type {
  AssessorSession,
  BlindSubmission,
  SubmissionEvidence,
  BPMSScores,
} from "@/lib/types";
import type { ArtworkWithArtist } from "@/lib/audit/redaction";
import { toBlindSubmission } from "@/lib/adapters/redaction-adapter";
import {
  MOCK_ASSESSOR_SESSION,
  MOCK_EVIDENCE,
} from "@/lib/mocks/data";

const MOCK_ARTWORK_RECORD: ArtworkWithArtist = {
  id: "SUB-2024-0471",
  title: "Erosion Study No. 7",
  slug: "erosion-study-no-7",
  medium: "Mixed media on prepared panel",
  year: 2024,
  dimensions: "120 × 90 cm",
  materials: "Oil pigment (Cadmium Yellow), Cold wax medium, Iron oxide (natural), Raw linen canvas",
  narrative:
    "This work investigates the material tension between synthetic binders and mineral pigments under controlled oxidation. The surface was developed over fourteen months through repeated layering and selective removal, allowing the substrate to participate in the final image.",
  sourceUrl: "https://example.com/gallery/erosion-7",
  imageUrl: null,
  sourceLicenseStatus: null,
  artist: {
    id: "ART-001",
    name: "Artist Name Redacted",
    slug: "artist-name-redacted",
    bio: "Emerging mixed-media artist working with mineral pigments.",
    website: "https://example.com/artist",
  },
};

export function createMockAssessorService(): AssessorService {
  let session = { ...MOCK_ASSESSOR_SESSION };

  return {
    async getSession(_sessionId: string): Promise<AssessorSession> {
      return { ...session };
    },

    async getBlindSubmission(_sessionId: string): Promise<BlindSubmission> {
      return toBlindSubmission(
        MOCK_ARTWORK_RECORD,
        "BLIND_SCORING",
        MOCK_EVIDENCE
      );
    },

    async getEvidence(_sessionId: string): Promise<SubmissionEvidence[]> {
      return [...MOCK_EVIDENCE];
    },

    async saveDraft(
      _sessionId: string,
      scores: BPMSScores,
      notes: string
    ): Promise<void> {
      session = { ...session, scores, notes, isDraft: true };
    },

    async submitFinal(
      _sessionId: string,
      scores: BPMSScores,
      notes: string
    ): Promise<void> {
      session = {
        ...session,
        scores,
        notes,
        isDraft: false,
        status: "completed",
        completedAt: new Date().toISOString(),
      };
    },
  };
}
