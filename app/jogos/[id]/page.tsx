"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft, MapPin, CalendarDays, Goal, Square, Award, Users, Info, Clock,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAM_MAP } from "@/lib/data/teams";
import { CITY_MAP } from "@/lib/data/cities";
import { getSquad, getPlayer } from "@/lib/data/squads";
import { buildLineup, FORMATIONS } from "@/lib/engine/lineup";
import { deriveMatchStats } from "@/lib/engine/matchStats";
import { winnerOf } from "@/lib/engine/simulate";
import { Pitch } from "@/components/match/Pitch";
import { Flag } from "@/components/ui/Flag";
import { Badge, LiveBadge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ShareButton } from "@/components/ui/ShareButton";
import { VersusBar } from "@/components/ui/StatBar";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { fmtDate, fmtKickoff } from "@/lib/format";
import { useTz } from "@/store/useTimezone";

const FORM_OPTIONS = FORMATIONS.map((f) => ({ value: f.key, label: f.name }));

export default function MatchPage({ params }: { params: { id: string } }) {
  const { tournament, liveEvents, liveStats } = useTournament();
  const tz = useTz();
  const match = tournament.matchMap[params.id];
  const events = (liveEvents[params.id]?.length ? liveEvents[params.id] : match?.events) ?? [];

  const [tab, setTab] = useState("escalacoes");
  const [side, setSide] = useState<"home" | "away">("home");
  const [formH, setFormH] = useState("4-3-3");
  const [formA, setFormA] = useState("4-3-3");

  const city = match ? CITY_MAP[match.cityId] : undefined;
  const home = match?.homeCode ? TEAM_MAP[match.homeCode] : undefined;
  const away = match?.awayCode ? TEAM_MAP[match.awayCode] : undefined;
  const decided = match?.status === "encerrado";
  const live = match?.status === "ao-vivo";
  const hasTeams = !!(home && away);

  const lineup = useMemo(() => {
    if (!hasTeams) return null;
    const code = side === "home" ? match!.homeCode! : match!.awayCode!;
    const form = side === "home" ? formH : formA;
    return buildLineup(getSquad(code), form);
  }, [hasTeams, side, match, formH, formA]);

  const stats = match ? (liveStats[params.id] ?? deriveMatchStats(match)) : null;

  const mvp = useMemo(() => {
    if (!match || !hasTeams || (!decided && !live)) return null;
    const tally = new Map<string, number>();
    for (const e of events) {
      const key = e.playerId || e.playerName || "";
      if (!key) continue;
      if (e.type === "gol" || e.type === "penalti") tally.set(key, (tally.get(key) ?? 0) + 2);
      if (e.assistPlayerId) tally.set(e.assistPlayerId, (tally.get(e.assistPlayerId) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestV = -1;
    for (const [id, v] of tally) if (v > bestV) { best = id; bestV = v; }
    if (best) return getPlayer(best);
    const w = winnerOf(match);
    const code = w ?? match.homeCode!;
    return [...getSquad(code)].sort((a, b) => b.rating - a.rating)[0];
  }, [match, hasTeams, decided, live]);

  if (!match) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg font-bold">Partida não encontrada.</p>
        <Link href="/calendario" className="mt-3 inline-block text-sm font-semibold text-pitch-600">Voltar ao calendário</Link>
      </div>
    );
  }

  const stageLabel = match.stage === "Grupos" ? `Grupo ${match.group}` : match.stage;
  const w = decided ? winnerOf(match) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <Link href="/calendario" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300">
        <ArrowLeft size={16} /> Calendário
      </Link>

      {/* Scoreboard */}
      <div className="relative mt-3 overflow-hidden rounded-3xl border border-[var(--border)]">
        <div className="absolute inset-0 gradient-pitch opacity-[0.08]" />
        <div className="relative p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <Badge tone={match.stage === "Grupos" ? "ink" : "gold"}>{stageLabel}</Badge>
            <div className="flex items-center gap-2">
              {live ? <LiveBadge minute={match.minute} /> : decided ? <Badge tone="pitch">Encerrado</Badge> : <Badge tone="ink"><Clock size={11} /> {fmtKickoff(match.date, match.cityId, tz)}</Badge>}
              <ShareButton label="" title={`${home?.name ?? match.homeLabel ?? ""} x ${away?.name ?? match.awayLabel ?? ""} — Mundial '26`} className="px-2.5 py-1.5" />
              <FavoriteButton kind="match" id={match.id} size={18} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <TeamBlock code={match.homeCode} label={match.homeLabel} dim={decided && w !== null && w !== match.homeCode} />
            <div className="text-center">
              {decided || live ? (
                <div className="stat-num text-5xl font-extrabold sm:text-6xl">
                  {match.homeGoals}<span className="mx-1 text-ink-300">:</span>{match.awayGoals}
                </div>
              ) : (
                <div className="text-2xl font-extrabold text-ink-300">VS</div>
              )}
              {match.homePens != null && (
                <div className="mt-1 text-xs font-semibold text-ink-400">pênaltis {match.homePens} - {match.awayPens}</div>
              )}
            </div>
            <TeamBlock code={match.awayCode} label={match.awayLabel} dim={decided && w !== null && w !== match.awayCode} align="right" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {fmtDate(match.date)} · {fmtKickoff(match.date, match.cityId, tz)}</span>
            {city && <span className="flex items-center gap-1.5"><MapPin size={13} /> {city.stadium}, {city.name} {city.countryFlag}</span>}
          </div>
        </div>
      </div>

      {!hasTeams ? (
        <div className="mt-6 surface rounded-2xl p-8 text-center">
          <Info className="mx-auto mb-3 text-pitch-500" size={28} />
          <p className="font-bold">Confronto a definir</p>
          <p className="mt-1 text-sm text-ink-400">
            {match.homeLabel} <span className="mx-1">×</span> {match.awayLabel}
          </p>
          <Link href="/simulador" className="mt-4 inline-block rounded-full gradient-pitch px-4 py-2 text-sm font-bold text-white">
            Definir no simulador
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex justify-center">
            <Tabs
              items={[
                { id: "escalacoes", label: "Escalações" },
                { id: "eventos", label: "Eventos" },
                { id: "estatisticas", label: "Estatísticas" },
              ]}
              value={tab}
              onChange={setTab}
              idPrefix="match-tab"
            />
          </div>

          <div className="mt-6">
            {tab === "escalacoes" && (
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="surface rounded-2xl p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Tabs
                      items={[
                        { id: "home", label: home!.name },
                        { id: "away", label: away!.name },
                      ]}
                      value={side}
                      onChange={(v) => setSide(v as "home" | "away")}
                      size="sm"
                      idPrefix="lineup-side"
                    />
                    <Select
                      value={side === "home" ? formH : formA}
                      onChange={(v) => (side === "home" ? setFormH(v) : setFormA(v))}
                      options={FORM_OPTIONS}
                      className="w-28"
                    />
                  </div>
                  {lineup && (
                    <Pitch
                      spots={lineup.starters}
                      color={(side === "home" ? home! : away!).firstColor}
                      textColor="#ffffff"
                    />
                  )}
                  <p className="mt-3 text-center text-xs text-ink-400">
                    Técnico: {(side === "home" ? home! : away!).coach} · {lineup?.formation.name}
                  </p>
                </div>
                <div className="surface rounded-2xl p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Users size={15} /> Banco de reservas</h3>
                  <div className="space-y-1.5">
                    {lineup?.bench.slice(0, 12).map((p) => (
                      <Link key={p.id} href={`/jogadores/${p.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-pitch-500/5">
                        <span className="w-6 text-center stat-num text-xs font-bold text-ink-400">{p.number}</span>
                        <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" />
                        <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                        <span className="stat-num text-xs font-bold text-ink-400">{p.rating}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "eventos" && (
              <div className="surface mx-auto max-w-2xl rounded-2xl p-5">
                {match.status === "agendado" ? (
                  <EmptyState text="Partida ainda não disputada." />
                ) : events.length === 0 ? (
                  <EmptyState text="Sem gols ou cartões registrados." />
                ) : (
                  <ul className="space-y-1">
                    {events.map((e, i) => {
                      const isHome = e.teamCode === match.homeCode;
                      const player = getPlayer(e.playerId);
                      const assist = e.assistPlayerId ? getPlayer(e.assistPlayerId) : null;
                      const name = player?.name ?? e.playerName ?? "—";
                      const assistName = assist?.name ?? e.assistName;
                      return (
                        <li key={i} className={`flex items-center gap-3 ${isHome ? "" : "flex-row-reverse text-right"}`}>
                          <span className="w-9 shrink-0 stat-num text-sm font-bold text-ink-400">{e.minute}'</span>
                          <EventIcon type={e.type} />
                          <div className={`min-w-0 flex-1 ${isHome ? "" : "flex flex-col items-end"}`}>
                            {player ? (
                              <Link href={`/jogadores/${e.playerId}`} className="truncate text-sm font-semibold hover:text-pitch-600 dark:hover:text-pitch-300">
                                {name}
                              </Link>
                            ) : (
                              <span className="truncate text-sm font-semibold">{name}</span>
                            )}
                            {assistName && <span className="text-xs text-ink-400">assist. {assistName}</span>}
                          </div>
                          <Flag code={e.teamCode} size="xs" />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {tab === "estatisticas" && (
              <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="surface rounded-2xl p-5">
                  {stats ? (
                    <>
                      <div className="mb-4 flex items-center justify-between text-sm font-bold">
                        <span className="flex items-center gap-2"><Flag code={match.homeCode} size="xs" /> {home!.name}</span>
                        <span className="flex items-center gap-2">{away!.name} <Flag code={match.awayCode} size="xs" /></span>
                      </div>
                      <StatRow label="Posse de bola" a={stats.home.posse} b={stats.away.posse} suffix="%" />
                      <StatRow label="Finalizações" a={stats.home.finalizacoes} b={stats.away.finalizacoes} />
                      <StatRow label="No gol" a={stats.home.noGol} b={stats.away.noGol} />
                      <StatRow label="Escanteios" a={stats.home.escanteios} b={stats.away.escanteios} />
                      <StatRow label="Defesas" a={stats.home.defesas} b={stats.away.defesas} />
                      <StatRow label="Faltas" a={stats.home.faltas} b={stats.away.faltas} />
                      <StatRow label="Impedimentos" a={stats.home.impedimentos} b={stats.away.impedimentos} />
                      <StatRow label="Passes" a={stats.home.passes} b={stats.away.passes} />
                      <StatRow label="Precisão de passe" a={stats.home.precisao} b={stats.away.precisao} suffix="%" />
                      <StatRow label="Cartões" a={stats.home.cartoes} b={stats.away.cartoes} />
                    </>
                  ) : (
                    <EmptyState text="Estatísticas disponíveis após o início da partida." />
                  )}
                </div>
                {mvp && (
                  <div className="surface rounded-2xl p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Award size={15} className="text-gold-500" /> Melhor em campo</h3>
                    <Link href={`/jogadores/${mvp.id}`} className="flex flex-col items-center text-center">
                      <PlayerAvatar name={mvp.name} teamCode={mvp.teamCode} number={mvp.number} size="xl" />
                      <div className="mt-3 font-bold">{mvp.name}</div>
                      <div className="text-xs text-ink-400">{mvp.position} · {TEAM_MAP[mvp.teamCode].name}</div>
                      <div className="mt-2 stat-num text-3xl font-extrabold gradient-text-pitch">{mvp.rating}</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TeamBlock({ code, label, dim, align = "left" }: { code?: string; label?: string; dim?: boolean; align?: "left" | "right" }) {
  const team = code ? TEAM_MAP[code] : undefined;
  return (
    <div className={`flex flex-col items-center gap-2 ${dim ? "opacity-50" : ""}`}>
      <Flag code={code} emoji={code ? undefined : "🏳️"} size="xl" ring={false} />
      {code ? (
        <Link href={`/selecoes/${code}`} className="text-center text-sm font-bold hover:text-pitch-600 dark:hover:text-pitch-300 sm:text-base">
          {team?.name}
        </Link>
      ) : (
        <span className="text-center text-xs font-semibold text-ink-400">{label ?? "A definir"}</span>
      )}
    </div>
  );
}

function StatRow({ label, a, b, suffix = "" }: { label: string; a: number; b: number; suffix?: string }) {
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="stat-num font-extrabold">{a}{suffix}</span>
        <span className="text-xs font-semibold text-ink-400">{label}</span>
        <span className="stat-num font-extrabold">{b}{suffix}</span>
      </div>
      <VersusBar left={a} right={b} />
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  if (type === "gol" || type === "penalti" || type === "gol-contra")
    return <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pitch-500/15 text-pitch-600 dark:text-pitch-300"><Goal size={13} /></span>;
  if (type === "amarelo")
    return <Square size={16} className="shrink-0 text-yellow-500" fill="currentColor" />;
  if (type === "vermelho")
    return <Square size={16} className="shrink-0 text-red-500" fill="currentColor" />;
  return <span className="h-2 w-2 rounded-full bg-ink-300" />;
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-ink-400">{text}</div>;
}
