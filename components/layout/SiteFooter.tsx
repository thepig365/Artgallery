"use client";

import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { useZone } from "./useZone";

export function SiteFooter() {
  const zone = useZone();

  if (zone === "gallery") {
    return (
      <footer className="border-t border-gallery-border bg-gallery-surface mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gallery-text mb-3">
                Art Valuation Protocol
              </h3>
              <p className="text-xs text-gallery-muted leading-relaxed">
                Curatorial protocol system for material sincerity assessment.
                Forensic-grade evaluation framework.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gallery-text mb-3 uppercase tracking-wide">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/archive"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Browse Archive
                  </Link>
                </li>
                <li>
                  <Link
                    href="/protocol"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Assessment Protocol
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/submit"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Submit Work
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gallery-text mb-3 uppercase tracking-wide">
                Legal & Access
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/takedown"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Takedown Request
                  </Link>
                </li>
                <li>
                  <Link
                    href="/protocol"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Scoring Methodology
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-xs text-gallery-muted hover:text-gallery-accent transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/masterpieces"
                    className="text-xs text-gallery-muted/50 hover:text-gallery-muted transition-colors"
                  >
                    Open Masterpieces
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal"
                    className="text-xs text-gallery-muted/50 hover:text-gallery-muted transition-colors"
                  >
                    Creator Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gallery-border pt-6">
            <p className="text-[11px] text-gallery-muted/70 leading-relaxed max-w-4xl">
              {DISCLAIMERS.global}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-noir-border bg-noir-bg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-noir-muted text-xs tracking-widest uppercase">
            Curatorial Protocol System v0.1
          </p>
          <p className="text-noir-muted text-xs">
            Material Sincerity Assessment Framework
          </p>
        </div>
        <p className="text-noir-muted/60 text-[10px] leading-relaxed mt-4 max-w-4xl">
          {DISCLAIMERS.global}
        </p>
      </div>
    </footer>
  );
}
