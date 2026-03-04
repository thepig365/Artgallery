import { redirect } from "next/navigation";
import { resolveSessionUser } from "@/lib/auth/session";

export default async function PortalClaimPage() {
  const user = await resolveSessionUser();
  if (!user) {
    redirect("/login?redirect=/portal/claim");
  }
  if (user.role === "ADMIN") {
    redirect("/admin/claims");
  }
  redirect("/portal");
}
