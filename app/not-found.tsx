import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="border border-noir-border bg-noir-surface p-8">
        <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-4">
          Error 404
        </p>
        <h1 className="text-lg font-medium tracking-forensic text-noir-text mb-3">
          Page Not Found
        </h1>
        <p className="text-xs text-noir-muted leading-relaxed mb-8">
          The requested resource does not exist in the protocol archive.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-noir-border px-4 py-2 text-xs font-medium tracking-widest uppercase text-noir-text hover:bg-noir-surface hover:text-white transition-colors duration-120 focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text"
        >
          Return to Index
        </Link>
      </div>
    </div>
  );
}
