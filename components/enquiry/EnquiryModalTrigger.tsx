"use client";

import { useState } from "react";

type CtaType = "enquire" | "viewing" | "price";

interface EnquiryModalTriggerProps {
  ctaType: CtaType;
  label: string;
  artworkId?: string | null;
  artworkSlug?: string | null;
  artworkTitle: string;
  compact?: boolean;
}

const CTA_LABELS: Record<CtaType, string> = {
  enquire: "Enquire",
  viewing: "Book a Viewing",
  price: "Request Price & Availability",
};

export function EnquiryModalTrigger({
  ctaType,
  label,
  artworkId,
  artworkSlug,
  artworkTitle,
  compact = false,
}: EnquiryModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function getSourceUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "", // honeypot
  });

  function openModal() {
    const currentSourceUrl = getSourceUrl();
    fetch("/api/enquiry/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "CLICK",
        ctaType,
        artworkId: artworkId ?? null,
        artworkSlug: artworkSlug ?? null,
        sourceUrl: currentSourceUrl || null,
      }),
    }).catch(() => {
      // best-effort event logging
    });

    const defaultMessage = [
      `CTA: ${CTA_LABELS[ctaType]}`,
      `Artwork: ${artworkTitle}`,
      artworkSlug ? `Slug: ${artworkSlug}` : "",
      currentSourceUrl ? `Page: ${currentSourceUrl}` : "",
      "",
      "Message:",
    ]
      .filter(Boolean)
      .join("\n");

    setForm((prev) => ({
      ...prev,
      message: prev.message.trim() ? prev.message : defaultMessage,
    }));
    setError(null);
    setDone(false);
    setOpen(true);
  }

  async function submit() {
    const currentSourceUrl = getSourceUrl();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in name, email, and message.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          message: form.message.trim(),
          ctaType,
          artworkId: artworkId ?? null,
          artworkSlug: artworkSlug ?? null,
          sourceUrl: currentSourceUrl,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? `Submit failed (${res.status})`);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal();
        }}
        aria-label={`${label} for ${artworkTitle}`}
        className={
          compact
            ? "px-2.5 py-1 text-[11px] font-medium border border-gallery-border rounded-md text-gallery-muted hover:text-gallery-text hover:border-gallery-accent transition-colors"
            : "inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-gallery-border rounded-lg text-gallery-text hover:border-gallery-accent hover:text-gallery-accent transition-colors"
        }
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl bg-gallery-surface border border-gallery-border rounded-xl p-5 sm:p-6">
            {!done ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gallery-text">
                      {CTA_LABELS[ctaType]}
                    </h3>
                    <p className="text-xs text-gallery-muted mt-1">{artworkTitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-gallery-muted hover:text-gallery-text"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Name *"
                    className="w-full px-3 py-2.5 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="Email *"
                    type="email"
                    className="w-full px-3 py-2.5 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="Phone (optional)"
                    className="w-full px-3 py-2.5 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                    rows={6}
                    placeholder="Message *"
                    className="w-full px-3 py-2.5 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
                  />
                  <input
                    value={form.website}
                    onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />
                </div>

                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-sm border border-gallery-border rounded-lg text-gallery-muted hover:text-gallery-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="px-4 py-2 text-sm bg-gallery-accent text-white rounded-lg hover:bg-gallery-accent-hover disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gallery-text mb-2">
                  Enquiry sent
                </h3>
                <p className="text-sm text-gallery-muted">
                  We will respond within 1–2 business days.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 px-4 py-2 text-sm border border-gallery-border rounded-lg text-gallery-text hover:border-gallery-accent"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
