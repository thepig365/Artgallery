"use client";

import { AlertTriangle, Shield } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";

interface StepConsentProps {
  consentGiven: boolean;
  onToggle: () => void;
  errors: Record<string, string>;
}

export function StepConsent({
  consentGiven,
  onToggle,
  errors,
}: StepConsentProps) {
  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-6">
        Consent & Final Submission
      </h2>

      <div className="border border-noir-border bg-noir-bg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield
            className="w-4 h-4 text-noir-muted flex-shrink-0 mt-0.5"
            strokeWidth={1}
            aria-hidden="true"
          />
          <p className="text-xs text-noir-muted leading-relaxed">
            {DISCLAIMERS.submissionConsent}
          </p>
        </div>
      </div>

      <div
        className="flex items-start gap-3 cursor-pointer group focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-2"
        onClick={onToggle}
        role="checkbox"
        aria-checked={consentGiven}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div
          className={`
            w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center
            transition-colors duration-120
            ${consentGiven ? "border-noir-text bg-noir-text" : "border-noir-border group-hover:border-noir-muted"}
            ${errors.consent ? "border-noir-accent" : ""}
          `}
        >
          {consentGiven && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="text-noir-bg"
              aria-hidden="true"
            >
              <path
                d="M2 5L4 7L8 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          )}
        </div>
        <p className="text-xs text-noir-text group-hover:text-white transition-colors duration-120">
          I have read and agree to the assessment protocol terms outlined above.
        </p>
      </div>

      {errors.consent && (
        <p className="text-noir-accent text-[10px] mt-2 tracking-wider ml-7">
          {errors.consent}
        </p>
      )}

      <div className="border border-noir-accent/30 bg-noir-accent/5 p-3 mt-6 flex items-start gap-3">
        <AlertTriangle
          className="w-4 h-4 text-noir-accent flex-shrink-0 mt-0.5"
          strokeWidth={1}
          aria-hidden="true"
        />
        <p className="text-[10px] text-noir-muted leading-relaxed">
          Once submitted, your work enters the blind assessment queue and cannot
          be modified. Ensure all fields are complete before final submission.
        </p>
      </div>
    </Panel>
  );
}
