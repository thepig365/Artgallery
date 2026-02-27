"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Panel } from "@/components/ui/Panel";
import { MEDIUM_OPTIONS } from "@/lib/types";
import type { IdentityFormData, IdentityFields } from "@/lib/types";

interface StepIdentityProps {
  data: IdentityFormData;
  onChange: (field: IdentityFields, value: string) => void;
  errors: Record<string, string>;
}

export function StepIdentity({ data, onChange, errors }: StepIdentityProps) {
  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-forensic text-noir-text mb-6">
        Artwork Details
      </h2>
      <div className="space-y-5">
        <div>
          <Label htmlFor="workTitle" required>
            Work Title
          </Label>
          <Input
            id="workTitle"
            value={data.workTitle}
            onChange={(e) => onChange("workTitle", e.target.value)}
            placeholder="e.g., Erosion Study No. 7"
            error={!!errors.workTitle}
          />
          {errors.workTitle && (
            <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
              {errors.workTitle}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="artistName" required>
            Artist Name
          </Label>
          <Input
            id="artistName"
            value={data.artistName}
            onChange={(e) => onChange("artistName", e.target.value)}
            placeholder="e.g., Jane Smith"
            error={!!errors.artistName}
          />
          {errors.artistName && (
            <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
              {errors.artistName}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="medium" required>
            Medium
          </Label>
          <Select
            id="medium"
            options={MEDIUM_OPTIONS}
            placeholder="Select primary medium..."
            value={data.medium}
            onChange={(e) => onChange("medium", e.target.value)}
            error={!!errors.medium}
          />
          {errors.medium && (
            <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
              {errors.medium}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year" required>
              Year of Completion
            </Label>
            <Input
              id="year"
              type="number"
              value={data.year}
              onChange={(e) => onChange("year", e.target.value)}
              placeholder="2024"
              error={!!errors.year}
            />
            {errors.year && (
              <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
                {errors.year}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dimensions" required>
              Dimensions
            </Label>
            <Input
              id="dimensions"
              value={data.dimensions}
              onChange={(e) => onChange("dimensions", e.target.value)}
              placeholder="120 × 90 cm"
              error={!!errors.dimensions}
            />
            {errors.dimensions && (
              <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
                {errors.dimensions}
              </p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
