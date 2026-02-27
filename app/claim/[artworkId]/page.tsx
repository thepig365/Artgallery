"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createOwnershipClaimSchema } from "@/lib/validation/schemas";

const RELATIONSHIPS = [
  { value: "ARTIST", label: "Artist (I created this work)" },
  { value: "OWNER", label: "Owner (I own this work)" },
  { value: "AGENT", label: "Authorized agent" },
  { value: "RIGHTS_HOLDER", label: "Rights holder" },
  { value: "OTHER", label: "Other" },
] as const;

export default function ClaimPage() {
  const { artworkId } = useParams<{ artworkId: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    claimantName: "",
    claimantEmail: "",
    relationshipToArtwork: "" as string,
    evidenceText: "",
    declarationAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/owner/status?artworkId=${artworkId}`)
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (!data.authenticated) {
          router.replace(`/login?redirect=/claim/${artworkId}`);
        }
      })
      .catch(() => setAuthenticated(false));
  }, [artworkId, router]);

  const handleSubmit = async () => {
    const validation = createOwnershipClaimSchema.safeParse({
      ...form,
      artworkId,
      declarationAccepted: form.declarationAccepted || undefined,
    });

    if (!validation.success) {
      const errs: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const key = String(issue.path[0] ?? "_root");
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const res = await fetch("/api/owner/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Failed (${res.status})`);
      }

      setSubmitState("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed"
      );
      setSubmitState("error");
    }
  };

  if (authenticated === null) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-sm text-gallery-muted animate-pulse">Loading…</p>
      </div>
    );
  }

  if (submitState === "success") {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-10">
          <div className="w-12 h-12 rounded-full bg-gallery-accent/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle
              className="w-6 h-6 text-gallery-accent"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-xl font-bold text-gallery-text mb-3">
            Claim Submitted
          </h1>
          <p className="text-sm text-gallery-muted leading-relaxed max-w-md mx-auto">
            Your ownership claim has been submitted for review. No changes have
            been made to the artwork listing yet.
          </p>
          <div className="mt-6">
            <Link
              href="/archive"
              className="inline-flex items-center gap-1.5 text-sm text-gallery-accent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back to Archive
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/archive"
        className="inline-flex items-center gap-1.5 text-sm text-gallery-muted hover:text-gallery-accent transition-colors duration-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to Archive
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield
            className="w-5 h-5 text-gallery-accent"
            strokeWidth={1.5}
          />
          <h1 className="text-2xl font-bold text-gallery-text tracking-tight">
            Claim Artwork Ownership
          </h1>
        </div>
        <p className="text-sm text-gallery-muted leading-relaxed">
          Submit a verified ownership claim for this artwork. Claims are
          reviewed by an administrator before granting management access.
        </p>
      </div>

      {submitState === "error" && submitError && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Claimant Details
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="claimantName"
                className="block text-sm font-medium text-gallery-text mb-1"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="claimantName"
                value={form.claimantName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, claimantName: e.target.value }))
                }
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${errors.claimantName ? "border-red-400" : "border-gallery-border"}`}
                placeholder="Your legal name"
              />
              {errors.claimantName && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.claimantName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="claimantEmail"
                className="block text-sm font-medium text-gallery-text mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="claimantEmail"
                type="email"
                value={form.claimantEmail}
                onChange={(e) =>
                  setForm((p) => ({ ...p, claimantEmail: e.target.value }))
                }
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${errors.claimantEmail ? "border-red-400" : "border-gallery-border"}`}
                placeholder="your@email.com"
              />
              {errors.claimantEmail && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.claimantEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Relationship & Evidence
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="relationship"
                className="block text-sm font-medium text-gallery-text mb-1"
              >
                Relationship to Artwork{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="relationship"
                value={form.relationshipToArtwork}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    relationshipToArtwork: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${errors.relationshipToArtwork ? "border-red-400" : "border-gallery-border"}`}
              >
                <option value="">Select relationship…</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.relationshipToArtwork && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.relationshipToArtwork}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="evidenceText"
                className="block text-sm font-medium text-gallery-text mb-1"
              >
                Evidence of Ownership{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="evidenceText"
                value={form.evidenceText}
                onChange={(e) =>
                  setForm((p) => ({ ...p, evidenceText: e.target.value }))
                }
                rows={4}
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors resize-y ${errors.evidenceText ? "border-red-400" : "border-gallery-border"}`}
                placeholder="Describe your relationship to this artwork and provide evidence of ownership (e.g., purchase records, exhibition history, creation documentation)…"
              />
              {errors.evidenceText && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.evidenceText}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <div
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() =>
              setForm((p) => ({
                ...p,
                declarationAccepted: !p.declarationAccepted,
              }))
            }
            role="checkbox"
            aria-checked={form.declarationAccepted}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setForm((p) => ({
                  ...p,
                  declarationAccepted: !p.declarationAccepted,
                }));
              }
            }}
          >
            <div
              className={`w-5 h-5 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center rounded transition-colors duration-200 ${form.declarationAccepted ? "border-gallery-accent bg-gallery-accent" : "border-gallery-border group-hover:border-gallery-muted"} ${errors.declarationAccepted ? "border-red-400" : ""}`}
            >
              {form.declarationAccepted && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gallery-text leading-relaxed">
              I declare that the information provided is accurate, and I have a
              legitimate ownership or rights-holder relationship with this
              artwork. I understand that false claims may result in account
              suspension.
            </p>
          </div>
          {errors.declarationAccepted && (
            <p className="text-red-600 text-xs mt-2 ml-8">
              {errors.declarationAccepted}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitState === "submitting" || !form.declarationAccepted}
          className="px-6 py-3 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitState === "submitting" ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </span>
          ) : (
            "Submit Ownership Claim"
          )}
        </button>
      </div>
    </div>
  );
}
