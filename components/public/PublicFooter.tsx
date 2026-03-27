"use client";

import Link from "next/link";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { FAMILY_STRIP, MAIN_SITE_URL } from "@/lib/brand";
import { Container } from "@/components/layout/Container";

// ── Open Your Wall footer CTA ────────────────────────────────────
function OpenWallCTA() {
  return (
    <div className="mb-10 border border-white/15 p-5 sm:p-6">
      <p className="mb-2 text-caption font-medium uppercase tracking-[0.2em] text-family-accent">
        Bayview Hub · Private Viewing Network
      </p>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/open-your-wall"
            className="font-serif text-lg font-semibold text-white transition-colors hover:text-family-accent"
          >
            Open Your Private Wall →
          </Link>
          <p className="mt-1 text-caption text-white/50">
            For artists, collectors, private hosts, and invited viewers
          </p>
        </div>
      </div>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto bg-family-navy text-white">
      <Container className="py-12 md:py-14">
        <OpenWallCTA />
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
            <h4 className="mb-3 text-caption font-semibold uppercase tracking-[0.16em] text-white">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/archive" className="text-helper text-white/70 transition-colors hover:text-white">
                  Collection
                </Link>
              </li>
              <li>
                <Link href="/masterpieces" className="text-helper text-white/70 transition-colors hover:text-white">
                  Open Masterpieces
                </Link>
              </li>
              <li>
                <Link href="/study" className="text-helper text-white/70 transition-colors hover:text-white">
                  Study Guides
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-helper text-white/70 transition-colors hover:text-white">
                  Submit for Curation
                </Link>
              </li>
              <li>
                <Link href="/passport" className="text-helper text-white/70 transition-colors hover:text-white">
                  Artwork Passport
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-caption font-semibold uppercase tracking-[0.16em] text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-helper text-white/70 transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-helper text-white/70 transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/rights" className="text-helper text-white/70 transition-colors hover:text-white">
                  Rights &amp; Takedown
                </Link>
              </li>
              <li>
                <Link
                  href="/login?redirect=/portal"
                  className="text-caption text-white/45 transition-colors hover:text-white/70"
                >
                  Staff Sign-In
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6">
          <p className="max-w-4xl text-micro leading-relaxed text-white/55">
            {DISCLAIMERS.global}
          </p>
        </div>
      </Container>

      <div className="border-t border-white/15 bg-family-navy-deep">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <a
              href={MAIN_SITE_URL}
              className="whitespace-nowrap text-helper font-medium text-white transition-colors hover:text-family-accent"
            >
              ← Back to Bayview Hub
            </a>
            <div className="text-center text-helper leading-relaxed text-white/70">
              <p>{FAMILY_STRIP.address}</p>
              <p className="mt-1">{FAMILY_STRIP.hours}</p>
            </div>
            <div className="flex items-center gap-4">
              {FAMILY_STRIP.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-caption uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
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
          <div className="flex flex-col items-center justify-between gap-3 text-micro text-white/55 sm:flex-row">
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
