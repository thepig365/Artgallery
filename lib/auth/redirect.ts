const ALLOWED_REDIRECTS = [
  "/portal",
  "/portal/submit",
  "/portal/assessor",
  "/portal/admin",
  "/admin",
  "/admin/submissions",
  "/admin/claims",
  "/admin/enquiries",
  "/archive",
  "/takedown",
  "/protocol",
  "/submit",
  "/claim",
] as const;

export const DEFAULT_REDIRECT = "/portal";

export function safeRedirect(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//")) return DEFAULT_REDIRECT;

  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }

  const pathname = raw.split("?")[0].split("#")[0];
  if (pathname.startsWith("/login")) return DEFAULT_REDIRECT;

  if (
    ALLOWED_REDIRECTS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    )
  ) {
    return raw;
  }

  return DEFAULT_REDIRECT;
}
