"use client";

import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { FAMILY_STRIP, MAIN_SITE_URL } from "@/lib/brand";
import { Container } from "@/components/layout/Container";

export function PublicFooter() {
  return (
    <footer className="mt-auto bg-family-navy text-white">
      <Container className="py-12 md:py-14">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-serif text-xl font-semibold text-white">
              Art Gallery
            </h3>
            <p className="text-sm leading-relaxed text-white/70">
              Curatorial protocol system for material sincerity assessment.
              Enquiry-first viewing-room experience.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/archive" className="text-sm text-white/70 transition-colors hover:text-white">
                  Archive
                </Link>
              </li>
              <li>
                <Link href="/masterpieces" className="text-sm text-white/70 transition-colors hover:text-white">
                  Open Masterpieces
                </Link>
              </li>
              <li>
                <Link href="/study" className="text-sm text-white/70 transition-colors hover:text-white">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-white/70 transition-colors hover:text-white">
                  Submit for Curation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-white/70 transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/70 transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/rights" className="text-sm text-white/70 transition-colors hover:text-white">
                  Rights &amp; Takedown
                </Link>
              </li>
              <li>
                <Link
                  href="/login?redirect=/portal"
                  className="text-xs text-white/45 transition-colors hover:text-white/70"
                >
                  Staff Sign-In
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6">
          <p className="max-w-4xl text-[11px] leading-relaxed text-white/55">
            {DISCLAIMERS.global}
          </p>
        </div>
      </Container>

      <div className="border-t border-white/15 bg-family-navy-deep">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <a
              href={MAIN_SITE_URL}
              className="whitespace-nowrap text-sm font-medium text-white transition-colors hover:text-family-accent"
            >
              ← Back to Bayview Hub
            </a>
            <div className="text-center text-xs leading-relaxed text-white/70">
              <p>{FAMILY_STRIP.address}</p>
              <p className="mt-1">{FAMILY_STRIP.hours}</p>
            </div>
            <div className="flex items-center gap-4">
              {FAMILY_STRIP.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <div className="border-t border-white/15 bg-family-navy">
        <Container className="py-4">
          <div className="flex flex-col items-center justify-between gap-3 text-[10px] text-white/55 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Bayview Hub ·{" "}
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              {" · "}
              <Link href="/terms" className="transition-colors hover:text-white">
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
