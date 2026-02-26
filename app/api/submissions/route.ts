import { NextRequest, NextResponse } from "next/server";
import { createArtistSubmissionSchema } from "@/lib/validation/schemas";
import { resolveAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUB-${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
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

    const validation = createArtistSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: validation.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const referenceId = generateReferenceId();

    const submission = await prisma.artistSubmission.create({
      data: {
        referenceId,
        submitterAuthUid: authUser.authUid,
        workTitle: data.workTitle,
        artistName: data.artistName ?? null,
        medium: data.medium ?? null,
        year: data.year ?? null,
        dimensions: data.dimensions ?? null,
        editionInfo: data.editionInfo ?? null,
        materials: data.materials,
        materialsOther: data.materialsOther ?? null,
        narrative: data.narrative ?? null,
        consentGiven: data.consentGiven,
        evidenceFiles:
          data.evidenceFiles.length > 0 ? data.evidenceFiles : undefined,
      },
    });

    return NextResponse.json(
      { ok: true, referenceId: submission.referenceId },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/submissions]", err);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
