"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { Select } from "@/components/ui/Select";
import { NumberInput } from "@/components/ui/NumberInput";
import { MendRadarChart } from "@/components/charts/MendRadarChart";
import { ForensicViewer } from "@/components/media/ForensicViewer";
import { MEDIUM_OPTIONS } from "@/lib/types";

export default function UIPreviewPage() {
  const [numberVal, setNumberVal] = useState(5.0);
  const [selectVal, setSelectVal] = useState("");

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <header>
        <h1 className="text-xl font-medium tracking-forensic text-noir-text mb-2">
          UI Component Laboratory
        </h1>
        <p className="text-noir-muted text-sm">
          Complete noir design system primitive catalog.
        </p>
      </header>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          Buttons
        </h2>
        <Divider />
        <Panel>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-3">
                Variants
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-3">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-3">
                States
              </p>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="accent" disabled>
                  Accent Disabled
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          Badges
        </h2>
        <Divider />
        <Panel>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="accent">Alert</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge>Draft</Badge>
            <Badge variant="accent">Variance</Badge>
          </div>
        </Panel>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          Form Elements
        </h2>
        <Divider />
        <Panel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="input-default">Standard Input</Label>
                <Input id="input-default" placeholder="Enter value..." />
              </div>
              <div>
                <Label htmlFor="input-error" required>
                  Input with Error
                </Label>
                <Input id="input-error" error placeholder="Invalid entry" />
                <p className="text-noir-accent text-[10px] mt-1 tracking-wider">
                  Field is required
                </p>
              </div>
              <div>
                <Label htmlFor="input-disabled">Disabled Input</Label>
                <Input id="input-disabled" disabled value="Locked value" />
              </div>
              <div>
                <Label htmlFor="select-demo">Select</Label>
                <Select
                  id="select-demo"
                  options={MEDIUM_OPTIONS}
                  placeholder="Select medium..."
                  value={selectVal}
                  onChange={(e) => setSelectVal(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="textarea-demo">Textarea</Label>
                <Textarea
                  id="textarea-demo"
                  placeholder="Provide narrative justification..."
                />
              </div>
              <div>
                <Label>Number Input (0–10, step 0.1)</Label>
                <NumberInput
                  value={numberVal}
                  onChange={setNumberVal}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
              <div>
                <Label>Number Input — Disabled</Label>
                <NumberInput
                  value={7.5}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Panels & Dividers */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          Panels & Dividers
        </h2>
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel>
            <p className="text-sm text-noir-text">Standard Panel</p>
            <p className="text-xs text-noir-muted mt-1">
              With default padding and border.
            </p>
          </Panel>
          <Panel noPadding>
            <div className="p-4 border-b border-noir-border">
              <p className="text-sm text-noir-text">Panel Header</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-noir-muted">
                No-padding panel with custom sections.
              </p>
            </div>
          </Panel>
        </div>
        <Divider label="Section Break" className="my-8" />
        <Panel>
          <p className="text-xs text-noir-muted">
            Labeled divider shown above.
          </p>
        </Panel>
      </section>

      {/* MendRadarChart */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          MendRadarChart — B/P/M/S Scoring
        </h2>
        <Divider />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Panel>
            <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-4">
              Valid Scores
            </p>
            <MendRadarChart
              scores={{ B: 7.2, P: 8.1, M: 6.5, S: 7.8 }}
              size={220}
            />
          </Panel>
          <Panel>
            <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-4">
              Edge Case — Max Values
            </p>
            <MendRadarChart
              scores={{ B: 10, P: 10, M: 10, S: 10 }}
              size={220}
            />
          </Panel>
          <Panel>
            <p className="text-[10px] text-noir-muted tracking-widest uppercase mb-4">
              Fallback — Invalid Data
            </p>
            <MendRadarChart scores={null} size={220} />
          </Panel>
        </div>
      </section>

      {/* ForensicViewer */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium tracking-widest uppercase text-noir-muted">
          ForensicViewer — Evidence Display
        </h2>
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel noPadding>
            <ForensicViewer
              src="https://placehold.co/800x600/111111/9A9A9A?text=Evidence+001"
              alt="Texture evidence macro"
              sourceUrl="https://example.com/evidence"
              sourceLabel="Source Archive"
            />
          </Panel>
          <Panel noPadding>
            <ForensicViewer />
          </Panel>
        </div>
      </section>
    </div>
  );
}
