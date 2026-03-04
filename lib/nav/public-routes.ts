const PUBLIC_PREFIXES = [
  "/",
  "/archive",
  "/masterpieces",
  "/study",
  "/submit",
  "/protocol",
  "/rights",
  "/takedown",
  "/privacy",
  "/terms",
  "/claim",
  "/login",
] as const;

export function isPublicRoute(pathname: string): boolean {
  if (!pathname || pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (route) => route !== "/" && pathname.startsWith(route)
  );
}
