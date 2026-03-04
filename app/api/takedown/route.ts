import { NextRequest, NextResponse } from "next/server";
import { createTakedownRequestSchema } from "@/lib/validation/schemas";
import { createTakedownRequest, TakedownError } from "@/lib/services/takedown";
import { Prisma } from "@prisma/client";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Check which DB env vars are present (without exposing values)
function getPresentEnvKeys(): string[] {
  const keys = ["DATABASE_URL", "DIRECT_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];
  return keys.filter((k) => !!process.env[k]);
}

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
  // Pre-flight: check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("[POST /api/takedown] DATABASE_URL missing at runtime");
    return NextResponse.json(
      {
        error: "DATABASE_URL missing at runtime",
        presentEnvKeys: getPresentEnvKeys(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
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

    // Extract Prisma error code if available
    let prismaCode: string | undefined;
    let message = "Unknown error";
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      prismaCode = err.code;
      message = `Prisma error ${err.code}`;
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      prismaCode = "INIT_ERROR";
      message = "Database connection initialization failed";
    } else if (err instanceof Error) {
      message = err.message.slice(0, 100);
    }

    return NextResponse.json(
      {
        error: "DB connection/query failed",
        prismaCode,
        message,
        presentEnvKeys: getPresentEnvKeys(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
