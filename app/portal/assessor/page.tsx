import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveSessionUser } from "@/lib/auth/session";
import { requireRole, AuthorizationError } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/client";

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

  const sessions = await prisma.auditSession.findMany({
    where: { status: { in: ["IN_PROGRESS", "DRAFT"] } },
    include: {
      artwork: { select: { title: true, slug: true } },
      scores: {
        where: { assessorUserId: user!.id },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const completedSessions = await prisma.auditSession.findMany({
    where: { status: "COMPLETED" },
    include: {
      artwork: { select: { title: true, slug: true } },
      scores: {
        where: { assessorUserId: user!.id },
        select: { id: true, finalV: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Assessor Portal
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight mb-8">
        Your Sessions
      </h1>

      {sessions.length === 0 && completedSessions.length === 0 ? (
        <div className="border border-gallery-border rounded-lg p-8 text-center">
          <p className="text-sm text-gallery-muted mb-4">
            No assessment sessions are currently assigned.
          </p>
          <Link
            href="/archive"
            className="text-sm text-gallery-accent hover:underline"
          >
            Browse the Archive
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sessions.length > 0 && (
            <section>
              <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted mb-3">
                Active Sessions
              </h2>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/portal/assessor/session/${s.id}`}
                    className="flex items-center justify-between border border-gallery-border rounded-lg px-4 py-3 hover:bg-gallery-surface-alt transition-colors duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium text-gallery-text">
                        {s.artwork.title}
                      </p>
                      <p className="text-xs text-gallery-muted mt-0.5">
                        {s.scores.length > 0 ? "Score submitted" : "Awaiting your score"}
                      </p>
                    </div>
                    <span className="text-xs text-gallery-accent font-medium uppercase tracking-wide">
                      {s.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {completedSessions.length > 0 && (
            <section>
              <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted mb-3">
                Completed
              </h2>
              <div className="space-y-2">
                {completedSessions.map((s) => {
                  const myScore = s.scores[0];
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border border-gallery-border/50 rounded-lg px-4 py-3 opacity-70"
                    >
                      <div>
                        <p className="text-sm text-gallery-text">
                          {s.artwork.title}
                        </p>
                        {myScore && (
                          <p className="text-xs text-gallery-muted mt-0.5">
                            Your V: {myScore.finalV.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gallery-muted font-medium uppercase tracking-wide">
                        Finalized
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
