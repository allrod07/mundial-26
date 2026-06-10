"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Trophy, Flag as FlagIcon, ChevronRight, Info, Wand2, Route as RouteIcon } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAMS, TEAM_MAP, GROUPS } from "@/lib/data/teams";
import { getTeamRoute, type RouteStep, type StepStatus } from "@/lib/engine/route";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const STAGE_LABEL: Record<string, string> = {
  "16-avos": "16-avos de final",
  Oitavas: "Oitavas de final",
  Quartas: "Quartas de final",
  Semifinal: "Semifinal",
  Final: "Final",
};

const STATUS_META: Record<StepStatus, { label: string; tone: "pitch" | "blue" | "ink" | "red"; dot: string }> = {
  won: { label: "Avançou", tone: "pitch", dot: "bg-pitch-500" },
  playing: { label: "Em disputa", tone: "blue", dot: "bg-blue-500" },
  projected: { label: "Projeção", tone: "ink", dot: "bg-ink-400" },
  lost: { label: "Eliminado", tone: "red", dot: "bg-red-500" },
};

function StepCard({ step }: { step: RouteStep }) {
  const meta = STATUS_META[step.status];
  const opp = step.opponentCode ? TEAM_MAP[step.opponentCode] : undefined;
  return (
    <div className="relative flex items-center gap-3 pl-8">
      <span className={cn("absolute left-[9px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-4 ring-[var(--bg)]", meta.dot)} />
      <div className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
            {STAGE_LABEL[step.stage] ?? step.stage}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-ink-400">vs</span>
            {opp ? (
              <Link href={`/selecoes/${opp.code}`} className="flex items-center gap-1.5 font-semibold hover:text-pitch-600 dark:hover:text-pitch-300">
                <Flag code={opp.code} size="xs" />
                <span className="truncate">{opp.name}</span>
              </Link>
            ) : (
              <span className="truncate text-sm font-medium text-ink-500">{step.opponentLabel ?? "A definir"}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          {step.score && (
            <span className="stat-num text-sm font-extrabold tabular">
              {step.teamSide === "home" ? step.score[0] : step.score[1]}
              <span className="mx-0.5 text-ink-300">:</span>
              {step.teamSide === "home" ? step.score[1] : step.score[0]}
              {step.pens && (
                <span className="ml-1 text-[10px] font-semibold text-ink-400">
                  (pên {step.teamSide === "home" ? step.pens[0] : step.pens[1]}-{step.teamSide === "home" ? step.pens[1] : step.pens[0]})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamRoute() {
  const { tournament, simulateAll } = useTournament();
  const [code, setCode] = useState("BRA");

  const route = useMemo(() => getTeamRoute(tournament, code), [tournament, code]);
  const team = TEAM_MAP[code];

  const teamsByGroup = useMemo(
    () => GROUPS.map((g) => ({ g, teams: TEAMS.filter((t) => t.group === g) })),
    [],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* picker */}
      <div className="surface h-fit rounded-2xl p-3">
        <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-400">Escolha a seleção</div>
        <div className="no-scrollbar max-h-[60vh] space-y-3 overflow-y-auto">
          {teamsByGroup.map(({ g, teams }) => (
            <div key={g}>
              <div className="mb-1 px-1 text-[10px] font-bold text-ink-400">GRUPO {g}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {teams.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setCode(t.code)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-colors",
                      code === t.code ? "bg-pitch-500/15 text-pitch-700 ring-1 ring-pitch-500/30 dark:text-pitch-300" : "hover:bg-ink-500/5",
                    )}
                  >
                    <Flag code={t.code} size="xs" />
                    <span className="truncate">{t.code}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* route */}
      <div>
        <div className="surface mb-4 flex items-center gap-4 rounded-2xl p-4">
          <Flag code={code} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold">{team.name}</h3>
              {route.champion && <Badge tone="gold"><Trophy size={11} /> Campeã</Badge>}
            </div>
            <div className="text-xs text-ink-400">
              Grupo {route.group} · {route.groupRank}º colocado{route.entry ? ` · ${route.entry}` : ""}
            </div>
          </div>
        </div>

        {!tournament.groupComplete && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-pitch-500/5 px-4 py-3 text-sm text-ink-500">
            <span className="flex items-center gap-2">
              <Info size={16} className="shrink-0 text-pitch-500" />
              Preencha os placares dos grupos para definir as rotas completas.
            </span>
            <button
              onClick={simulateAll}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full gradient-pitch px-3 py-1.5 text-xs font-bold text-white"
            >
              <Wand2 size={13} /> Simular o resto
            </button>
          </div>
        )}

        {route.qualified === false ? (
          <div className="surface rounded-2xl p-8 text-center text-ink-400">
            <FlagIcon className="mx-auto mb-2 text-red-500" size={26} />
            <p className="font-bold text-ink-600 dark:text-ink-200">Fora do mata-mata</p>
            <p className="mt-1 text-sm">{team.name} está em {route.groupRank}º no Grupo {route.group} e não avançaria à fase final neste cenário.</p>
          </div>
        ) : route.qualified === "pending" ? (
          <div className="surface rounded-2xl p-8 text-center text-ink-400">
            <RouteIcon className="mx-auto mb-2 text-gold-500" size={26} />
            <p className="font-bold text-ink-600 dark:text-ink-200">Vaga como melhor 3º a definir</p>
            <p className="mt-1 text-sm">A posição de {team.name} no chaveamento depende dos outros grupos. Complete a fase de grupos para ver a rota.</p>
          </div>
        ) : (
          <div className="relative space-y-2.5 before:absolute before:bottom-4 before:left-[14px] before:top-4 before:w-px before:bg-[var(--border)]">
            {route.steps.map((step) => (
              <StepCard key={step.matchId} step={step} />
            ))}
            {!route.eliminatedAt && route.steps.length > 0 && (
              <div className="relative flex items-center gap-3 pl-8">
                <span className="absolute left-[9px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold-500 ring-4 ring-[var(--bg)]" />
                <div className={cn("flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5", route.champion ? "border-gold-500/40 bg-gold-500/10" : "border-[var(--border)]")}>
                  <Trophy size={16} className="text-gold-500" />
                  <span className="text-sm font-bold">
                    {route.champion ? "Campeã Mundial 2026! 🏆" : "Título mundial"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
