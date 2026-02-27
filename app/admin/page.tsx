"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle, Shield, LogOut } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import type { ArtworkWithVisibility } from "@/lib/services/public-artwork-query";

export default function AdminPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArtworkWithVisibility[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "live" | "error">("loading");
  const [hideReason, setHideReason] = useState<Record<string, string>>({});
  const [actionState, setActionState] = useState<
    Record<string, "idle" | "loading" | "done">
  >({});
  const [imageUrlInput, setImageUrlInput] = useState<Record<string, string>>({});
  const [imageUpdateState, setImageUpdateState] = useState<
    Record<string, "idle" | "loading" | "done">
  >({});
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [apiError, setApiError] = useState<string | null>(null);

  function normalizeImageUrl(value: string): string {
    const v = value.trim();
    if (!v) return "";
    return v.replace(/^\/+/, "");
  }

  const handleSetImage = async (artwork: ArtworkWithVisibility) => {
    const raw = imageUrlInput[artwork.id]?.trim();
    if (!raw) return;
    const imageUrl = normalizeImageUrl(raw);
    if (!imageUrl) return;

    setImageUpdateState((prev) => ({ ...prev, [artwork.id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/artworks/${artwork.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setApiError(data?.error ?? `Update failed (${res.status})`);
        setImageUpdateState((prev) => ({ ...prev, [artwork.id]: "idle" }));
        return;
      }
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artwork.id ? { ...a, imageUrl } : a
        )
      );
      setImageUrlInput((prev) => ({ ...prev, [artwork.id]: "" }));
      setApiError(null);
      setImageUpdateState((prev) => ({ ...prev, [artwork.id]: "done" }));
      setTimeout(() => {
        setImageUpdateState((prev) => ({ ...prev, [artwork.id]: "idle" }));
      }, 1500);
    } catch {
      setApiError("Network error");
      setImageUpdateState((prev) => ({ ...prev, [artwork.id]: "idle" }));
    }
  };

  const loadArtworks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/artworks");
      if (res.status === 401) {
        router.replace("/login?redirect=/admin");
        return;
      }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setArtworks(data);
      setLoadState("live");
    } catch {
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const filtered = useMemo(() => {
    switch (filter) {
      case "visible":
        return artworks.filter((a) => a.isVisible);
      case "hidden":
        return artworks.filter((a) => !a.isVisible);
      default:
        return artworks;
    }
  }, [artworks, filter]);

  const counts = useMemo(
    () => ({
      total: artworks.length,
      visible: artworks.filter((a) => a.isVisible).length,
      hidden: artworks.filter((a) => !a.isVisible).length,
    }),
    [artworks]
  );

  const handleToggleVisibility = async (artwork: ArtworkWithVisibility) => {
    const nextVisible = !artwork.isVisible;

    if (!nextVisible) {
      const reason = hideReason[artwork.id]?.trim();
      if (!reason) return;
    }

    setActionState((prev) => ({ ...prev, [artwork.id]: "loading" }));

    try {
      const res = await fetch("/api/admin/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: artwork.id,
          isVisible: nextVisible,
          reason: nextVisible ? undefined : hideReason[artwork.id]?.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("[Admin] Visibility toggle failed:", data?.error ?? res.status);
        setApiError(data?.error ?? `Toggle failed (${res.status})`);
        setActionState((prev) => ({ ...prev, [artwork.id]: "idle" }));
        return;
      }

      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artwork.id
            ? {
                ...a,
                isVisible: nextVisible,
                hiddenReason: nextVisible
                  ? null
                  : hideReason[artwork.id]?.trim() || null,
                hiddenAt: nextVisible ? null : new Date().toISOString(),
                hiddenBy: nextVisible ? null : "API",
              }
            : a
        )
      );

      setApiError(null);
      setActionState((prev) => ({ ...prev, [artwork.id]: "done" }));
      setTimeout(() => {
        setActionState((prev) => ({ ...prev, [artwork.id]: "idle" }));
      }, 1500);
    } catch (err) {
      console.error("[Admin] Visibility toggle error:", err);
      setApiError("Network error — could not reach server");
      setActionState((prev) => ({ ...prev, [artwork.id]: "idle" }));
    }
  };

  if (loadState === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} aria-hidden="true" />
          <h1 className="text-lg font-medium tracking-forensic text-noir-text">
            Admin — Visibility Control
          </h1>
        </div>
        <Panel>
          <div className="py-8 text-center">
            <p className="text-xs text-noir-muted tracking-widest uppercase animate-pulse">
              Authenticating…
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} aria-hidden="true" />
          <h1 className="text-lg font-medium tracking-forensic text-noir-text">
            Admin — Visibility Control
          </h1>
        </div>
        <div className="border border-noir-accent bg-noir-accent/10 p-4" role="alert">
          <p className="text-xs text-noir-accent font-medium mb-1">Connection Failed</p>
          <p className="text-[10px] text-noir-muted leading-relaxed">
            Could not load artworks from the database. Check that DATABASE_URL is configured and the database is reachable.
          </p>
          <button
            onClick={() => { setLoadState("loading"); loadArtworks(); }}
            className="mt-3 text-xs text-noir-text border border-noir-border px-3 py-1.5 hover:bg-noir-surface transition-colors"
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
          <AlertTriangle
            className="w-4 h-4 text-noir-accent flex-shrink-0 mt-0.5"
            strokeWidth={1}
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-noir-accent font-medium">
              Action Failed
            </p>
            <p className="text-[10px] text-noir-muted mt-0.5 leading-relaxed">
              {apiError}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield
              className="w-4 h-4 text-noir-muted"
              strokeWidth={1}
              aria-hidden="true"
            />
            <h1 className="text-lg font-medium tracking-forensic text-noir-text">
              Admin — Visibility Control
            </h1>
          </div>
          <p className="text-xs text-noir-muted">
            Manage artwork public visibility. All actions are logged to
            provenance trail.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase transition-colors"
          >
            Submissions
          </Link>
          <Link
            href="/admin/claims"
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase transition-colors"
          >
            Ownership Claims
          </Link>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase transition-colors"
          >
            Enquiries
          </Link>
          <Badge variant="muted">{counts.total} total</Badge>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 mb-6 border border-noir-border">
        {(
          [
            { key: "all", label: "All", count: counts.total },
            { key: "visible", label: "Visible", count: counts.visible },
            { key: "hidden", label: "Hidden", count: counts.hidden },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              flex-1 px-4 py-2.5 text-xs font-medium tracking-widest uppercase
              transition-colors duration-120 border-r border-noir-border last:border-r-0
              focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]
              ${
                filter === tab.key
                  ? "text-noir-text bg-noir-surface"
                  : "text-noir-muted hover:text-noir-text hover:bg-noir-surface/50"
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <div className="py-8 text-center">
            <p className="text-xs text-noir-muted tracking-widest uppercase">
              No {filter === "all" ? "" : filter} artworks
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((artwork) => (
            <Panel key={artwork.id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-medium text-noir-text truncate">
                      {artwork.title}
                    </h2>
                    <Badge
                      variant={artwork.isVisible ? "default" : "accent"}
                    >
                      {artwork.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                    {actionState[artwork.id] === "done" && (
                      <Badge variant="muted">Updated</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-noir-muted tracking-widest uppercase">
                    <span>{artwork.id}</span>
                    {artwork.artist && <span>{artwork.artist.name}</span>}
                    {artwork.medium && <span>{artwork.medium}</span>}
                    {!artwork.imageUrl && (
                      <span className="text-amber-400">NO IMAGE</span>
                    )}
                  </div>
                  {!artwork.isVisible && artwork.hiddenReason && (
                    <p className="text-[10px] text-noir-accent/80 mt-1.5 leading-relaxed">
                      Reason: {artwork.hiddenReason}
                    </p>
                  )}
                  {!artwork.imageUrl && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <div className="flex-1 min-w-[180px]">
                        <Label htmlFor={`image-${artwork.id}`} className="text-[10px]">
                          Set gallery-public URL or object path
                        </Label>
                        <Input
                          id={`image-${artwork.id}`}
                          value={imageUrlInput[artwork.id] ?? ""}
                          onChange={(e) =>
                            setImageUrlInput((prev) => ({
                              ...prev,
                              [artwork.id]: e.target.value,
                            }))
                          }
                          placeholder="e.g. published/<artworkId>/image.jpg or gallery-public URL"
                          className="mt-1 text-xs"
                        />
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSetImage(artwork)}
                        disabled={
                          !imageUrlInput[artwork.id]?.trim() ||
                          imageUpdateState[artwork.id] === "loading"
                        }
                        aria-busy={imageUpdateState[artwork.id] === "loading"}
                      >
                        {imageUpdateState[artwork.id] === "loading"
                          ? "Saving…"
                          : imageUpdateState[artwork.id] === "done"
                            ? "Saved"
                            : "Set Image"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-64 flex-shrink-0">
                  {artwork.isVisible ? (
                    <>
                      <div>
                        <Label htmlFor={`reason-${artwork.id}`}>
                          Reason for hiding
                        </Label>
                        <Textarea
                          id={`reason-${artwork.id}`}
                          value={hideReason[artwork.id] ?? ""}
                          onChange={(e) =>
                            setHideReason((prev) => ({
                              ...prev,
                              [artwork.id]: e.target.value,
                            }))
                          }
                          placeholder="Required — provide a reason"
                          className="min-h-[60px]"
                        />
                      </div>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleToggleVisibility(artwork)}
                        disabled={
                          actionState[artwork.id] === "loading" ||
                          !hideReason[artwork.id]?.trim()
                        }
                        aria-busy={actionState[artwork.id] === "loading"}
                      >
                        {actionState[artwork.id] === "loading" ? (
                          <span className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 bg-current animate-pulse"
                              aria-hidden="true"
                            />
                            Hiding…
                          </span>
                        ) : (
                          <>
                            <EyeOff
                              className="w-3 h-3 mr-1.5"
                              strokeWidth={1.5}
                            />
                            Hide from Public
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleToggleVisibility(artwork)}
                      disabled={actionState[artwork.id] === "loading"}
                      aria-busy={actionState[artwork.id] === "loading"}
                    >
                      {actionState[artwork.id] === "loading" ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 bg-current animate-pulse"
                            aria-hidden="true"
                          />
                          Unhiding…
                        </span>
                      ) : (
                        <>
                          <Eye
                            className="w-3 h-3 mr-1.5"
                            strokeWidth={1.5}
                          />
                          Make Visible
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Divider className="my-6" />

      <div className="border border-noir-border bg-noir-bg p-3">
        <p className="text-[10px] text-noir-muted tracking-widest uppercase font-medium mb-1">
          Audit Note
        </p>
        <p className="text-[9px] text-noir-muted/50 leading-relaxed">
          Connected to database. All visibility toggles are recorded in the
          provenance log with actor ID, timestamp, and reason.
        </p>
      </div>
    </div>
  );
}
