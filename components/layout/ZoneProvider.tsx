"use client";

import { usePathname } from "next/navigation";

/**
 * Routes that use the gallery (public-facing) design system.
 * Everything else defaults to the noir (forensic) design system.
 */
const GALLERY_ROUTES = ["/", "/archive", "/masterpieces", "/study", "/takedown", "/rights", "/submit", "/privacy", "/terms", "/portal", "/protocol", "/claim", "/login"];

function isGalleryRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return GALLERY_ROUTES.some(
    (route) => route !== "/" && pathname.startsWith(route)
  );
}

export function ZoneProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const zone = isGalleryRoute(pathname) ? "gallery" : "noir";

  return (
    <div
      className={zone === "gallery" ? "zone-gallery" : "zone-noir"}
      data-zone={zone}
    >
      {children}
    </div>
  );
}
