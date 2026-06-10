import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Cake, Ruler, Weight, Footprints, Banknote, Shirt,
  Goal, Handshake, Square, Activity, GitCompare, Star,
} from "lucide-react";
import { getPlayer } from "@/lib/data/squads";
import { TEAM_MAP } from "@/lib/data/teams";
import { BASE_TOURNAMENT } from "@/lib/engine/tournament";
import { deriveAttributes, ATTR_LABELS } from "@/lib/engine/attributes";
import { RadarStats } from "@/components/charts/RadarStats";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { StatBar } from "@/components/ui/StatBar";
import { fmtMoney, fmtDate, POSITION_GROUP_COLOR } from "@/lib/format";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = getPlayer(params.id);
  if (!p) return { title: "Jogador não encontrado" };
  const team = TEAM_MAP[p.teamCode];
  return {
    title: `${p.name} — ${team?.name}`,
    description: `Perfil, estatísticas e atributos de ${p.name} (${p.position}, ${team?.name}) na Copa do Mundo 2026.`,
  };
}

function tournamentStats(id: string, teamCode: string) {
  let goals = 0, assists = 0, pens = 0, yellow = 0, red = 0;
  for (const m of BASE_TOURNAMENT.matches) {
    for (const e of m.events) {
      if (e.playerId === id) {
        if (e.type === "gol" || e.type === "penalti") { goals++; if (e.type === "penalti") pens++; }
        if (e.type === "amarelo") yellow++;
        if (e.type === "vermelho") red++;
      }
      if (e.assistPlayerId === id) assists++;
    }
  }
  const matches = BASE_TOURNAMENT.matches.filter(
    (m) => m.status === "encerrado" && (m.homeCode === teamCode || m.awayCode === teamCode),
  ).length;
  return { goals, assists, pens, yellow, red, matches };
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-ink-400">
        {icon}
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <div className="mt-1 stat-num text-lg font-extrabold">{value}</div>
    </div>
  );
}

export default function PlayerPage({ params }: { params: { id: string } }) {
  const player = getPlayer(params.id);
  if (!player) notFound();
  const team = TEAM_MAP[player.teamCode];
  const attrs = deriveAttributes(player);
  const stats = tournamentStats(player.id, player.teamCode);
  const color = POSITION_GROUP_COLOR[player.positionGroup];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <Link href={`/selecoes/${team.code}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300">
        <ArrowLeft size={16} /> {team.name}
      </Link>

      {/* Hero */}
      <div className="relative mt-3 overflow-hidden rounded-3xl border border-[var(--border)]">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${team.colors[0]}22, ${team.colors[1]}10)` }} />
        <div className="relative flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <PlayerAvatar name={player.name} teamCode={player.teamCode} number={player.number} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Flag code={team.code} size="sm" />
              <Link href={`/selecoes/${team.code}`} className="text-sm font-semibold text-ink-500 hover:text-pitch-600 dark:hover:text-pitch-300">
                {team.name}
              </Link>
              {player.isCaptain && <Badge tone="gold"><Star size={11} /> Capitão</Badge>}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{player.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="chip text-white" style={{ background: color }}>{player.position}</span>
              <Badge tone="ink">Camisa {player.number}</Badge>
              <Badge tone="ink">{player.clubFlag} {player.club}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="stat-num text-5xl font-extrabold gradient-text-pitch">{player.rating}</div>
              <div className="text-xs text-ink-400">Overall</div>
            </div>
            <FavoriteButton kind="player" id={player.id} size={22} />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat icon={<Cake size={13} />} label="Idade" value={`${player.age}a`} />
        <MiniStat icon={<Ruler size={13} />} label="Altura" value={`${player.height}cm`} />
        <MiniStat icon={<Weight size={13} />} label="Peso" value={`${player.weight}kg`} />
        <MiniStat icon={<Footprints size={13} />} label="Pé" value={player.foot} />
        <MiniStat icon={<Shirt size={13} />} label="Jogos seleção" value={player.caps} />
        <MiniStat icon={<Banknote size={13} />} label="Valor" value={fmtMoney(player.marketValue)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Attributes radar */}
        <div className="surface rounded-2xl p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Activity size={16} className="text-pitch-500" /> Atributos
          </h2>
          <RadarStats series={[{ name: player.name, color, attrs }]} />
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            {ATTR_LABELS.map((a) => (
              <div key={a.key} className="flex items-center gap-2">
                <span className="w-20 text-xs text-ink-400">{a.label}</span>
                <StatBar value={attrs[a.key]} color={color} className="flex-1" height={6} />
                <span className="w-7 text-right stat-num text-xs font-bold">{attrs[a.key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament stats */}
        <div className="space-y-5">
          <div className="surface rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold">Estatísticas na Copa 2026</h2>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat icon={<Activity size={13} />} label="Partidas" value={stats.matches} />
              <MiniStat icon={<Goal size={13} />} label="Gols" value={stats.goals} />
              <MiniStat icon={<Handshake size={13} />} label="Assistências" value={stats.assists} />
              <MiniStat icon={<Square size={13} className="text-yellow-500" />} label="Amarelos" value={stats.yellow} />
              <MiniStat icon={<Square size={13} className="text-red-500" />} label="Vermelhos" value={stats.red} />
              <MiniStat icon={<Goal size={13} />} label="Participações" value={stats.goals + stats.assists} />
            </div>
          </div>

          <div className="surface rounded-2xl p-5">
            <h2 className="mb-3 text-sm font-bold">Dados</h2>
            <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
              <dt className="text-ink-400">Nacionalidade</dt>
              <dd className="font-semibold">{team.flag} {team.name}</dd>
              <dt className="text-ink-400">Nascimento</dt>
              <dd className="font-semibold">{fmtDate(player.birth)}</dd>
              <dt className="text-ink-400">Clube</dt>
              <dd className="font-semibold">{player.clubFlag} {player.club}</dd>
              <dt className="text-ink-400">Gols pela seleção</dt>
              <dd className="font-semibold">{player.intlGoals} em {player.caps} jogos</dd>
            </dl>
          </div>

          <Link
            href={`/comparar?p1=${player.id}`}
            className="surface group flex items-center justify-between rounded-2xl p-5 transition-all hover:shadow-glow"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch-500/10 text-pitch-600 dark:text-pitch-300">
                <GitCompare size={18} />
              </span>
              <div>
                <div className="text-sm font-bold">Comparar {player.name}</div>
                <div className="text-xs text-ink-400">Confronte atributos com outro jogador</div>
              </div>
            </div>
            <ArrowLeft size={18} className="rotate-180 text-ink-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
