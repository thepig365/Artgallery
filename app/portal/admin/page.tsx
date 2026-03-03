"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Shield,
  LogOut,
  UserPlus,
  RotateCcw,
  Ban,
  AlertCircle,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface Assessor {
  id: string;
  authUid: string;
  name: string;
  email: string;
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  artist?: { name: string };
}

interface Score {
  id: string;
  B: number;
  P: number;
  M: number;
  S: number;
  totalScore: number;
  status: string;
  submittedAt: string | null;
  assessorAuthUid: string;
}

interface Assignment {
  id: string;
  artworkId: string;
  artwork: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    varianceFlag: boolean;
  };
  assessorAuthUid: string;
  status: string;
  dueAt: string | null;
  assignedAt: string;
  notesToAssessor: string | null;
  scores: Score[];
}

interface AuditLogEntry {
  id: string;
  actorAuthUid: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export default function PortalAdminPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadState, setLoadState] = useState<
    "loading" | "live" | "error"
  >("loading");
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [actionState, setActionState] = useState<
    Record<string, "idle" | "loading" | "done">
  >({});

  const [assignForm, setAssignForm] = useState({
    artworkId: "",
    assessorAuthUid: "",
    dueAt: "",
    notesToAssessor: "",
  });

  const load = useCallback(async () => {
    try {
      const [assignRes, artRes, assessRes] = await Promise.all([
        fetch("/api/portal/admin/assignments"),
        fetch("/api/admin/artworks"),
        fetch("/api/portal/admin/assessors"),
      ]);

      if (assignRes.status === 401 || artRes.status === 401) {
        router.replace("/login?redirect=/portal/admin");
        return;
      }

      if (!assignRes.ok || !artRes.ok || !assessRes.ok) {
        throw new Error("Failed to load data");
      }

      const assignData = await assignRes.json();
      const artData = await artRes.json();
      const assessData = await assessRes.json();

      setAssignments(assignData.assignments ?? []);
      setArtworks(Array.isArray(artData) ? artData : []);
      setAssessors(assessData.assessors ?? []);
      setLoadState("live");
    } catch {
      setLoadState("error");
    }
  }, [router]);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/admin/audit-logs?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setAuditLogs(data.logs ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showLogs) loadLogs();
  }, [showLogs, loadLogs]);

  const handleCreateAssignment = async () => {
    if (!assignForm.artworkId || !assignForm.assessorAuthUid) {
      setApiError("Please select an artwork and assessor.");
      return;
    }

    setActionState((prev) => ({ ...prev, create: "loading" }));
    setApiError(null);

    try {
      const res = await fetch("/api/portal/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: assignForm.artworkId,
          assessorAuthUid: assignForm.assessorAuthUid,
          dueAt: assignForm.dueAt || null,
          notesToAssessor: assignForm.notesToAssessor || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Failed to create assignment");
        setActionState((prev) => ({ ...prev, create: "idle" }));
        return;
      }

      setAssignForm({
        artworkId: "",
        assessorAuthUid: "",
        dueAt: "",
        notesToAssessor: "",
      });
      setShowAssignForm(false);
      setActionState((prev) => ({ ...prev, create: "done" }));
      load();
      setTimeout(() => setActionState((prev) => ({ ...prev, create: "idle" })), 1500);
    } catch {
      setApiError("Network error");
      setActionState((prev) => ({ ...prev, create: "idle" }));
    }
  };

  const handleWithdraw = async (assignmentId: string) => {
    setActionState((prev) => ({ ...prev, [assignmentId]: "loading" }));
    try {
      const res = await fetch(
        `/api/portal/admin/assignments/${assignmentId}/withdraw`,
        { method: "POST" }
      );
      if (res.ok) {
        load();
        setActionState((prev) => ({ ...prev, [assignmentId]: "done" }));
        setTimeout(
          () => setActionState((prev) => ({ ...prev, [assignmentId]: "idle" })),
          1500
        );
      } else {
        setActionState((prev) => ({ ...prev, [assignmentId]: "idle" }));
      }
    } catch {
      setActionState((prev) => ({ ...prev, [assignmentId]: "idle" }));
    }
  };

  const handleNeedsRevision = async (assignmentId: string) => {
    setActionState((prev) => ({ ...prev, [assignmentId]: "loading" }));
    try {
      const res = await fetch(
        `/api/portal/admin/assignments/${assignmentId}/needs-revision`,
        { method: "POST" }
      );
      if (res.ok) {
        load();
        setActionState((prev) => ({ ...prev, [assignmentId]: "done" }));
        setTimeout(
          () => setActionState((prev) => ({ ...prev, [assignmentId]: "idle" })),
          1500
        );
      } else {
        setActionState((prev) => ({ ...prev, [assignmentId]: "idle" }));
      }
    } catch {
      setActionState((prev) => ({ ...prev, [assignmentId]: "idle" }));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loadState === "loading") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} />
          <h1 className="text-lg font-medium text-noir-text">
            Admin — Assignment Console
          </h1>
        </div>
        <Panel>
          <div className="py-8 text-center">
            <p className="text-xs text-noir-muted tracking-widest uppercase animate-pulse">
              Loading…
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="border border-noir-accent bg-noir-accent/10 p-4" role="alert">
          <p className="text-xs text-noir-accent font-medium mb-1">
            Failed to load
          </p>
          <button
            onClick={() => {
              setLoadState("loading");
              load();
            }}
            className="mt-2 text-xs text-noir-text border border-noir-border px-3 py-1.5 hover:bg-noir-surface"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {apiError && (
        <div
          className="border border-noir-accent bg-noir-accent/10 p-3 mb-6 flex items-start gap-3"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-noir-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-noir-accent font-medium">{apiError}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} />
            <h1 className="text-lg font-medium text-noir-text">
              Admin — Assignment Console
            </h1>
          </div>
          <p className="text-xs text-noir-muted">
            Assign artworks to assessors, withdraw assignments, set needs
            revision. All actions are audited.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase"
          >
            Visibility Control
          </Link>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase"
          >
            Audit Logs
          </button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAssignForm(true)}
          >
            <UserPlus className="w-3 h-3 mr-1.5" />
            Assign Assessor
          </Button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>

      {showAssignForm && (
        <Panel className="mb-6">
          <h2 className="text-sm font-medium text-noir-text mb-4">
            Create Assignment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="assign-artwork">Artwork</Label>
              <select
                id="assign-artwork"
                value={assignForm.artworkId}
                onChange={(e) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    artworkId: e.target.value,
                  }))
                }
                className="mt-1 w-full border border-noir-border bg-noir-bg text-noir-text text-sm px-3 py-2"
              >
                <option value="">Select artwork…</option>
                {artworks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} {a.artist ? `— ${a.artist.name}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="assign-assessor">Assessor</Label>
              <select
                id="assign-assessor"
                value={assignForm.assessorAuthUid}
                onChange={(e) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    assessorAuthUid: e.target.value,
                  }))
                }
                className="mt-1 w-full border border-noir-border bg-noir-bg text-noir-text text-sm px-3 py-2"
              >
                <option value="">Select assessor…</option>
                {assessors.map((a) => (
                  <option key={a.authUid} value={a.authUid}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="assign-due">Due date (optional)</Label>
              <Input
                id="assign-due"
                type="datetime-local"
                value={assignForm.dueAt}
                onChange={(e) =>
                  setAssignForm((prev) => ({ ...prev, dueAt: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="assign-notes">Notes to assessor</Label>
              <Textarea
                id="assign-notes"
                value={assignForm.notesToAssessor}
                onChange={(e) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    notesToAssessor: e.target.value,
                  }))
                }
                placeholder="Optional instructions for the assessor"
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateAssignment}
              disabled={actionState.create === "loading"}
            >
              {actionState.create === "loading" ? "Creating…" : "Create"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAssignForm(false);
                setApiError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </Panel>
      )}

      {showLogs && (
        <Panel className="mb-6">
          <h2 className="text-sm font-medium text-noir-text mb-4">
            Recent Audit Logs
          </h2>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-noir-muted">No logs</p>
            ) : (
              auditLogs.map((l) => (
                <div
                  key={l.id}
                  className="text-[10px] border-b border-noir-border pb-2 last:border-0"
                >
                  <span className="text-noir-muted">
                    {new Date(l.createdAt).toISOString()}
                  </span>{" "}
                  <span className="font-medium">{l.action}</span> by{" "}
                  {l.actorRole} ({l.actorAuthUid.slice(0, 8)}…) —{" "}
                  {l.entityType}:{l.entityId.slice(0, 8)}
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      <h2 className="text-xs font-medium uppercase tracking-widest text-noir-muted mb-3">
        Assignments ({assignments.length})
      </h2>
      {assignments.length === 0 ? (
        <Panel>
          <div className="py-8 text-center">
            <p className="text-xs text-noir-muted">
              No assignments yet. Use &quot;Assign Assessor&quot; to create one.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Panel key={a.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-noir-text">
                      {a.artwork.title}
                    </h3>
                    <Badge variant={a.status === "SUBMITTED" ? "default" : "muted"}>
                      {a.status.replace("_", " ")}
                    </Badge>
                    {a.artwork.varianceFlag && (
                      <Badge variant="accent">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Variance
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-noir-muted">
                    Assignee: {a.assessorAuthUid.slice(0, 12)}… · Assigned{" "}
                    {new Date(a.assignedAt).toLocaleDateString()}
                    {a.dueAt && (
                      <> · Due {new Date(a.dueAt).toLocaleDateString()}</>
                    )}
                  </p>
                  {a.scores.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
                      {a.scores.map((s) => (
                        <span key={s.id} className="text-noir-muted">
                          B:{s.B} P:{s.P} M:{s.M} S:{s.S} → V:{s.totalScore.toFixed(2)}{" "}
                          ({s.status})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status !== "WITHDRAWN" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNeedsRevision(a.id)}
                        disabled={actionState[a.id] === "loading"}
                      >
                        {actionState[a.id] === "loading" ? (
                          "…"
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Needs Revision
                          </>
                        )}
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleWithdraw(a.id)}
                        disabled={actionState[a.id] === "loading"}
                      >
                        {actionState[a.id] === "loading" ? (
                          "…"
                        ) : (
                          <>
                            <Ban className="w-3 h-3 mr-1" />
                            Withdraw
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
