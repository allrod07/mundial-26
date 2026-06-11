"use client";

import { Clock } from "lucide-react";
import { useTimezoneStore, useTz } from "@/store/useTimezone";

export function TimezoneToggle() {
  const tz = useTz();
  const toggle = useTimezoneStore((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      title={
        tz === "brt"
          ? "Horário de Brasília — clique para o horário local da sede"
          : "Horário local da sede — clique para o horário de Brasília"
      }
      aria-label="Alternar fuso horário"
      className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--border)] px-2.5 text-[11px] font-bold text-ink-500 transition-colors hover:text-pitch-600 dark:hover:text-pitch-300"
    >
      <Clock size={14} />
      {tz === "brt" ? "BRT" : "Local"}
    </button>
  );
}
