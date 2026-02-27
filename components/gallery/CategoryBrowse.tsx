import Link from "next/link";
import {
  Paintbrush,
  Layers,
  Droplets,
  Box,
  Camera,
  Aperture,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  label: string;
  medium: string;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { label: "Oil Painting", medium: "oil", icon: Paintbrush },
  { label: "Mixed Media", medium: "mixed", icon: Layers },
  { label: "Watercolor", medium: "watercolor", icon: Droplets },
  { label: "Sculpture", medium: "sculpture", icon: Box },
  { label: "Photography", medium: "photography", icon: Camera },
  { label: "Digital", medium: "digital", icon: Aperture },
];

export function CategoryBrowse() {
  return (
    <section className="py-16 sm:py-20 bg-gallery-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-gallery-accent mb-2">
            Explore by Medium
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gallery-text tracking-tight">
            Browse Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ label, medium, icon: Icon }) => (
            <Link
              key={medium}
              href={`/archive?medium=${medium}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gallery-accent/30 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-full bg-gallery-surface-alt flex items-center justify-center group-hover:bg-gallery-accent/10 transition-colors duration-200">
                <Icon
                  className="w-5 h-5 text-gallery-muted group-hover:text-gallery-accent transition-colors duration-200"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-xs font-medium text-gallery-text text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
