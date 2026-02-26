import { describe, it, expect } from "vitest";
import {
  requireRole,
  hasRole,
  isAdmin,
  canScore,
  canManageVisibility,
  AuthorizationError,
} from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/roles";

const adminUser: SessionUser = { id: "admin-1", authUid: "auth-admin-1", role: "ADMIN", isActive: true };
const assessorUser: SessionUser = { id: "assessor-1", authUid: "auth-assessor-1", role: "ASSESSOR", isActive: true };
const artistUser: SessionUser = { id: "artist-1", authUid: "auth-artist-1", role: "ARTIST", isActive: true };
const viewerUser: SessionUser = { id: "viewer-1", authUid: "auth-viewer-1", role: "VIEWER", isActive: true };
const deactivatedUser: SessionUser = { id: "dead-1", authUid: "auth-dead-1", role: "ADMIN", isActive: false };

describe("requireRole", () => {
  it("passes for matching role", () => {
    expect(() => requireRole(adminUser, "ADMIN")).not.toThrow();
    expect(() => requireRole(assessorUser, "ASSESSOR")).not.toThrow();
  });

  it("passes when user has one of multiple allowed roles", () => {
    expect(() => requireRole(assessorUser, "ADMIN", "ASSESSOR")).not.toThrow();
  });

  it("throws AuthorizationError for non-matching role", () => {
    expect(() => requireRole(artistUser, "ADMIN")).toThrow(AuthorizationError);
    expect(() => requireRole(viewerUser, "ADMIN", "ASSESSOR")).toThrow(
      AuthorizationError
    );
  });

  it("throws for null user", () => {
    expect(() => requireRole(null, "ADMIN")).toThrow(AuthorizationError);
    expect(() => requireRole(null, "ADMIN")).toThrow("Authentication required");
  });

  it("throws for undefined user", () => {
    expect(() => requireRole(undefined, "ADMIN")).toThrow(AuthorizationError);
  });

  it("throws for deactivated user", () => {
    expect(() => requireRole(deactivatedUser, "ADMIN")).toThrow(
      AuthorizationError
    );
    expect(() => requireRole(deactivatedUser, "ADMIN")).toThrow(
      "Account is deactivated"
    );
  });
});

describe("hasRole", () => {
  it("returns true for matching role", () => {
    expect(hasRole(adminUser, "ADMIN")).toBe(true);
  });

  it("returns false for non-matching role", () => {
    expect(hasRole(artistUser, "ADMIN")).toBe(false);
  });

  it("returns false for null user", () => {
    expect(hasRole(null, "ADMIN")).toBe(false);
  });

  it("returns false for deactivated user", () => {
    expect(hasRole(deactivatedUser, "ADMIN")).toBe(false);
  });
});

describe("isAdmin", () => {
  it("returns true for ADMIN", () => {
    expect(isAdmin(adminUser)).toBe(true);
  });

  it("returns false for ASSESSOR", () => {
    expect(isAdmin(assessorUser)).toBe(false);
  });
});

describe("canScore", () => {
  it("returns true for ADMIN", () => {
    expect(canScore(adminUser)).toBe(true);
  });

  it("returns true for ASSESSOR", () => {
    expect(canScore(assessorUser)).toBe(true);
  });

  it("returns false for ARTIST", () => {
    expect(canScore(artistUser)).toBe(false);
  });

  it("returns false for VIEWER", () => {
    expect(canScore(viewerUser)).toBe(false);
  });
});

describe("canManageVisibility", () => {
  it("returns true for ADMIN only", () => {
    expect(canManageVisibility(adminUser)).toBe(true);
    expect(canManageVisibility(assessorUser)).toBe(false);
  });
});
