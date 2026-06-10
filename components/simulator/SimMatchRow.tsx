"use client";

import type { Match } from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { useTournament } from "@/components/providers/TournamentProvider";
import { Flag } from "@/components/ui/Flag";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { fmtTime } from "@/lib/format";

function Stepper({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] text-ink-400 transition-colors hover:border-red-500/40 hover:text-red-500"
        aria-label="Diminuir"
      >
        <Minus size={13} />
      </button>
      <span className={`w-7 text-center stat-num text-xl font-extrabold ${accent ? "text-pitch-600 dark:text-pitch-300" : ""}`}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] text-ink-400 transition-colors hover:border-pitch-500/40 hover:text-pitch-500"
        aria-label="Aumentar"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export function SimMatchRow({ match }: { match: Match }) {
  const { overrides, setResult, clearResult } = useTournament();
  const ov = overrides[match.id];
  const knockout = match.stage !== "Grupos";

  const home = match.homeCode ? TEAM_MAP[match.homeCode] : undefined;
  const away = match.awayCode ? TEAM_MAP[match.awayCode] : undefined;

  if (!home || !away) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-ink-400">
        <span className="flex-1 truncate text-right">{match.homeLabel}</span>
        <span className="px-3 text-xs">a definir</span>
        <span className="flex-1 truncate">{match.awayLabel}</span>
      </div>
    );
  }

  const hg = ov?.homeGoals ?? match.homeGoals ?? 0;
  const ag = ov?.awayGoals ?? match.awayGoals ?? 0;
  const hp = ov?.homePens ?? match.homePens ?? 4;
  const ap = ov?.awayPens ?? match.awayPens ?? 2;
  const isDraw = knockout && hg === ag;

  const update = (nh: number, na: number, ph?: number, pa?: number) => {
    if (knockout && nh === na) {
      setResult(match.id, nh, na, [ph ?? hp, pa ?? ap]);
    } else {
      setResult(match.id, nh, na);
    }
  };

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-semibold">{home.name}</span>
          <Flag code={match.homeCode} size="sm" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Stepper value={hg} onChange={(v) => update(v, ag)} accent={hg > ag} />
          <span className="text-ink-300">:</span>
          <Stepper value={ag} onChange={(v) => update(hg, v)} accent={ag > hg} />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={match.awayCode} size="sm" />
          <span className="truncate text-sm font-semibold">{away.name}</span>
        </div>
        <button
          onClick={() => clearResult(match.id)}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 transition-opacity hover:text-red-500 ${ov ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          aria-label="Limpar resultado"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {isDraw && (
        <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-ink-400">
          <span>Pênaltis</span>
          <Stepper value={hp} onChange={(v) => update(hg, ag, v, ap)} />
          <span className="text-ink-300">:</span>
          <Stepper value={ap} onChange={(v) => update(hg, ag, hp, v)} />
        </div>
      )}

      {!ov && match.status === "agendado" && (
        <div className="mt-0.5 text-center text-[10px] text-ink-400">{fmtTime(match.date)} · não disputado</div>
      )}
    </div>
  );
}
