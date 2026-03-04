"use client";

import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { FAMILY_STRIP, MAIN_SITE_URL } from "@/lib/brand";
import { Container } from "@/components/layout/Container";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <Container className="py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-fg mb-3 font-serif">
              Art Gallery
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Curatorial protocol system for material sincerity assessment.
              Enquiry-first viewing-room experience.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-fg mb-3 uppercase tracking-wide">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/archive" className="text-xs text-muted hover:text-fg transition-colors">
                  Archive
                </Link>
              </li>
              <li>
                <Link href="/masterpieces" className="text-xs text-muted hover:text-fg transition-colors">
                  Open Masterpieces
                </Link>
              </li>
              <li>
                <Link href="/study" className="text-xs text-muted hover:text-fg transition-colors">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-xs text-muted hover:text-fg transition-colors">
                  Submit for Curation
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
                <Link href="/privacy" className="text-xs text-muted hover:text-fg transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-muted hover:text-fg transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/rights" className="text-xs text-muted hover:text-fg transition-colors">
                  Rights &amp; Takedown
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

      <div className="border-t border-border bg-surface-alt">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <a
              href={MAIN_SITE_URL}
              className="text-sm font-medium text-accent hover:underline whitespace-nowrap"
            >
              ← Back to Bayview Hub
            </a>
            <div className="text-xs text-muted text-center leading-relaxed">
              <p>{FAMILY_STRIP.address}</p>
              <p className="mt-1">{FAMILY_STRIP.hours}</p>
            </div>
            <div className="flex items-center gap-4">
              {FAMILY_STRIP.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted hover:text-fg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <div className="border-t border-border bg-surface">
        <Container className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted/70">
            <p>
              © {new Date().getFullYear()} Bayview Hub ·{" "}
              <Link href="/privacy" className="hover:text-muted">
                Privacy
              </Link>
              {" · "}
              <Link href="/terms" className="hover:text-muted">
                Terms
              </Link>
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
