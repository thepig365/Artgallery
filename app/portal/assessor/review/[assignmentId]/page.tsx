"use client";

import { useState, useCallback, use, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, BarChart3, FileText } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { NumberInput } from "@/components/ui/NumberInput";
import { MendRadarChart } from "@/components/charts/MendRadarChart";
import { TerminologyWarning } from "@/components/portal/TerminologyWarning";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";
import { computeMendIndex } from "@/lib/mend-index";
import { mendScoresSchema } from "@/lib/validation/schemas";

type BPMSScores = { B: number; P: number; M: number; S: number };

const SCORE_LABELS: Record<keyof BPMSScores, string> = {
  B: "Body — Physical Integrity",
  P: "Process — Material Evidence",
  M: "Material — Sincerity Index",
  S: "Surface — Forensic Coherence",
};

interface BlindArtwork {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  medium: string | null;
  year: number | null;
  dimensions: string | null;
  materials: string | null;
  narrative: string | null;
}

interface AssignmentData {
  assignment: {
    id: string;
    status: string;
    dueAt: string | null;
    assignedAt: string;
    notesToAssessor: string | null;
  };
  artwork: BlindArtwork;
  score: {
    id: string;
    B: number;
    P: number;
    M: number;
    S: number;
    totalScore: number;
    notes: string | null;
    status: string;
    submittedAt: string | null;
  } | null;
}

export default function AssessorReviewPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = use(params);

  const [scores, setScores] = useState<BPMSScores>({ B: 5, P: 5, M: 5, S: 5 });
  const [notes, setNotes] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<AssignmentData | null>(null);

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
        const res = await fetch(
          `/api/assessor/assignments/${assignmentId}`
        );
        if (res.status === 403) {
          setLoadError("Assignment not found or access denied.");
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setLoadError(body.error || `Failed to load (${res.status})`);
          return;
        }
        const payload = await res.json();
        if (cancelled) return;

        setData(payload);

        if (payload.score) {
          setScores({
            B: payload.score.B,
            P: payload.score.P,
            M: payload.score.M,
            S: payload.score.S,
          });
          setNotes(payload.score.notes || "");
          setIsDraft(payload.score.status === "DRAFT");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Network error"
          );
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

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
      const url = isFinal
        ? `/api/assessor/assignments/${assignmentId}/submit`
        : `/api/assessor/assignments/${assignmentId}/draft`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          B: scores.B,
          P: scores.P,
          M: scores.M,
          S: scores.S,
          notes: notes || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveState("error");
        setLoadError(body.error || `Request failed (${res.status})`);
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
      <div className="container mx-auto px-4 py-24">
        <div className="border border-gallery-border rounded-lg bg-gallery-surface p-8 max-w-md mx-auto text-center">
          <AlertTriangle
            className="w-8 h-8 text-gallery-accent mx-auto mb-3"
            strokeWidth={1}
          />
          <p className="text-sm text-gallery-text mb-1">Access denied</p>
          <p className="text-xs text-gallery-muted mb-4">{loadError}</p>
          <Link
            href="/portal/assessor"
            className="text-sm text-gallery-accent hover:underline"
          >
            Back to My Assignments
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="border border-gallery-border rounded-lg bg-gallery-surface p-8 max-w-md mx-auto text-center">
          <div className="flex justify-center gap-1.5 mb-4" aria-hidden="true">
            <div
              className="w-1.5 h-1.5 bg-gallery-muted animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-gallery-muted animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 bg-gallery-muted animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <p
            className="text-xs text-gallery-muted tracking-widest uppercase"
            role="status"
            aria-live="polite"
          >
            Loading assignment…
          </p>
        </div>
      </div>
    );
  }

  const { assignment, artwork } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-medium tracking-tight text-gallery-text">
              Assessment — Blind Review
            </h1>
            <Badge variant={isDraft ? "muted" : "default"}>
              {isDraft ? "Draft" : "Submitted"}
            </Badge>
          </div>
          <p className="text-[10px] text-gallery-muted tracking-widest uppercase">
            Assignment {assignment.id.slice(0, 8)} · Due{" "}
            {assignment.dueAt
              ? new Date(assignment.dueAt).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/portal/assessor"
            className="text-xs text-gallery-muted hover:text-gallery-text uppercase tracking-wide"
          >
            ← My Assignments
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saveState === "saving" || !isDraft}
            aria-busy={saveState === "saving"}
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : saveState === "error"
                  ? "Error — Retry"
                  : "Save Draft"}
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleFinalSubmit}
            disabled={saveState === "saving" || !isDraft}
          >
            Submit Score
          </Button>
        </div>
      </div>

      <div className="border border-gallery-border bg-gallery-surface p-3 mb-6">
        <p className="text-[10px] text-gallery-muted leading-relaxed">
          {DISCLAIMERS.assessorDisclosure}
        </p>
      </div>

      {assignment.notesToAssessor && (
        <div className="border border-gallery-accent/30 bg-gallery-accent/5 p-3 mb-6">
          <p className="text-[10px] font-medium text-gallery-accent uppercase tracking-wide mb-1">
            Notes from Admin
          </p>
          <p className="text-xs text-gallery-text leading-relaxed">
            {assignment.notesToAssessor}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Artwork Panel (blind — no artist identity) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted">
            Artwork
          </h2>
          <Panel noPadding>
            <div className="aspect-square bg-gallery-surface-alt relative">
              {artwork.imageUrl ? (
                <Image
                  src={artwork.imageUrl}
                  alt=""
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gallery-muted text-sm">
                  No image
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Metadata (blind) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText
              className="w-3.5 h-3.5 text-gallery-muted"
              strokeWidth={1}
              aria-hidden="true"
            />
            <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted">
              Work Details
            </h2>
          </div>
          <Panel>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="text-sm text-gallery-text">{artwork.title}</p>
              </div>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Medium</Label>
                  <p className="text-xs text-gallery-text">
                    {artwork.medium ?? "—"}
                  </p>
                </div>
                <div>
                  <Label>Year</Label>
                  <p className="text-xs text-gallery-text">
                    {artwork.year ?? "—"}
                  </p>
                </div>
                {artwork.dimensions && (
                  <div className="col-span-2">
                    <Label>Dimensions</Label>
                    <p className="text-xs text-gallery-text">
                      {artwork.dimensions}
                    </p>
                  </div>
                )}
              </div>
              {artwork.materials && (
                <>
                  <Divider />
                  <div>
                    <Label>Materials</Label>
                    <p className="text-xs text-gallery-muted leading-relaxed">
                      {artwork.materials}
                    </p>
                  </div>
                </>
              )}
              {artwork.narrative && (
                <>
                  <Divider />
                  <div>
                    <Label>Narrative</Label>
                    <p className="text-xs text-gallery-muted leading-relaxed">
                      {artwork.narrative}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Score Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3
              className="w-3.5 h-3.5 text-gallery-muted"
              strokeWidth={1}
              aria-hidden="true"
            />
            <h2 className="text-xs font-medium uppercase tracking-widest text-gallery-muted">
              Score Panel
            </h2>
          </div>

          <Panel>
            <div className="flex justify-center mb-4">
              <MendRadarChart scores={scores} size={200} />
            </div>

            {mendIndex !== null && (
              <div className="border border-gallery-border bg-gallery-bg px-3 py-2 mb-4 flex items-center justify-between">
                <span className="text-[10px] text-gallery-muted tracking-widest uppercase">
                  Mend Index (V)
                </span>
                <span className="text-sm text-gallery-text font-medium tabular-nums">
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
                      label={`${axis} — ${
                        SCORE_LABELS[axis].split("—")[1]?.trim() ||
                        SCORE_LABELS[axis]
                      }`}
                      value={scores[axis]}
                      onChange={updateScore(axis)}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={!isDraft}
                    />
                    {scoreErrors[axis] && (
                      <p className="text-gallery-accent text-[10px] mt-1 tracking-wider">
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

          <div className="border border-gallery-border bg-gallery-bg p-3">
            <p className="text-[9px] text-gallery-muted/80 leading-relaxed">
              {DISCLAIMERS.report}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
