"use client";

import { Panel } from "@/components/ui/Panel";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { TerminologyWarning } from "@/components/portal/TerminologyWarning";

interface StepNarrativeProps {
  narrative: string;
  onChange: (value: string) => void;
  errors: Record<string, string>;
}

const MAX_CHARS = 5000;

export function StepNarrative({
  narrative,
  onChange,
  errors,
}: StepNarrativeProps) {
  const charCount = narrative.length;

  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-2">
        Narrative Justification (Optional but recommended)
      </h2>
      <p className="text-xs text-noir-muted mb-6">
        Briefly explain why you chose these materials and process methods, and
        how they relate to the meaning of the work.
      </p>

      <div>
        <Label htmlFor="narrative">
          Artist Statement / Process Narrative
        </Label>
        <Textarea
          id="narrative"
          value={narrative}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe why you chose these materials, your process, and how they connect to the work's meaning..."
          className="min-h-[200px]"
          error={!!errors.narrative}
        />
        <div className="flex items-center justify-between mt-2">
          {errors.narrative ? (
            <p className="text-noir-accent text-[10px] tracking-wider">
              {errors.narrative}
            </p>
          ) : (
            <span />
          )}
          <p
            className={`text-[10px] tracking-wider ${
              charCount > MAX_CHARS ? "text-noir-accent" : "text-noir-muted"
            }`}
          >
            {charCount} / {MAX_CHARS}
          </p>
        </div>
        <TerminologyWarning text={narrative} />
      </div>
    </Panel>
  );
}
