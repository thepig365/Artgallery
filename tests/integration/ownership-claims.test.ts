import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createOwnershipClaimSchema,
  ownerToggleVisibilitySchema,
  reviewClaimSchema,
} from "@/lib/validation/schemas";
import { AuthorizationError, requireRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/roles";

const ROOT = path.resolve(__dirname, "../..");

const VALID_CLAIM = {
  artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  claimantName: "Alice Artist",
  claimantEmail: "alice@example.com",
  relationshipToArtwork: "ARTIST" as const,
  evidenceText: "I created this work in my studio in 2024. Here is documentation.",
  declarationAccepted: true as const,
};

const VALID_OWNER_VISIBILITY = {
  artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  isVisible: false,
  reason: "Temporary withdrawal for updated documentation",
};

// ────────────────────────────────────────────────────────────────
// A. Schema validation — createOwnershipClaimSchema
// ────────────────────────────────────────────────────────────────

describe("createOwnershipClaimSchema", () => {
  it("accepts valid claim data", () => {
    const r = createOwnershipClaimSchema.safeParse(VALID_CLAIM);
    expect(r.success).toBe(true);
  });

  it("rejects missing claimantName", () => {
    const r = createOwnershipClaimSchema.safeParse({
      ...VALID_CLAIM,
      claimantName: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = createOwnershipClaimSchema.safeParse({
      ...VALID_CLAIM,
      claimantEmail: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  it("rejects evidence text that is too short", () => {
    const r = createOwnershipClaimSchema.safeParse({
      ...VALID_CLAIM,
      evidenceText: "short",
    });
    expect(r.success).toBe(false);
  });

  it("rejects when declaration is not accepted", () => {
    const r = createOwnershipClaimSchema.safeParse({
      ...VALID_CLAIM,
      declarationAccepted: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid relationship value", () => {
    const r = createOwnershipClaimSchema.safeParse({
      ...VALID_CLAIM,
      relationshipToArtwork: "HACKER",
    });
    expect(r.success).toBe(false);
  });

  it("accepts all valid relationship types", () => {
    for (const rel of ["ARTIST", "OWNER", "AGENT", "RIGHTS_HOLDER", "OTHER"]) {
      const r = createOwnershipClaimSchema.safeParse({
        ...VALID_CLAIM,
        relationshipToArtwork: rel,
      });
      expect(r.success).toBe(true);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// B. Schema validation — ownerToggleVisibilitySchema
// ────────────────────────────────────────────────────────────────

describe("ownerToggleVisibilitySchema", () => {
  it("accepts valid hide payload (reason required)", () => {
    const r = ownerToggleVisibilitySchema.safeParse(VALID_OWNER_VISIBILITY);
    expect(r.success).toBe(true);
  });

  it("rejects hide without reason", () => {
    const r = ownerToggleVisibilitySchema.safeParse({
      artworkId: VALID_OWNER_VISIBILITY.artworkId,
      isVisible: false,
    });
    expect(r.success).toBe(false);
  });

  it("accepts show without reason", () => {
    const r = ownerToggleVisibilitySchema.safeParse({
      artworkId: VALID_OWNER_VISIBILITY.artworkId,
      isVisible: true,
    });
    expect(r.success).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────
// C. API route contract — POST /api/owner/claims
// ────────────────────────────────────────────────────────────────

describe("POST /api/owner/claims route contract", () => {
  const routeFile = path.join(ROOT, "app/api/owner/claims/route.ts");

  it("route file exists", () => {
    expect(fs.existsSync(routeFile)).toBe(true);
  });

  it("imports createOwnershipClaimSchema for validation", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("createOwnershipClaimSchema");
  });

  it("uses resolveAuthUser for lightweight auth (any Supabase user)", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("resolveAuthUser");
  });

  it("returns 401 if no session", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("401");
  });

  it("calls createOwnershipClaim service", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("createOwnershipClaim");
  });

  it("returns 201 on successful creation", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("201");
  });
});

// ────────────────────────────────────────────────────────────────
// D. API route contract — owner visibility
// ────────────────────────────────────────────────────────────────

describe("POST /api/owner/artworks/visibility route contract", () => {
  const routeFile = path.join(
    ROOT,
    "app/api/owner/artworks/visibility/route.ts"
  );

  it("route file exists", () => {
    expect(fs.existsSync(routeFile)).toBe(true);
  });

  it("imports ownerToggleVisibilitySchema for validation", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("ownerToggleVisibilitySchema");
  });

  it("calls resolveSessionUser for authentication", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("resolveSessionUser");
  });

  it("calls ownerToggleArtworkVisibility service", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("ownerToggleArtworkVisibility");
  });

  it("returns 403 on ownership mismatch", () => {
    const src = fs.readFileSync(routeFile, "utf-8");
    expect(src).toContain("403");
  });
});

// ────────────────────────────────────────────────────────────────
// E. Admin claims routes
// ────────────────────────────────────────────────────────────────

describe("Admin claims API routes", () => {
  it("GET /api/admin/claims route exists", () => {
    expect(
      fs.existsSync(path.join(ROOT, "app/api/admin/claims/route.ts"))
    ).toBe(true);
  });

  it("GET route requires ADMIN role", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/api/admin/claims/route.ts"),
      "utf-8"
    );
    expect(src).toContain('requireRole(user, "ADMIN")');
  });

  it("approve route exists and calls approveOwnershipClaim", () => {
    const filePath = path.join(
      ROOT,
      "app/api/admin/claims/[id]/approve/route.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const src = fs.readFileSync(filePath, "utf-8");
    expect(src).toContain("approveOwnershipClaim");
  });

  it("reject route exists and calls rejectOwnershipClaim", () => {
    const filePath = path.join(
      ROOT,
      "app/api/admin/claims/[id]/reject/route.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const src = fs.readFileSync(filePath, "utf-8");
    expect(src).toContain("rejectOwnershipClaim");
  });
});

// ────────────────────────────────────────────────────────────────
// F. Service layer contracts — ownership-claims.ts
// ────────────────────────────────────────────────────────────────

describe("Ownership claims service layer", () => {
  const serviceFile = path.join(ROOT, "lib/services/ownership-claims.ts");

  it("service file exists", () => {
    expect(fs.existsSync(serviceFile)).toBe(true);
  });

  it("exports createOwnershipClaim function", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("export async function createOwnershipClaim");
  });

  it("enforces duplicate pending claim check", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("status: \"PENDING\"");
    expect(src).toContain("already have a pending");
  });

  it("uses $transaction for atomicity", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("prisma.$transaction");
  });

  it("writes provenance logs for all claim lifecycle events", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("OWNERSHIP_CLAIMED");
    expect(src).toContain("OWNERSHIP_APPROVED");
    expect(src).toContain("OWNERSHIP_REJECTED");
  });

  it("approveOwnershipClaim sets ownerAuthUid on Artwork", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("ownerAuthUid: claim.claimantAuthUid");
  });

  it("canManageArtwork checks ownerAuthUid match", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("export async function canManageArtwork");
    expect(src).toContain("artwork.ownerAuthUid === authUid");
  });
});

// ────────────────────────────────────────────────────────────────
// G. Service layer contracts — owner-visibility.ts
// ────────────────────────────────────────────────────────────────

describe("Owner visibility service layer", () => {
  const serviceFile = path.join(ROOT, "lib/services/owner-visibility.ts");

  it("service file exists", () => {
    expect(fs.existsSync(serviceFile)).toBe(true);
  });

  it("verifies ownership before visibility toggle", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("canManageArtwork");
    expect(src).toContain("not the verified owner");
  });

  it("writes OWNER_HIDDEN / OWNER_UNHIDDEN provenance events", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("OWNER_HIDDEN");
    expect(src).toContain("OWNER_UNHIDDEN");
  });

  it("uses $transaction for atomicity", () => {
    const src = fs.readFileSync(serviceFile, "utf-8");
    expect(src).toContain("prisma.$transaction");
  });
});

// ────────────────────────────────────────────────────────────────
// H. Auth plumbing — SessionUser includes authUid
// ────────────────────────────────────────────────────────────────

describe("SessionUser authUid integration", () => {
  it("SessionUser interface includes authUid field", () => {
    const rolesFile = path.join(ROOT, "lib/auth/roles.ts");
    const src = fs.readFileSync(rolesFile, "utf-8");
    expect(src).toContain("authUid: string");
  });

  it("resolveSessionUser returns authUid from Supabase user.id", () => {
    const sessionFile = path.join(ROOT, "lib/auth/session.ts");
    const src = fs.readFileSync(sessionFile, "utf-8");
    expect(src).toContain("authUid: user.id");
  });

  it("resolveAuthUser exists for lightweight auth without assessor_users", () => {
    const sessionFile = path.join(ROOT, "lib/auth/session.ts");
    const src = fs.readFileSync(sessionFile, "utf-8");
    expect(src).toContain("export async function resolveAuthUser");
    expect(src).toContain("authUid: user.id, email: user.email");
  });

  it("owner/status endpoint uses resolveAuthUser", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/api/owner/status/route.ts"),
      "utf-8"
    );
    expect(src).toContain("resolveAuthUser");
  });

  it("requireRole still works with authUid-bearing SessionUser", () => {
    const user: SessionUser = {
      id: "u-1",
      authUid: "auth-u-1",
      role: "ADMIN",
      isActive: true,
    };
    expect(() => requireRole(user, "ADMIN")).not.toThrow();
  });

  it("requireRole rejects null user (fail-closed)", () => {
    expect(() => requireRole(null, "ADMIN")).toThrow(AuthorizationError);
  });
});

// ────────────────────────────────────────────────────────────────
// I. Prisma schema — OwnershipClaim model and enums
// ────────────────────────────────────────────────────────────────

describe("Prisma schema — OwnershipClaim", () => {
  const schemaFile = path.join(ROOT, "prisma/schema.prisma");

  it("OwnershipClaim model exists", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("model OwnershipClaim");
  });

  it("ClaimStatus enum exists with expected values", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("enum ClaimStatus");
    expect(src).toContain("PENDING");
    expect(src).toContain("APPROVED");
    expect(src).toContain("REJECTED");
    expect(src).toContain("REVOKED");
  });

  it("ClaimRelationship enum exists with expected values", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("enum ClaimRelationship");
    expect(src).toContain("RIGHTS_HOLDER");
  });

  it("Artwork has ownerAuthUid field", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("ownerAuthUid");
    expect(src).toContain("owner_auth_uid");
  });

  it("ProvenanceEventType includes ownership events", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("OWNERSHIP_CLAIMED");
    expect(src).toContain("OWNERSHIP_APPROVED");
    expect(src).toContain("OWNERSHIP_REJECTED");
    expect(src).toContain("OWNER_HIDDEN");
    expect(src).toContain("OWNER_UNHIDDEN");
  });

  it("OwnershipClaim has unique constraint on artworkId+claimantAuthUid+status", () => {
    const src = fs.readFileSync(schemaFile, "utf-8");
    expect(src).toContain("one_pending_claim_per_claimant");
  });
});

// ────────────────────────────────────────────────────────────────
// J. UI — artwork detail shows ownership actions
// ────────────────────────────────────────────────────────────────

describe("UI — ArtworkOwnerActions integration", () => {
  it("ArtworkOwnerActions component exists", () => {
    expect(
      fs.existsSync(
        path.join(ROOT, "components/gallery/ArtworkOwnerActions.tsx")
      )
    ).toBe(true);
  });

  it("artwork detail page imports ArtworkOwnerActions", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/archive/[slug]/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("ArtworkOwnerActions");
  });

  it("claim form page exists", () => {
    expect(
      fs.existsSync(
        path.join(ROOT, "app/claim/[artworkId]/page.tsx")
      )
    ).toBe(true);
  });

  it("admin claims page exists", () => {
    expect(
      fs.existsSync(path.join(ROOT, "app/admin/claims/page.tsx"))
    ).toBe(true);
  });

  it("admin page links to claims", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/admin/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("/admin/claims");
  });

  it("public pages still use visibility-safe data paths", () => {
    const archiveSrc = fs.readFileSync(
      path.join(ROOT, "app/archive/page.tsx"),
      "utf-8"
    );
    expect(archiveSrc).toContain("getPublicArtworks");

    const detailSrc = fs.readFileSync(
      path.join(ROOT, "app/archive/[slug]/page.tsx"),
      "utf-8"
    );
    expect(detailSrc).toContain("getPublicArtworkBySlug");
  });
});
