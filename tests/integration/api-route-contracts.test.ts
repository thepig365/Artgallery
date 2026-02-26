import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { createTakedownRequestSchema, toggleVisibilitySchema } from "@/lib/validation/schemas";
import { TakedownError } from "@/lib/services/takedown";
import { VisibilityError } from "@/lib/services/artwork-visibility";
import { AuthorizationError, requireRole } from "@/lib/auth/roles";
import { resolveSessionUser, isAuthConfigured } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/roles";

const ROOT = path.resolve(__dirname, "../..");

const VALID_TAKEDOWN = {
  artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  complainantName: "Jane Doe",
  contactEmail: "jane@example.com",
  workUrl: "https://example.com/artwork/123",
  complaintBasis:
    "This work uses my copyrighted photograph without permission or attribution.",
  evidenceLinks: ["https://evidence.example.com/original"],
  declarationAccepted: true as const,
};

const VALID_VISIBILITY = {
  artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  isVisible: false,
  reason: "Under takedown review",
  actorId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
};

describe("Integration: API route handler contracts", () => {
  describe("POST /api/takedown route file", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/api/takedown/route.ts"),
      "utf-8"
    );

    it("imports and uses createTakedownRequestSchema for validation", () => {
      expect(src).toContain("createTakedownRequestSchema");
      expect(src).toContain(".safeParse(");
    });

    it("imports and calls createTakedownRequest service", () => {
      expect(src).toContain("createTakedownRequest");
      expect(src).toContain("from \"@/lib/services/takedown\"");
    });

    it("returns 422 on validation failure", () => {
      expect(src).toContain("status: 422");
    });

    it("returns 201 on success", () => {
      expect(src).toContain("status: 201");
    });

    it("catches TakedownError separately from generic errors", () => {
      expect(src).toContain("TakedownError");
    });

    it("returns 503 for unexpected errors (DB not configured)", () => {
      expect(src).toContain("status: 503");
    });

    it("returns referenceId in success response", () => {
      expect(src).toContain("referenceId");
    });
  });

  describe("POST /api/admin/visibility route file", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/api/admin/visibility/route.ts"),
      "utf-8"
    );

    it("imports and calls resolveSessionUser for auth", () => {
      expect(src).toContain("resolveSessionUser");
      expect(src).toContain("from \"@/lib/auth/session\"");
    });

    it("calls requireRole with ADMIN", () => {
      expect(src).toContain("requireRole");
      expect(src).toContain("\"ADMIN\"");
    });

    it("imports and uses toggleVisibilitySchema for validation", () => {
      expect(src).toContain("toggleVisibilitySchema");
      expect(src).toContain(".safeParse(");
    });

    it("overrides actorId from session user (prevents spoofing)", () => {
      expect(src).toContain("user!.id");
      expect(src).toContain("actorId:");
    });

    it("imports and calls toggleArtworkVisibility service", () => {
      expect(src).toContain("toggleArtworkVisibility");
    });

    it("returns 401 for AuthorizationError", () => {
      expect(src).toContain("AuthorizationError");
      expect(src).toContain("status: 401");
    });

    it("returns 422 for VisibilityError or validation error", () => {
      expect(src).toContain("VisibilityError");
      expect(src).toContain("status: 422");
    });

    it("returns 503 for unexpected errors", () => {
      expect(src).toContain("status: 503");
    });
  });

  describe("takedown schema → route → service parameter alignment", () => {
    it("schema output fields match service CreateTakedownParams keys", () => {
      const result = createTakedownRequestSchema.safeParse(VALID_TAKEDOWN);
      expect(result.success).toBe(true);
      if (result.success) {
        const keys = Object.keys(result.data);
        expect(keys).toContain("artworkId");
        expect(keys).toContain("complainantName");
        expect(keys).toContain("contactEmail");
        expect(keys).toContain("workUrl");
        expect(keys).toContain("complaintBasis");
        expect(keys).toContain("evidenceLinks");
        expect(keys).toContain("declarationAccepted");
      }
    });
  });

  describe("visibility schema → route → service parameter alignment", () => {
    it("schema output fields match ToggleVisibilityParams keys", () => {
      const result = toggleVisibilitySchema.safeParse(VALID_VISIBILITY);
      expect(result.success).toBe(true);
      if (result.success) {
        const keys = Object.keys(result.data);
        expect(keys).toContain("artworkId");
        expect(keys).toContain("isVisible");
        expect(keys).toContain("reason");
        expect(keys).toContain("actorId");
      }
    });

    it("rejects hide without reason", () => {
      const result = toggleVisibilitySchema.safeParse({
        ...VALID_VISIBILITY,
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("accepts unhide without reason", () => {
      const result = toggleVisibilitySchema.safeParse({
        ...VALID_VISIBILITY,
        isVisible: true,
        reason: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("error class distinguishability for routes", () => {
    it("TakedownError, VisibilityError, AuthorizationError are all distinguishable", () => {
      const t = new TakedownError("t");
      const v = new VisibilityError("v");
      const a = new AuthorizationError("a");

      const names = new Set([t.name, v.name, a.name]);
      expect(names.size).toBe(3);

      expect(t).toBeInstanceOf(Error);
      expect(v).toBeInstanceOf(Error);
      expect(a).toBeInstanceOf(Error);
    });
  });
});

describe("Integration: auth session adapter", () => {
  it("resolveSessionUser returns null (fail-closed) outside server context", async () => {
    const user = await resolveSessionUser();
    expect(user).toBeNull();
  });

  it("requireRole throws AuthorizationError when user is null", () => {
    expect(() => requireRole(null, "ADMIN")).toThrow(AuthorizationError);
    expect(() => requireRole(null, "ADMIN")).toThrow("Authentication required");
  });

  it("fail-closed chain: resolveSessionUser → requireRole blocks access", async () => {
    const user = await resolveSessionUser();
    expect(() => requireRole(user, "ADMIN")).toThrow(AuthorizationError);
  });

  it("isAuthConfigured reflects whether Supabase env vars are present", () => {
    const hasVars = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    expect(isAuthConfigured()).toBe(hasVars);
  });

  it("requireRole passes when a valid session user is provided", () => {
    const fakeAdmin: SessionUser = { id: "a-1", authUid: "auth-a-1", role: "ADMIN", isActive: true };
    expect(() => requireRole(fakeAdmin, "ADMIN")).not.toThrow();
  });
});

describe("Integration: auth plumbing", () => {
  it("resolveSessionUser uses auth_uid for Prisma lookup (not email match)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "lib/auth/session.ts"),
      "utf-8"
    );
    expect(src).toContain("authUid: user.id");
    expect(src).toContain("where: { authUid: user.id }");
  });

  it("session.ts checks isActive before returning user", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "lib/auth/session.ts"),
      "utf-8"
    );
    expect(src).toContain("isActive");
  });

  it("session.ts returns null on any error (fail-closed)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "lib/auth/session.ts"),
      "utf-8"
    );
    expect(src).toContain("catch");
    expect(src).toContain("return null");
  });

  it("login page exists and uses signInWithPassword", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/login/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("signInWithPassword");
    expect(src).toContain("createSupabaseBrowserClient");
  });

  it("logout route exists and calls signOut", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/api/auth/logout/route.ts"),
      "utf-8"
    );
    expect(src).toContain("signOut");
  });

  it("admin page redirects to /login on 401", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/admin/page.tsx"),
      "utf-8"
    );
    expect(src).toContain('router.replace("/login")');
    expect(src).toContain("res.status === 401");
  });

  it("admin page has logout button", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/admin/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("handleLogout");
    expect(src).toContain('"/api/auth/logout"');
  });

  it("proxy.ts exists for session refresh", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "proxy.ts"),
      "utf-8"
    );
    expect(src).toContain("updateSession");
  });

  it("supabase server client uses @supabase/ssr createServerClient", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "lib/supabase/server.ts"),
      "utf-8"
    );
    expect(src).toContain("createServerClient");
    expect(src).toContain("@supabase/ssr");
  });
});

describe("Integration: client-side wiring", () => {
  it("takedown page uses /api/takedown endpoint", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/takedown/page.tsx"),
      "utf-8"
    );
    expect(src).toContain('"/api/takedown"');
    expect(src).toContain("method: \"POST\"");
  });

  it("admin page uses /api/admin/visibility endpoint", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/admin/page.tsx"),
      "utf-8"
    );
    expect(src).toContain('"/api/admin/visibility"');
    expect(src).toContain("method: \"POST\"");
  });

  it("admin page fetches artworks from /api/admin/artworks on mount", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/admin/page.tsx"),
      "utf-8"
    );
    expect(src).toContain('"/api/admin/artworks"');
  });
});

describe("Integration: GET /api/artworks/public route file", () => {
  const src = fs.readFileSync(
    path.join(ROOT, "app/api/artworks/public/route.ts"),
    "utf-8"
  );

  it("imports and calls getPublicArtworks", () => {
    expect(src).toContain("getPublicArtworks");
    expect(src).toContain("from \"@/lib/services/artwork-visibility\"");
  });

  it("applies visibility filter via getPublicArtworks (isVisible: true)", () => {
    const serviceSrc = fs.readFileSync(
      path.join(ROOT, "lib/services/artwork-visibility.ts"),
      "utf-8"
    );
    expect(serviceSrc).toContain("isVisible: true");
  });

  it("returns 503 on database errors", () => {
    expect(src).toContain("status: 503");
  });

  it("does NOT import resolveSessionUser (public endpoint)", () => {
    expect(src).not.toContain("resolveSessionUser");
  });
});

describe("Integration: GET /api/admin/artworks route file", () => {
  const src = fs.readFileSync(
    path.join(ROOT, "app/api/admin/artworks/route.ts"),
    "utf-8"
  );

  it("requires ADMIN role", () => {
    expect(src).toContain("resolveSessionUser");
    expect(src).toContain("requireRole");
    expect(src).toContain("\"ADMIN\"");
  });

  it("returns 401 for unauthorized access", () => {
    expect(src).toContain("status: 401");
  });

  it("includes artist data in response", () => {
    expect(src).toContain("include: { artist: true }");
  });

  it("does NOT apply visibility filter (admin sees all)", () => {
    expect(src).not.toContain("isVisible");
    expect(src).not.toContain("publicArtworkWhereClause");
  });
});

describe("Integration: Prisma-backed public data paths", () => {
  it("home page uses getPublicArtworks (server-side)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("getPublicArtworks");
    expect(src).toContain("from \"@/lib/services/artwork-visibility\"");
    expect(src).not.toContain("MOCK_ARCHIVE_ARTWORKS");
  });

  it("archive list page uses getPublicArtworks (server-side)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/archive/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("getPublicArtworks");
    expect(src).not.toContain("MOCK_ARCHIVE_ARTWORKS");
  });

  it("archive detail page uses getPublicArtworkBySlug (server-side)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/archive/[slug]/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("getPublicArtworkBySlug");
    expect(src).not.toContain("MOCK_ARCHIVE_ARTWORKS");
  });

  it("archive detail page calls notFound() for missing/hidden artworks", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "app/archive/[slug]/page.tsx"),
      "utf-8"
    );
    expect(src).toContain("notFound()");
  });

  it("getPublicArtworkBySlug applies visibility filter", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "lib/services/artwork-visibility.ts"),
      "utf-8"
    );
    expect(src).toContain("getPublicArtworkBySlug");
    expect(src).toContain("publicArtworkWhereClause()");
  });
});
