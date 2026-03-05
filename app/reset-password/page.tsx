"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TokenState = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [tokenState, setTokenState] = useState<TokenState>("checking");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const code = new URLSearchParams(window.location.search).get("code");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!sessionError && mounted) {
            setTokenState("ready");
            return;
          }
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (!exchangeError && mounted) {
            setTokenState("ready");
            return;
          }
        }

        if (mounted) setTokenState("invalid");
      } catch {
        if (mounted) setTokenState("invalid");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Unable to reset password right now.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-gallery-muted" strokeWidth={1} aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gallery-text tracking-tight">
            Reset Password
          </h1>
        </div>

        {tokenState === "checking" && (
          <p className="text-sm text-gallery-muted">Verifying reset link...</p>
        )}

        {tokenState === "invalid" && (
          <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
            <p className="text-xs text-red-700 leading-relaxed">
              This reset link is invalid or expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block mt-3 text-xs text-gallery-accent hover:underline"
            >
              Request new reset link
            </Link>
          </div>
        )}

        {tokenState === "ready" && !done && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                htmlFor="password"
                className="block text-xs font-medium text-gallery-muted mb-1.5"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white border border-gallery-border text-gallery-text text-sm rounded-lg px-3 py-2.5 placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-gallery-muted mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white border border-gallery-border text-gallery-text text-sm rounded-lg px-3 py-2.5 placeholder:text-gallery-muted/50 focus:outline-none focus:ring-2 focus:ring-gallery-accent/30 focus:border-gallery-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full bg-gallery-accent text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gallery-accent-hover transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {tokenState === "ready" && done && (
          <div className="border border-green-300 bg-green-50 p-4 rounded-lg mt-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5" />
              <p className="text-xs text-green-800 leading-relaxed">
                Password updated successfully. You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block mt-3 text-xs text-gallery-accent hover:underline"
            >
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
