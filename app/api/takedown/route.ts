import { NextRequest, NextResponse } from "next/server";
import { createTakedownRequestSchema } from "@/lib/validation/schemas";
import { createTakedownRequest, TakedownError } from "@/lib/services/takedown";

/**
 * POST /api/takedown
 *
 * Public endpoint — no auth required (per RLS: takedown_requests_public_insert).
 * Validates input via Zod, delegates to createTakedownRequest() which
 * transactionally creates the request + provenance log entry.
 *
 * If DATABASE_URL is not configured, this will fail with a 503.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validation = createTakedownRequestSchema.safeParse(body);
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

  try {
    const { request: tkdRequest } = await createTakedownRequest(validation.data);

    return NextResponse.json(
      {
        referenceId: tkdRequest.id,
        status: tkdRequest.status,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof TakedownError) {
      return NextResponse.json(
        { error: err.message },
        { status: 422 }
      );
    }

    console.error("[POST /api/takedown] Unexpected error:", err);
    return NextResponse.json(
      { error: "Service unavailable — database may not be configured" },
      { status: 503 }
    );
  }
}
