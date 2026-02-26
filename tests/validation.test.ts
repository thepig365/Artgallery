import { describe, it, expect } from "vitest";
import {
  mendScoresSchema,
  toggleVisibilitySchema,
  createTakedownRequestSchema,
  createArtworkSchema,
  uploadMetadataSchema,
} from "@/lib/validation/schemas";

describe("mendScoresSchema", () => {
  it("accepts valid scores", () => {
    const result = mendScoresSchema.safeParse({ B: 7.2, P: 8.1, M: 6.5, S: 7.8 });
    expect(result.success).toBe(true);
  });

  it("accepts boundary values 0 and 10", () => {
    expect(mendScoresSchema.safeParse({ B: 0, P: 0, M: 0, S: 0 }).success).toBe(true);
    expect(mendScoresSchema.safeParse({ B: 10, P: 10, M: 10, S: 10 }).success).toBe(true);
  });

  it("rejects negative scores", () => {
    const result = mendScoresSchema.safeParse({ B: -1, P: 5, M: 5, S: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects scores above 10", () => {
    const result = mendScoresSchema.safeParse({ B: 5, P: 5, M: 11, S: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-number values", () => {
    const result = mendScoresSchema.safeParse({ B: "high", P: 5, M: 5, S: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = mendScoresSchema.safeParse({ B: 5, P: 5 });
    expect(result.success).toBe(false);
  });
});

describe("toggleVisibilitySchema", () => {
  it("accepts valid hide request with reason", () => {
    const result = toggleVisibilitySchema.safeParse({
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      isVisible: false,
      reason: "Copyright violation",
      actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid unhide request without reason", () => {
    const result = toggleVisibilitySchema.safeParse({
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      isVisible: true,
      actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(true);
  });

  it("rejects hide request without reason", () => {
    const result = toggleVisibilitySchema.safeParse({
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      isVisible: false,
      actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });

  it("rejects hide request with empty reason", () => {
    const result = toggleVisibilitySchema.safeParse({
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      isVisible: false,
      reason: "   ",
      actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for artworkId", () => {
    const result = toggleVisibilitySchema.safeParse({
      artworkId: "not-a-uuid",
      isVisible: true,
      actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTakedownRequestSchema", () => {
  const validTakedown = {
    artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    complainantName: "Jane Doe",
    contactEmail: "jane@example.com",
    workUrl: "https://example.com/artwork",
    complaintBasis: "This work infringes on my copyright as the original creator.",
    evidenceLinks: ["https://evidence.example.com/proof1"],
    declarationAccepted: true as const,
  };

  it("accepts valid takedown request", () => {
    const result = createTakedownRequestSchema.safeParse(validTakedown);
    expect(result.success).toBe(true);
  });

  it("rejects without declaration accepted", () => {
    const result = createTakedownRequestSchema.safeParse({
      ...validTakedown,
      declarationAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createTakedownRequestSchema.safeParse({
      ...validTakedown,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short complaint basis", () => {
    const result = createTakedownRequestSchema.safeParse({
      ...validTakedown,
      complaintBasis: "bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid evidence URLs", () => {
    const result = createTakedownRequestSchema.safeParse({
      ...validTakedown,
      evidenceLinks: ["not-a-url"],
    });
    expect(result.success).toBe(false);
  });
});

describe("createArtworkSchema", () => {
  it("accepts valid artwork", () => {
    const result = createArtworkSchema.safeParse({
      title: "Test Artwork",
      slug: "test-artwork",
      medium: "Oil on canvas",
      year: 2024,
      artistId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = createArtworkSchema.safeParse({
      title: "Test",
      slug: "Invalid Slug!",
      artistId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(result.success).toBe(false);
  });
});

describe("uploadMetadataSchema", () => {
  it("accepts valid upload metadata", () => {
    const result = uploadMetadataSchema.safeParse({
      filename: "photo.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024000,
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      uploadedBy: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      evidenceType: "texture",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported mime type", () => {
    const result = uploadMetadataSchema.safeParse({
      filename: "doc.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024000,
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      uploadedBy: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });

  it("rejects files exceeding 50MB", () => {
    const result = uploadMetadataSchema.safeParse({
      filename: "huge.png",
      mimeType: "image/png",
      sizeBytes: 60 * 1024 * 1024,
      artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      uploadedBy: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });
});
