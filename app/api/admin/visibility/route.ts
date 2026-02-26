import { NextRequest, NextResponse } from "next/server";
import { toggleVisibilitySchema } from "@/lib/validation/schemas";
import {
  toggleArtworkVisibility,
  VisibilityError,
} from "@/lib/services/artwork-visibility";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";

/**
 * POST /api/admin/visibility
 *
 * Admin-only endpoint. Toggles artwork visibility with provenance logging.
 * Requires authenticated ADMIN user (fail-closed when auth is not configured).
 *
 * Request body: { artworkId, isVisible, reason?, actorId }
 * The actorId from the body is overridden by the authenticated user's ID
 * when auth is active (defense against spoofing).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await resolveSessionUser();
    requireRole(user, "ADMIN");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = toggleVisibilitySchema.safeParse({
      ...(body as Record<string, unknown>),
      actorId: user!.id,
    });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: validation.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 422 }
      );
    }

    const { artwork } = await toggleArtworkVisibility(validation.data);

    return NextResponse.json(
      {
        id: artwork.id,
        isVisible: artwork.isVisible,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json(
        { error: err.message },
        { status: 401 }
      );
    }

    if (err instanceof VisibilityError) {
      return NextResponse.json(
        { error: err.message },
        { status: 422 }
      );
    }

    console.error("[POST /api/admin/visibility] Unexpected error:", err);
    return NextResponse.json(
      { error: "Service unavailable — database or auth may not be configured" },
      { status: 503 }
    );
  }
}
