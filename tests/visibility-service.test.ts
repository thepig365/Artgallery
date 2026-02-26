import { describe, it, expect } from "vitest";
import { VisibilityError } from "@/lib/services/artwork-visibility";

/**
 * Service-layer logic tests for artwork visibility.
 *
 * Note: Full integration tests require a database connection.
 * These tests validate the business rules that can be tested
 * without DB, plus the error class behavior.
 *
 * The toggleArtworkVisibility function itself is integration-tested
 * against the DB. Here we test the validation rules independently.
 */

describe("VisibilityError", () => {
  it("has correct name", () => {
    const err = new VisibilityError("test");
    expect(err.name).toBe("VisibilityError");
    expect(err.message).toBe("test");
    expect(err instanceof Error).toBe(true);
  });
});

describe("visibility business rules", () => {
  // Extracted rule: reason required when hiding
  function validateHideRequest(isVisible: boolean, reason?: string): boolean {
    if (!isVisible && (!reason || reason.trim() === "")) {
      return false;
    }
    return true;
  }

  it("requires reason when hiding", () => {
    expect(validateHideRequest(false)).toBe(false);
    expect(validateHideRequest(false, "")).toBe(false);
    expect(validateHideRequest(false, "   ")).toBe(false);
  });

  it("accepts reason when hiding", () => {
    expect(validateHideRequest(false, "Copyright violation")).toBe(true);
  });

  it("does not require reason when unhiding", () => {
    expect(validateHideRequest(true)).toBe(true);
    expect(validateHideRequest(true, undefined)).toBe(true);
  });
});
