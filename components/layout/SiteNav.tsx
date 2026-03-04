"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useZone } from "./useZone";

const NOIR_NAV_ITEMS = [
  { label: "LABORATORY", href: "/laboratory/ui-preview" },
  { label: "PROTOCOL", href: "/protocol" },
  { label: "ARCHIVE", href: "/archive" },
] as const;

const GALLERY_NAV_ITEMS = [
  { label: "Archive", href: "/archive" },
  { label: "Protocol", href: "/protocol" },
  { label: "Submit for Curation", href: "/submit" },
  { label: "Rights & Takedown", href: "/rights" },
  { label: "Open Masterpieces", href: "/masterpieces" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const zone = useZone();

  if (zone === "gallery") {
    return (
      <nav aria-label="Main navigation" className="flex items-center gap-1">
        {GALLERY_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                px-3 py-2 text-sm font-medium rounded-md
                transition-colors duration-200
                ${
                  isActive
                    ? "text-gallery-accent bg-gallery-accent/10"
                    : "text-gallery-muted hover:text-gallery-text hover:bg-gallery-surface-alt"
                }
              `}
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
        const isActive = pathname.startsWith(
          item.href.split("/").slice(0, 2).join("/")
        );
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`
              px-4 py-4 text-xs font-medium tracking-widest uppercase
              border-l border-noir-border
              transition-colors duration-120
              focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
              ${
                isActive
                  ? "text-white bg-noir-surface"
                  : "text-noir-muted hover:text-noir-text hover:bg-noir-surface/50"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
