import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Panel } from "@/components/ui/Panel";
import { GALLERY_EMAIL } from "@/lib/brand";

const TITLE = "Open Your Private Wall | Bayview Hub Private Viewing Network";
const DESCRIPTION =
  "BayviewHub organises carefully curated viewing relationships around selected works held in private walls, studios, and lived spaces. Not public. Not open-access. By arrangement and by BayviewHub selection.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/open-your-wall" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/open-your-wall",
    siteName: "Bayview Hub Art Gallery",
    images: [{ url: "/images/bayview-estate-logo.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/bayview-estate-logo.jpg"],
  },
};

const VIEWING_HREF = `mailto:${GALLERY_EMAIL}?subject=${encodeURIComponent(
  "Viewing Access Request — Bayview Hub Private Viewing Network"
)}`;

// ── §2 Problem cards ─────────────────────────────────────────────
const PROBLEMS = [
  {
    n: "01",
    headline: "Works stay on private walls",
    body: "Many meaningful works live on private walls, in studios, and inside personal collections — rarely seen in the right context, by the right people.",
  },
  {
    n: "02",
    headline: "Selective sharing has no infrastructure",
    body: "Artists, collectors, and private hosts may want to share selected works, but not with open traffic, casual drop-ins, or public exposure.",
  },
  {
    n: "03",
    headline: "Serious viewers need a trusted way in",
    body: "Art lovers, collectors, and curators may want more contextual encounters with art — but they need a trusted intermediary, not an open door.",
  },
] as const;

// ── §4 How It Works steps ────────────────────────────────────────
const HOW_STEPS = [
  {
    n: "01",
    label: "Register a Work",
    body: "Submit your work through the Artwork Passport registration — title, artist, medium, dimensions, a short context note, and an image. No public listing. No exposure.",
  },
  {
    n: "02",
    label: "Receive a Preliminary Passport",
    body: "Your work receives a private digital record with a Passport ID and a QR code for selective sharing. This is not a certificate of provenance. It is the starting point of a curatorial relationship.",
  },
  {
    n: "03",
    label: "Share Selectively",
    body: "Use the QR code or private link to share this record with trusted contacts — potential buyers, curators, or invited viewers you choose. The record is not publicly indexed.",
  },
  {
    n: "04",
    label: "Express Interest in Bayview Consideration",
    body: "If you would like BayviewHub to consider this work for online curation or future in-person programming, you may express that interest directly. All consideration remains curatorial and discretionary.",
  },
] as const;

// ── §5 Audience cards ────────────────────────────────────────────
const AUDIENCES = [
  {
    label: "Artists",
    body: "You have work in your studio or private collection. You want it seen by the right people — on your terms, in your own time, without cold submission or public exposure. BayviewHub can organise a more considered path.",
  },
  {
    label: "Collectors",
    body: "You have acquired works you believe deserve a wider audience — within limits. You want to share selectively, without opening your home or disclosing your collection publicly. BayviewHub mediates every introduction.",
  },
  {
    label: "Private Hosts & Homeowners",
    body: "You live with meaningful works on your walls. You would like to share them with invited visitors — curators, serious buyers, or fellow collectors — through a framework that protects your privacy and maintains your control.",
  },
  {
    label: "Art Lovers & Invited Viewers",
    body: "You want more contextual encounters with art — beyond white cube formats, inside real lived spaces where works have real histories. You understand that access is selective and by arrangement.",
  },
] as const;

// ── §6 Rules ─────────────────────────────────────────────────────
const RULES = [
  "All visits are by arrangement with BayviewHub. No drop-ins.",
  "Host details — name, address, contact — are never publicly disclosed.",
  "BayviewHub mediates all introductions between hosts and viewers.",
  "Not every work submitted will enter wider curation or exhibition consideration.",
  "Not every viewer is suitable. Access is selective and by introduction only.",
  "Future in-person presentation remains selective and entirely discretionary.",
  "Registering a work does not guarantee exhibition, sale, or representation.",
  "BayviewHub retains discretion over all aspects of this programme.",
] as const;

// ── §7 Passport is / is not ──────────────────────────────────────
const PASSPORT_IS = [
  "A private record of a work, submitted by the host",
  "A controlled sharing object — not a public listing",
  "A starting point for a curatorial relationship with BayviewHub",
  "A document you can use beside the work for invited viewing",
] as const;

const PASSPORT_IS_NOT = [
  "A certificate of authenticity",
  "A provenance document",
  "A valuation or appraisal",
  "A gallery listing or public exhibition record",
] as const;

export default function OpenYourWallPage() {
  return (
    <div>
      {/* ── §1 Hero ─────────────────────────────────────────────────── */}
      <section className="bg-family-navy text-white">
        <Container className="py-24 sm:py-32">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
            Bayview Hub · Private Viewing Network
          </p>
          <h1 className="mb-6 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Open Your Private Wall to Selected Art Lovers
          </h1>
          <p className="mb-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            A BayviewHub initiative for artists, collectors, and private hosts
            who want to share selected works in a more intimate, curated, and
            carefully mediated way.
          </p>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-white/50">
            Not public. Not open-access. Not a marketplace. By request, by
            introduction, and by BayviewHub selection.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/passport/register"
              className="inline-flex items-center justify-center bg-white px-6 py-3 text-sm font-medium text-family-navy transition-colors hover:bg-white/90"
            >
              Register a Work →
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              How It Works ↓
            </a>
          </div>
        </Container>
      </section>

      {/* ── §2 Why This Exists ──────────────────────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            Why This Exists
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            Some works are rarely seen in the right context.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div
                key={p.n}
                className="border border-gallery-border p-5 sm:p-6"
              >
                <h3 className="mb-2.5 text-sm font-medium text-gallery-text">
                  {p.headline}
                </h3>
                <p className="text-sm leading-relaxed text-gallery-muted">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── §3 Why BayviewHub ───────────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Mediated Layer
          </p>
          <blockquote className="mb-8 max-w-2xl border-l-2 border-gallery-accent pl-6 font-serif text-lg font-medium leading-snug text-gallery-text sm:text-xl md:text-2xl">
            We do not open private walls to the public. We organise carefully
            curated viewing relationships around selected works.
          </blockquote>
          <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-gallery-muted">
            <p>
              BayviewHub becomes the trusted layer between work, space, host,
              and viewer. Every introduction is mediated. Every visit is by
              arrangement. Every host&apos;s contact details remain entirely
              private.
            </p>
            <p>
              This is not an open-access service, and it is not a marketplace.
              It is a carefully organised network — selective by design,
              relationship-led by principle.
            </p>
          </div>
        </Container>
      </section>

      {/* ── §4 How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Process
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            Four steps. All of them private.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step) => (
              <Panel key={step.n}>
                <p className="mb-3 font-mono text-xs text-gallery-accent">
                  {step.n}
                </p>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gallery-text">
                  {step.label}
                </h3>
                <p className="text-sm leading-relaxed text-gallery-muted">
                  {step.body}
                </p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      {/* ── §5 Who It Is For ────────────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Participants
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            This programme is for people who take art seriously.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {AUDIENCES.map((a) => (
              <div
                key={a.label}
                className="border border-gallery-border bg-gallery-surface p-5 sm:p-6"
              >
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gallery-text">
                  {a.label}
                </h3>
                <p className="text-sm leading-relaxed text-gallery-muted">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── §6 The Rules ────────────────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-family-navy text-white">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
            The Rules
          </p>
          <h2 className="mb-4 font-serif text-2xl font-semibold sm:text-3xl">
            This is a programme with rules.
          </h2>
          <p className="mb-8 max-w-lg text-sm leading-relaxed text-white/60">
            We ask that you read them carefully before registering.
          </p>
          <ul className="mb-8 max-w-2xl space-y-4 border-l-2 border-white/20 pl-6">
            {RULES.map((rule) => (
              <li key={rule} className="text-sm leading-relaxed text-white/75">
                — {rule}
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-sm leading-relaxed text-white/50 italic">
            These rules are what allow the programme to remain selective,
            private, and workable for everyone involved.
          </p>
        </Container>
      </section>

      {/* ── §7 The Preliminary Passport ─────────────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Record Layer
          </p>
          <h2 className="mb-4 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            The Preliminary Passport is the record beneath the relationship.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-gallery-muted">
            When you register a work through this programme, you receive a
            Preliminary Passport — a private digital record generated from the
            information you submit as host. It contains artwork details, a
            Passport ID, and a QR code for controlled, selective sharing.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-gallery-border p-5 sm:p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gallery-accent">
                What it is
              </p>
              <ul className="space-y-3">
                {PASSPORT_IS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gallery-accent" />
                    <span className="text-sm leading-relaxed text-gallery-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-gallery-border p-5 sm:p-6">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-gallery-muted">
                What it is not
              </p>
              <ul className="space-y-3">
                {PASSPORT_IS_NOT.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gallery-muted/40" />
                    <span className="text-sm leading-relaxed text-gallery-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-gallery-muted italic">
            The Preliminary Passport is intentionally modest: a private record
            for controlled sharing, not a certificate, valuation, or public
            listing.
          </p>
        </Container>
      </section>

      {/* ── §8 Why This Matters ─────────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            For Bayview Hub
          </p>
          <div className="max-w-2xl">
            <h2 className="mb-5 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
              This is our higher-quality intake path.
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gallery-muted">
              <p>
                Open Your Wall is not a submission portal. It is how BayviewHub
                discovers works that belong in more serious conversation — works
                with context, hosts who care about placement, and potential
                viewers who bring real interest rather than casual attention.
              </p>
              <p>
                Some registered works may later be considered for
                BayviewHub&apos;s online curation or future in-person
                programming. Many will simply remain private records used for
                more thoughtful sharing.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §9 Dual CTA ─────────────────────────────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-gallery-accent">
                For hosts &amp; artists
              </p>
              <h3 className="mb-3 font-serif text-xl font-semibold text-gallery-text">
                I want to register a work
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gallery-muted">
                For artists, collectors, and private hosts who want to create a
                Preliminary Passport for a selected work.
              </p>
              <Link
                href="/passport/register"
                className="inline-flex items-center justify-center bg-family-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-family-navy/90"
              >
                Register a Work →
              </Link>
            </div>
            <div className="border border-gallery-border bg-gallery-surface p-6 sm:p-8">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-gallery-accent">
                For viewers &amp; collectors
              </p>
              <h3 className="mb-3 font-serif text-xl font-semibold text-gallery-text">
                I want to request viewing access
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gallery-muted">
                For art lovers, collectors, and curators who would like to be
                considered for invited viewing introductions.
              </p>
              <a
                href={VIEWING_HREF}
                className="inline-flex items-center justify-center border border-gallery-border px-5 py-2.5 text-sm font-medium text-gallery-text transition-colors hover:bg-gallery-surface-alt"
              >
                Request Viewing Access →
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §10 Final Close ─────────────────────────────────────────── */}
      <section className="bg-family-navy text-white">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-5 font-serif text-2xl font-semibold sm:text-3xl">
              By arrangement. By introduction. By BayviewHub.
            </h2>
            <p className="mb-10 text-sm leading-relaxed text-white/60">
              If you have a work you would like to share more carefully, or
              would like to be considered for invited viewing introductions,
              enquiries are welcome.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/passport/register"
                className="inline-flex items-center justify-center bg-white px-6 py-3 text-sm font-medium text-family-navy transition-colors hover:bg-white/90"
              >
                Register a Work →
              </Link>
              <a
                href={VIEWING_HREF}
                className="inline-flex items-center justify-center border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Request Viewing Access
              </a>
            </div>
            <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-white/30">
              Bayview Hub · Private Viewing Network · By Arrangement Only
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
