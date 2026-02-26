"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, AlertTriangle, Settings, BarChart3 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ALLOWED_REDIRECTS = [
  "/portal",
  "/portal/submit",
  "/portal/assessor",
  "/admin",
  "/admin/submissions",
  "/admin/claims",
  "/archive",
  "/takedown",
  "/protocol",
];

const DEFAULT_REDIRECT = "/portal";

function safeRedirect(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.startsWith("//")) return DEFAULT_REDIRECT;
  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return DEFAULT_REDIRECT;
  } catch {
    return DEFAULT_REDIRECT;
  }
  const pathname = raw.split("?")[0].split("#")[0];
  if (ALLOWED_REDIRECTS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return raw;
  }
  return DEFAULT_REDIRECT;
}

type PortalChoice = "admin" | "assessor" | null;

const PORTALS = [
  {
    id: "admin" as const,
    label: "Admin Portal",
    description: "Manage artworks, review submissions, create assessment sessions, and finalize Mend Index scores.",
    icon: Settings,
    redirect: "/admin",
  },
  {
    id: "assessor" as const,
    label: "Assessor Portal",
    description: "Review assigned artworks under the blind scoring protocol and submit B/P/M/S evaluations.",
    icon: BarChart3,
    redirect: "/portal/assessor",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const redirectParam = searchParams.get("redirect");
  const hasExplicitRedirect = !!redirectParam;

  const initialChoice: PortalChoice = redirectParam?.startsWith("/admin")
    ? "admin"
    : redirectParam?.startsWith("/portal/assessor")
      ? "assessor"
      : null;

  const [selectedPortal, setSelectedPortal] = useState<PortalChoice>(initialChoice);

  const targetRedirect = selectedPortal
    ? PORTALS.find((p) => p.id === selectedPortal)!.redirect
    : safeRedirect(redirectParam);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && hasExplicitRedirect) {
        router.replace(safeRedirect(redirectParam));
      } else if (user) {
        setIsLoggedIn(true);
        setChecking(false);
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [router, redirectParam, hasExplicitRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push(targetRedirect);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <p className="text-xs text-gallery-muted animate-pulse">Checking session…</p>
    );
  }

  const showPortalChooser = !hasExplicitRedirect && !selectedPortal;

  if (showPortalChooser) {
    const handlePortalClick = (portal: typeof PORTALS[number]) => {
      if (isLoggedIn) {
        router.push(portal.redirect);
      } else {
        setSelectedPortal(portal.id);
      }
    };

    return (
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-gallery-muted" strokeWidth={1} aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gallery-text tracking-tight">
            Sign In
          </h1>
        </div>
        <p className="text-sm text-gallery-muted mb-8">
          Select your portal to continue.
        </p>

        <div className="space-y-3">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.id}
                onClick={() => handlePortalClick(portal)}
                className="w-full text-left border border-gallery-border rounded-lg p-5 hover:border-gallery-accent hover:bg-gallery-accent/5 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gallery-surface-alt border border-gallery-border flex items-center justify-center group-hover:border-gallery-accent/30 transition-colors">
                    <Icon className="w-5 h-5 text-gallery-muted group-hover:text-gallery-accent transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gallery-text group-hover:text-gallery-accent transition-colors">
                      {portal.label}
                    </p>
                    <p className="text-xs text-gallery-muted leading-relaxed mt-1">
                      {portal.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-gallery-muted/50 mt-8 leading-relaxed text-center">
          {isLoggedIn
            ? "You are signed in. Select a portal to continue."
            : "Access is restricted to authorized staff. Role-based permissions are enforced server-side."}
        </p>
      </div>
    );
  }

  const activePortal = PORTALS.find((p) => p.id === selectedPortal);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-3 mb-1">
        <Shield className="w-5 h-5 text-gallery-muted" strokeWidth={1} aria-hidden="true" />
        <h1 className="text-lg font-semibold text-gallery-text tracking-tight">
          {activePortal ? activePortal.label : "Sign In"}
        </h1>
      </div>
      {!hasExplicitRedirect && (
        <button
          onClick={() => setSelectedPortal(null)}
          className="text-xs text-gallery-accent hover:underline mb-6 inline-block"
        >
          ← Choose a different portal
        </button>
      )}
      {hasExplicitRedirect && <div className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="border border-red-300 bg-red-50 p-3 flex items-start gap-3 rounded-lg"
            role="alert"
          >
            <AlertTriangle
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gallery-muted mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-white border border-gallery-border text-gallery-text text-sm rounded-lg px-3 py-2.5 placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gallery-muted mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-white border border-gallery-border text-gallery-text text-sm rounded-lg px-3 py-2.5 placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-gallery-accent text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gallery-accent-hover transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-current animate-pulse rounded-full" aria-hidden="true" />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-[10px] text-gallery-muted/50 mt-6 leading-relaxed text-center">
        Access is restricted to authorized staff. Role-based permissions are enforced server-side.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <p className="text-xs text-gallery-muted animate-pulse">Loading…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
