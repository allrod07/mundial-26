"use client";

import Link from "next/link";
import { useState } from "react";
import type { TeamProjection } from "@/lib/engine/projections";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";
import { Tabs } from "@/components/ui/Tabs";
import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLS: { key: keyof TeamProjection; label: string }[] = [
  { key: "groupWinner", label: "1º grupo" },
  { key: "qualify", label: "Classifica" },
  { key: "oitavas", label: "Oitavas" },
  { key: "quartas", label: "Quartas" },
  { key: "semis", label: "Semis" },
  { key: "final", label: "Final" },
  { key: "titulo", label: "Título" },
];

function heat(p: number): React.CSSProperties {
  if (p <= 0) return { color: "var(--ink-400, #7d8cb2)" };
  return {
    background: `rgba(0, 199, 95, ${0.08 + p * 0.82})`,
    color: p > 0.55 ? "#04130b" : undefined,
    fontWeight: 700,
  };
}

export function ProjectionsTable({ data }: { data: TeamProjection[] }) {
  const [sort, setSort] = useState<keyof TeamProjection>("titulo");

  const rows = [...data].sort((a, b) => (b[sort] as number) - (a[sort] as number));

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-xs font-semibold text-ink-400">Ordenar por:</span>
        <Tabs
          items={COLS.map((c) => ({ id: c.key, label: c.label }))}
          value={sort}
          onChange={(v) => setSort(v as keyof TeamProjection)}
          size="sm"
          idPrefix="proj-sort"
        />
      </div>

      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-ink-400">
              <th className="py-3 pl-4 text-left font-semibold">#</th>
              <th className="py-3 text-left font-semibold">Seleção</th>
              <th className="py-3 text-center font-semibold">Gr.</th>
              {COLS.map((c) => (
                <th key={c.key} className="py-3 text-center font-semibold">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const team = TEAM_MAP[r.code];
              return (
                <tr key={r.code} className="border-b border-[var(--border)] last:border-0 hover:bg-pitch-500/5">
                  <td className="py-2 pl-4 text-ink-400">{i + 1}</td>
                  <td className="py-2">
                    <Link href={`/selecoes/${r.code}`} className="flex items-center gap-2 font-semibold hover:text-pitch-600 dark:hover:text-pitch-300">
                      <Flag code={r.code} size="xs" />
                      <span className="truncate">{team?.name}</span>
                    </Link>
                  </td>
                  <td className="py-2 text-center text-ink-400">{r.group}</td>
                  {COLS.map((c) => (
                    <td key={c.key} className="px-1 py-1 text-center">
                      <div
                        className={cn("mx-auto rounded-md py-1.5 stat-num text-xs tabular")}
                        style={heat(r[c.key] as number)}
                      >
                        {(r[c.key] as number) > 0.001 ? fmtPct(r[c.key] as number) : "—"}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
