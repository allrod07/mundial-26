"use client";

import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell,
} from "recharts";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarTrend({
  data,
  height = 260,
  color = "#00c75f",
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-300/20" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-400" tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "rgba(0,199,95,0.08)" }}
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
