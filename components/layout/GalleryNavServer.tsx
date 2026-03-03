import Link from "next/link";
import { headers } from "next/headers";
import {
  GALLERY_NAV_ITEMS,
  NOIR_NAV_ITEMS,
  isGalleryRoute,
} from "@/lib/nav/galleryNav";

/**
 * Server-rendered nav. Always outputs full link list for SSR (no client hooks).
 * Reads x-pathname from middleware for correct zone and active state.
 */
export function GalleryNavServer() {
  const pathname = headers().get("x-pathname") ?? "";
  const isGallery = isGalleryRoute(pathname);

  if (isGallery) {
    return (
      <nav aria-label="Main navigation" className="flex items-center gap-1">
        {GALLERY_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "px-3 py-2 text-sm font-medium rounded-md text-gallery-accent bg-gallery-accent/10"
                  : "px-3 py-2 text-sm font-medium rounded-md text-gallery-muted hover:text-gallery-text hover:bg-gallery-surface-alt transition-colors duration-200"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-0">
      {NOIR_NAV_ITEMS.map((item) => {
        const base = item.href.split("/").slice(0, 2).join("/");
        const isActive =
          pathname === item.href ||
          pathname.startsWith(base + "/") ||
          pathname === base;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "px-4 py-4 text-xs font-medium tracking-widest uppercase text-white bg-noir-surface border-l border-noir-border"
                : "px-4 py-4 text-xs font-medium tracking-widest uppercase text-noir-muted hover:text-noir-text hover:bg-noir-surface/50 border-l border-noir-border transition-colors duration-120"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
