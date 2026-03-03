import { describe, it, expect } from "vitest";
import {
  isPubliclyVisible,
  filterPublicArtworks,
  findPublicArtworkById,
} from "@/lib/services/public-artwork-query";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";
import { toggleVisibilitySchema } from "@/lib/validation/schemas";
import { VisibilityError } from "@/lib/services/artwork-visibility";

// ─────────────────────────────────────────────────────────────
// Test dataset: mirrors the seed data structure.
// 2 visible artworks + 1 hidden artwork.
// ─────────────────────────────────────────────────────────────

function createTestDataset(): ArtworkWithVisibility[] {
  return [
    {
      id: "art-visible-001",
      title: "Erosion Study No. 7",
      slug: "erosion-study-no-7",
      medium: "Oil and iron oxide on raw linen",
      year: 2024,
      isVisible: true,
      artist: {
        id: "artist-001",
        name: "Elena Vasquez",
        slug: "elena-vasquez",
      },
    },
    {
      id: "art-visible-002",
      title: "Tidal Memory",
      slug: "tidal-memory",
      medium: "Encaustic and mineral pigment on panel",
      year: 2024,
      isVisible: true,
      artist: {
        id: "artist-002",
        name: "Marcus Chen",
        slug: "marcus-chen",
      },
    },
    {
      id: "art-hidden-001",
      title: "Substrate Dialogue III",
      slug: "substrate-dialogue-iii",
      medium: "Mixed media and found materials on reclaimed wood",
      year: 2023,
      isVisible: false,
      hiddenReason: "Pending verification",
      hiddenAt: "2024-11-01T00:00:00Z",
      hiddenBy: "admin-001",
      artist: {
        id: "artist-003",
        name: "Sofia Amari",
        slug: "sofia-amari",
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Integration: public list filtering
// ─────────────────────────────────────────────────────────────

describe("Integration: public hidden-artwork filtering", () => {
  describe("public list query — filterPublicArtworks", () => {
    it("returns only visible artworks from a mixed dataset", () => {
      const dataset = createTestDataset();
      const publicList = filterPublicArtworks(dataset);

      expect(publicList).toHaveLength(2);
      expect(publicList.map((a) => a.id)).toEqual([
        "art-visible-001",
        "art-visible-002",
      ]);
    });

    it("never includes a hidden artwork in the public list", () => {
      const dataset = createTestDataset();
      const publicList = filterPublicArtworks(dataset);

      const hiddenIds = dataset
        .filter((a) => !a.isVisible)
        .map((a) => a.id);

      for (const id of hiddenIds) {
        expect(publicList.find((a) => a.id === id)).toBeUndefined();
      }
    });

    it("returns empty list when all artworks are hidden", () => {
      const allHidden: ArtworkWithVisibility[] = createTestDataset().map(
        (a) => ({
          ...a,
          isVisible: false,
          hiddenReason: "Under review",
        })
      );

      const publicList = filterPublicArtworks(allHidden);
      expect(publicList).toHaveLength(0);
    });

    it("returns full list when all artworks are visible", () => {
      const allVisible: ArtworkWithVisibility[] = createTestDataset().map(
        (a) => ({
          ...a,
          isVisible: true,
          hiddenReason: null,
          hiddenAt: null,
          hiddenBy: null,
        })
      );

      const publicList = filterPublicArtworks(allVisible);
      expect(publicList).toHaveLength(3);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Public detail fetch — findPublicArtworkById
  // ─────────────────────────────────────────────────────────

  describe("public detail fetch — findPublicArtworkById", () => {
    it("returns a visible artwork by ID", () => {
      const dataset = createTestDataset();
      const result = findPublicArtworkById(dataset, "art-visible-001");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("art-visible-001");
      expect(result!.title).toBe("Erosion Study No. 7");
    });

    it("returns null for a hidden artwork ID", () => {
      const dataset = createTestDataset();
      const result = findPublicArtworkById(dataset, "art-hidden-001");

      expect(result).toBeNull();
    });

    it("returns null for a non-existent artwork ID", () => {
      const dataset = createTestDataset();
      const result = findPublicArtworkById(dataset, "art-nonexistent");

      expect(result).toBeNull();
    });

    it("hidden artwork returns same null as non-existent (no information leak)", () => {
      const dataset = createTestDataset();
      const hidden = findPublicArtworkById(dataset, "art-hidden-001");
      const missing = findPublicArtworkById(dataset, "art-does-not-exist");

      // Both must be indistinguishable: null
      expect(hidden).toBeNull();
      expect(missing).toBeNull();
      expect(hidden).toBe(missing);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Visibility predicate
  // ─────────────────────────────────────────────────────────

  describe("isPubliclyVisible predicate", () => {
    it("returns true for isVisible: true", () => {
      const dataset = createTestDataset();
      expect(isPubliclyVisible(dataset[0])).toBe(true);
    });

    it("returns false for isVisible: false", () => {
      const dataset = createTestDataset();
      expect(isPubliclyVisible(dataset[2])).toBe(false);
    });

    it("rejects truthy-but-not-true values (strict equality)", () => {
      const artwork = {
        ...createTestDataset()[0],
        isVisible: 1 as unknown as boolean,
      };

      // Must use strict === true, not truthy check
      expect(isPubliclyVisible(artwork)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────
  // Lifecycle: hide → query → verify exclusion → unhide → verify inclusion
  // ─────────────────────────────────────────────────────────

  describe("visibility lifecycle", () => {
    it("hiding an artwork removes it from public queries", () => {
      const dataset = createTestDataset();

      // Baseline: 2 visible
      expect(filterPublicArtworks(dataset)).toHaveLength(2);

      // Simulate hiding art-visible-001
      const target = dataset.find((a) => a.id === "art-visible-001")!;
      target.isVisible = false;
      target.hiddenReason = "Copyright investigation";
      target.hiddenAt = new Date().toISOString();
      target.hiddenBy = "admin-001";

      // After hide: only 1 visible
      const afterHide = filterPublicArtworks(dataset);
      expect(afterHide).toHaveLength(1);
      expect(afterHide[0].id).toBe("art-visible-002");

      // Detail fetch also returns null
      expect(findPublicArtworkById(dataset, "art-visible-001")).toBeNull();
    });

    it("unhiding an artwork restores it to public queries", () => {
      const dataset = createTestDataset();

      // Baseline: art-hidden-001 is hidden
      expect(findPublicArtworkById(dataset, "art-hidden-001")).toBeNull();

      // Simulate unhiding
      const target = dataset.find((a) => a.id === "art-hidden-001")!;
      target.isVisible = true;
      target.hiddenReason = null;
      target.hiddenAt = null;
      target.hiddenBy = null;

      // After unhide: now visible
      expect(filterPublicArtworks(dataset)).toHaveLength(3);
      expect(
        findPublicArtworkById(dataset, "art-hidden-001")
      ).not.toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────
  // Schema + service error contract alignment
  // ─────────────────────────────────────────────────────────

  describe("validation alignment with visibility contract", () => {
    it("toggleVisibilitySchema rejects hide-without-reason", () => {
      const result = toggleVisibilitySchema.safeParse({
        artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isVisible: false,
        actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        // reason intentionally omitted
      });

      expect(result.success).toBe(false);
    });

    it("toggleVisibilitySchema accepts hide-with-reason", () => {
      const result = toggleVisibilitySchema.safeParse({
        artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isVisible: false,
        reason: "Pending verification",
        actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      });

      expect(result.success).toBe(true);
    });

    it("VisibilityError is throwable and identifiable", () => {
      const err = new VisibilityError(
        "Reason is required when hiding an artwork"
      );

      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe("VisibilityError");
      expect(err.message).toContain("Reason is required");
    });

    it("hide lifecycle: schema validation → mutation → query exclusion", () => {
      // Step 1: Validate the hide payload
      const payload = {
        artworkId: "art-visible-001",
        isVisible: false,
        reason: "DMCA takedown pending",
        actorId: "admin-001",
      };

      // Use a UUID for schema validation
      const schemaPayload = {
        ...payload,
        artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      };
      const validation = toggleVisibilitySchema.safeParse(schemaPayload);
      expect(validation.success).toBe(true);

      // Step 2: Apply the mutation in-memory
      const dataset = createTestDataset();
      const target = dataset.find((a) => a.id === "art-visible-001")!;
      target.isVisible = payload.isVisible;
      target.hiddenReason = payload.reason;
      target.hiddenAt = new Date().toISOString();
      target.hiddenBy = payload.actorId;

      // Step 3: Verify the public query contract
      expect(findPublicArtworkById(dataset, "art-visible-001")).toBeNull();
      expect(filterPublicArtworks(dataset)).toHaveLength(1);
    });
  });
});
