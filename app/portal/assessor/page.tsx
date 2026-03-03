import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { getAssignmentsForAssessor } from "@/lib/services/assessment-assignment";

export default async function AssessorPortalPage() {
  let user;
  try {
    user = await resolveSessionUser();
    requireRole(user, "ADMIN", "ASSESSOR");
  } catch (err) {
    if (err instanceof AuthorizationError) {
      redirect("/login?redirect=/portal/assessor");
    }
    redirect("/login?redirect=/portal/assessor");
  }

  const assignments = await getAssignmentsForAssessor(user!.authUid!);

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
