"use client";

import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { useZone } from "./useZone";
import { Container } from "./Container";

export function SiteFooter() {
  const zone = useZone();

  if (zone === "gallery") {
    return (
      <footer className="border-t border-border bg-surface mt-auto">
        <Container className="py-10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-fg mb-3 font-serif">
                Bayview Hub Art Gallery
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Curatorial protocol system for material sincerity assessment.
                Forensic-grade evaluation framework.
              </p>
              <a
                href="https://bayviewhub.me"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                ← Back to Bayview Hub
              </a>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-fg mb-3 uppercase tracking-wide">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/archive"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Browse Archive
                  </Link>
                </li>
                <li>
                  <Link
                    href="/protocol"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Assessment Protocol
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Submit for Curation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/masterpieces"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Open Masterpieces
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-fg mb-3 uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rights"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Rights & Takedown
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-fg mb-3 uppercase tracking-wide">
                Staff
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login?redirect=/portal"
                    className="text-xs text-muted hover:text-fg transition-colors"
                  >
                    Staff Sign-In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 space-y-4">
            <p className="text-[11px] text-muted leading-relaxed max-w-4xl">
              {DISCLAIMERS.global}
            </p>
            <p className="text-[10px] text-muted/60 leading-relaxed">
              © {new Date().getFullYear()} Bayview Hub. We acknowledge the Bunurong and Boon Wurrung peoples
              as the Traditional Custodians of the land on which we operate.
            </p>
          </div>
        </Container>
      </footer>
    );
  }

  return (
    <footer className="border-t border-noir-border bg-noir-bg mt-auto">
      <Container className="py-6">
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
      </Container>
    </footer>
  );
}
