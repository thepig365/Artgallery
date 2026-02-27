import { z } from "zod";

// ──── Shared validators ─────────────────────────────────────

const score = z
  .number()
  .min(0, "Score must be ≥ 0")
  .max(10, "Score must be ≤ 10");

const uuid = z.string().uuid("Must be a valid UUID");

// ──── Artist ─────────────────────────────────────────────────

export const createArtistSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  bio: z.string().max(5000).optional(),
  website: z.string().url().optional(),
});

// ──── Artwork ────────────────────────────────────────────────

export const createArtworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  slug: z
    .string()
    .min(1)
    .max(300)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  medium: z.string().max(200).optional(),
  year: z.number().int().min(1000).max(2100).optional(),
  dimensions: z.string().max(200).optional(),
  materials: z.string().max(2000).optional(),
  narrative: z.string().max(10000).optional(),
  sourceUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  sourceLicenseStatus: z.string().max(100).optional(),
  artistId: uuid,
});

// ──── Scores ─────────────────────────────────────────────────

export const mendScoresSchema = z.object({
  B: score,
  P: score,
  M: score,
  S: score,
});

export const submitAuditScoreSchema = z.object({
  auditSessionId: uuid,
  assessorUserId: uuid,
  scoreB: score,
  scoreP: score,
  scoreM: score,
  scoreS: score,
  notes: z.string().max(5000).optional(),
});

// ──── Audit Session ──────────────────────────────────────────

export const createAuditSessionSchema = z.object({
  artworkId: uuid,
  assessorIds: z.array(uuid).optional(),
  notes: z.string().max(5000).optional(),
});

// ──── Visibility toggle ──────────────────────────────────────

export const toggleVisibilitySchema = z
  .object({
    artworkId: uuid,
    isVisible: z.boolean(),
    reason: z.string().max(2000).optional(),
    actorId: uuid,
  })
  .refine(
    (data) => {
      // Reason is required when hiding
      if (!data.isVisible && (!data.reason || data.reason.trim() === "")) {
        return false;
      }
      return true;
    },
    { message: "Reason is required when hiding an artwork", path: ["reason"] }
  );

// ──── Takedown request ───────────────────────────────────────

export const createTakedownRequestSchema = z.object({
  artworkId: uuid,
  complainantName: z.string().min(1, "Name is required").max(300),
  contactEmail: z.string().email("Valid email required"),
  workUrl: z.string().url("Valid URL required"),
  complaintBasis: z.string().min(10, "Provide complaint basis").max(5000),
  evidenceLinks: z
    .array(z.string().url())
    .max(20, "Maximum 20 evidence links"),
  declarationAccepted: z.literal(true, {
    message: "Declaration must be accepted",
  }),
});

// ──── Ownership claims ──────────────────────────────────────

export const claimRelationshipEnum = z.enum([
  "ARTIST",
  "OWNER",
  "AGENT",
  "RIGHTS_HOLDER",
  "OTHER",
]);

export const createOwnershipClaimSchema = z.object({
  artworkId: uuid,
  claimantName: z.string().min(1, "Name is required").max(300),
  claimantEmail: z.string().email("Valid email required"),
  relationshipToArtwork: claimRelationshipEnum,
  evidenceText: z.string().min(10, "Provide evidence of ownership").max(5000),
  declarationAccepted: z.literal(true, {
    message: "Declaration must be accepted",
  }),
});

export const ownerToggleVisibilitySchema = z
  .object({
    artworkId: uuid,
    isVisible: z.boolean(),
    reason: z.string().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (!data.isVisible && (!data.reason || data.reason.trim() === "")) {
        return false;
      }
      return true;
    },
    { message: "Reason is required when hiding an artwork", path: ["reason"] }
  );

export const reviewClaimSchema = z.object({
  notes: z.string().max(2000).optional(),
});

// ──── Artist submission (server-side) ────────────────────────

export const evidenceFileDescriptorSchema = z.object({
  id: z.string().max(200),
  name: z.string().max(500),
  mimeType: z.string().max(100).optional(),
  size: z.number().int().nonnegative().optional(),
  path: z.string().max(1000).optional(),
  uploadedAt: z.string().max(100).optional(),
});

export const createArtistSubmissionSchema = z.object({
  workTitle: z.string().min(1, "Title is required").max(300),
  artistName: z.string().min(1, "Artist name is required").max(300),
  submitterPrintName: z.string().min(1, "Print name is required").max(300),
  medium: z.string().max(200).optional(),
  year: z
    .number()
    .int()
    .min(1000, "Year must be ≥ 1000")
    .max(2100, "Year must be ≤ 2100")
    .optional()
    .nullable(),
  dimensions: z.string().max(200).optional(),
  editionInfo: z.string().max(500).optional(),
  materials: z.array(z.string().max(200)).max(50).default([]),
  materialsOther: z.string().max(500).optional(),
  narrative: z.string().max(10000).optional(),
  evidenceFiles: z
    .array(evidenceFileDescriptorSchema)
    .min(1, "At least one evidence image is required")
    .max(50),
  consentGiven: z.literal(true, {
    message: "Consent must be given",
  }),
});

export type CreateArtistSubmissionInput = z.infer<
  typeof createArtistSubmissionSchema
>;

// ──── Upload metadata contract ───────────────────────────────

export const uploadMetadataSchema = z.object({
  filename: z.string().min(1).max(500),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp|tiff)$/, "Allowed types: jpeg, png, webp, tiff"),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024, "Max 50MB"),
  artworkId: uuid,
  uploadedBy: uuid,
  evidenceType: z.enum(["texture", "process", "detail", "context"]).optional(),
});

// ──── Type exports ───────────────────────────────────────────

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type MendScoresInput = z.infer<typeof mendScoresSchema>;
export type SubmitAuditScoreInput = z.infer<typeof submitAuditScoreSchema>;
export type CreateAuditSessionInput = z.infer<typeof createAuditSessionSchema>;
export type ToggleVisibilityInput = z.infer<typeof toggleVisibilitySchema>;
export type CreateTakedownRequestInput = z.infer<typeof createTakedownRequestSchema>;
export type UploadMetadataInput = z.infer<typeof uploadMetadataSchema>;
export type CreateOwnershipClaimInput = z.infer<typeof createOwnershipClaimSchema>;
export type OwnerToggleVisibilityInput = z.infer<typeof ownerToggleVisibilitySchema>;
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;
