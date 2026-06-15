import Link from "next/link";
import type { Match } from "@/lib/types";
import type { ResolvedTournament } from "@/lib/engine/tournament";
import { TEAM_MAP } from "@/lib/data/teams";
import { winnerOf } from "@/lib/engine/simulate";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";

const ROUNDS: { label: string; ids: string[] }[] = [
  { label: "16-avos", ids: Array.from({ length: 16 }, (_, i) => `R32-${i + 1}`) },
  { label: "Oitavas", ids: Array.from({ length: 8 }, (_, i) => `R16-${i + 1}`) },
  { label: "Quartas", ids: Array.from({ length: 4 }, (_, i) => `QF-${i + 1}`) },
  { label: "Semifinais", ids: ["SF-1", "SF-2"] },
  { label: "Final", ids: ["FINAL"] },
];

function BracketSide({
  code,
  label,
  isWinner,
  decided,
  provisional,
}: {
  code?: string;
  label?: string;
  isWinner: boolean;
  decided: boolean;
  provisional?: boolean;
}) {
  const team = code ? TEAM_MAP[code] : undefined;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5",
        decided && !isWinner && "opacity-45",
      )}
      title={provisional ? "Classificação provisória — pode mudar conforme os jogos" : undefined}
    >
      {team ? (
        <Flag code={code} size="xs" />
      ) : (
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-ink-500/10 text-[9px]">?</span>
      )}
      <span className={cn("truncate text-xs font-semibold", provisional && "italic text-ink-500 dark:text-ink-300")}>
        {team?.name ?? label ?? "A definir"}
      </span>
      {provisional && (
        <span className="shrink-0 rounded bg-amber-500/15 px-1 text-[8px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">
          prov
        </span>
      )}
      {isWinner && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-pitch-500" />}
    </div>
  );
}

function BracketMatch({ match, big }: { match?: Match; big?: boolean }) {
  if (!match) return null;
  const w = match.status === "encerrado" ? winnerOf(match) : null;
  const decided = !!w;
  const score = (g?: number) => (match.status === "encerrado" || match.status === "ao-vivo" ? g ?? 0 : "");

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition-all hover:border-pitch-500/40 hover:shadow-glow",
        big ? "w-60" : "w-52",
      )}
    >
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1 divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between">
            <BracketSide code={match.homeCode} label={match.homeLabel} isWinner={w === match.homeCode} decided={decided} provisional={match.homeProvisional} />
            <span className="px-2 stat-num text-sm font-extrabold">{score(match.homeGoals)}</span>
          </div>
          <div className="flex items-center justify-between">
            <BracketSide code={match.awayCode} label={match.awayLabel} isWinner={w === match.awayCode} decided={decided} provisional={match.awayProvisional} />
            <span className="px-2 stat-num text-sm font-extrabold">{score(match.awayGoals)}</span>
          </div>
        </div>
      </div>
      {match.homePens != null && (
        <div className="border-t border-[var(--border)] bg-ink-500/5 px-2.5 py-0.5 text-[10px] text-ink-400">
          Pênaltis: {match.homePens} - {match.awayPens}
        </div>
      )}
    </Link>
  );
}

export function Bracket({ tournament }: { tournament: ResolvedTournament }) {
  const tp = tournament.matchMap["TP"];

  return (
    <div className="space-y-6">
      <div className="no-scrollbar overflow-x-auto pb-4">
        <div className="flex min-w-[1100px] gap-5">
          {ROUNDS.map((round, ri) => (
            <div key={round.label} className="flex flex-1 flex-col">
              <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
                {round.label}
              </div>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {round.ids.map((id) => (
                  <div key={id} className="relative flex justify-center">
                    <BracketMatch match={tournament.matchMap[id]} big={ri === ROUNDS.length - 1} />
                    {ri < ROUNDS.length - 1 && (
                      <span className="pointer-events-none absolute right-0 top-1/2 h-px w-5 translate-x-full bg-[var(--border)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Third place */}
      {tp && (
        <div className="flex flex-col items-center gap-3 border-t border-[var(--border)] pt-6">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">
            Disputa de 3º lugar
          </div>
          <BracketMatch match={tp} />
        </div>
      )}
    </div>
  );
}
