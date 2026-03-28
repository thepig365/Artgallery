"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  buildShareMailto,
  facebookShareUrl,
  linkedInShareUrl,
} from "@/lib/share-links";

export type PageShareStripVariant = "on-dark" | "on-light";

export interface PageShareStripProps {
  url: string;
  mailtoSubject: string;
  mailtoIntro: string;
  variant?: PageShareStripVariant;
  className?: string;
}

export function PageShareStrip({
  url,
  mailtoSubject,
  mailtoIntro,
  variant = "on-light",
  className = "",
}: PageShareStripProps) {
  const [copied, setCopied] = useState(false);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (clearRef.current) clearTimeout(clearRef.current);
      clearRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [url]);

  useEffect(() => {
    return () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    };
  }, []);

  const mailtoHref = buildShareMailto({
    subject: mailtoSubject,
    intro: mailtoIntro,
    url,
  });
  const isDark = variant === "on-dark";

  const linkClass = isDark
    ? "text-sm text-white/60 transition-colors underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-family-navy rounded-sm"
    : "text-sm text-gallery-muted transition-colors underline-offset-4 hover:text-gallery-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gallery-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gallery-surface rounded-sm";

  const labelClass = isDark
    ? "mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40"
    : "mb-3 text-micro font-medium uppercase tracking-[0.2em] text-gallery-accent";

  const sepClass = isDark ? "select-none px-1.5 text-sm text-white/25" : "select-none px-1.5 text-sm text-gallery-border";

  const borderClass = isDark ? "border-white/15" : "border-gallery-border";

  return (
    <div className={`border-t pt-5 ${borderClass} ${className}`}>
      <p className={labelClass}>Share</p>
      <div
        className="flex flex-wrap items-center gap-y-2"
        role="group"
        aria-label="Share this page"
      >
        <button type="button" onClick={copyLink} className={linkClass}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        <span className={sepClass} aria-hidden>
          ·
        </span>
        <a href={mailtoHref} className={linkClass}>
          Email
        </a>
        <span className={sepClass} aria-hidden>
          ·
        </span>
        <a
          href={linkedInShareUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          LinkedIn
        </a>
        <span className={sepClass} aria-hidden>
          ·
        </span>
        <a
          href={facebookShareUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Facebook
        </a>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Page link copied to clipboard" : ""}
      </p>
    </div>
  );
}
