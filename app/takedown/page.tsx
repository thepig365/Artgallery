"use client";

import { useState, useCallback } from "react";
import { Shield, AlertTriangle, Plus, X, CheckCircle } from "lucide-react";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { createTakedownRequestSchema } from "@/lib/validation/schemas";

interface TakedownFormData {
  complainantName: string;
  contactEmail: string;
  artworkId: string;
  workUrl: string;
  complaintBasis: string;
  evidenceLinks: string[];
  declarationAccepted: boolean;
}

const INITIAL_FORM: TakedownFormData = {
  complainantName: "",
  contactEmail: "",
  artworkId: "",
  workUrl: "",
  complaintBasis: "",
  evidenceLinks: [],
  declarationAccepted: false,
};

export default function TakedownRequestPage() {
  const [form, setForm] = useState<TakedownFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState("");

  const updateField = useCallback(
    <K extends keyof TakedownFormData>(key: K, value: TakedownFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const addEvidenceLink = useCallback(() => {
    const trimmed = newLink.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      evidenceLinks: [...prev.evidenceLinks, trimmed],
    }));
    setNewLink("");
  }, [newLink]);

  const removeEvidenceLink = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      evidenceLinks: prev.evidenceLinks.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async () => {
    const validation = createTakedownRequestSchema.safeParse({
      ...form,
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

    try {
      const res = await fetch("/api/takedown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 422 && data?.issues) {
          const errs: Record<string, string> = {};
          for (const issue of data.issues as { path: string[]; message: string }[]) {
            const key = String(issue.path[0] ?? "_root");
            if (!errs[key]) errs[key] = issue.message;
          }
          setErrors(errs);
          setSubmitState("idle");
          return;
        }
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const result = await res.json();
      setReferenceId(result.referenceId ?? `TKD-${Date.now().toString(36).toUpperCase()}`);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  if (submitState === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-10">
          <div className="w-12 h-12 rounded-full bg-gallery-accent/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-gallery-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-gallery-text mb-3">
            Takedown Request Submitted
          </h1>
          <p className="text-sm text-gallery-muted leading-relaxed mb-4">
            Your request has been logged and will be reviewed by the protocol
            administration team. You will be contacted at the provided email
            address regarding the status of this request.
          </p>
          {referenceId && (
            <p className="text-xs text-gallery-muted font-medium uppercase tracking-wide mb-6">
              Reference: {referenceId}
            </p>
          )}
          <div className="border-t border-gallery-border pt-6 mt-6">
            <p className="text-[11px] text-gallery-muted/60 leading-relaxed text-left">
              {DISCLAIMERS.report}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gallery-text tracking-tight">
            Takedown Request
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-md border border-red-200">
            Legal
          </span>
        </div>
        <p className="text-sm text-gallery-muted leading-relaxed">
          Use this form to request the removal of content from the assessment
          archive. All requests are reviewed under the platform takedown
          protocol.
        </p>
      </div>

      {submitState === "error" && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm text-red-800 font-medium">
              Submission Failed
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              An error occurred while submitting your request. Please try again.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Complainant info */}
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Complainant Information
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="complainantName" className="block text-sm font-medium text-gallery-text mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="complainantName"
                value={form.complainantName}
                onChange={(e) => updateField("complainantName", e.target.value)}
                placeholder="Legal name of complainant"
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${
                  errors.complainantName ? "border-red-400" : "border-gallery-border"
                }`}
              />
              {errors.complainantName && (
                <p className="text-red-600 text-xs mt-1">{errors.complainantName}</p>
              )}
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gallery-text mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="name@example.com"
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${
                  errors.contactEmail ? "border-red-400" : "border-gallery-border"
                }`}
              />
              {errors.contactEmail && (
                <p className="text-red-600 text-xs mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Work identification */}
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Work Identification
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="artworkId" className="block text-sm font-medium text-gallery-text mb-1">
                Artwork ID <span className="text-red-500">*</span>
              </label>
              <input
                id="artworkId"
                value={form.artworkId}
                onChange={(e) => updateField("artworkId", e.target.value)}
                placeholder="e.g., AW-001 or UUID"
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${
                  errors.artworkId ? "border-red-400" : "border-gallery-border"
                }`}
              />
              {errors.artworkId && (
                <p className="text-red-600 text-xs mt-1">{errors.artworkId}</p>
              )}
            </div>
            <div>
              <label htmlFor="workUrl" className="block text-sm font-medium text-gallery-text mb-1">
                Work URL <span className="text-red-500">*</span>
              </label>
              <input
                id="workUrl"
                type="url"
                value={form.workUrl}
                onChange={(e) => updateField("workUrl", e.target.value)}
                placeholder="https://..."
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors ${
                  errors.workUrl ? "border-red-400" : "border-gallery-border"
                }`}
              />
              {errors.workUrl && (
                <p className="text-red-600 text-xs mt-1">{errors.workUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Complaint basis */}
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Complaint Basis
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="complaintBasis" className="block text-sm font-medium text-gallery-text mb-1">
                Basis for Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                id="complaintBasis"
                value={form.complaintBasis}
                onChange={(e) => updateField("complaintBasis", e.target.value)}
                placeholder="Describe the grounds for this takedown request in detail..."
                rows={5}
                className={`w-full px-3 py-2.5 text-sm bg-gallery-bg border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors resize-y ${
                  errors.complaintBasis ? "border-red-400" : "border-gallery-border"
                }`}
              />
              {errors.complaintBasis && (
                <p className="text-red-600 text-xs mt-1">{errors.complaintBasis}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gallery-text mb-1">
                Evidence Links (optional)
              </label>
              <div className="space-y-2">
                {form.evidenceLinks.map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gallery-surface-alt border border-gallery-border rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-gallery-text truncate flex-1">
                      {link}
                    </span>
                    <button
                      onClick={() => removeEvidenceLink(i)}
                      aria-label={`Remove link ${i + 1}`}
                      className="text-gallery-muted hover:text-red-500 transition-colors flex-shrink-0 p-0.5"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://evidence-url..."
                    className="flex-1 px-3 py-2.5 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEvidenceLink();
                      }
                    }}
                  />
                  <button
                    onClick={addEvidenceLink}
                    disabled={!newLink.trim()}
                    aria-label="Add evidence link"
                    className="p-2.5 border border-gallery-border rounded-lg text-gallery-muted hover:text-gallery-text hover:bg-gallery-surface-alt disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              {errors.evidenceLinks && (
                <p className="text-red-600 text-xs mt-1">{errors.evidenceLinks}</p>
              )}
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="bg-gallery-surface border border-gallery-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-gallery-text mb-4">
            Declaration
          </h2>

          <div className="bg-gallery-surface-alt border border-gallery-border rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield
                className="w-5 h-5 text-gallery-accent flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <p className="text-sm text-gallery-muted leading-relaxed">
                {DISCLAIMERS.takedownDeclaration}
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() =>
              updateField("declarationAccepted", !form.declarationAccepted)
            }
            role="checkbox"
            aria-checked={form.declarationAccepted}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                updateField(
                  "declarationAccepted",
                  !form.declarationAccepted
                );
              }
            }}
          >
            <div
              className={`
                w-5 h-5 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                rounded transition-colors duration-200
                ${form.declarationAccepted ? "border-gallery-accent bg-gallery-accent" : "border-gallery-border group-hover:border-gallery-muted"}
                ${errors.declarationAccepted ? "border-red-400" : ""}
              `}
            >
              {form.declarationAccepted && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-white"
                  aria-hidden="true"
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
            <p className="text-sm text-gallery-text group-hover:text-gallery-text/80 transition-colors">
              I confirm the above declaration is accurate and accept the terms.
            </p>
          </div>
          {errors.declarationAccepted && (
            <p className="text-red-600 text-xs mt-2 ml-8">
              {errors.declarationAccepted}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitState === "submitting" || !form.declarationAccepted}
          aria-busy={submitState === "submitting"}
          className="px-6 py-3 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitState === "submitting" ? (
            <span className="flex items-center gap-2">
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              Submitting...
            </span>
          ) : (
            "Submit Takedown Request"
          )}
        </button>
      </div>
    </div>
  );
}
