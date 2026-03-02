"use client";

import { usePathname } from "next/navigation";

const GALLERY_ROUTES = ["/", "/archive", "/masterpieces", "/takedown", "/rights", "/submit", "/privacy", "/terms", "/portal", "/protocol", "/claim", "/login"];

export function useZone(): "gallery" | "noir" {
  const pathname = usePathname();
  if (pathname === "/") return "gallery";
  return GALLERY_ROUTES.some(
    (route) => route !== "/" && pathname.startsWith(route)
  )
    ? "gallery"
    : "noir";
}
