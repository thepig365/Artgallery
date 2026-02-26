import type {
  IdentityFormData,
  EvidenceFile,
} from "@/lib/types";

export interface EvidenceFileDescriptor {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  path?: string;
  uploadedAt?: string;
}

export interface SubmissionPayload {
  identity: IdentityFormData;
  materials: string[];
  materialsOther: string;
  narrative: string;
  evidenceFiles: EvidenceFileDescriptor[];
  consentGiven: boolean;
}

export interface SubmissionService {
  submit(payload: SubmissionPayload): Promise<{ referenceId: string }>;
  uploadEvidence(file: File): Promise<EvidenceFile>;
  removeEvidence(fileId: string): Promise<void>;
}
