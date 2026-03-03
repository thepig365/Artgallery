import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { CONTACT_EMAIL } from "@/lib/site-config";

/**
 * /assessor — Public entry for assessors.
 * - Not logged in → redirect to /login?redirect=/portal/assessor
 * - Logged in + assessor → redirect to /portal/assessor
 * - Logged in + not assessor → show "Access restricted" + contact + link to /archive
 */
export default async function AssessorEntryPage() {
  const user = await resolveSessionUser();

  if (!user) {
    redirect("/login?redirect=/portal/assessor");
  }

  if (hasRole(user, "ASSESSOR")) {
    redirect("/portal/assessor");
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-md mx-auto border border-gallery-border rounded-lg p-8 text-center">
        <h1 className="text-xl font-semibold text-gallery-text mb-3">
          Access Restricted
        </h1>
        <p className="text-sm text-gallery-muted mb-6">
          The Assessor Portal is for assigned assessors only. If you believe you
          should have access, please contact the administration team.
        </p>
        <p className="text-sm text-gallery-text mb-2">
          Contact:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-gallery-accent hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <Link
          href="/archive"
          className="inline-block mt-6 text-sm text-gallery-accent hover:underline font-medium"
        >
          Browse the Archive
        </Link>
      </div>
    </div>
  );
}
