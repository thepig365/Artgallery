"use client";

import { ExternalLink, ImageOff } from "lucide-react";
import { motion } from "framer-motion";

interface ForensicViewerProps {
  src?: string | null;
  alt?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  className?: string;
}

export function ForensicViewer({
  src,
  alt = "Evidence",
  sourceUrl,
  sourceLabel,
  className = "",
}: ForensicViewerProps) {
  const isPlaceholder = !src;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24 }}
      className={`
        relative border border-noir-border bg-noir-bg overflow-hidden
        ${className}
      `}
    >
      {isPlaceholder ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
          <ImageOff className="w-6 h-6 text-noir-muted/50" strokeWidth={1} aria-hidden="true" />
          <span className="text-[10px] text-noir-muted tracking-widest uppercase">
            No Evidence Linked
          </span>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          <div className="scanline-overlay" aria-hidden="true" />
        </>
      )}

      {sourceUrl && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-noir-border bg-noir-bg/90 px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-noir-muted tracking-wider uppercase truncate">
            {sourceLabel || "Source"}
          </span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open source: ${sourceLabel || "external link"}`}
            className="text-noir-muted hover:text-noir-text transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
          >
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
