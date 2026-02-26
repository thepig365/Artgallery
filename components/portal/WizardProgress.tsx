"use client";

import type { WizardStep } from "@/lib/types";

const STEPS: { key: WizardStep; label: string; index: number }[] = [
  { key: "identity", label: "Artwork", index: 0 },
  { key: "evidence", label: "Evidence", index: 1 },
  { key: "materials", label: "Materials", index: 2 },
  { key: "narrative", label: "Narrative", index: 3 },
  { key: "consent", label: "Consent", index: 4 },
];

interface WizardProgressProps {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
}

export function WizardProgress({
  currentStep,
  completedSteps,
}: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className="border border-noir-border bg-noir-surface p-4"
      role="navigation"
      aria-label="Submission progress"
    >
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCurrent = step.key === currentStep;
          const isCompleted = completedSteps.has(step.key);
          const isPast = i < currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={`
                    w-6 h-6 flex items-center justify-center border text-[10px] font-medium
                    ${isCurrent
                      ? "border-noir-text text-noir-text"
                      : isCompleted || isPast
                        ? "border-noir-muted text-noir-muted"
                        : "border-noir-border text-noir-border"
                    }
                  `}
                >
                  {isCompleted ? (
                    <span aria-label={`Step ${i + 1} completed`}>✓</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`
                    text-[9px] tracking-widest uppercase mt-1.5 text-center truncate w-full
                    ${isCurrent ? "text-noir-text" : "text-noir-muted"}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`
                    h-px flex-shrink-0 w-full max-w-[40px]
                    ${isPast || isCompleted ? "bg-noir-muted" : "bg-noir-border"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
