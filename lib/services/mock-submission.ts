import type { SubmissionService } from "./submission";
import type { EvidenceFile } from "@/lib/types";

export function createMockSubmissionService(): SubmissionService {
  let fileCounter = 0;

  return {
    async submit(_payload): Promise<{ referenceId: string }> {
      return {
        referenceId: `SUB-${Date.now().toString(36).toUpperCase()}`,
      };
    },

    async uploadEvidence(_file: File): Promise<EvidenceFile> {
      fileCounter += 1;
      return {
        id: `file-${Date.now()}`,
        name: `texture_evidence_${String(fileCounter).padStart(3, "0")}.tiff`,
        type: "TIFF",
      };
    },

    async removeEvidence(_fileId: string): Promise<void> {
      return;
    },
  };
}
