import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveSessionUser } from "@/lib/auth/session";

export default async function PortalPage() {
  const user = await resolveSessionUser();

  if (!user) {
    redirect("/login?redirect=/portal");
  }

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin");
    }
    if (user.role === "ASSESSOR") {
      redirect("/portal/assessor");
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent mb-2">
        Portal
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gallery-text tracking-tight mb-4">
        Access restricted
      </h1>
      <p className="text-sm text-gallery-muted leading-relaxed mb-4 max-w-lg">
        Your account does not have an assigned portal role. If you believe
        this is an error, please contact the platform administrator.
      </p>
      <p className="text-sm text-gallery-muted leading-relaxed mb-10 max-w-lg">
        To request access or inquire about assessor onboarding, email{" "}
        <a
          href="mailto:admin@artprotocol.dev"
          className="text-gallery-accent hover:underline"
        >
          admin@artprotocol.dev
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
        <Link
          href="/login"
          className="block text-center text-sm text-gallery-muted hover:text-gallery-text transition-colors duration-200"
        >
          Sign in with a different account
        </Link>
      </div>
    </div>
  );
}
