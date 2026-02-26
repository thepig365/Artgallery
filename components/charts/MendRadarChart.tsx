"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

export interface BPMSScore {
  B: number;
  P: number;
  M: number;
  S: number;
}

interface MendRadarChartProps {
  scores: BPMSScore | null;
  size?: number;
  strokeColor?: string;
  className?: string;
}

const AXIS_LABELS = ["B", "P", "M", "S"] as const;

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v));
}

function isValidScores(scores: BPMSScore | null): scores is BPMSScore {
  if (!scores) return false;
  return AXIS_LABELS.every(
    (k) => typeof scores[k] === "number" && isFinite(scores[k])
  );
}

export function MendRadarChart({
  scores,
  size = 200,
  strokeColor = "#E5E5E5",
  className = "",
}: MendRadarChartProps) {
  const data = useMemo(() => {
    if (!isValidScores(scores)) return null;
    return AXIS_LABELS.map((axis) => ({
      axis,
      value: clamp(scores[axis]),
    }));
  }, [scores]);

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center border border-noir-border bg-noir-surface ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] text-noir-muted tracking-widest uppercase">
          No Valid Data
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="#222222"
            strokeWidth={1}
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: "#9A9A9A",
              fontSize: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          />
          <Radar
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1}
            fill="none"
            dot={{
              r: 2,
              fill: strokeColor,
              stroke: strokeColor,
              strokeWidth: 1,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
