import type {
  AssessorSession,
  BlindSubmission,
  SubmissionEvidence,
  BPMSScores,
} from "@/lib/types";

export interface AssessorService {
  getSession(sessionId: string): Promise<AssessorSession>;
  getBlindSubmission(sessionId: string): Promise<BlindSubmission>;
  getEvidence(sessionId: string): Promise<SubmissionEvidence[]>;
  saveDraft(sessionId: string, scores: BPMSScores, notes: string): Promise<void>;
  submitFinal(sessionId: string, scores: BPMSScores, notes: string): Promise<void>;
}
