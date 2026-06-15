import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy, Star, User, Calendar, TrendingUp, History,
  Users2, Banknote, Activity, ArrowLeft,
} from "lucide-react";
import { TEAMS, TEAM_MAP } from "@/lib/data/teams";
import { CONFEDERATIONS } from "@/lib/data/confederations";
import { getSquad, getCaptain } from "@/lib/data/squads";
import { BASE_TOURNAMENT } from "@/lib/engine/tournament";
import { SquadList } from "@/components/team/SquadList";
import { MatchCard } from "@/components/match/MatchCard";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ShareButton } from "@/components/ui/ShareButton";
import { fmtMoney } from "@/lib/format";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ code: t.code }));
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const team = TEAM_MAP[params.code];
  if (!team) return { title: "Seleção não encontrada" };
  return {
    title: `${team.name}`,
    description: `Elenco, estatísticas e jogos da seleção de ${team.name} na Copa do Mundo 2026.`,
  };
}

function StatTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="flex items-center gap-2 text-ink-400">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="mt-1.5 stat-num text-2xl font-extrabold">{value}</div>
      {sub && <div className="text-xs text-ink-400">{sub}</div>}
    </div>
  );
}

export default function TeamPage({ params }: { params: { code: string } }) {
  const team = TEAM_MAP[params.code];
  if (!team) notFound();

  const squad = getSquad(team.code);
  const captain = getCaptain(team.code);
  const conf = CONFEDERATIONS[team.confederation];

  const avgAge = (squad.reduce((s, p) => s + p.age, 0) / squad.length).toFixed(1);
  const totalValue = squad.reduce((s, p) => s + p.marketValue, 0);
  const topXI = [...squad].sort((a, b) => b.rating - a.rating).slice(0, 11);
  const avgRating = Math.round(topXI.reduce((s, p) => s + p.rating, 0) / topXI.length);
  const mvp = [...squad].sort((a, b) => b.marketValue - a.marketValue)[0];

  const matches = BASE_TOURNAMENT.matches
    .filter((m) => m.group === team.group)
    .filter((m) => m.homeCode === team.code || m.awayCode === team.code)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <Link href="/selecoes" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300">
        <ArrowLeft size={16} /> Todas as seleções
      </Link>

      {/* Hero */}
      <div className="relative mt-3 overflow-hidden rounded-3xl border border-[var(--border)]">
        <div className="absolute inset-0 opacity-90" style={{ background: `linear-gradient(135deg, ${team.colors[0]}, ${team.colors[1]})` }} />
        <div className="absolute inset-0 bg-grid-dark bg-[size:28px_28px] opacity-20" />
        <div className="relative flex flex-col gap-5 p-6 text-white sm:flex-row sm:items-center sm:p-9">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-white/15 backdrop-blur">
            <Flag code={team.code} size="xl" ring={false} className="h-16 w-24 rounded-lg" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              {conf.name} · {conf.region}
              {team.host && <Badge tone="gold" className="ml-1">Anfitriã</Badge>}
            </div>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{team.name}</h1>
            <p className="mt-1 text-white/80">{team.nickname} · Grupo {team.group}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip bg-white/15 text-white">#{team.fifaRank} no ranking FIFA</span>
              <span className="chip bg-white/15 text-white"><User size={12} /> Téc. {team.coach}</span>
              <span className="chip bg-white/15 text-white"><Star size={12} /> Capitão: {captain.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <FavoriteButton kind="team" id={team.code} size={22} className="bg-white/15 text-white hover:bg-white/25" />
            <ShareButton title={`${team.name} — Mundial '26`} className="border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white" />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile icon={<TrendingUp size={14} />} label="Força (OVR)" value={team.rating} />
        <StatTile icon={<Users2 size={14} />} label="Idade média" value={avgAge} sub="anos" />
        <StatTile icon={<Activity size={14} />} label="Rating XI" value={avgRating} />
        <StatTile icon={<Banknote size={14} />} label="Valor elenco" value={fmtMoney(totalValue)} />
        <StatTile icon={<Trophy size={14} />} label="Títulos" value={team.titles} />
        <StatTile icon={<Calendar size={14} />} label="Participações" value={team.appearances} />
      </div>

      {/* History + MVP */}
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <div className="surface rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <History size={16} className="text-pitch-500" />
            <h2 className="text-sm font-bold">Histórico em Copas</h2>
          </div>
          <p className="text-sm text-ink-500">
            {team.name} tem <strong>{team.appearances}</strong> participações em Copas do Mundo
            {team.titles > 0 ? (
              <> e <strong>{team.titles}</strong> {team.titles === 1 ? "título" : "títulos"} mundiais.</>
            ) : (
              <>. Melhor campanha: <strong>{team.bestResult}</strong>.</>
            )}{" "}
            Melhor resultado: <strong>{team.bestResult}</strong>.
          </p>
        </div>
        <Link href={`/jogadores/${mvp.id}`} className="surface group rounded-2xl p-5 transition-all hover:shadow-glow">
          <div className="mb-3 flex items-center gap-2 text-ink-400">
            <Star size={14} /> <span className="text-xs font-semibold">Maior valor de mercado</span>
          </div>
          <div className="text-lg font-bold group-hover:text-pitch-600 dark:group-hover:text-pitch-300">{mvp.name}</div>
          <div className="text-sm text-ink-400">{mvp.position}</div>
          <div className="mt-2 stat-num text-2xl font-extrabold gradient-text-gold">{fmtMoney(mvp.marketValue)}</div>
        </Link>
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold tracking-tight">Jogos na fase de grupos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} showDay />
            ))}
          </div>
        </section>
      )}

      {/* Squad */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-extrabold tracking-tight">Convocação · {squad.length} jogadores</h2>
        <SquadList squad={squad} />
      </section>
    </div>
  );
}
