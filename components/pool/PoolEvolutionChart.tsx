"use client";

import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
} from "recharts";
import type { PoolEvolution, PoolResult } from "@/lib/engine/pool";

const COLORS = ["#00c75f", "#e0991f", "#3b82f6", "#ef4444", "#a855f7", "#14b8a6", "#f97316", "#ec4899"];

export function PoolEvolutionChart({ evo, results }: { evo: PoolEvolution; results: PoolResult[] }) {
  const top = results.slice(0, 8);
  if (evo.checkpoints.length === 0 || top.length === 0) return null;

  const data = evo.checkpoints.map((c, i) => {
    const row: Record<string, number | string> = { label: c.label };
    for (const r of top) row[r.participant.name] = evo.series[r.participant.id]?.[i] ?? 0;
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-300/20" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {top.map((r, i) => (
          <Line key={r.participant.id} type="monotone" dataKey={r.participant.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
