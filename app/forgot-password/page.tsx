"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, MailCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError("Unable to send reset email right now.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-gallery-muted" strokeWidth={1} aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gallery-text tracking-tight">
            Forgot Password
          </h1>
        </div>
        <p className="text-sm text-gallery-muted mb-6">
          Enter your account email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="border border-green-300 bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <MailCheck className="w-4 h-4 text-green-700 mt-0.5" />
              <p className="text-xs text-green-800 leading-relaxed">
                If that email exists in our system, a password reset link has been sent.
                Please check your inbox and spam folder.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs text-gallery-accent hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gallery-accent text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gallery-accent-hover transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <p className="text-[11px] text-gallery-muted/70 text-center">
              <Link href="/login" className="hover:underline text-gallery-accent">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
