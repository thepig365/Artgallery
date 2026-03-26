"use client";

// ─────────────────────────────────────────────────────────────
// Admin — Private Walls Management
//
// Shows all HostPassport records. Allows Bayview admin to:
//   - Review host opt-in status
//   - Publish a record to the Public Private Walls page
//   - Unpublish a record (slug is preserved, state returns to PRIVATE_ONLY)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, LogOut, Globe, EyeOff } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

// ── Types ─────────────────────────────────────────────────────
interface PassportRecord {
  id: string;
  passportId: string;
  shareToken: string;
  artworkTitle: string;
  artistName: string;
  medium: string;
  dimensions: string | null;
  artworkYear: number | null;
  artworkType: string;
  hostRegion: string;
  hostName: string;
  hostEmail: string;
  hostPublicOptIn: boolean;
  wallPublication: "PRIVATE_ONLY" | "PUBLIC_PRIVATE_WALLS";
  publicSlug: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  status: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  ORIGINAL:      "Original",
  EDITION:       "Limited Edition",
  DIGITAL_PRINT: "Digital Print",
  REPRODUCTION:  "Reproduction",
};

export default function AdminPrivateWallsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PassportRecord[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "live" | "error">("loading");
  const [actionState, setActionState] = useState<Record<string, "idle" | "loading" | "done">>(
    {}
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "opted_in" | "published">("all");

  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/private-walls");
      if (res.status === 401) {
        router.replace("/login?redirect=/admin/private-walls");
        return;
      }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setRecords(data);
      setLoadState("live");
    } catch {
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handlePublish = async (record: PassportRecord) => {
    setActionState((prev) => ({ ...prev, [record.id]: "loading" }));
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/private-walls/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setApiError(data?.error ?? `Publish failed (${res.status})`);
        setActionState((prev) => ({ ...prev, [record.id]: "idle" }));
        return;
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                wallPublication: "PUBLIC_PRIVATE_WALLS",
                publicSlug: data.publicSlug ?? r.publicSlug,
                publishedAt: data.publishedAt ?? null,
              }
            : r
        )
      );
      setActionState((prev) => ({ ...prev, [record.id]: "done" }));
      setTimeout(() => setActionState((prev) => ({ ...prev, [record.id]: "idle" })), 2000);
    } catch {
      setApiError("Network error");
      setActionState((prev) => ({ ...prev, [record.id]: "idle" }));
    }
  };

  const handleUnpublish = async (record: PassportRecord) => {
    setActionState((prev) => ({ ...prev, [record.id]: "loading" }));
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/private-walls/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setApiError(data?.error ?? `Unpublish failed (${res.status})`);
        setActionState((prev) => ({ ...prev, [record.id]: "idle" }));
        return;
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? { ...r, wallPublication: "PRIVATE_ONLY" }
            : r
        )
      );
      setActionState((prev) => ({ ...prev, [record.id]: "done" }));
      setTimeout(() => setActionState((prev) => ({ ...prev, [record.id]: "idle" })), 2000);
    } catch {
      setApiError("Network error");
      setActionState((prev) => ({ ...prev, [record.id]: "idle" }));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const filtered = records.filter((r) => {
    if (filter === "opted_in") return r.hostPublicOptIn;
    if (filter === "published") return r.wallPublication === "PUBLIC_PRIVATE_WALLS";
    return true;
  });

  const counts = {
    total:     records.length,
    optedIn:   records.filter((r) => r.hostPublicOptIn).length,
    published: records.filter((r) => r.wallPublication === "PUBLIC_PRIVATE_WALLS").length,
  };

  // ── Loading / error states ────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} />
          <h1 className="text-lg font-medium tracking-forensic text-noir-text">
            Admin — Private Walls
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
          <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} />
          <h1 className="text-lg font-medium tracking-forensic text-noir-text">
            Admin — Private Walls
          </h1>
        </div>
        <Panel>
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-noir-accent">Could not load passport records.</p>
            <button
              onClick={() => { setLoadState("loading"); loadRecords(); }}
              className="text-xs text-noir-text border border-noir-border px-3 py-1.5 hover:bg-noir-surface transition-colors"
            >
              Retry
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">

      {/* ── API error banner ───────────────────────────────────── */}
      {apiError && (
        <div className="border border-noir-accent bg-noir-accent/10 p-3 mb-6" role="alert">
          <p className="text-xs text-noir-accent font-medium">Action Failed</p>
          <p className="text-[10px] text-noir-muted mt-0.5">{apiError}</p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-4 h-4 text-noir-muted" strokeWidth={1} />
            <h1 className="text-lg font-medium tracking-forensic text-noir-text">
              Admin — Private Walls
            </h1>
          </div>
          <p className="text-xs text-noir-muted">
            Manage publication state for the Works for Private Walls programme.
            Unpublishing preserves the slug — it does not destroy the record.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Link
            href="/admin"
            className="text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase"
          >
            ← Admin
          </Link>
          <Link
            href="/art-work-for-private-walls"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase"
          >
            <Globe className="w-3 h-3" strokeWidth={1.5} />
            View Page
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[10px] text-noir-muted hover:text-noir-text border border-noir-border px-2 py-1 tracking-widest uppercase"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total registered",   value: counts.total },
          { label: "Host opt-in",         value: counts.optedIn },
          { label: "Published (live)",    value: counts.published },
        ].map(({ label, value }) => (
          <Panel key={label} className="py-4 text-center">
            <p className="text-xl font-semibold text-noir-text">{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-noir-muted mt-1">{label}</p>
          </Panel>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-0 mb-6 border border-noir-border">
        {(
          [
            { key: "all",       label: "All",          count: counts.total },
            { key: "opted_in",  label: "Host Opt-In",  count: counts.optedIn },
            { key: "published", label: "Published",    count: counts.published },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              flex-1 px-4 py-2.5 text-xs font-medium tracking-widest uppercase
              transition-colors duration-120 border-r border-noir-border last:border-r-0
              ${filter === tab.key
                ? "text-noir-text bg-noir-surface"
                : "text-noir-muted hover:text-noir-text hover:bg-noir-surface/50"
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Records list ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Panel>
          <div className="py-8 text-center">
            <p className="text-xs text-noir-muted tracking-widest uppercase">
              No records found
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const isPublished = record.wallPublication === "PUBLIC_PRIVATE_WALLS";
            const state = actionState[record.id] ?? "idle";
            return (
              <Panel key={record.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                  {/* Work info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-sm font-medium text-noir-text truncate">
                        {record.artworkTitle}
                      </h2>
                      <Badge variant={isPublished ? "default" : "muted"}>
                        {isPublished ? "Published" : "Private"}
                      </Badge>
                      {record.hostPublicOptIn && (
                        <Badge variant="muted">Host opt-in</Badge>
                      )}
                      {state === "done" && <Badge variant="muted">Updated</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-noir-muted tracking-widest uppercase mb-2">
                      <span>{record.artistName}</span>
                      <span>{record.medium}</span>
                      {record.artworkYear && <span>{record.artworkYear}</span>}
                      <span>{TYPE_LABELS[record.artworkType] ?? record.artworkType}</span>
                      <span>{record.hostRegion}</span>
                    </div>

                    {/* Internal host details */}
                    <div className="text-[10px] text-noir-muted space-y-0.5 mb-2">
                      <p>Host: {record.hostName} · {record.hostEmail}</p>
                      <p>Passport ID: {record.passportId}</p>
                      {record.publicSlug && (
                        <p>
                          Slug:{" "}
                          <a
                            href={`/art-work-for-private-walls/${record.publicSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-noir-text"
                          >
                            /art-work-for-private-walls/{record.publicSlug}
                          </a>
                        </p>
                      )}
                      {record.publishedAt && (
                        <p>
                          Published:{" "}
                          {new Date(record.publishedAt).toLocaleDateString("en-AU", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-noir-muted/60">
                      Private record:{" "}
                      <a
                        href={`/passport/record/${record.shareToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-noir-text"
                      >
                        /passport/record/[token]
                      </a>
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0 sm:w-40">
                    {isPublished ? (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleUnpublish(record)}
                        disabled={state === "loading"}
                        aria-busy={state === "loading"}
                        className="w-full"
                      >
                        {state === "loading" ? (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-current animate-pulse" />
                            Unpublishing…
                          </span>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
                            Unpublish
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublish(record)}
                        disabled={state === "loading"}
                        aria-busy={state === "loading"}
                        className="w-full"
                      >
                        {state === "loading" ? (
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-current animate-pulse" />
                            Publishing…
                          </span>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
                            Publish
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Divider className="my-6" />
      <div className="border border-noir-border bg-noir-bg p-3">
        <p className="text-[10px] text-noir-muted tracking-widest uppercase font-medium mb-1">
          Programme Note
        </p>
        <p className="text-[9px] text-noir-muted/50 leading-relaxed">
          Publishing a work makes it visible on /art-work-for-private-walls only.
          It does not add the work to the main curated archive. Unpublishing sets
          the state to Private Only but preserves the public slug for future use.
          Host details are never exposed on the public page.
        </p>
      </div>

    </div>
  );
}
