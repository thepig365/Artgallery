"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type {
  WizardStep,
  EvidenceFile,
  IdentityFormData,
  IdentityFields,
} from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  validateIdentity,
  validateNarrative,
  validateMaterials,
} from "@/lib/adapters/submission-adapter";
import { SubmissionSuccess } from "@/components/portal/SubmissionSuccess";
import { WizardProgress } from "@/components/portal/WizardProgress";
import { StepIdentity } from "@/components/portal/StepIdentity";
import { StepEvidence } from "@/components/portal/StepEvidence";
import { StepMaterials } from "@/components/portal/StepMaterials";
import { StepNarrative } from "@/components/portal/StepNarrative";
import { StepConsent } from "@/components/portal/StepConsent";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { LogIn } from "lucide-react";

const STEP_ORDER: WizardStep[] = [
  "identity",
  "evidence",
  "materials",
  "narrative",
  "consent",
];

const stepMotion = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2 },
};

const AUTH_CHECK_TIMEOUT_MS = 5000;

export default function ArtistSubmitClient() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>("identity");
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [identity, setIdentity] = useState<IdentityFormData>({
    workTitle: "",
    artistName: "",
    medium: "",
    year: "",
    dimensions: "",
  });

  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [materialsOther, setMaterialsOther] = useState("");
  const [narrative, setNarrative] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitterPrintName, setSubmitterPrintName] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const promise = supabase.auth.getUser();

    timeoutRef.current = setTimeout(() => {
      setAuthState((prev) => (prev === "checking" ? "unauthenticated" : prev));
    }, AUTH_CHECK_TIMEOUT_MS);

    promise
      .then(({ data: { user } }) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setAuthState(user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setAuthState("unauthenticated");
      });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  const validateStep = useCallback(
    (step: WizardStep): boolean => {
      let result: { success: boolean; errors: Record<string, string> };

      switch (step) {
        case "identity":
          result = validateIdentity(identity);
          break;
        case "evidence":
          result = { success: true, errors: {} };
          break;
        case "materials":
          result = validateMaterials({ selectedMaterials, materialsOther });
          break;
        case "narrative":
          result = validateNarrative(narrative);
          break;
        case "consent": {
          const consentErrors: Record<string, string> = {};
          if (!consentGiven) consentErrors.consent = "You must agree to the terms before submission";
          if (!submitterPrintName.trim()) consentErrors.submitterPrintName = "Print name is required";
          result = Object.keys(consentErrors).length === 0 ? { success: true, errors: {} } : { success: false, errors: consentErrors };
          break;
        }
        default:
          result = { success: true, errors: {} };
      }

      setErrors(result.errors);
      return result.success;
    },
    [identity, selectedMaterials, materialsOther, narrative, consentGiven, submitterPrintName]
  );

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("consent")) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const yearNum = identity.year ? parseInt(identity.year, 10) : null;
      const uploadedFiles = files.filter((f) => f.status === "done");
      const evidenceFiles = uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        path: f.path,
        uploadedAt: f.uploadedAt,
      }));
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workTitle: identity.workTitle,
          artistName: identity.artistName.trim(),
          medium: identity.medium || undefined,
          year: Number.isNaN(yearNum) ? null : yearNum,
          dimensions: identity.dimensions || undefined,
          materials: selectedMaterials,
          materialsOther: materialsOther || undefined,
          narrative: narrative || undefined,
          evidenceFiles,
          consentGiven,
          submitterPrintName: submitterPrintName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Submission failed");
        return;
      }
      setReferenceId(data.referenceId);
      setIsSubmitted(true);
    } catch {
      setSubmitError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentityChange = (field: IdentityFields, value: string) => {
    setIdentity((prev) => ({ ...prev, [field]: value }));
  };

  const addFiles = (newFiles: EvidenceFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<EvidenceFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleSubmitAnother = useCallback(() => {
    setIsSubmitted(false);
    setReferenceId(null);
    setCurrentStep("identity");
    setCompletedSteps(new Set());
    setIdentity({
      workTitle: "",
      artistName: "",
      medium: "",
      year: "",
      dimensions: "",
    });
    setFiles([]);
    setSelectedMaterials([]);
    setMaterialsOther("");
    setNarrative("");
    setConsentGiven(false);
    setSubmitterPrintName("");
    setErrors({});
    setSubmitError(null);
  }, []);

  /* Show Sign In for both checking and unauthenticated — avoids loading shell */
  if (authState === "unauthenticated" || authState === "checking") {
    return (
      <div className="max-w-md mx-auto py-12 text-center border border-gallery-border rounded-lg bg-gallery-surface-alt/50 px-6">
        <LogIn className="w-12 h-12 text-gallery-muted mx-auto mb-4" strokeWidth={1} />
        <h2 className="text-lg font-semibold text-gallery-text mb-2">
          Sign In Required
        </h2>
        <p className="text-sm text-gallery-muted mb-6">
          {authState === "checking"
            ? "Verifying session…"
            : "Please sign in to submit your artwork for assessment."}
        </p>
        <Link
          href="/login?redirect=/portal/submit"
          className="inline-flex items-center px-6 py-3 bg-gallery-accent text-white text-sm font-medium rounded-lg hover:bg-gallery-accent-hover transition-colors duration-200"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <SubmissionSuccess
        referenceId={referenceId}
        onSubmitAnother={handleSubmitAnother}
      />
    );
  }

  return (
    <div className="border-t border-gallery-border pt-10">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium tracking-forensic text-gallery-text">
            Artist Intake Protocol
          </h2>
          <Badge variant="muted">Draft</Badge>
        </div>

        <WizardProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} {...stepMotion}>
          {currentStep === "identity" && (
            <StepIdentity
              data={identity}
              onChange={handleIdentityChange}
              errors={errors}
            />
          )}
          {currentStep === "evidence" && (
            <StepEvidence
              files={files}
              onAdd={addFiles}
              onRemove={removeFile}
              onUpdateFile={updateFile}
            />
          )}
          {currentStep === "materials" && (
            <StepMaterials
              selectedMaterials={selectedMaterials}
              materialsOther={materialsOther}
              onToggle={toggleMaterial}
              onOtherChange={setMaterialsOther}
            />
          )}
          {currentStep === "narrative" && (
            <StepNarrative
              narrative={narrative}
              onChange={setNarrative}
              errors={errors}
            />
          )}
          {currentStep === "consent" && (
            <StepConsent
              consentGiven={consentGiven}
              onToggle={() => setConsentGiven((p) => !p)}
              submitterPrintName={submitterPrintName}
              onPrintNameChange={setSubmitterPrintName}
              errors={errors}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {submitError && (
        <div
          className="mt-4 border border-noir-accent bg-noir-accent/10 p-3 text-xs text-noir-accent"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 border-t border-noir-border pt-6">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>
        <span
          className="text-[10px] text-noir-muted tracking-widest uppercase"
          aria-live="polite"
        >
          Step {currentIndex + 1} of {STEP_ORDER.length}
        </span>
        {currentStep === "consent" ? (
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={isSubmitting || !consentGiven}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-current animate-pulse" aria-hidden="true" />
                Submitting…
              </span>
            ) : (
              "Submit for Review"
            )}
          </Button>
        ) : (
          <Button variant="default" onClick={handleNext}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
