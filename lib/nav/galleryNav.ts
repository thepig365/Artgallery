/**
 * Gallery nav items — single source of truth for SSR and client.
 * Always render all items; no filtering based on client-only state.
 */

export const GALLERY_NAV_ITEMS = [
  { label: "Archive", href: "/archive" },
  { label: "Submit Artwork", href: "/submit" },
  { label: "Assessment Protocol", href: "/protocol" },
  { label: "Rights & Licensing", href: "/rights" },
  { label: "Open Masterpieces", href: "/masterpieces" },
] as const;

export const GALLERY_ROUTES = [
  "/",
  "/archive",
  "/masterpieces",
  "/study",
  "/takedown",
  "/rights",
  "/submit",
  "/privacy",
  "/terms",
  "/portal",
  "/protocol",
  "/claim",
  "/login",
] as const;

export function isGalleryRoute(pathname: string): boolean {
  if (!pathname || pathname === "/") return true;
  return GALLERY_ROUTES.some(
    (route) => route !== "/" && pathname.startsWith(route)
  );
}

export const NOIR_NAV_ITEMS = [
  { label: "LABORATORY", href: "/laboratory/ui-preview" },
  { label: "PROTOCOL", href: "/protocol" },
  { label: "ARCHIVE", href: "/archive" },
] as const;
