"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { checkTerminology } from "@/lib/compliance/terminology-guard";
import type { TerminologyMatch } from "@/lib/compliance/terminology-guard";

interface TerminologyWarningProps {
  text: string;
}

export function TerminologyWarning({ text }: TerminologyWarningProps) {
  const result = useMemo(() => checkTerminology(text), [text]);

  if (result.clean) return null;

  return (
    <div
      className="border border-noir-accent/30 bg-noir-accent/5 p-3 mt-3 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <AlertTriangle
        className="w-3.5 h-3.5 text-noir-accent flex-shrink-0 mt-0.5"
        strokeWidth={1}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-[10px] text-noir-accent font-medium tracking-widest uppercase mb-1.5">
          Terminology Warning
        </p>
        <p className="text-[10px] text-noir-muted leading-relaxed mb-2">
          Your narrative contains language that may be flagged during review.
          This platform provides curatorial assessments, not financial valuations.
        </p>
        <ul className="space-y-1">
          {result.matches.map((match: TerminologyMatch, i: number) => (
            <li key={i} className="text-[10px] text-noir-muted flex items-baseline gap-1 min-w-0">
              <span className="text-noir-accent font-medium flex-shrink-0">&quot;{match.phrase}&quot;</span>
              <span className="flex-shrink-0">{" — "}</span>
              <span className="italic truncate block min-w-0">
                …{match.context}…
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
