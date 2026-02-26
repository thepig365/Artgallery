"use client";

import Link from "next/link";
import { SiteNav } from "./SiteNav";
import { useZone } from "./useZone";

export function SiteHeader() {
  const zone = useZone();

  if (zone === "gallery") {
    return (
      <header className="border-b border-gallery-border bg-gallery-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-gallery-text text-base font-semibold tracking-tight hover:text-gallery-accent transition-colors duration-200"
            >
              Art Valuation Protocol
            </Link>
            <SiteNav />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-noir-border bg-noir-bg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-noir-text text-sm font-medium tracking-forensic uppercase hover:text-white transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-2"
          >
            ART VALUATION PROTOCOL
          </Link>
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
