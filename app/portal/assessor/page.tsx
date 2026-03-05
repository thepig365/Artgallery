import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { resolveAuthUser, resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { getAssignmentsForAssessor } from "@/lib/services/assessment-assignment";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { authDebug } from "@/lib/auth/debug";

export default async function AssessorPortalPage() {
  const authUser = await resolveAuthUser();
  let user = null;
  try {
    user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");
  } catch (err) {
    if (!authUser) {
      authDebug("portal_assessor_page", {
        decision: "redirect",
        reason: "no_auth_session",
        target: "/login?redirect=/portal/assessor",
      });
      redirect("/login?redirect=/portal/assessor");
    }

    if (err instanceof AuthorizationError) {
      authDebug("portal_assessor_page", {
        decision: "allow",
        reason: "authenticated_but_no_assessor_role",
        authUid: authUser.authUid,
      });
      return (
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
            Assessor Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-4">
            No Portal Access
          </h1>
          <p className="text-sm text-gallery-muted leading-relaxed mb-4 max-w-lg">
            Your account is authenticated but not assigned to the Assessor portal.
          </p>
          <p className="text-sm text-gallery-muted leading-relaxed mb-10 max-w-lg">
            For access requests, contact{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gallery-accent hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <div className="space-y-4">
            <Link
              href="/archive"
              className="block border border-gallery-border text-gallery-text text-sm font-medium rounded-lg px-6 py-4 hover:bg-gallery-surface-alt transition-colors duration-200 text-center"
            >
              Browse the Archive
            </Link>
          </div>
        </div>
      );
    }
    authDebug("portal_assessor_page", {
      decision: "redirect",
      reason: "unexpected_authorization_error",
      target: "/login?redirect=/portal/assessor",
    });
    redirect("/login?redirect=/portal/assessor");
  }

  let assignments: Awaited<ReturnType<typeof getAssignmentsForAssessor>> = [];
  let hasLoadError = false;
  try {
    assignments = await getAssignmentsForAssessor(user!.authUid!);
  } catch (error) {
    hasLoadError = true;
    console.error("[portal/assessor] Failed to load assignments", error);
  }

  if (hasLoadError) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
          Assessor Portal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-4">
          Portal Temporarily Unavailable
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed mb-4 max-w-lg">
          We could not load your assignments right now. Please retry in a moment.
        </p>
        <p className="text-sm text-gallery-muted leading-relaxed mb-10 max-w-lg">
          If this persists, contact{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-gallery-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <div className="space-y-4">
          <Link
            href="/portal/assessor"
            className="block border border-gallery-border text-gallery-text text-sm font-medium rounded-lg px-6 py-4 hover:bg-gallery-surface-alt transition-colors duration-200 text-center"
          >
            Retry
          </Link>
          <Link
            href="/archive"
            className="block border border-gallery-border text-gallery-text text-sm font-medium rounded-lg px-6 py-4 hover:bg-gallery-surface-alt transition-colors duration-200 text-center"
          >
            Browse the Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Assessor Portal
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-8">
        My Assignments
      </h1>

      {assignments.length === 0 ? (
        <div className="border border-gallery-border rounded-lg p-8 text-center">
          <p className="text-sm text-gallery-muted mb-4">
            No assignments are currently assigned to you.
          </p>
          <Link
            href="/archive"
            className="text-sm text-gallery-accent hover:underline"
          >
            Browse the Archive
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted mb-3">
            Active ({assignments.length})
          </h2>
          {assignments.map((a) => {
            const score = a.scores[0];
            return (
              <Link
                key={a.id}
                href={`/portal/assessor/review/${a.id}`}
                className="flex items-center gap-4 border border-gallery-border rounded-lg px-4 py-4 hover:bg-gallery-surface-alt transition-colors duration-200"
              >
                <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gallery-surface-alt">
                  {a.artwork.imageUrl ? (
                    <Image
                      src={a.artwork.imageUrl}
                      alt=""
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gallery-muted text-xs">
                      —
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gallery-text truncate">
                    {a.artwork.title}
                  </p>
                  <p className="text-xs text-gallery-muted mt-0.5">
                    Assigned {new Date(a.assignedAt).toLocaleDateString()}
                    {a.dueAt && (
                      <> · Due {new Date(a.dueAt).toLocaleDateString()}</>
                    )}
                  </p>
                  <p className="text-xs text-gallery-muted mt-0.5">
                    {score?.status === "SUBMITTED"
                      ? "Score submitted"
                      : score?.status === "DRAFT"
                        ? "Draft saved"
                        : "Awaiting your score"}
                  </p>
                </div>
                <span className="text-xs text-gallery-accent font-medium uppercase tracking-wide flex-shrink-0">
                  {a.status.replace("_", " ")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
