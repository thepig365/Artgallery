import { z } from "zod";
import type { IdentityFormData } from "@/lib/types";

/**
 * Validates submission identity fields against backend contract expectations.
 *
 * Field mapping:
 *   UI `workTitle`  → backend `title`
 *   UI `year` (string) → backend `year` (int)
 *   UI `medium` (string) → backend `medium` (string, optional)
 *   UI `dimensions` (string) → backend `dimensions` (string, optional)
 */
export const identitySchema = z.object({
  workTitle: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title must be 300 characters or fewer"),
  artistName: z
    .string()
    .min(1, "Artist name is required")
    .max(300, "Artist name must be 300 characters or fewer"),
  medium: z.string().min(1, "Medium is required"),
  year: z
    .string()
    .min(1, "Year is required")
    .refine(
      (v) => {
        const n = parseInt(v, 10);
        return !isNaN(n) && n >= 1000 && n <= 2100;
      },
      { message: "Year must be between 1000 and 2100" }
    ),
  dimensions: z
    .string()
    .min(1, "Dimensions are required")
    .max(200, "Dimensions must be 200 characters or fewer"),
});

export const narrativeSchema = z
  .string()
  .max(10000, "Maximum 10 000 characters");

export const materialsSchema = z.object({
  selectedMaterials: z.array(z.string()).default([]),
  materialsOther: z.string().max(500).optional().default(""),
});

export type IdentityValidationErrors = Partial<
  Record<keyof IdentityFormData, string>
>;

export function validateIdentity(data: IdentityFormData): {
  success: boolean;
  errors: Record<string, string>;
} {
  const result = identitySchema.safeParse(data);
  if (result.success) return { success: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}

export function validateNarrative(text: string): {
  success: boolean;
  errors: Record<string, string>;
} {
  const result = narrativeSchema.safeParse(text);
  if (result.success) return { success: true, errors: {} };
  return {
    success: false,
    errors: { narrative: result.error.issues[0]?.message ?? "Invalid" },
  };
}

export function validateMaterials(_data: {
  selectedMaterials: string[];
  materialsOther: string;
}): {
  success: boolean;
  errors: Record<string, string>;
} {
  return { success: true, errors: {} };
}

/**
 * Maps UI IdentityFormData to backend-compatible CreateArtworkInput shape.
 * This adapter bridges the field name mismatch:
 *   workTitle → title
 *   year (string) → year (number)
 */
export function toCreateArtworkPayload(identity: IdentityFormData) {
  return {
    title: identity.workTitle,
    medium: identity.medium || undefined,
    year: identity.year ? parseInt(identity.year, 10) : undefined,
    dimensions: identity.dimensions || undefined,
  };
}
