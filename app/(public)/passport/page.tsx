import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Panel } from "@/components/ui/Panel";
import { GALLERY_EMAIL } from "@/lib/brand";

const TITLE = "Private Viewing Network & Artwork Passport | Bayview Hub";
const DESCRIPTION =
  "Open your private wall to selected art lovers. Bayview Hub's invitation-led programme for collectors and hosts — with Artwork Passport records and QR-linked documentation included.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/passport" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/passport",
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

const VIEWING_HREF = `mailto:${GALLERY_EMAIL}?subject=Private%20Viewing%20Access%20Request`;

// ── Section 2: audience cards ────────────────────────────────────
const AUDIENCES = [
  {
    label: "Hosts & Collectors",
    body: "Open selected works to the right visitors, on your terms. Bayview mediates introductions. Your address and contact details are never made public.",
  },
  {
    label: "Art Lovers & Invited Viewers",
    body: "Request access to selected works held in private spaces. Viewings are arranged through Bayview, subject to host approval and availability.",
  },
  {
    label: "Bayview",
    body: "Bayview curates the connections, maintains Artwork Passport records, and holds the relationship between hosts and viewers throughout.",
  },
] as const;

// ── Section 4: passport spec card ───────────────────────────────
const PASSPORT_ITEMS = [
  "Artwork title and attributed artist name",
  "Declared medium, dimensions, and year (where provided)",
  "Selected background notes — host-provided",
  "Artwork type: original, edition, print, or reproduction (as declared)",
  "Unique Passport ID",
  "QR code linked to this record",
  "Status: Preliminary — host-submitted, not yet reviewed by Bayview Hub",
] as const;

// ── Section 6: how it works steps ───────────────────────────────
const HOW_STEPS = [
  {
    n: "01",
    label: "Register",
    body: "Submit your host details and artwork information. No approval is required to generate a Preliminary Passport.",
  },
  {
    n: "02",
    label: "Receive Your Preliminary Passport",
    body: "Each submitted work receives a Preliminary Passport with a unique ID and QR code, generated immediately from the information you provide and clearly labelled as such.",
  },
  {
    n: "03",
    label: "Share Selectively",
    body: "Use the QR code to share a work's record with trusted contacts or gallery connections. The record is designed for selective sharing and is not indexed as a public gallery listing.",
  },
  {
    n: "04",
    label: "Bayview-Mediated Viewing",
    body: "If you choose to receive viewing requests, Bayview can facilitate introductions. Access is always by arrangement. Host approval is required before any viewing proceeds.",
  },
] as const;

// ── Section 7: who this is for ───────────────────────────────────
const WHO_CARDS = [
  {
    label: "Collectors & Private Owners",
    body: "Works held in private spaces — considered, well-placed, and worth sharing with the right people. You set the terms and retain full control over whether a viewing proceeds.",
  },
  {
    label: "Art Lovers & Interested Viewers",
    body: "Curious about works held outside public galleries? Viewing access can be requested through Bayview. Introductions are made at gallery discretion and subject to host availability.",
  },
  {
    label: "Artists & Estates",
    body: "Have work displayed or held privately? An Artwork Passport provides a structured starting record that can support future exhibition, curatorial reference, or collector conversation.",
  },
] as const;

// ── Section 8: trust points ──────────────────────────────────────
const TRUST_POINTS = [
  {
    heading: "Not open-access.",
    body: "The network cannot be joined, browsed, or searched without a Bayview introduction.",
  },
  {
    heading: "Not a marketplace.",
    body: "No works are listed for sale through this programme. No pricing is displayed or implied.",
  },
  {
    heading: "Not a home tour.",
    body: "Host addresses and contact details are never published or shared with viewers directly.",
  },
  {
    heading: "Not every host is visible.",
    body: "Hosts choose their own visibility preference. Some hosts and works may never be searchable except through direct gallery mediation.",
  },
  {
    heading: "All introductions remain mediated by Bayview Hub.",
    body: "Viewers and hosts are not connected directly at any point in this programme.",
  },
  {
    heading: "Not a verification service.",
    body: "Preliminary Passports are host-submitted records. They have not been reviewed, verified, or authenticated by Bayview Hub.",
  },
] as const;

export default function PassportPage() {
  return (
    <div>
      {/* ── §1 Hero ───────────────────────────────────────────────── */}
      <section className="bg-family-navy text-white">
        <Container className="py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
              Bayview Hub · Private Viewing Network
            </p>
            <h1 className="mb-5 font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Private Viewing Network & Artwork Passport
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              A BayviewHub programme for registering selected works,
              generating a Preliminary Passport, and enabling private viewing
              by request.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/passport/register"
                className="inline-flex items-center justify-center bg-white px-5 py-2.5 text-sm font-medium text-family-navy transition-colors hover:bg-white/90"
              >
                Register as a Host →
              </Link>
              <a
                href={VIEWING_HREF}
                className="inline-flex items-center justify-center border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Request Viewing Access
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §2 What This Is ──────────────────────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Programme
          </p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
                A different kind of art encounter
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-gallery-muted">
                <p>
                  The Bayview Private Viewing Network connects selected hosts
                  and collectors with invited art lovers for private viewings of
                  selected works. It is not a public browsing platform, not a
                  marketplace, and not an open-access service.
                </p>
                <p>
                  Bayview mediates every introduction. Hosts control their
                  availability and visibility. Viewers access spaces only by
                  arrangement — never by search, never without approval.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {AUDIENCES.map((a) => (
                <div
                  key={a.label}
                  className="border border-gallery-border bg-gallery-surface p-4 sm:p-5"
                >
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gallery-text">
                    {a.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-gallery-muted">
                    {a.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── §3 Why This Exists ───────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            Why Private Viewing
          </p>
          <div className="max-w-2xl">
            <h2 className="mb-5 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
              Not every meaningful encounter with art happens in a gallery
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-gallery-muted">
              <p>
                Some of the most affecting encounters with art happen in private
                spaces — a considered living room, a collector&apos;s study, a
                wall that has been lived with for years. The work has context.
                It means something to the person who chose it.
              </p>
              <p>
                The Private Viewing Network exists to make more of those
                encounters possible, for the right people, in a way that is
                quiet, contextual, and controlled — without exposing hosts to
                public attention or treating the works as inventory.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §4 How Artwork Passport Fits In ─────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            The Documentation Layer
          </p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
                Artwork Passport — a record layer for selected works
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-gallery-muted">
                <p>
                  If the Private Viewing Network is the relationship layer, the
                  Artwork Passport is the documentation layer underneath it.
                </p>
                <p>
                  An Artwork Passport is a Bayview-associated record that can
                  travel with a work — providing context, continuity, and a
                  structured point of reference for collectors, viewers, and the
                  gallery over time.
                </p>
                <p>
                  When a host registers through this programme, each submitted
                  work receives a{" "}
                  <strong className="text-gallery-text font-semibold">
                    Preliminary Passport
                  </strong>{" "}
                  immediately — generated from host-provided information and
                  clearly labelled as such. A Preliminary Passport is not a
                  reviewed or authenticated record. It is a structured starting
                  point that may be built on through future review.
                </p>
              </div>
            </div>
            <div>
              <div className="border border-accent/30 bg-surface p-5 sm:p-6">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
                  A Preliminary Passport may include
                </p>
                <ul className="space-y-3">
                  {PASSPORT_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-sm leading-relaxed text-gallery-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §5 Host Registration CTA ─────────────────────────────── */}
      <section className="bg-family-navy text-white">
        <Container className="py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
              Register as a Host
            </p>
            <h2 className="mb-4 font-serif text-2xl font-semibold sm:text-3xl">
              Open your wall. Your Preliminary Passport is generated on
              submission.
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              Registration takes around five minutes. You will need basic
              artwork details and a clear image of the work. No approval is
              required to generate a Preliminary Passport. Future viewing access
              and wider inclusion within the Bayview programme remain subject to
              gallery review.
            </p>
            <Link
              href="/passport/register"
              className="inline-flex items-center justify-center bg-white px-5 py-2.5 text-sm font-medium text-family-navy transition-colors hover:bg-white/90"
            >
              Register as a Host →
            </Link>
            <p className="mt-4 text-[11px] leading-relaxed text-white/40">
              Registration is subject to Bayview Hub review. Preliminary
              Passports are host-generated records and do not represent
              verification, authentication, or gallery endorsement.
            </p>
          </div>
        </Container>
      </section>

      {/* ── §6 How It Works ──────────────────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            Process
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            From registration to private viewing
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

      {/* ── §7 Who This Is For ───────────────────────────────────── */}
      <section className="border-b border-gallery-border">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            Audience
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            Selected for a reason
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {WHO_CARDS.map((card) => (
              <div
                key={card.label}
                className="border border-gallery-border p-5 sm:p-6"
              >
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gallery-text">
                  {card.label}
                </h3>
                <p className="text-sm leading-relaxed text-gallery-muted">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── §8 Trust / Privacy / Control ─────────────────────────── */}
      <section className="bg-family-navy text-white">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
            What This Is Not
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold sm:text-3xl">
            Privacy and host control are central to this programme
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((pt) => (
              <div
                key={pt.heading}
                className="border border-white/10 bg-white/5 p-4 sm:p-5"
              >
                <p className="mb-1.5 text-sm font-semibold text-white">
                  → {pt.heading}
                </p>
                <p className="text-sm leading-relaxed text-white/65">{pt.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── §9 Example Passport Preview ──────────────────────────── */}
      <section className="border-b border-gallery-border bg-gallery-surface-alt">
        <Container className="py-16 sm:py-20">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
            What a Record Looks Like
          </p>
          <h2 className="mb-10 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
            Example — Preliminary Passport
          </h2>
          <div className="mx-auto max-w-lg border border-gallery-border bg-gallery-surface p-6 sm:p-8">
            {/* Artwork image placeholder */}
            <div className="mb-6 flex aspect-[4/3] w-full items-center justify-center border border-gallery-border bg-gallery-surface-alt">
              <p className="text-[11px] uppercase tracking-widest text-gallery-muted">
                Artwork Image
              </p>
            </div>
            {/* Artwork metadata */}
            <div className="mb-5 space-y-1.5">
              <p className="font-serif text-lg font-semibold text-gallery-text">
                Untitled No. 3
              </p>
              <p className="text-sm text-gallery-muted">Artist Name</p>
              <p className="text-xs text-gallery-muted">
                Oil on linen · 90 × 120 cm · 2019
              </p>
              <p className="text-[11px] uppercase tracking-widest text-gallery-muted">
                Original
              </p>
            </div>
            {/* Host note */}
            <p className="mb-5 border-l-2 border-accent/40 pl-3 text-xs leading-relaxed text-gallery-muted italic">
              &ldquo;Acquired in Melbourne, 2020. Hung in the north-facing
              study.&rdquo;
            </p>
            <div className="border-t border-gallery-border pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                      Passport ID
                    </p>
                    <p className="font-mono text-xs text-gallery-text">
                      PP-20260323-XK7M2P
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gallery-muted">
                      Status
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gallery-muted">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                      Preliminary
                    </span>
                  </div>
                </div>
                {/* QR placeholder */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center border border-gallery-border bg-gallery-surface-alt">
                  <p className="text-[9px] uppercase tracking-widest text-gallery-muted">
                    QR
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-gallery-muted">
                This record was generated from information submitted by the
                host. It has not been reviewed, verified, or authenticated by
                Bayview Hub.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §10 Final CTA Strip ───────────────────────────────────── */}
      <section className="border-t border-gallery-border">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mb-3 font-serif text-2xl font-semibold text-gallery-text sm:text-3xl">
              Open your wall. Or request access.
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-gallery-muted">
              Both begin with a conversation with Bayview Hub.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/passport/register"
                className="inline-flex items-center justify-center bg-family-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-family-navy/90"
              >
                I Want to Open My Wall →
              </Link>
              <a
                href={VIEWING_HREF}
                className="inline-flex items-center justify-center border border-gallery-border px-5 py-2.5 text-sm font-medium text-gallery-text transition-colors hover:bg-gallery-surface-alt"
              >
                I Want to Request Access
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Programme Note ───────────────────────────────────────── */}
      <section className="border-t border-gallery-border bg-gallery-surface-alt">
        <Container className="py-8 sm:py-10">
          <div className="border border-accent/20 bg-accent/5 p-4 sm:p-5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gallery-accent">
              Programme Note
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-gallery-muted">
              The Artwork Passport and Private Viewing Network are being
              introduced at Bayview Hub for selected works and spaces. Not all
              works will be enrolled. Documentation content, access
              arrangements, and programme scope may change. Nothing here
              constitutes a guarantee of provenance verification,
              authentication, or valuation. Enquiries are welcome.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
