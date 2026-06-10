import type { Metadata } from "next";
import { TrendingUp, Trophy, Sparkles, Info } from "lucide-react";
import { getProjections } from "@/lib/engine/projections";
import { TEAM_MAP } from "@/lib/data/teams";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Flag } from "@/components/ui/Flag";
import { RankingBars } from "@/components/charts/RankingBars";
import { ProjectionsTable } from "@/components/projections/ProjectionsTable";
import { fmtPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projeções & Probabilidades",
  description:
    "Modelo estatístico de Monte Carlo com a probabilidade de cada seleção avançar de fase e conquistar a Copa do Mundo 2026.",
};

export default function ProjecoesPage() {
  const projections = getProjections();
  const top4 = projections.slice(0, 4);
  const titleOdds = projections
    .slice(0, 12)
    .map((p) => ({ teamCode: p.code, value: +(p.titulo * 100).toFixed(1) }));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Inteligência"
        icon={<TrendingUp size={24} />}
        title="Projeções & Probabilidades"
        description="Simulação de Monte Carlo com milhares de cenários para estimar as chances de cada seleção em cada fase do torneio."
      />

      {/* favourites */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {top4.map((p, i) => {
          const team = TEAM_MAP[p.code];
          return (
            <Card key={p.code} className="relative overflow-hidden p-5">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl" style={{ background: team.firstColor }} />
              <div className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <span className="chip bg-gold-500/15 text-gold-600 dark:text-gold-300">
                    {i === 0 ? <Trophy size={11} /> : null} Favorito #{i + 1}
                  </span>
                  <Flag code={p.code} size="sm" />
                </div>
                <div className="text-base font-extrabold">{team.name}</div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="stat-num text-3xl font-extrabold gradient-text-gold">{fmtPct(p.titulo, 1)}</div>
                    <div className="text-xs text-ink-400">chance de título</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Favoritas ao título" subtitle="Probabilidade de ser campeã" icon={<Trophy size={16} />} />
          <div className="p-4">
            <RankingBars rows={titleOdds} color="#e0991f" format={(n) => `${n}%`} />
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-pitch-500" />
            <h2 className="text-lg font-extrabold tracking-tight">Probabilidades por fase</h2>
          </div>
          <ProjectionsTable data={projections} />
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-pitch-500/5 px-4 py-3 text-xs text-ink-400">
        <Info size={14} className="mt-0.5 shrink-0 text-pitch-500" />
        Metodologia: cada partida é simulada por um modelo de Poisson calibrado pela força
        relativa das seleções. Os resultados já encerrados são fixados e o restante do
        torneio é projetado milhares de vezes; as porcentagens são a frequência de cada
        desfecho.
      </p>
    </div>
  );
}
