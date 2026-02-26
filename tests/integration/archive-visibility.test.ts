import { describe, it, expect } from "vitest";
import {
  filterPublicArtworks,
  findPublicArtworkById,
} from "@/lib/services/public-artwork-query";
import { MOCK_ARCHIVE_ARTWORKS } from "@/lib/mocks/archive";

/**
 * Integration: exercises the ACTUAL mock archive dataset through the
 * production visibility-filtering code path. This validates the full
 * pipeline that the Archive page and detail pages rely on.
 */

describe("Integration: archive visibility with production mock data", () => {
  describe("archive list path (filterPublicArtworks)", () => {
    it("returns only publicly visible artworks from the mock dataset", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);

      for (const artwork of publicList) {
        expect(artwork.isVisible).toBe(true);
      }
    });

    it("excludes all hidden artworks by ID", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const publicIds = new Set(publicList.map((a) => a.id));

      const hiddenIds = MOCK_ARCHIVE_ARTWORKS.filter(
        (a) => !a.isVisible
      ).map((a) => a.id);

      for (const hiddenId of hiddenIds) {
        expect(publicIds.has(hiddenId)).toBe(false);
      }
    });

    it("returns exactly 3 visible artworks from the 5-item dataset", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      expect(publicList).toHaveLength(3);
    });

    it("preserves ordering from the source dataset", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const expectedIds = MOCK_ARCHIVE_ARTWORKS.filter(
        (a) => a.isVisible
      ).map((a) => a.id);

      expect(publicList.map((a) => a.id)).toEqual(expectedIds);
    });

    it("hidden artwork data never appears in serialized public list", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const serialized = JSON.stringify(publicList);

      const hiddenArtworks = MOCK_ARCHIVE_ARTWORKS.filter(
        (a) => !a.isVisible
      );

      for (const hidden of hiddenArtworks) {
        expect(serialized).not.toContain(hidden.title);
        if (hidden.artist) {
          expect(serialized).not.toContain(hidden.artist.name);
        }
      }
    });
  });

  describe("archive detail path (slug lookup)", () => {
    it("returns visible artwork by slug match", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const result = publicList.find(
        (a) => a.slug === "erosion-study-no-7"
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe("AW-001");
      expect(result!.isVisible).toBe(true);
    });

    it("hidden artwork slug not findable in filtered list", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const result = publicList.find((a) => a.slug === "thermal-residue");

      expect(result).toBeUndefined();
    });

    it("non-existent slug returns undefined from filtered list", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const result = publicList.find(
        (a) => a.slug === "does-not-exist-xyz"
      );

      expect(result).toBeUndefined();
    });

    it("hidden slug and non-existent slug are indistinguishable", () => {
      const publicList = filterPublicArtworks(MOCK_ARCHIVE_ARTWORKS);
      const hidden = publicList.find((a) => a.slug === "thermal-residue");
      const missing = publicList.find(
        (a) => a.slug === "totally-fabricated"
      );

      expect(hidden).toBeUndefined();
      expect(missing).toBeUndefined();
      expect(hidden).toBe(missing);
    });
  });

  describe("findPublicArtworkById on production data", () => {
    it("returns visible artwork by ID", () => {
      const result = findPublicArtworkById(MOCK_ARCHIVE_ARTWORKS, "AW-001");
      expect(result).not.toBeNull();
      expect(result!.title).toBe("Erosion Study No. 7");
    });

    it("returns null for hidden artwork ID AW-003", () => {
      expect(
        findPublicArtworkById(MOCK_ARCHIVE_ARTWORKS, "AW-003")
      ).toBeNull();
    });

    it("returns null for hidden artwork ID AW-005", () => {
      expect(
        findPublicArtworkById(MOCK_ARCHIVE_ARTWORKS, "AW-005")
      ).toBeNull();
    });
  });
});
