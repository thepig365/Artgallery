"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

// ── Types ────────────────────────────────────────────────────────
type Step = "host" | "artwork" | "image" | "review";

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  path: string;
  name: string;
  preview: string;
  error: string;
}

interface FormState {
  // Step 1 — host
  hostName: string;
  hostEmail: string;
  hostMobile: string;
  hostRegion: string;
  hostType: string;
  visibilityPref: string;

  // Step 2 — artwork
  artworkTitle: string;
  artistName: string;
  artworkYear: string;
  medium: string;
  dimensions: string;
  ownershipStatus: string;
  artworkType: string;
  significance: string;
  viewingRequested: boolean;

  // Step 4 — confirmation
  disclaimerAccepted: boolean;
}

const INITIAL_FORM: FormState = {
  hostName: "",
  hostEmail: "",
  hostMobile: "",
  hostRegion: "",
  hostType: "",
  visibilityPref: "",
  artworkTitle: "",
  artistName: "",
  artworkYear: "",
  medium: "",
  dimensions: "",
  ownershipStatus: "",
  artworkType: "",
  significance: "",
  viewingRequested: false,
  disclaimerAccepted: false,
};

const INITIAL_UPLOAD: UploadState = {
  status: "idle",
  path: "",
  name: "",
  preview: "",
  error: "",
};

// ── Select options ───────────────────────────────────────────────
const HOST_TYPE_OPTIONS = [
  { value: "COLLECTOR",  label: "Collector" },
  { value: "HOMEOWNER",  label: "Homeowner" },
  { value: "STYLIST",    label: "Stylist" },
  { value: "DESIGNER",   label: "Designer / Interior designer" },
  { value: "OTHER",      label: "Other" },
];

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE_ONLY",    label: "Private only — not searchable" },
  { value: "BY_REQUEST",      label: "By request — viewable on enquiry" },
  { value: "BY_INTRODUCTION", label: "By introduction — via Bayview referral" },
  { value: "HIDDEN",          label: "Hidden — managed by Bayview only" },
];

const ARTWORK_TYPE_OPTIONS = [
  { value: "ORIGINAL",      label: "Original" },
  { value: "EDITION",       label: "Limited edition" },
  { value: "DIGITAL_PRINT", label: "Digital print / clear image" },
  { value: "REPRODUCTION",  label: "Reproduction" },
];

const STEPS: { id: Step; label: string }[] = [
  { id: "host",    label: "Your Details" },
  { id: "artwork", label: "Artwork Details" },
  { id: "image",   label: "Artwork Image" },
  { id: "review",  label: "Review & Submit" },
];

// ── Validation helpers ───────────────────────────────────────────
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function validateStep(step: Step, form: FormState, upload: UploadState): string[] {
  const errs: string[] = [];
  if (step === "host") {
    if (form.hostName.trim().length < 2)   errs.push("Full name is required (min 2 characters).");
    if (!isValidEmail(form.hostEmail))     errs.push("A valid email address is required.");
    if (form.hostMobile.trim().length < 6) errs.push("Mobile number is required.");
    if (form.hostRegion.trim().length < 2) errs.push("Suburb / region is required.");
    if (!form.hostType)                    errs.push("Host type is required.");
    if (!form.visibilityPref)              errs.push("Visibility preference is required.");
  }
  if (step === "artwork") {
    if (!form.artworkTitle.trim())         errs.push("Artwork title is required.");
    if (!form.artistName.trim())           errs.push("Artist name is required.");
    if (!form.medium.trim())               errs.push("Medium is required.");
    if (!form.dimensions.trim())           errs.push("Dimensions are required.");
    if (!form.ownershipStatus.trim())      errs.push("Ownership status is required.");
    if (!form.artworkType)                 errs.push("Artwork type is required.");
    if (form.significance.trim().length < 10)
      errs.push("Please add a brief note about this work (min 10 characters).");
  }
  if (step === "image") {
    if (upload.status !== "success")       errs.push("A main artwork image is required.");
  }
  if (step === "review") {
    if (!form.disclaimerAccepted)          errs.push("Please confirm the disclaimer to continue.");
  }
  return errs;
}

// ── Component ────────────────────────────────────────────────────
export function HostRegisterClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>("host");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [upload, setUpload] = useState<UploadState>(INITIAL_UPLOAD);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // ── Field helpers ──────────────────────────────────────────────
  const set = useCallback(
    (field: keyof FormState, value: string | boolean) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  // ── Step navigation ────────────────────────────────────────────
  function handleNext() {
    const errs = validateStep(currentStep, form, upload);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next.id);
  }

  function handleBack() {
    setStepErrors([]);
    const prev = STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev.id);
  }

  // ── Image upload ───────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation before hitting the server
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!ALLOWED.includes(file.type)) {
      setUpload((u) => ({
        ...u,
        status: "error",
        error: "Unsupported file type. Please use JPEG, PNG, WebP, or TIFF.",
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUpload((u) => ({
        ...u,
        status: "error",
        error: "File exceeds the 10 MB limit.",
      }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setUpload({ status: "uploading", path: "", name: file.name, preview, error: "" });

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", "main");

      const res = await fetch("/api/passport/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        setUpload((u) => ({
          ...u,
          status: "error",
          error: json.error ?? "Upload failed. Please try again.",
        }));
        return;
      }

      setUpload((u) => ({
        ...u,
        status: "success",
        path: json.path as string,
        error: "",
      }));
    } catch {
      setUpload((u) => ({
        ...u,
        status: "error",
        error: "Upload failed — please check your connection and try again.",
      }));
    }
  }

  // ── Final submit ───────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validateStep("review", form, upload);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        hostName:        form.hostName.trim(),
        hostEmail:       form.hostEmail.trim(),
        hostMobile:      form.hostMobile.trim(),
        hostRegion:      form.hostRegion.trim(),
        hostType:        form.hostType,
        visibilityPref:  form.visibilityPref,
        artworkTitle:    form.artworkTitle.trim(),
        artistName:      form.artistName.trim(),
        artworkYear:     form.artworkYear ? parseInt(form.artworkYear, 10) : null,
        medium:          form.medium.trim(),
        dimensions:      form.dimensions.trim(),
        ownershipStatus: form.ownershipStatus.trim(),
        artworkType:     form.artworkType,
        significance:    form.significance.trim(),
        viewingRequested: form.viewingRequested,
        mainImagePath:   upload.path,
      };

      const res = await fetch("/api/passport/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/passport/record/${json.shareToken}`);
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Step label lookup ──────────────────────────────────────────
  const artworkTypeLabel = ARTWORK_TYPE_OPTIONS.find(
    (o) => o.value === form.artworkType
  )?.label ?? form.artworkType;
  const visibilityLabel = VISIBILITY_OPTIONS.find(
    (o) => o.value === form.visibilityPref
  )?.label ?? form.visibilityPref;
  const hostTypeLabel = HOST_TYPE_OPTIONS.find(
    (o) => o.value === form.hostType
  )?.label ?? form.hostType;

  return (
    <div className="min-h-screen bg-gallery-bg">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b border-gallery-border bg-family-navy">
        <Container className="py-8 sm:py-10">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-family-accent">
            Bayview Hub · Private Viewing Network
          </p>
          <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            Register as a Host
          </h1>
        </Container>
      </div>

      {/* ── Step indicator ──────────────────────────────────────── */}
      <div className="border-b border-gallery-border bg-gallery-surface">
        <Container className="py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const done    = i < stepIndex;
              const active  = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center text-[10px] font-semibold ${
                        active
                          ? "bg-family-navy text-white"
                          : done
                          ? "bg-accent text-white"
                          : "border border-gallery-border text-gallery-muted"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={`hidden text-xs sm:block ${
                        active
                          ? "font-semibold text-gallery-text"
                          : "text-gallery-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mx-3 h-px w-6 bg-gallery-border sm:w-10" />
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </div>

      {/* ── Form content ────────────────────────────────────────── */}
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl">

          {/* ── Validation errors ───────────────────────────────── */}
          {stepErrors.length > 0 && (
            <div className="mb-6 border border-red-200 bg-red-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-700">
                Please correct the following
              </p>
              <ul className="space-y-1">
                {stepErrors.map((e) => (
                  <li key={e} className="text-sm text-red-600">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Step 1: Host Details ─────────────────────────────── */}
          {currentStep === "host" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-gallery-text">
                  Your Details
                </h2>
                <p className="mt-1 text-sm text-gallery-muted">
                  Your contact information is kept private and is never shared
                  with viewers or published in any public record.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hostName" required>Full Name</Label>
                  <Input
                    id="hostName"
                    value={form.hostName}
                    onChange={(e) => set("hostName", e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="hostEmail" required>Email Address</Label>
                  <Input
                    id="hostEmail"
                    type="email"
                    value={form.hostEmail}
                    onChange={(e) => set("hostEmail", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="hostMobile" required>Mobile Number</Label>
                  <Input
                    id="hostMobile"
                    type="tel"
                    value={form.hostMobile}
                    onChange={(e) => set("hostMobile", e.target.value)}
                    placeholder="+61 4xx xxx xxx"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="hostRegion" required>Suburb / Region</Label>
                  <Input
                    id="hostRegion"
                    value={form.hostRegion}
                    onChange={(e) => set("hostRegion", e.target.value)}
                    placeholder="e.g. South Yarra, VIC"
                  />
                  <p className="mt-1 text-[11px] text-gallery-muted">
                    Suburb and state only — no full address is collected or published.
                  </p>
                </div>
                <div>
                  <Label htmlFor="hostType" required>I am a</Label>
                  <Select
                    id="hostType"
                    value={form.hostType}
                    onChange={(e) => set("hostType", e.target.value)}
                    options={HOST_TYPE_OPTIONS}
                    placeholder="Select host type"
                  />
                </div>
                <div>
                  <Label htmlFor="visibilityPref" required>Visibility Preference</Label>
                  <Select
                    id="visibilityPref"
                    value={form.visibilityPref}
                    onChange={(e) => set("visibilityPref", e.target.value)}
                    options={VISIBILITY_OPTIONS}
                    placeholder="Select preference"
                  />
                  <p className="mt-1 text-[11px] text-gallery-muted">
                    This controls how Bayview may present your interest in the
                    programme. It can be changed later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Artwork Details ──────────────────────────── */}
          {currentStep === "artwork" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-gallery-text">
                  Artwork Details
                </h2>
                <p className="mt-1 text-sm text-gallery-muted">
                  This information will appear on the Preliminary Passport record.
                  Provide details as accurately as you can — they can be updated
                  through the gallery if needed.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="artworkTitle" required>Artwork Title</Label>
                  <Input
                    id="artworkTitle"
                    value={form.artworkTitle}
                    onChange={(e) => set("artworkTitle", e.target.value)}
                    placeholder="e.g. Untitled No. 3"
                  />
                </div>
                <div>
                  <Label htmlFor="artistName" required>Artist Name</Label>
                  <Input
                    id="artistName"
                    value={form.artistName}
                    onChange={(e) => set("artistName", e.target.value)}
                    placeholder="Artist's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="artworkYear">Year (optional)</Label>
                  <Input
                    id="artworkYear"
                    type="number"
                    value={form.artworkYear}
                    onChange={(e) => set("artworkYear", e.target.value)}
                    placeholder="e.g. 2019"
                    min={1000}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <Label htmlFor="medium" required>Medium</Label>
                  <Input
                    id="medium"
                    value={form.medium}
                    onChange={(e) => set("medium", e.target.value)}
                    placeholder="e.g. Oil on linen"
                  />
                </div>
                <div>
                  <Label htmlFor="dimensions" required>Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={form.dimensions}
                    onChange={(e) => set("dimensions", e.target.value)}
                    placeholder="e.g. 90 × 120 cm"
                  />
                </div>
                <div>
                  <Label htmlFor="ownershipStatus" required>Ownership Status</Label>
                  <Input
                    id="ownershipStatus"
                    value={form.ownershipStatus}
                    onChange={(e) => set("ownershipStatus", e.target.value)}
                    placeholder="e.g. Purchased 2018, gift from artist, inherited"
                  />
                </div>
                <div>
                  <Label htmlFor="artworkType" required>Artwork Type</Label>
                  <Select
                    id="artworkType"
                    value={form.artworkType}
                    onChange={(e) => set("artworkType", e.target.value)}
                    options={ARTWORK_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                </div>
                <div>
                  <Label htmlFor="significance" required>
                    Background Note
                  </Label>
                  <Textarea
                    id="significance"
                    value={form.significance}
                    onChange={(e) => set("significance", e.target.value)}
                    placeholder="A brief note about this work — where it came from, why it is held, what it means to you."
                    className="min-h-[120px]"
                  />
                  <p className="mt-1 text-[11px] text-gallery-muted">
                    This note will appear on the Preliminary Passport as a
                    host-provided background note.
                  </p>
                </div>
                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.viewingRequested}
                      onChange={(e) => set("viewingRequested", e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-accent"
                    />
                    <span className="text-sm leading-relaxed text-gallery-muted">
                      I am interested in receiving private viewing requests for
                      this work through Bayview Hub (subject to gallery
                      approval and my availability).
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Artwork Image ────────────────────────────── */}
          {currentStep === "image" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-gallery-text">
                  Artwork Image
                </h2>
                <p className="mt-1 text-sm text-gallery-muted">
                  Upload a clear image of the work. This is required to generate
                  the Preliminary Passport. Images are stored privately and are
                  not publicly accessible.
                </p>
              </div>

              {/* Upload area */}
              <div
                className="cursor-pointer border border-dashed border-gallery-border bg-gallery-surface p-8 text-center transition-colors hover:bg-gallery-surface-alt"
                onClick={() => fileInputRef.current?.click()}
              >
                {upload.status === "success" && upload.preview ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upload.preview}
                      alt="Artwork preview"
                      className="mx-auto max-h-48 max-w-full object-contain"
                    />
                    <p className="text-xs text-gallery-accent">
                      ✓ {upload.name} uploaded
                    </p>
                    <p className="text-[11px] text-gallery-muted">
                      Click to replace
                    </p>
                  </div>
                ) : upload.status === "uploading" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gallery-muted">Uploading…</p>
                    <p className="text-xs text-gallery-muted">{upload.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center border border-gallery-border">
                      <svg
                        className="h-5 w-5 text-gallery-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gallery-muted">
                      Click to select an image
                    </p>
                    <p className="text-[11px] text-gallery-muted">
                      JPEG, PNG, WebP or TIFF · Max 10 MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/tiff"
                className="hidden"
                onChange={handleFileChange}
              />

              {upload.status === "error" && (
                <p className="text-sm text-red-600">{upload.error}</p>
              )}

              <div className="border border-accent/20 bg-accent/5 p-3">
                <p className="text-[11px] leading-relaxed text-gallery-muted">
                  Images are stored in a private storage bucket and are only
                  accessible via time-limited signed links generated when the
                  record page is viewed. They are not indexed or publicly listed.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Confirm ─────────────────────────── */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-semibold text-gallery-text">
                  Review & Confirm
                </h2>
                <p className="mt-1 text-sm text-gallery-muted">
                  Review your submission before generating the Preliminary
                  Passport. Once submitted, contact the gallery to make changes.
                </p>
              </div>

              {/* Summary panels */}
              <div className="space-y-4">
                <div className="border border-gallery-border p-4 sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gallery-accent">
                    Your Details
                  </p>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Name</dt>
                      <dd className="text-gallery-text">{form.hostName}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Email</dt>
                      <dd className="text-gallery-text">{form.hostEmail}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Mobile</dt>
                      <dd className="text-gallery-text">{form.hostMobile}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Region</dt>
                      <dd className="text-gallery-text">{form.hostRegion}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Host type</dt>
                      <dd className="text-gallery-text">{hostTypeLabel}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Visibility</dt>
                      <dd className="text-gallery-text">{visibilityLabel}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-gallery-border p-4 sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gallery-accent">
                    Artwork
                  </p>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Title</dt>
                      <dd className="text-gallery-text">{form.artworkTitle}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Artist</dt>
                      <dd className="text-gallery-text">{form.artistName}</dd>
                    </div>
                    {form.artworkYear && (
                      <div className="flex gap-2">
                        <dt className="w-28 flex-shrink-0 text-gallery-muted">Year</dt>
                        <dd className="text-gallery-text">{form.artworkYear}</dd>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Medium</dt>
                      <dd className="text-gallery-text">{form.medium}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Dimensions</dt>
                      <dd className="text-gallery-text">{form.dimensions}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Ownership</dt>
                      <dd className="text-gallery-text">{form.ownershipStatus}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Type</dt>
                      <dd className="text-gallery-text">{artworkTypeLabel}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-28 flex-shrink-0 text-gallery-muted">Viewing</dt>
                      <dd className="text-gallery-text">
                        {form.viewingRequested ? "Requested" : "Not requested"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 border-t border-gallery-border pt-3">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gallery-muted">
                      Background note
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gallery-text">
                      {form.significance}
                    </p>
                  </div>
                </div>

                <div className="border border-gallery-border p-4 sm:p-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gallery-accent">
                    Image
                  </p>
                  {upload.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={upload.preview}
                      alt="Artwork"
                      className="mb-2 max-h-32 max-w-full object-contain"
                    />
                  )}
                  <p className="text-xs text-gallery-muted">{upload.name}</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="border border-accent/20 bg-accent/5 p-4">
                <p className="mb-3 text-xs leading-relaxed text-gallery-muted">
                  The Preliminary Passport generated from this submission is a
                  record of host-provided information only. It has not been
                  reviewed, verified, or authenticated by Bayview Hub and does
                  not constitute a certificate of provenance, authentication, or
                  title. Submission is subject to Bayview Hub review and
                  programme terms.
                </p>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.disclaimerAccepted}
                    onChange={(e) => set("disclaimerAccepted", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-accent"
                  />
                  <span className="text-sm text-gallery-muted">
                    I understand and agree to the above.
                  </span>
                </label>
              </div>

              {/* Honeypot — hidden, bots fill this in */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
                autoComplete="off"
              />

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}
            </div>
          )}

          {/* ── Navigation buttons ─────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between border-t border-gallery-border pt-6">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
              >
                ← Back
              </button>
            ) : (
              <Link
                href="/passport"
                className="text-sm text-gallery-muted underline underline-offset-4 hover:text-gallery-text"
              >
                ← Cancel
              </Link>
            )}

            {currentStep === "review" ? (
              <Button
                variant="accent"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting || !form.disclaimerAccepted}
              >
                {submitting ? "Generating Passport…" : "Submit & Generate Passport →"}
              </Button>
            ) : (
              <Button variant="default" size="lg" onClick={handleNext}>
                Continue →
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
