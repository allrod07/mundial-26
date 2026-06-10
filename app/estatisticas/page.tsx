"use client";

import { useMemo, useState } from "react";
import { BarChart3, Goal, Handshake, Activity, Flame, Square, Trophy, Percent } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAM_MAP, TEAMS, GROUPS } from "@/lib/data/teams";
import { CONFEDERATION_COLORS } from "@/lib/data/confederations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScorersList } from "@/components/stats/ScorersList";
import { Donut } from "@/components/charts/Donut";
import { BarTrend } from "@/components/charts/BarTrend";
import { RankingBars } from "@/components/charts/RankingBars";
import { Tabs } from "@/components/ui/Tabs";
import { CountUp } from "@/components/ui/CountUp";

export default function EstatisticasPage() {
  const { tournament } = useTournament();
  const [metric, setMetric] = useState("goals");

  const data = useMemo(() => {
    const finished = tournament.matches.filter((m) => m.status === "encerrado");
    const played = finished.length;
    let totalGoals = 0;
    let yellow = 0;
    let red = 0;
    let biggest = { diff: -1, label: "—", score: "" };
    const teamGoals: Record<string, number> = {};
    const confGoals: Record<string, number> = {};
    const groupGoals: Record<string, number> = {};

    for (const m of finished) {
      const hg = m.homeGoals ?? 0;
      const ag = m.awayGoals ?? 0;
      totalGoals += hg + ag;
      if (m.homeCode) {
        teamGoals[m.homeCode] = (teamGoals[m.homeCode] ?? 0) + hg;
        const c = TEAM_MAP[m.homeCode].confederation;
        confGoals[c] = (confGoals[c] ?? 0) + hg;
      }
      if (m.awayCode) {
        teamGoals[m.awayCode] = (teamGoals[m.awayCode] ?? 0) + ag;
        const c = TEAM_MAP[m.awayCode].confederation;
        confGoals[c] = (confGoals[c] ?? 0) + ag;
      }
      if (m.group) groupGoals[m.group] = (groupGoals[m.group] ?? 0) + hg + ag;
      const diff = Math.abs(hg - ag);
      if (diff > biggest.diff && m.homeCode && m.awayCode) {
        biggest = {
          diff,
          label: `${TEAM_MAP[m.homeCode].name} × ${TEAM_MAP[m.awayCode].name}`,
          score: `${hg}-${ag}`,
        };
      }
      for (const e of m.events) {
        if (e.type === "amarelo") yellow++;
        if (e.type === "vermelho") red++;
      }
    }

    const teamGoalRanking = Object.entries(teamGoals)
      .map(([teamCode, value]) => ({ teamCode, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // aproveitamento (todas as seleções com jogos)
    const allRows = GROUPS.flatMap((g) => tournament.standings[g]);
    const efficiency = allRows
      .filter((r) => r.played > 0)
      .map((r) => ({ teamCode: r.teamCode, value: Math.round((r.points / (r.played * 3)) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const confDonut = Object.entries(confGoals)
      .map(([name, value]) => ({ name, value, color: CONFEDERATION_COLORS[name as keyof typeof CONFEDERATION_COLORS] }))
      .sort((a, b) => b.value - a.value);

    const groupBars = GROUPS.map((g) => ({ label: g, value: groupGoals[g] ?? 0 }));

    const topScorer = tournament.scorers[0];

    return {
      played, totalGoals, yellow, red, biggest,
      avg: played ? totalGoals / played : 0,
      teamGoalRanking, efficiency, confDonut, groupBars, topScorer,
    };
  }, [tournament]);

  const tiles = [
    { icon: Goal, label: "Gols marcados", value: data.totalGoals, dec: 0 },
    { icon: Activity, label: "Média por jogo", value: data.avg, dec: 2 },
    { icon: Flame, label: "Jogos disputados", value: data.played, dec: 0 },
    { icon: Square, label: "Cartões", value: data.yellow + data.red, dec: 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Dados"
        icon={<BarChart3 size={24} />}
        title="Estatísticas"
        description="Painel analítico da Copa 2026: artilharia, assistências, disciplina e desempenho por seleção."
      />

      {/* tiles */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-pitch-500/10 text-pitch-600 dark:text-pitch-300">
              <t.icon size={22} />
            </span>
            <div>
              <div className="stat-num text-2xl font-extrabold">
                <CountUp to={t.value} decimals={t.dec} />
              </div>
              <div className="text-xs text-ink-400">{t.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* biggest win + top scorer banner */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-500"><Flame size={20} /></span>
          <div>
            <div className="text-xs text-ink-400">Maior goleada</div>
            <div className="font-bold">{data.biggest.label}</div>
            <div className="stat-num text-sm font-extrabold text-red-500">{data.biggest.score}</div>
          </div>
        </Card>
        {data.topScorer && (
          <Card className="flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/10 text-gold-500"><Trophy size={20} /></span>
            <div>
              <div className="text-xs text-ink-400">Artilheiro</div>
              <div className="font-bold">{TEAM_MAP[data.topScorer.teamCode].flag} {/* name resolved below */}
                <ScorerName id={data.topScorer.playerId} />
              </div>
              <div className="stat-num text-sm font-extrabold text-gold-600 dark:text-gold-300">{data.topScorer.goals} gols</div>
            </div>
          </Card>
        )}
      </div>

      {/* scorers / assists */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title="Líderes"
            subtitle="Artilharia e assistências da Copa"
            icon={<Goal size={16} />}
            action={
              <Tabs
                items={[{ id: "goals", label: "Gols" }, { id: "assists", label: "Assist." }]}
                value={metric}
                onChange={setMetric}
                size="sm"
                idPrefix="stat-metric"
              />
            }
          />
          <ScorersList scorers={tournament.scorers} limit={10} metric={metric as "goals" | "assists"} />
        </Card>

        <Card>
          <CardHeader title="Gols por confederação" icon={<BarChart3 size={16} />} />
          <div className="p-4">
            <Donut data={data.confDonut} unit=" gols" />
          </div>
        </Card>
      </div>

      {/* rankings */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Seleções mais goleadoras" subtitle="Gols marcados" icon={<Flame size={16} />} />
          <div className="p-4">
            <RankingBars rows={data.teamGoalRanking} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Melhor aproveitamento" subtitle="% de pontos conquistados" icon={<Percent size={16} />} />
          <div className="p-4">
            <RankingBars rows={data.efficiency} color="#e0991f" format={(n) => `${n}%`} max={100} />
          </div>
        </Card>
      </div>

      {/* goals per group */}
      <Card className="mt-5">
        <CardHeader title="Gols por grupo" subtitle="Distribuição da artilharia na fase de grupos" icon={<BarChart3 size={16} />} />
        <div className="p-4">
          <BarTrend data={data.groupBars} />
        </div>
      </Card>
    </div>
  );
}

import { getPlayer } from "@/lib/data/squads";
function ScorerName({ id }: { id: string }) {
  return <> {getPlayer(id)?.name}</>;
}
