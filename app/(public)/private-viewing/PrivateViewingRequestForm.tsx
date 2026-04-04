"use client";

import { useState } from "react";

type PrivateViewingRequestFormProps = {
  sourceUrl: string;
};

export function PrivateViewingRequestForm({
  sourceUrl,
}: PrivateViewingRequestFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    note: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function currentSourceUrl() {
    if (typeof window === "undefined") return sourceUrl;
    return window.location.href || sourceUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const message = form.note.trim().length
        ? form.note.trim()
        : "Private viewing request for the Bayview Arts Gallery collection.";

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: null,
          message,
          ctaType: "viewing",
          artworkId: null,
          artworkSlug: null,
          sourceUrl: currentSourceUrl(),
          website: form.website,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? `Submit failed (${res.status})`);
        return;
      }

      setDone(true);
      setForm({
        name: "",
        email: "",
        note: "",
        website: "",
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-gallery-border bg-gallery-surface-alt p-5 text-center">
        <p className="font-serif text-lg font-semibold text-gallery-text">
          Request submitted
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gallery-muted">
          We respond within 5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) =>
            setForm((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      <div>
        <label
          htmlFor="private-viewing-name"
          className="mb-2 block text-caption font-medium uppercase tracking-[0.16em] text-gallery-text"
        >
          Name
        </label>
        <input
          id="private-viewing-name"
          type="text"
          required
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          className="w-full border border-gallery-border bg-bg px-3 py-3 text-sm text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
        />
      </div>

      <div>
        <label
          htmlFor="private-viewing-email"
          className="mb-2 block text-caption font-medium uppercase tracking-[0.16em] text-gallery-text"
        >
          Email
        </label>
        <input
          id="private-viewing-email"
          type="email"
          required
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          className="w-full border border-gallery-border bg-bg px-3 py-3 text-sm text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
        />
      </div>

      <div>
        <label
          htmlFor="private-viewing-note"
          className="mb-2 block text-caption font-medium uppercase tracking-[0.16em] text-gallery-text"
        >
          Brief note about your interest
        </label>
        <textarea
          id="private-viewing-note"
          rows={5}
          placeholder="Tell us what draws you to the collection, or leave this blank."
          value={form.note}
          onChange={(event) =>
            setForm((current) => ({ ...current, note: event.target.value }))
          }
          className="w-full border border-gallery-border bg-bg px-3 py-3 text-sm leading-relaxed text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:border-gallery-accent"
        />
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center border border-gallery-border bg-family-navy px-5 py-3 text-caption font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-family-navy/90 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit request"}
      </button>

      <p className="text-center text-micro leading-relaxed text-gallery-muted">
        We respond within 5 business days.
      </p>
    </form>
  );
}
