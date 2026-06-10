"use client";

import Link from "next/link";
import { ListOrdered, Medal, Info } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { GROUPS, TEAM_MAP } from "@/lib/data/teams";
import { GroupTable } from "@/components/standings/GroupTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export default function ClassificacaoPage() {
  const { tournament, isSimulated } = useTournament();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <PageHeader
        eyebrow="Fase de grupos"
        icon={<ListOrdered size={24} />}
        title="Classificação"
        description="Tabela dos 12 grupos. Avançam os 2 primeiros de cada grupo e os 8 melhores terceiros colocados."
        action={
          isSimulated ? (
            <Badge tone="gold">
              <Info size={12} /> Cenário simulado
            </Badge>
          ) : undefined
        }
      />

      {/* legend */}
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-pitch-500/40" /> Classificado (1º e 2º)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gold-500/40" /> Melhor 3º (8 vagas)
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((g) => (
          <Reveal key={g}>
            <GroupTable group={g} rows={tournament.standings[g]} />
          </Reveal>
        ))}
      </div>

      {/* best thirds */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Medal size={18} className="text-gold-500" />
          <h2 className="text-xl font-extrabold tracking-tight">Melhores terceiros colocados</h2>
        </div>
        <div className="surface overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-ink-400">
                <th className="py-3 pl-4 text-left font-semibold">#</th>
                <th className="py-3 text-left font-semibold">Seleção</th>
                <th className="py-3 text-center font-semibold">Grupo</th>
                <th className="py-3 text-center font-semibold">Pts</th>
                <th className="hidden py-3 text-center font-semibold sm:table-cell">SG</th>
                <th className="hidden py-3 text-center font-semibold sm:table-cell">GP</th>
                <th className="py-3 pr-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {tournament.thirds.map((r) => {
                const team = TEAM_MAP[r.teamCode];
                return (
                  <tr
                    key={r.teamCode}
                    className={cn(
                      "border-t border-[var(--border)] transition-colors hover:bg-pitch-500/5",
                      r.qualified ? "" : "opacity-60",
                    )}
                  >
                    <td className="py-3 pl-4">
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded text-xs font-bold",
                          r.qualified && "bg-gold-500/15 text-gold-600 dark:text-gold-300",
                        )}
                      >
                        {r.overallRank}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href={`/selecoes/${r.teamCode}`} className="flex items-center gap-2 font-semibold hover:text-pitch-600 dark:hover:text-pitch-300">
                        <Flag code={r.teamCode} size="sm" />
                        <span className="truncate">{team?.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-center text-ink-500">{r.group}</td>
                    <td className="py-3 text-center stat-num font-extrabold">{r.points}</td>
                    <td className="hidden py-3 text-center tabular text-ink-500 sm:table-cell">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                    <td className="hidden py-3 text-center tabular text-ink-500 sm:table-cell">{r.gf}</td>
                    <td className="py-3 pr-4 text-right">
                      {r.qualified ? (
                        <Badge tone="pitch">Classificado</Badge>
                      ) : (
                        <Badge tone="ink">Eliminado</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!tournament.groupComplete && (
          <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-ink-400">
            <Info size={13} /> A ordenação dos terceiros se consolida quando todos os
            grupos terminarem. Use o{" "}
            <Link href="/simulador" className="font-semibold text-pitch-600 hover:underline dark:text-pitch-300">
              simulador
            </Link>{" "}
            para completar a fase de grupos.
          </p>
        )}
      </section>
    </div>
  );
}
