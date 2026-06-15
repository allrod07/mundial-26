"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";
import { Countdown } from "@/components/home/Countdown";
import { kickoffEpoch, fmtDay, fmtKickoff } from "@/lib/format";
import type { Tz } from "@/store/useTimezone";

function teamName(code?: string): string | undefined {
  return code ? TEAM_MAP[code]?.name ?? code : undefined;
}

/**
 * Painel "Próxima partida" do banner. Seleciona pelo INSTANTE REAL do pontapé
 * (kickoffEpoch), não pelo status — assim, quando o horário chega, o banner
 * avança sozinho para o próximo jogo mesmo que o placar do anterior ainda não
 * tenha sido registrado. Quando há vários jogos no mesmo horário, lista todos.
 */
export function NextMatchPanel({ matches, tz }: { matches: Match[]; tz: Tz }) {
  // Relógio local (1s) isolado neste componente para não re-renderizar a home
  // inteira a cada segundo — mesmo padrão do <Countdown/>.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const slot = useMemo(() => {
    const future = matches
      .map((m) => ({ m, k: kickoffEpoch(m.date, m.cityId) }))
      .filter((x) => x.k > now)
      .sort((a, b) => a.k - b.k);
    if (!future.length) return null;
    const targetMs = future[0].k;
    return { targetMs, list: future.filter((x) => x.k === targetMs).map((x) => x.m) };
  }, [matches, now]);

  if (!slot) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-md">
        <div className="text-xs font-bold uppercase tracking-wide text-white/70">Próxima partida</div>
        <div className="mt-2 text-sm text-white/80">Nenhum jogo agendado no momento.</div>
      </div>
    );
  }

  const multiple = slot.list.length > 1;
  const first = slot.list[0];
  const tzLabel = tz === "brt" ? "Brasília" : "local";

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-white/70">
          {multiple ? "Próximos jogos" : "Próxima partida"}
        </span>
        {multiple && (
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
            {slot.list.length} jogos
          </span>
        )}
      </div>
      <div className="mb-4 text-sm text-white/80">
        {fmtDay(first.date)} · {fmtKickoff(first.date, first.cityId, tz)}{" "}
        <span className="text-white/50">({tzLabel})</span>
      </div>

      {multiple ? (
        <ul className="space-y-2">
          {slot.list.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-white"
            >
              {m.group && (
                <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/70">
                  {m.group}
                </span>
              )}
              <Flag code={m.homeCode} emoji={m.homeCode ? undefined : "🏳️"} size="sm" ring={false} />
              <span className="min-w-0 flex-1 truncate text-right text-xs font-bold">
                {teamName(m.homeCode) ?? m.homeLabel ?? "A definir"}
              </span>
              <span className="shrink-0 text-[11px] font-bold text-white/50">×</span>
              <span className="min-w-0 flex-1 truncate text-xs font-bold">
                {teamName(m.awayCode) ?? m.awayLabel ?? "A definir"}
              </span>
              <Flag code={m.awayCode} emoji={m.awayCode ? undefined : "🏳️"} size="sm" ring={false} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-between gap-2 text-white">
          <TeamMini code={first.homeCode} label={first.homeLabel} />
          <span className="shrink-0 px-2 text-lg font-bold text-white/60">VS</span>
          <TeamMini code={first.awayCode} label={first.awayLabel} />
        </div>
      )}

      <div className="mt-5 border-t border-white/15 pt-4">
        <Countdown targetMs={slot.targetMs} />
      </div>
    </div>
  );
}

function TeamMini({ code, label }: { code?: string; label?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <Flag code={code} emoji={code ? undefined : "🏳️"} size="lg" ring={false} />
      <span className="truncate text-center text-xs font-bold">
        {teamName(code) ?? label ?? "A definir"}
      </span>
    </div>
  );
}
