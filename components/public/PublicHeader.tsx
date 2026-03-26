"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { MAIN_SITE_URL } from "@/lib/brand";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";

const DESKTOP_NAV_ITEMS = [
  { label: "Collection",           href: "/archive" },
  { label: "Private Viewing",      href: "/open-your-wall" },
  { label: "Mend Index Protocol",  href: "/protocol" },
  { label: "Submit",               href: "/submit" },
] as const;

const MOBILE_NAV_ITEMS = [
  { label: "Collection",           href: "/archive" },
  { label: "Private Viewing",      href: "/open-your-wall" },
  { label: "Open Your Wall",       href: "/passport/register" },
  { label: "Artwork Passport",     href: "/passport" },
  { label: "Mend Index Protocol",  href: "/protocol" },
  { label: "Submit",               href: "/submit" },
] as const;

export function PublicHeader() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 border-b border-white/10 bg-family-navy text-white shadow-family">
      <Container>
        <div className="flex items-center justify-between h-24 md:h-28">
          <a
            href={MAIN_SITE_URL}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/images/bayview-estate-logo.jpg"
              alt="Bayview Hub Art Gallery"
              width={200}
              height={60}
              className="h-14 w-auto md:h-16"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl md:text-2xl font-serif font-semibold leading-tight text-white">
                Bayview Hub
              </span>
              <span className="text-xs tracking-[0.16em] uppercase text-white/70">
                Art Gallery
              </span>
            </div>
          </a>

          <div className="flex items-center gap-1 md:gap-1.5">
            <PublicThemeToggle />

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1.5 md:gap-2">
              {DESKTOP_NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "rounded-md bg-white/12 px-3 py-2 text-xs font-medium tracking-wide text-white md:text-sm"
                        : "rounded-md px-3 py-2 text-xs font-medium tracking-wide text-white/75 transition-colors duration-200 hover:bg-white/8 hover:text-white md:text-sm"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-md"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 z-50 border-t border-white/10"
          style={{ background: "var(--family-navy)" }}
        >
          <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "px-3 py-3 text-base font-medium rounded-md bg-white/12 text-white"
                      : "px-3 py-3 text-base font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
