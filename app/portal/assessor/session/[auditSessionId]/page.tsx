"use client";

import { useState, useCallback, use, useMemo, useEffect } from "react";
import { AlertTriangle, Eye, FileText, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { MendRadarChart } from "@/components/charts/MendRadarChart";
import { ForensicViewer } from "@/components/media/ForensicViewer";
import { TerminologyWarning } from "@/components/portal/TerminologyWarning";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { computeMendIndex } from "@/lib/mend-index";
import { mendScoresSchema } from "@/lib/validation/schemas";
import type {
  BPMSScores,
  BlindSubmission,
  SubmissionEvidence,
} from "@/lib/types";

const SCORE_LABELS: Record<keyof BPMSScores, string> = {
  B: "Body — Physical Integrity",
  P: "Process — Material Evidence",
  M: "Material — Sincerity Index",
  S: "Surface — Forensic Coherence",
};

export default function AssessorSessionPage({
  params,
}: {
  params: Promise<{ auditSessionId: string }>;
}) {
  const { auditSessionId } = use(params);

  const [scores, setScores] = useState<BPMSScores>({ B: 5, P: 5, M: 5, S: 5 });
  const [notes, setNotes] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [activeEvidence, setActiveEvidence] = useState(0);
  const [showVarianceWarning] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submission, setSubmission] = useState<BlindSubmission | null>(null);
  const [evidence, setEvidence] = useState<SubmissionEvidence[]>([]);

  const mendIndex = useMemo(() => {
    try {
      return computeMendIndex(scores);
    } catch {
      return null;
    }
  }, [scores]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/portal/assessor/session/${auditSessionId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setLoadError(data.error || `Failed to load session (${res.status})`);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        setSubmission(data.submission);
        setEvidence(data.submission.evidence || []);

        if (data.session.isFinalized) {
          setIsDraft(false);
        }

        if (data.myScore) {
          setScores({
            B: data.myScore.B,
            P: data.myScore.P,
            M: data.myScore.M,
            S: data.myScore.S,
          });
          setNotes(data.myScore.notes || "");
          setIsDraft(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Network error");
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [auditSessionId]);

  const updateScore = useCallback(
    (axis: keyof BPMSScores) => (value: number) => {
      setScores((prev) => ({ ...prev, [axis]: value }));
      setScoreErrors((prev) => {
        if (!prev[axis]) return prev;
        const next = { ...prev };
        delete next[axis];
        return next;
      });
      setIsDraft(true);
      setSaveState("idle");
    },
    []
  );

  const submitScores = async (isFinal: boolean) => {
    if (isFinal) {
      const validation = mendScoresSchema.safeParse(scores);
      if (!validation.success) {
        const errs: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const key = issue.path[0];
          if (key && typeof key === "string" && !errs[key]) {
            errs[key] = issue.message;
          }
        }
        setScoreErrors(errs);
        return;
      }
      setScoreErrors({});
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/portal/assessor/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditSessionId,
          B: scores.B,
          P: scores.P,
          M: scores.M,
          S: scores.S,
          notes,
          isFinal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Score submit error:", data);
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      if (isFinal) setIsDraft(false);
    } catch {
      setSaveState("error");
    }
  };

  const handleSaveDraft = () => submitScores(false);
  const handleFinalSubmit = () => submitScores(true);

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="border border-noir-border bg-noir-surface p-8 max-w-md mx-auto text-center">
          <AlertTriangle className="w-8 h-8 text-noir-accent mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-noir-text mb-1">Session unavailable</p>
          <p className="text-xs text-noir-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="border border-noir-border bg-noir-surface p-8 max-w-md mx-auto text-center">
          <div className="flex justify-center gap-1.5 mb-4" aria-hidden="true">
            <div className="w-1.5 h-1.5 bg-noir-muted animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-noir-muted animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-noir-muted animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-xs text-noir-muted tracking-widest uppercase" role="status" aria-live="polite">
            Loading session {auditSessionId}…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-medium tracking-forensic text-noir-text">
              Assessment Session
            </h1>
            <Badge variant={isDraft ? "muted" : "default"}>
              {isDraft ? "Draft" : "Submitted"}
            </Badge>
          </div>
          <p className="text-[10px] text-noir-muted tracking-widest uppercase">
            Session {auditSessionId} — Blind Review Protocol
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saveState === "saving"}
            aria-busy={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-current animate-pulse" aria-hidden="true" />
                Saving…
              </span>
            ) : saveState === "saved" ? (
              "Saved"
            ) : saveState === "error" ? (
              "Error — Retry"
            ) : (
              "Save Draft"
            )}
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={saveState === "saving" || !isDraft}
          >
            Final Submit
          </Button>
        </div>
      </div>

      {/* Assessor Disclosure */}
      <div className="border border-noir-border bg-noir-surface p-3 mb-4">
        <p className="text-[10px] text-noir-muted leading-relaxed">
          {DISCLAIMERS.assessorDisclosure}
        </p>
      </div>

      {showVarianceWarning && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          role="alert"
          className="border border-noir-accent/40 bg-noir-accent/5 p-3 mb-6 flex items-start gap-3"
        >
          <AlertTriangle
            className="w-4 h-4 text-noir-accent flex-shrink-0 mt-0.5"
            strokeWidth={1}
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-noir-accent font-medium">Variance Alert</p>
            <p className="text-[10px] text-noir-muted mt-0.5 leading-relaxed">
              Significant scoring variance detected between assessors for this
              submission. Please review your scores carefully and provide
              additional justification in your notes.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Evidence Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-noir-muted" strokeWidth={1} aria-hidden="true" />
            <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
              Evidence Panel
            </h2>
          </div>

          <Panel noPadding>
            <ForensicViewer
              src={evidence[activeEvidence]?.url}
              alt={evidence[activeEvidence]?.label}
              sourceUrl="#"
              sourceLabel={evidence[activeEvidence]?.label}
            />
          </Panel>

          <div className="space-y-1" role="listbox" aria-label="Evidence items">
            {evidence.map((ev, i) => (
              <button
                key={ev.id}
                onClick={() => setActiveEvidence(i)}
                role="option"
                aria-selected={i === activeEvidence}
                className={`
                  w-full text-left px-3 py-2 border text-xs
                  transition-colors duration-120
                  focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
                  ${
                    i === activeEvidence
                      ? "border-noir-text bg-noir-surface text-noir-text"
                      : "border-noir-border text-noir-muted hover:text-noir-text hover:bg-noir-surface/50"
                  }
                `}
              >
                <span className="text-[10px] tracking-widest uppercase text-noir-muted mr-2">
                  {ev.type}
                </span>
                {ev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Narrative Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-noir-muted" strokeWidth={1} aria-hidden="true" />
            <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
              Submission Details
            </h2>
          </div>

          <Panel>
            <div className="space-y-4">
              <div>
                <Label>Work Identifier</Label>
                <p className="text-sm text-noir-text">
                  {submission.workTitle}
                </p>
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Medium</Label>
                  <p className="text-xs text-noir-text">{submission.medium}</p>
                </div>
                <div>
                  <Label>Year</Label>
                  <p className="text-xs text-noir-text">{submission.year}</p>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <p className="text-xs text-noir-text">{submission.dimensions}</p>
                </div>
              </div>
              <Divider />
              <div>
                <Label>Declared Materials</Label>
                <ul className="space-y-1 mt-1">
                  {submission.materials.map((m, i) => (
                    <li
                      key={i}
                      className="text-xs text-noir-muted flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-noir-border flex-shrink-0" aria-hidden="true" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <Divider />
              <div>
                <Label>Process Narrative</Label>
                <p className="text-xs text-noir-muted leading-relaxed mt-1">
                  {submission.narrative}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Score Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-noir-muted" strokeWidth={1} aria-hidden="true" />
            <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
              Score Panel
            </h2>
          </div>

          <Panel>
            <div className="flex justify-center mb-4">
              <MendRadarChart scores={scores} size={200} />
            </div>

            {mendIndex !== null && (
              <div className="border border-noir-border bg-noir-bg px-3 py-2 mb-4 flex items-center justify-between">
                <span className="text-[10px] text-noir-muted tracking-widest uppercase">
                  Mend Index (V)
                </span>
                <span className="text-sm text-noir-text font-medium tabular-nums">
                  {mendIndex.toFixed(2)}
                </span>
              </div>
            )}

            <Divider label="B / P / M / S Scores" className="mb-6" />

            <div className="space-y-4">
              {(Object.keys(SCORE_LABELS) as Array<keyof BPMSScores>).map(
                (axis) => (
                  <div key={axis}>
                    <NumberInput
                      label={`${axis} — ${SCORE_LABELS[axis].split("—")[1]?.trim() || SCORE_LABELS[axis]}`}
                      value={scores[axis]}
                      onChange={updateScore(axis)}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={!isDraft}
                    />
                    {scoreErrors[axis] && (
                      <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
                        {scoreErrors[axis]}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </Panel>

          <Panel>
            <Label htmlFor="assessor-notes">Assessor Notes</Label>
            <Textarea
              id="assessor-notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaveState("idle");
              }}
              placeholder="Provide scoring justification and observations..."
              disabled={!isDraft}
              className="min-h-[120px]"
            />
            <TerminologyWarning text={notes} />
          </Panel>

          {/* Report disclaimer */}
          <div className="border border-noir-border bg-noir-bg p-3">
            <p className="text-[9px] text-noir-muted/50 leading-relaxed">
              {DISCLAIMERS.report}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
