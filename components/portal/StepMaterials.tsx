"use client";

import { Panel } from "@/components/ui/Panel";

const MATERIALS = [
  "Oil Paint",
  "Acrylic Paint",
  "Watercolour",
  "Ink",
  "Canvas",
  "Linen",
  "Paper",
  "Wood Panel",
  "Charcoal / Graphite",
  "Pastel",
  "Mixed Media",
  "Textile / Fabric",
] as const;

interface StepMaterialsProps {
  selectedMaterials: string[];
  materialsOther: string;
  onToggle: (material: string) => void;
  onOtherChange: (value: string) => void;
}

export function StepMaterials({
  selectedMaterials,
  materialsOther,
  onToggle,
  onOtherChange,
}: StepMaterialsProps) {
  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-2">
        Material Declaration (Optional)
      </h2>
      <p className="text-xs text-noir-muted mb-6">
        Tick any materials used in this artwork. You can skip this step if
        unsure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {MATERIALS.map((item) => {
          const isSelected = selectedMaterials.includes(item);
          const inputId = `mat-${item.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <label
              key={item}
              htmlFor={inputId}
              className="flex items-center gap-3 py-2 cursor-pointer group"
            >
              <span
                className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-120 ${
                  isSelected
                    ? "border-noir-text bg-noir-text"
                    : "border-noir-border group-hover:border-noir-muted"
                }`}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="text-noir-bg"
                  >
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <input
                id={inputId}
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(item)}
                className="sr-only"
              />
              <span
                className={`text-xs transition-colors duration-120 ${
                  isSelected ? "text-noir-text" : "text-noir-muted group-hover:text-noir-text"
                }`}
              >
                {item}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-6">
        <label
          htmlFor="materials-other"
          className="text-[10px] font-medium text-noir-muted tracking-widest uppercase mb-1.5 block"
        >
          Other (optional)
        </label>
        <input
          id="materials-other"
          value={materialsOther}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="e.g., Resin, Gold Leaf, Found Objects"
          className="w-full bg-noir-bg border border-noir-border text-noir-text text-sm px-3 py-2 placeholder:text-noir-muted/60 focus:outline-none focus:border-noir-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-noir-text focus-visible:outline-offset-[-1px]"
        />
      </div>
    </Panel>
  );
}
