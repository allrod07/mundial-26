"use client";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { ATTR_LABELS, type Attributes } from "@/lib/engine/attributes";

export interface RadarSeries {
  name: string;
  color: string;
  attrs: Attributes;
}

export function RadarStats({ series, height = 320 }: { series: RadarSeries[]; height?: number }) {
  const data = ATTR_LABELS.map((a) => {
    const row: Record<string, number | string> = { axis: a.short, fullMark: 100 };
    series.forEach((s, i) => (row[`s${i}`] = s.attrs[a.key]));
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="currentColor" className="text-ink-300/40" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fontWeight: 700, fill: "currentColor" }} className="text-ink-500" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        {series.map((s, i) => (
          <Radar
            key={i}
            name={s.name}
            dataKey={`s${i}`}
            stroke={s.color}
            fill={s.color}
            fillOpacity={series.length > 1 ? 0.22 : 0.35}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
