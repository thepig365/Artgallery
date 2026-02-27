"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ClipboardCheck,
  Copy,
  Clock,
  ListChecks,
  Mail,
  Archive,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";

interface SubmissionSuccessProps {
  referenceId: string | null;
  onSubmitAnother?: () => void;
}

const NEXT_STEPS = [
  {
    icon: Clock,
    title: "Verification check (24–48 hours)",
    description:
      "We review submission completeness and ownership evidence.",
  },
  {
    icon: ListChecks,
    title: "Protocol assessment queue",
    description: "Your work enters the next review stage.",
  },
  {
    icon: Mail,
    title: "Status update by email",
    description: "We'll notify you when the status changes.",
  },
];

const WHILE_YOU_WAIT = [
  "Explore works already in the Archive",
  "Read how the Material Sincerity framework works",
  "Prepare photos and details for your next submission",
];

const CTA_LINKS = [
  { href: "/archive", label: "View Archive", icon: Archive },
  { href: "/protocol", label: "Read the Protocol", icon: BookOpen },
  { href: "/portal/submit", label: "Submit Another Work", icon: PenTool },
];

export function SubmissionSuccess({ referenceId, onSubmitAnother }: SubmissionSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referenceId) return;
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API may not be available */
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      {/* Confirmation */}
      <div className="border border-noir-border bg-noir-surface p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle
            className="w-5 h-5 text-noir-text flex-shrink-0"
            strokeWidth={1.5}
          />
          <Badge variant="default">Submitted</Badge>
        </div>

        <h1 className="text-lg font-medium tracking-forensic text-noir-text mb-3">
          Submission Received
        </h1>

        <p className="text-xs text-noir-muted leading-relaxed mb-6">
          Thank you — your work has been successfully submitted and entered into
          our review queue.
        </p>

        <p className="text-xs text-noir-muted leading-relaxed mb-6">
          We will complete an initial verification check (submission
          completeness and ownership evidence) within 24–48 hours. If anything
          is missing, we&apos;ll contact you by email. If all checks pass, your
          work will move to the next assessment stage.
        </p>

        {referenceId && (
          <div className="border border-noir-border bg-noir-bg px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-0.5">
                Reference
              </p>
              <p className="text-sm text-noir-text font-mono tracking-wide truncate">
                {referenceId}
              </p>
            </div>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Reference copied" : "Copy reference"}
              className="flex-shrink-0 p-2 text-noir-muted hover:text-noir-text border border-noir-border hover:border-noir-muted transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
            >
              {copied ? (
                <ClipboardCheck className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        )}

        <p className="text-[10px] text-noir-muted mt-3">
          Please keep this reference for support enquiries.
        </p>
      </div>

      {/* What happens next */}
      <div className="border border-noir-border bg-noir-surface p-6 sm:p-8 mb-6">
        <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-4">
          What happens next
        </h2>
        <div className="space-y-4">
          {NEXT_STEPS.map((step) => (
            <div key={step.title} className="flex items-start gap-3">
              <step.icon
                className="w-4 h-4 text-noir-muted flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-xs text-noir-text font-medium">
                  {step.title}
                </p>
                <p className="text-[11px] text-noir-muted leading-relaxed mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* While you wait */}
      <div className="border border-noir-border bg-noir-surface p-6 sm:p-8 mb-6">
        <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-3">
          While you wait
        </h2>
        <ul className="space-y-2">
          {WHILE_YOU_WAIT.map((item) => (
            <li
              key={item}
              className="text-xs text-noir-muted leading-relaxed flex items-start gap-2"
            >
              <span
                className="w-1 h-1 bg-noir-muted flex-shrink-0 mt-[6px]"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {CTA_LINKS.map((cta) => {
          const isSubmitAnother = cta.href === "/portal/submit";
          if (isSubmitAnother && onSubmitAnother) {
            return (
              <button
                key={cta.href}
                type="button"
                onClick={onSubmitAnother}
                className="flex items-center justify-center gap-2 border border-noir-border text-noir-text hover:bg-noir-surface hover:text-white px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
              >
                <cta.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {cta.label}
              </button>
            );
          }
          return (
            <Link
              key={cta.href}
              href={cta.href}
              className="flex items-center justify-center gap-2 border border-noir-border text-noir-text hover:bg-noir-surface hover:text-white px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
            >
              <cta.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {cta.label}
            </Link>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-noir-muted/50 leading-relaxed">
        {DISCLAIMERS.report}
      </p>
    </div>
  );
}
