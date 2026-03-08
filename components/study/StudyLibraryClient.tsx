"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface StudyItem {
  slug: string;
  name: string;
  blurb: string;
  institution: string | null;
  kind: "master" | "pack";
}

interface StudyLibraryClientProps {
  items: StudyItem[];
}

export function StudyLibraryClient({ items }: StudyLibraryClientProps) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "master" | "pack">("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const hasActiveFilters =
    !!query.trim() || kindFilter !== "all" || institutionFilter !== "all";

  const institutions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.institution).filter(Boolean))
    ).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (institutionFilter !== "all" && item.institution !== institutionFilter) return false;
      return true;
    });
  }, [items, query, kindFilter, institutionFilter]);

  return (
    <>
      <section className="border border-gallery-border rounded-lg bg-gallery-surface p-4 sm:p-5 mb-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gallery-muted">
            Library Filters
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setKindFilter("all");
              setInstitutionFilter("all");
            }}
            className="text-xs text-gallery-accent hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label htmlFor="study-search" className="mb-1 block text-xs text-gallery-muted">
              Search
            </label>
            <input
              id="study-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist or study guide"
              className="w-full rounded-md border border-gallery-border bg-white px-3 py-2 text-sm text-gallery-text"
            />
          </div>
          <div>
            <label htmlFor="study-kind" className="mb-1 block text-xs text-gallery-muted">
              Guide type
            </label>
            <select
              id="study-kind"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as "all" | "master" | "pack")}
              className="w-full rounded-md border border-gallery-border bg-white px-3 py-2 text-sm text-gallery-text"
            >
              <option value="all">All guide types</option>
              <option value="master">Modern Masters</option>
              <option value="pack">Study Packs</option>
            </select>
          </div>
          <div>
            <label htmlFor="study-institution" className="mb-1 block text-xs text-gallery-muted">
              Institution
            </label>
            <select
              id="study-institution"
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="w-full rounded-md border border-gallery-border bg-white px-3 py-2 text-sm text-gallery-text"
            >
              <option value="all">All institutions</option>
              {institutions.map((institution) => (
                <option key={institution!} value={institution!}>
                  {institution}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-gallery-muted">
          {filtered.length} of {items.length} study guides
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Link
            key={item.slug}
            href={`/study/${item.slug}`}
            className="group bg-gallery-surface border border-gallery-border rounded-lg p-5 hover:border-gallery-accent/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gallery-text group-hover:text-gallery-accent transition-colors mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-gallery-muted mb-2">
                  {item.institution ?? "Study Pack"}
                </p>
                <p className="text-sm text-gallery-muted/80 leading-relaxed line-clamp-2">
                  {item.blurb}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-gallery-muted/40 group-hover:text-gallery-accent transition-colors shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
