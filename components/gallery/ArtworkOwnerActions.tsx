"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";

interface ArtworkOwnerActionsProps {
  artworkId: string;
  isVisible: boolean;
}

type OwnershipStatus = "none" | "pending" | "approved" | "rejected";

export function ArtworkOwnerActions({
  artworkId,
  isVisible: initialVisible,
}: ArtworkOwnerActionsProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ownershipStatus, setOwnershipStatus] =
    useState<OwnershipStatus>("none");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [reason, setReason] = useState("");
  const [actionState, setActionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/owner/status?artworkId=${artworkId}`)
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        setOwnershipStatus(data.ownershipStatus);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [artworkId]);

  const handleToggle = useCallback(async () => {
    const nextVisible = !isVisible;
    if (!nextVisible && !reason.trim()) return;

    setActionState("loading");
    setActionError(null);

    try {
      const res = await fetch("/api/owner/artworks/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId,
          isVisible: nextVisible,
          reason: nextVisible ? undefined : reason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Failed (${res.status})`);
      }

      setIsVisible(nextVisible);
      setReason("");
      setActionState("success");
      setTimeout(() => setActionState("idle"), 2000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "An error occurred"
      );
      setActionState("error");
    }
  }, [artworkId, isVisible, reason]);

  if (loading) return null;

  if (ownershipStatus === "approved") {
    return (
      <div className="border-t border-gallery-border pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield
            className="w-4 h-4 text-gallery-accent"
            strokeWidth={1.5}
          />
          <h3 className="text-sm font-semibold text-gallery-text">
            Manage My Artwork
          </h3>
        </div>

        {actionState === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            Visibility updated successfully
          </div>
        )}

        {actionError && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            {actionError}
          </div>
        )}

        {isVisible ? (
          <div className="space-y-3">
            <p className="text-xs text-gallery-muted">
              This artwork is currently <strong>visible</strong> in the public
              archive.
            </p>
            <div>
              <label
                htmlFor="hide-reason"
                className="block text-xs font-medium text-gallery-muted mb-1"
              >
                Reason for hiding <span className="text-red-500">*</span>
              </label>
              <textarea
                id="hide-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Temporary withdrawal for updated documentation"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-gallery-bg border border-gallery-border rounded-lg text-gallery-text placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors resize-y"
              />
            </div>
            <button
              onClick={handleToggle}
              disabled={actionState === "loading" || !reason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionState === "loading" ? (
                <>
                  <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  Hiding…
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  Hide from Public
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gallery-muted">
              This artwork is currently <strong>hidden</strong> from the public
              archive.
            </p>
            <button
              onClick={handleToggle}
              disabled={actionState === "loading"}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gallery-accent bg-gallery-accent/10 border border-gallery-accent/30 rounded-lg hover:bg-gallery-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionState === "loading" ? (
                <>
                  <span className="w-3 h-3 border-2 border-gallery-accent/30 border-t-gallery-accent rounded-full animate-spin" />
                  Restoring…
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  Make Visible
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (ownershipStatus === "pending") {
    return (
      <div className="border-t border-gallery-border pt-6">
        <div className="flex items-center gap-2 bg-gallery-surface-alt border border-gallery-border rounded-lg px-4 py-3">
          <Shield
            className="w-4 h-4 text-gallery-muted flex-shrink-0"
            strokeWidth={1.5}
          />
          <p className="text-sm text-gallery-muted">
            Your ownership claim is <strong>pending review</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gallery-border pt-6">
      <Link
        href={
          authenticated
            ? `/claim/${artworkId}`
            : `/login?redirect=/claim/${artworkId}`
        }
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gallery-text bg-gallery-surface border border-gallery-border rounded-lg hover:bg-gallery-surface-alt transition-colors"
      >
        <Shield className="w-4 h-4" strokeWidth={1.5} />
        Claim this artwork
      </Link>
    </div>
  );
}
