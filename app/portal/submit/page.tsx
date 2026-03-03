import { redirect } from "next/navigation";
import { resolveSessionUser } from "@/lib/auth/session";
import ArtistSubmitClient from "./ArtistSubmitClient";

export default async function PortalSubmitPage() {
  const user = await resolveSessionUser();
  if (!user) {
    redirect("/login?redirect=/portal/submit");
  }
  if (user.role !== "ADMIN" && user.role !== "ASSESSOR") {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-sm text-gallery-muted">Access denied. Administrator or Assessor role required.</p>
      </div>
    );
  }
  return <ArtistSubmitClient />;
}
