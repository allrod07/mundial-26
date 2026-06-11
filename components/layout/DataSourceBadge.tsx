"use client";

import { useTournament } from "@/components/providers/TournamentProvider";
import { Radio, Database } from "lucide-react";

export function DataSourceBadge() {
  const { dataSource } = useTournament();
  const live = dataSource === "live";
  return (
    <span
      title={live ? "Resultados ao vivo (preenchidos no painel /admin)" : "Aguardando resultados — preencha as partidas no painel /admin"}
      className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${
        live
          ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300"
          : "border-[var(--border)] text-ink-400"
      }`}
    >
      {live ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-live" />
          AO VIVO
        </>
      ) : (
        <>
          <Database size={11} /> PRÉ-COPA
        </>
      )}
    </span>
  );
}
