"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";

type EnquiryStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

interface EnquiryItem {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  ctaType: string;
  status: EnquiryStatus;
  artworkId: string | null;
  artworkSlug: string | null;
  sourceUrl: string | null;
  artwork?: { id: string; title: string; slug: string } | null;
}

type LoadState = "loading" | "live" | "empty" | "error";
type ErrorKind = "auth" | "server" | "network";

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [actionState, setActionState] = useState<Record<string, "idle" | "loading">>({});
  const [errorInfo, setErrorInfo] = useState<{ kind: ErrorKind; message: string } | null>(null);

  const [ctaType, setCtaType] = useState("all");
  const [status, setStatus] = useState("all");
  const [artwork, setArtwork] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadEnquiries = useCallback(async () => {
    setLoadState("loading");
    setErrorInfo(null);
    try {
      const params = new URLSearchParams();
      if (ctaType !== "all") params.set("ctaType", ctaType);
      if (status !== "all") params.set("status", status);
      if (artwork.trim()) params.set("artwork", artwork.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (res.status === 401) {
        router.replace("/login?redirect=/admin/enquiries");
        return;
      }
      if (res.status === 403) {
        const body = await res.json().catch(() => null);
        setErrorInfo({
          kind: "auth",
          message: body?.error ?? "You do not have permission to view enquiries.",
        });
        setLoadState("error");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorInfo({
          kind: "server",
          message: body?.error ?? `Server error (${res.status})`,
        });
        setLoadState("error");
        return;
      }
      const data = (await res.json()) as EnquiryItem[];
      setItems(data);
      setLoadState(data.length === 0 ? "empty" : "live");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed";
      setErrorInfo({ kind: "network", message });
      setLoadState("error");
    }
  }, [artwork, ctaType, from, router, status, to]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      new: items.filter((i) => i.status === "NEW").length,
    };
  }, [items]);

  async function updateStatus(id: string, nextStatus: EnquiryStatus) {
    setActionState((s) => ({ ...s, [id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: nextStatus } : i)));
    } catch {
      // no-op minimal UI
    } finally {
      setActionState((s) => ({ ...s, [id]: "idle" }));
    }
  }

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <p className="text-sm text-[#9A9A9A] animate-pulse">Loading enquiries…</p>
      </div>
    );
  }

  if (loadState === "error") {
    const reasonLabel =
      errorInfo?.kind === "auth"
        ? "Authentication / Permission Error"
        : errorInfo?.kind === "server"
          ? "Server Error"
          : "Network Error";
    return (
      <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B20000] mx-auto" />
          <p className="text-sm text-[#9A9A9A]">Unable to load enquiries</p>
          <p className="text-xs text-[#C7C7C7]">{reasonLabel}</p>
          {errorInfo?.message && (
            <p className="max-w-md text-xs text-[#8F8F8F]">{errorInfo.message}</p>
          )}
          <button
            onClick={loadEnquiries}
            className="px-4 py-2 text-sm border border-[#222] bg-[#111111] hover:bg-[#1a1a1a] transition-colors duration-150"
          >
            Retry
          </button>
          {errorInfo?.kind === "auth" && (
            <button
              onClick={() => router.replace("/login?redirect=/admin/enquiries")}
              className="ml-2 px-4 py-2 text-sm border border-[#333] bg-[#0d0d0d] hover:bg-[#171717] transition-colors duration-150"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5]">
      <div className="container mx-auto px-4 py-6 sm:py-8">
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
              <h1 className="text-lg font-bold tracking-tight">Enquiries</h1>
            </div>
          </div>
          <div className="text-xs text-[#9A9A9A]">{counts.total} total · {counts.new} new</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
          <select
            value={ctaType}
            onChange={(e) => setCtaType(e.target.value)}
            className="px-2.5 py-2 text-xs bg-[#111111] border border-[#222] text-[#E5E5E5]"
          >
            <option value="all">All CTA</option>
            <option value="enquire">Enquire</option>
            <option value="viewing">Viewing</option>
            <option value="price">Price</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-2 text-xs bg-[#111111] border border-[#222] text-[#E5E5E5]"
          >
            <option value="all">All Status</option>
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <input
            value={artwork}
            onChange={(e) => setArtwork(e.target.value)}
            placeholder="Artwork title/slug/id"
            className="px-2.5 py-2 text-xs bg-[#111111] border border-[#222] text-[#E5E5E5] placeholder:text-[#666]"
          />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2.5 py-2 text-xs bg-[#111111] border border-[#222] text-[#E5E5E5]"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2.5 py-2 text-xs bg-[#111111] border border-[#222] text-[#E5E5E5]"
          />
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={loadEnquiries}
            className="px-3 py-2 text-xs border border-[#222] bg-[#111111] hover:bg-[#1a1a1a]"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setCtaType("all");
              setStatus("all");
              setArtwork("");
              setFrom("");
              setTo("");
            }}
            className="px-3 py-2 text-xs border border-[#222] bg-[#111111] hover:bg-[#1a1a1a]"
          >
            Clear
          </button>
        </div>

        {loadState === "empty" ? (
          <div className="border border-[#222] bg-[#111111] p-10 text-center text-sm text-[#9A9A9A]">
            No enquiries yet
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-[#222] bg-[#111111] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm text-[#E5E5E5] font-medium truncate">
                      {item.name} · {item.email}
                    </div>
                    <div className="text-xs text-[#9A9A9A] mt-0.5 truncate">
                      {item.ctaType} · {new Date(item.createdAt).toLocaleString()} ·{" "}
                      {item.artwork?.title ?? item.artworkSlug ?? item.artworkId ?? "No artwork"}
                    </div>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as EnquiryStatus)}
                    disabled={actionState[item.id] === "loading"}
                    className="px-2.5 py-1.5 text-xs bg-[#0a0a0a] border border-[#333] text-[#E5E5E5]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <p className="text-xs text-[#CFCFCF] mt-3 whitespace-pre-wrap leading-relaxed">
                  {item.message}
                </p>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs text-[#9A9A9A] underline hover:text-[#E5E5E5]"
                  >
                    Source URL
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
