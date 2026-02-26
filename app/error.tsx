"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="border border-noir-accent/30 bg-noir-surface p-8">
        <p className="text-[10px] text-noir-accent tracking-widest uppercase mb-4">
          System Error
        </p>
        <h1 className="text-lg font-medium tracking-forensic text-noir-text mb-3">
          An Error Occurred
        </h1>
        <p className="text-xs text-noir-muted leading-relaxed mb-2">
          The protocol system encountered an unexpected condition.
        </p>
        {error.digest && (
          <p className="text-[10px] text-noir-muted/50 tracking-widest uppercase mb-8">
            Ref: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center justify-center border border-noir-border px-4 py-2 text-xs font-medium tracking-widest uppercase text-noir-text hover:bg-noir-surface hover:text-white transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
