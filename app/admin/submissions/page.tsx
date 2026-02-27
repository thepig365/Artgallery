"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
  FileText,
  ImageIcon,
  Eye,
} from "lucide-react";
import Link from "next/link";

type SubmissionStatus =
  | "RECEIVED"
  | "UNDER_REVIEW"
  | "NEEDS_INFO"
  | "APPROVED"
  | "REJECTED";

interface EvidenceDescriptor {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  path?: string;
  uploadedAt?: string;
}

interface Submission {
  id: string;
  referenceId: string;
  submitterAuthUid: string;
  status: SubmissionStatus;
  workTitle: string;
  artistName: string | null;
  medium: string | null;
  year: number | null;
  dimensions: string | null;
  editionInfo: string | null;
  evidenceFiles: EvidenceDescriptor[] | null;
  materials: string[];
  materialsOther: string | null;
  narrative: string | null;
  consentGiven: boolean;
  createdAt: string;
}

type FilterKey = "all" | "RECEIVED" | "APPROVED" | "REJECTED";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "RECEIVED":
    case "UNDER_REVIEW":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/40">
          <Clock className="w-3 h-3" />
          {status === "RECEIVED" ? "Received" : "Under Review"}
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/40">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/40">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex px-2 py-0.5 text-xs text-[#9A9A9A] border border-[#222]">
          {status}
        </span>
      );
  }
}

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "live" | "error">(
    "loading"
  );
  const [actionState, setActionState] = useState<
    Record<string, "idle" | "loading" | "done" | "error">
  >({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {}
  );
  const [imageUrlOverrides, setImageUrlOverrides] = useState<
    Record<string, string>
  >({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.status === 401) {
        router.replace("/login?redirect=/admin/submissions");
        return;
      }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setSubmissions(data);
      setLoadState("live");
    } catch {
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleApprove = async (
    id: string,
    imageUrlOverride?: string
  ) => {
    setActionState((s) => ({ ...s, [id]: "loading" }));
    try {
      const body =
        imageUrlOverride?.trim() ?
          JSON.stringify({ imageUrl: imageUrlOverride.trim() })
        : undefined;
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setActionState((s) => ({ ...s, [id]: "error" }));
        setApiError(data?.error ?? "Approve failed");
        return;
      }
      setApiError(null);
      setActionState((s) => ({ ...s, [id]: "done" }));
      await loadSubmissions();
    } catch {
      setActionState((s) => ({ ...s, [id]: "error" }));
    }
  };

  const handleReject = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rejectReasons[id] || "Rejected by admin",
        }),
      });
      if (!res.ok) {
        setActionState((s) => ({ ...s, [id]: "error" }));
        return;
      }
      setActionState((s) => ({ ...s, [id]: "done" }));
      await loadSubmissions();
    } catch {
      setActionState((s) => ({ ...s, [id]: "error" }));
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return submissions;
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  const counts = useMemo(() => {
    const received = submissions.filter(
      (s) => s.status === "RECEIVED" || s.status === "UNDER_REVIEW"
    ).length;
    return { total: submissions.length, received };
  }, [submissions]);

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <p className="text-sm text-[#9A9A9A] animate-pulse">
          Loading submissions…
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B20000] mx-auto" />
          <p className="text-sm text-[#9A9A9A]">Unable to load submissions</p>
          <button
            onClick={loadSubmissions}
            className="px-4 py-2 text-sm border border-[#222] bg-[#111111] hover:bg-[#1a1a1a] transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5]">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[#9A9A9A] hover:text-[#E5E5E5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Admin
            </Link>
            <span className="text-[#333]">/</span>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E5E5E5]" strokeWidth={1.5} />
              <h1 className="text-lg font-bold tracking-tight">
                Artist Submissions
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {counts.received > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/40">
                {counts.received} pending review
              </span>
            )}
            <span className="text-xs text-[#9A9A9A]">
              {counts.total} total
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#222]">
          {(["all", "RECEIVED", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                filter === f
                  ? "text-[#E5E5E5] border-[#E5E5E5]"
                  : "text-[#9A9A9A] border-transparent hover:text-[#E5E5E5]"
              }`}
            >
              {f === "all" ? "All" : f === "RECEIVED" ? "Pending" : f}
            </button>
          ))}
        </div>

        {/* Submission list */}
        {filtered.length === 0 ? (
          <div className="border border-[#222] bg-[#111111] p-12 text-center">
            <FileText
              className="w-8 h-8 text-[#333] mx-auto mb-3"
              strokeWidth={1}
            />
            <p className="text-sm text-[#9A9A9A]">
              No {filter === "all" ? "" : filter.toLowerCase() + " "}submissions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => {
              const isExpanded = expandedId === sub.id;
              const action = actionState[sub.id] ?? "idle";
              const canReview =
                sub.status === "RECEIVED" || sub.status === "UNDER_REVIEW";
              const evidenceCount = Array.isArray(sub.evidenceFiles)
                ? sub.evidenceFiles.length
                : 0;
              const hasEvidencePath = Array.isArray(sub.evidenceFiles) &&
                sub.evidenceFiles.some((f) => (f as EvidenceDescriptor).path?.trim());
              const pastedUrl = imageUrlOverrides[sub.id]?.trim();
              const canApprove = hasEvidencePath || !!pastedUrl;

              return (
                <div key={sub.id} className="border border-[#222] bg-[#111111]">
                  {/* Summary row */}
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : sub.id);
                      setApiError(null);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[#E5E5E5] truncate">
                          {sub.workTitle}
                        </span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <p className="text-xs text-[#9A9A9A] truncate">
                        {sub.referenceId}
                        {sub.artistName && ` · ${sub.artistName}`}
                        {sub.medium && ` · ${sub.medium}`}
                        {" · "}
                        {new Date(sub.createdAt).toLocaleDateString()}
                        {evidenceCount > 0 && ` · ${evidenceCount} file${evidenceCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-[#9A9A9A] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#222] pt-3 space-y-4">
                      {/* Identity fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Title
                          </span>
                          <span className="text-[#E5E5E5] font-medium">
                            {sub.workTitle}
                          </span>
                        </div>
                        {sub.artistName && (
                          <div>
                            <span className="text-[#9A9A9A] block mb-0.5">
                              Artist
                            </span>
                            <span className="text-[#E5E5E5]">
                              {sub.artistName}
                            </span>
                          </div>
                        )}
                        {sub.medium && (
                          <div>
                            <span className="text-[#9A9A9A] block mb-0.5">
                              Medium
                            </span>
                            <span className="text-[#E5E5E5]">{sub.medium}</span>
                          </div>
                        )}
                        {sub.year && (
                          <div>
                            <span className="text-[#9A9A9A] block mb-0.5">
                              Year
                            </span>
                            <span className="text-[#E5E5E5]">{sub.year}</span>
                          </div>
                        )}
                        {sub.dimensions && (
                          <div>
                            <span className="text-[#9A9A9A] block mb-0.5">
                              Dimensions
                            </span>
                            <span className="text-[#E5E5E5]">
                              {sub.dimensions}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Submitted
                          </span>
                          <span className="text-[#E5E5E5]">
                            {new Date(sub.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Reference
                          </span>
                          <span className="text-[#E5E5E5] font-mono text-[11px]">
                            {sub.referenceId}
                          </span>
                        </div>
                      </div>

                      {/* Materials */}
                      {(sub.materials.length > 0 || sub.materialsOther) && (
                        <div>
                          <span className="text-[#9A9A9A] text-xs block mb-1">
                            Materials
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {sub.materials.map((m) => (
                              <span
                                key={m}
                                className="px-2 py-0.5 text-[11px] bg-[#1a1a1a] border border-[#222] text-[#E5E5E5]"
                              >
                                {m}
                              </span>
                            ))}
                            {sub.materialsOther && (
                              <span className="px-2 py-0.5 text-[11px] bg-[#1a1a1a] border border-[#333] text-[#9A9A9A] italic">
                                {sub.materialsOther}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Narrative */}
                      {sub.narrative && (
                        <div>
                          <span className="text-[#9A9A9A] text-xs block mb-1">
                            Artist Narrative
                          </span>
                          <p className="text-xs text-[#E5E5E5] leading-relaxed whitespace-pre-wrap bg-[#0a0a0a] border border-[#222] p-3 max-h-40 overflow-y-auto">
                            {sub.narrative}
                          </p>
                        </div>
                      )}

                      {/* Evidence files */}
                      {evidenceCount > 0 && (
                        <div>
                          <span className="text-[#9A9A9A] text-xs block mb-1">
                            Evidence Files ({evidenceCount})
                          </span>
                          <div className="space-y-1.5">
                            {(
                              sub.evidenceFiles as EvidenceDescriptor[]
                            ).map((f) => (
                              <div
                                key={f.id}
                                className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#222] text-xs"
                              >
                                <ImageIcon
                                  className="w-3.5 h-3.5 text-[#9A9A9A] flex-shrink-0"
                                  strokeWidth={1}
                                />
                                <span className="text-[#E5E5E5] truncate flex-1">
                                  {f.name}
                                </span>
                                {f.mimeType && (
                                  <span className="text-[#666] flex-shrink-0">
                                    {f.mimeType.split("/")[1]?.toUpperCase()}
                                  </span>
                                )}
                                {f.size != null && (
                                  <span className="text-[#666] flex-shrink-0">
                                    {formatBytes(f.size)}
                                  </span>
                                )}
                                {f.path && sub.status === "APPROVED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(f.path!);
                                    }}
                                    className="flex-shrink-0 text-[#666] hover:text-[#E5E5E5] underline"
                                    title="Copy storage path for Visibility Control"
                                  >
                                    Copy path
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {canReview && (
                        <div className="flex flex-col gap-3 pt-3 border-t border-[#222]">
                          {!hasEvidencePath && (
                            <div className="space-y-1">
                              <p className="text-xs text-amber-400 font-medium">
                                Image required to approve
                              </p>
                              <input
                                type="text"
                                placeholder="Paste image URL or storage path (e.g. intake/uid/2026/02/xxx/file.jpg)"
                                value={imageUrlOverrides[sub.id] ?? ""}
                                onChange={(e) =>
                                  setImageUrlOverrides((s) => ({
                                    ...s,
                                    [sub.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 text-xs bg-[#0a0a0a] border border-amber-700/50 text-[#E5E5E5] placeholder:text-[#555] focus:outline-none focus:border-amber-600 transition-colors"
                              />
                            </div>
                          )}
                          <div className="flex items-end gap-3">
                            <button
                              onClick={() => {
                                if (!canApprove) {
                                  setApiError(
                                    "Image required to approve. Paste image URL or storage path first."
                                  );
                                  return;
                                }
                                handleApprove(
                                  sub.id,
                                  hasEvidencePath ? undefined : pastedUrl
                                );
                              }}
                              disabled={action === "loading"}
                              className="px-4 py-2 text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/40 hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                            >
                              {action === "loading" ? (
                                "Processing…"
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve & Create Artwork
                                </>
                              )}
                            </button>
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                placeholder="Rejection reason (optional)"
                                value={rejectReasons[sub.id] ?? ""}
                                onChange={(e) =>
                                  setRejectReasons((s) => ({
                                    ...s,
                                    [sub.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 text-xs bg-[#0a0a0a] border border-[#222] text-[#E5E5E5] placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-colors"
                              />
                            </div>
                            <button
                            onClick={() => handleReject(sub.id)}
                            disabled={action === "loading"}
                            className="px-4 py-2 text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/40 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                          >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Post-approval info */}
                      {sub.status === "APPROVED" && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
                          <Eye
                            className="w-3.5 h-3.5 text-green-400"
                            strokeWidth={1.5}
                          />
                          <span className="text-xs text-[#9A9A9A]">
                            Artwork created and visible in the{" "}
                            <Link
                              href="/archive"
                              className="text-[#E5E5E5] underline hover:text-white"
                            >
                              Assessment Archive
                            </Link>
                            . Use{" "}
                            <Link
                              href="/admin"
                              className="text-[#E5E5E5] underline hover:text-white"
                            >
                              Visibility Control
                            </Link>{" "}
                            to hide if needed.
                          </span>
                        </div>
                      )}

                      {(action === "error" || apiError) && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {apiError ?? "Action failed. Please try again."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
