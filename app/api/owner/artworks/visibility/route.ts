import { NextRequest, NextResponse } from "next/server";
import { ownerToggleVisibilitySchema } from "@/lib/validation/schemas";
import {
  ownerToggleArtworkVisibility,
  OwnerVisibilityError,
} from "@/lib/services/owner-visibility";
import { resolveSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = ownerToggleVisibilitySchema.safeParse(body);
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

    const artwork = await ownerToggleArtworkVisibility(
      validation.data,
      user.authUid,
      user.id
    );

    return NextResponse.json(
      { id: artwork.id, isVisible: artwork.isVisible },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof OwnerVisibilityError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[POST /api/owner/artworks/visibility]", err);
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 }
    );
  }
}
