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
} from "lucide-react";
import Link from "next/link";

interface Claim {
  id: string;
  artworkId: string;
  claimantAuthUid: string;
  claimantEmail: string;
  claimantName: string;
  relationshipToArtwork: string;
  evidenceText: string;
  status: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  artwork: { id: string; title: string; slug: string };
}

export default function AdminClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "live" | "error">(
    "loading"
  );
  const [actionState, setActionState] = useState<
    Record<string, "idle" | "loading" | "done" | "error">
  >({});
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/claims");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setClaims(data);
      setLoadState("live");
    } catch {
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleApprove = async (claimId: string) => {
    setActionState((s) => ({ ...s, [claimId]: "loading" }));
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      setActionState((s) => ({ ...s, [claimId]: "done" }));
      await loadClaims();
    } catch {
      setActionState((s) => ({ ...s, [claimId]: "error" }));
    }
  };

  const handleReject = async (claimId: string) => {
    setActionState((s) => ({ ...s, [claimId]: "loading" }));
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: rejectNotes[claimId] || "Rejected by admin",
        }),
      });
      if (!res.ok) throw new Error();
      setActionState((s) => ({ ...s, [claimId]: "done" }));
      await loadClaims();
    } catch {
      setActionState((s) => ({ ...s, [claimId]: "error" }));
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return claims;
    return claims.filter((c) => c.status === filter);
  }, [claims, filter]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/40">
            <Clock className="w-3 h-3" />
            Pending
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
  };

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <p className="text-sm text-[#9A9A9A] animate-pulse">
          Loading claims…
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B20000] mx-auto" />
          <p className="text-sm text-[#9A9A9A]">
            Unable to load claims
          </p>
          <button
            onClick={loadClaims}
            className="px-4 py-2 text-sm border border-[#222] bg-[#111111] hover:bg-[#1a1a1a] transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = claims.filter((c) => c.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5]">
      <div className="container mx-auto px-4 py-6 sm:py-8">
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
                Ownership Claims
              </h1>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-700/40">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#222]">
          {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                filter === f
                  ? "text-[#E5E5E5] border-[#E5E5E5]"
                  : "text-[#9A9A9A] border-transparent hover:text-[#E5E5E5]"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-[#222] bg-[#111111] p-12 text-center">
            <p className="text-sm text-[#9A9A9A]">
              No {filter === "all" ? "" : filter.toLowerCase() + " "}claims
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((claim) => {
              const isExpanded = expandedId === claim.id;
              const claimAction = actionState[claim.id] ?? "idle";

              return (
                <div
                  key={claim.id}
                  className="border border-[#222] bg-[#111111]"
                >
                  {/* Summary row */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : claim.id)
                    }
                    className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[#E5E5E5] truncate">
                          {claim.claimantName}
                        </span>
                        {statusBadge(claim.status)}
                      </div>
                      <p className="text-xs text-[#9A9A9A] truncate">
                        {claim.artwork.title} · {claim.relationshipToArtwork} ·{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
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
                    <div className="px-4 pb-4 border-t border-[#222] pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Email
                          </span>
                          <span className="text-[#E5E5E5]">
                            {claim.claimantEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Artwork
                          </span>
                          <Link
                            href={`/archive/${claim.artwork.slug}`}
                            className="text-[#E5E5E5] underline hover:text-white"
                          >
                            {claim.artwork.title}
                          </Link>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Relationship
                          </span>
                          <span className="text-[#E5E5E5]">
                            {claim.relationshipToArtwork}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] block mb-0.5">
                            Submitted
                          </span>
                          <span className="text-[#E5E5E5]">
                            {new Date(claim.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#9A9A9A] text-xs block mb-1">
                          Evidence
                        </span>
                        <p className="text-xs text-[#E5E5E5] leading-relaxed whitespace-pre-wrap bg-[#0a0a0a] border border-[#222] p-3">
                          {claim.evidenceText}
                        </p>
                      </div>

                      {claim.reviewNotes && (
                        <div>
                          <span className="text-[#9A9A9A] text-xs block mb-1">
                            Review Notes
                          </span>
                          <p className="text-xs text-[#E5E5E5] leading-relaxed">
                            {claim.reviewNotes}
                          </p>
                        </div>
                      )}

                      {claim.status === "PENDING" && (
                        <div className="flex items-end gap-3 pt-2 border-t border-[#222]">
                          <button
                            onClick={() => handleApprove(claim.id)}
                            disabled={claimAction === "loading"}
                            className="px-4 py-2 text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/40 hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {claimAction === "loading"
                              ? "Processing…"
                              : "Approve"}
                          </button>
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              placeholder="Rejection reason (optional)"
                              value={rejectNotes[claim.id] ?? ""}
                              onChange={(e) =>
                                setRejectNotes((s) => ({
                                  ...s,
                                  [claim.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 text-xs bg-[#0a0a0a] border border-[#222] text-[#E5E5E5] placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-colors"
                            />
                          </div>
                          <button
                            onClick={() => handleReject(claim.id)}
                            disabled={claimAction === "loading"}
                            className="px-4 py-2 text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/40 hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Reject
                          </button>
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
