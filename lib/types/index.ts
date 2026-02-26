export interface BPMSScores {
  B: number;
  P: number;
  M: number;
  S: number;
}

export interface ArtistSubmission {
  id: string;
  workTitle: string;
  medium: string;
  year: number;
  dimensions: string;
  materials: string[];
  narrative: string;
  evidenceUrls: string[];
  consentGiven: boolean;
  status: "draft" | "submitted" | "under_review" | "assessed";
  submittedAt: string | null;
}

export interface AssessorSession {
  id: string;
  submissionId: string;
  assessorId: string;
  status: "pending" | "in_progress" | "completed";
  scores: BPMSScores | null;
  notes: string;
  isDraft: boolean;
  varianceFlag: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface SubmissionEvidence {
  id: string;
  url: string;
  label: string;
  type: "texture" | "process" | "detail" | "context";
}

export interface MaterialDeclaration {
  material: string;
  source: string;
  verified: boolean;
}

export interface BlindSubmission {
  id: string;
  workTitle: string;
  medium: string;
  year: number;
  dimensions: string;
  materials: string[];
  narrative: string;
  evidence: SubmissionEvidence[];
}

export type WizardStep =
  | "identity"
  | "evidence"
  | "materials"
  | "narrative"
  | "consent";

export interface MaterialRow {
  id: string;
  material: string;
  source: string;
}

export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  /** Storage path — present after successful upload */
  path?: string;
  /** MIME type from server */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
  /** ISO timestamp of upload */
  uploadedAt?: string;
  /** Upload state for UI feedback */
  status?: "uploading" | "done" | "error";
  /** Error message if upload failed */
  error?: string;
}

export type IdentityFields = "workTitle" | "medium" | "year" | "dimensions";

export interface IdentityFormData {
  workTitle: string;
  medium: string;
  year: string;
  dimensions: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const MEDIUM_OPTIONS: SelectOption[] = [
  { value: "oil", label: "Oil on canvas" },
  { value: "acrylic", label: "Acrylic on canvas" },
  { value: "mixed", label: "Mixed media" },
  { value: "watercolor", label: "Watercolor" },
  { value: "sculpture", label: "Sculpture" },
  { value: "installation", label: "Installation" },
  { value: "digital", label: "Digital" },
  { value: "photography", label: "Photography" },
  { value: "other", label: "Other" },
];
