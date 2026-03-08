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
        {/* Main Gallery Footer */}
        <Container className="py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-fg mb-3 font-serif">
                Art Gallery
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Curatorial protocol system for material sincerity assessment.
                Forensic-grade evaluation framework.
              </p>
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
                    Browse Collection
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
                <li>
                  <Link
                    href="/login?redirect=/portal"
                    className="text-xs text-muted/60 hover:text-muted transition-colors"
                  >
                    Staff Sign-In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6">
            <p className="text-[11px] text-muted leading-relaxed max-w-4xl">
              {DISCLAIMERS.global}
            </p>
          </div>
        </Container>

        {/* Family Strip — connects to main site */}
        <div className="border-t border-border bg-surface-alt">
          <Container className="py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Back to main */}
              <a
                href="https://bayviewhub.me"
                className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
              >
                ← Back to Bayview Hub
              </a>

              {/* Middle: Address + Hours */}
              <div className="text-xs text-muted text-center leading-relaxed">
                <p>365 Purves Road, Main Ridge, Victoria 3928</p>
                <p className="mt-1">Wed–Sun | 11 AM – Late · Closed Christmas Day</p>
              </div>

              {/* Right: Main site links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://bayviewhub.me/visit"
                  className="text-xs text-muted hover:text-fg transition-colors"
                >
                  Visit
                </a>
                <a
                  href="https://bayviewhub.me/events"
                  className="text-xs text-muted hover:text-fg transition-colors"
                >
                  What&apos;s On
                </a>
                <a
                  href="https://bayviewhub.me/partners"
                  className="text-xs text-muted hover:text-fg transition-colors"
                >
                  Partners
                </a>
              </div>
            </div>
          </Container>
        </div>

        {/* Bottom Legal + Acknowledgment */}
        <div className="border-t border-border bg-surface">
          <Container className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted/70">
              <p>
                © {new Date().getFullYear()} Bayview Hub ·{" "}
                <Link href="/privacy" className="hover:text-muted">Privacy</Link>
                {" · "}
                <Link href="/terms" className="hover:text-muted">Terms</Link>
              </p>
              <p className="text-center sm:text-right">
                We acknowledge the Bunurong and Boon Wurrung peoples as Traditional Custodians of this land.
              </p>
            </div>
          </Container>
        </div>
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
