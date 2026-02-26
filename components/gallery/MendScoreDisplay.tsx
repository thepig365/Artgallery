interface MendScoreDisplayProps {
  scores: { B: number; P: number; M: number; S: number };
  finalV: number | null;
}

const AXES = [
  { key: "B" as const, label: "Body", sublabel: "Physical Integrity", weight: 25 },
  { key: "P" as const, label: "Process", sublabel: "Material Evidence", weight: 20 },
  { key: "M" as const, label: "Material", sublabel: "Sincerity Index", weight: 35 },
  { key: "S" as const, label: "Surface", sublabel: "Forensic Coherence", weight: 20 },
];

export function MendScoreDisplay({ scores, finalV }: MendScoreDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {AXES.map(({ key, label, sublabel, weight }) => (
          <div
            key={key}
            className="bg-gallery-surface-alt rounded-lg p-4 border border-gallery-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gallery-muted uppercase tracking-wide">
                {key} &middot; {label}
              </span>
              <span className="text-[10px] text-gallery-muted/60">
                {weight}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gallery-text tabular-nums">
              {scores[key].toFixed(1)}
            </p>
            <p className="text-[11px] text-gallery-muted mt-0.5">{sublabel}</p>
            {/* Score bar */}
            <div className="mt-3 h-1.5 bg-gallery-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gallery-accent rounded-full transition-all duration-500"
                style={{ width: `${(scores[key] / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {finalV != null && (
        <div className="bg-gallery-accent/5 border border-gallery-accent/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gallery-accent uppercase tracking-wide">
              Mend Index (V)
            </p>
            <p className="text-[11px] text-gallery-muted mt-0.5">
              Composite curatorial assessment
            </p>
          </div>
          <p className="text-3xl font-bold text-gallery-accent tabular-nums">
            {finalV.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
