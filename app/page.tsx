"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, CalendarDays, Trophy, Activity, Goal, Users,
  MapPin, BarChart3, Sparkles, Flame, ListOrdered, TrendingUp,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAMS, GROUPS } from "@/lib/data/teams";
import { MatchCard } from "@/components/match/MatchCard";
import { GroupTable } from "@/components/standings/GroupTable";
import { ScorersList } from "@/components/stats/ScorersList";
import { Countdown } from "@/components/home/Countdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge, LiveBadge } from "@/components/ui/Badge";
import { Flag } from "@/components/ui/Flag";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { fmtDay, fmtKickoff } from "@/lib/format";
import { useTz } from "@/store/useTimezone";

export default function HomePage() {
  const { tournament } = useTournament();
  const tz = useTz();

  const { live, upcoming, recent, nextMatch, totalGoals, played } = useMemo(() => {
    const ms = tournament.matches;
    const live = ms.filter((m) => m.status === "ao-vivo");
    const upcoming = ms
      .filter((m) => m.status === "agendado" && (m.homeCode || m.homeLabel))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const recent = ms
      .filter((m) => m.status === "encerrado")
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const played = recent.length;
    const totalGoals = recent.reduce((s, m) => s + (m.homeGoals ?? 0) + (m.awayGoals ?? 0), 0);
    return { live, upcoming, recent, nextMatch: upcoming[0], totalGoals, played };
  }, [tournament]);

  const featured = [...TEAMS].sort((a, b) => b.rating - a.rating).slice(0, 6);

  const quickStats = [
    { icon: Goal, label: "Gols marcados", value: totalGoals, suffix: "" },
    { icon: Activity, label: "Jogos disputados", value: played, suffix: "" },
    { icon: Users, label: "Seleções", value: 48, suffix: "" },
    { icon: MapPin, label: "Sedes", value: 16, suffix: "" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative mt-6 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 gradient-pitch" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px] opacity-40" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-400/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-pitch-300/30 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <Sparkles size={13} /> Copa do Mundo · EUA · Canadá · México
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                O torneio mais
                <br />
                grandioso da história,
                <br />
                <span className="gradient-text-gold">em um só lugar.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-white/80">
                Calendário completo, classificação ao vivo, estatísticas avançadas,
                simuladores e projeções por probabilidade. A experiência definitiva
                da Copa de 2026.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/simulador"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pitch-700 shadow-lg transition-transform hover:scale-[1.03]"
                >
                  <Trophy size={17} /> Simular a Copa
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/calendario"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <CalendarDays size={17} /> Ver calendário
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
                {["48 seleções", "12 grupos", "104 jogos", "16 sedes"].map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-300" /> {f}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Featured next/live match + countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center gap-4"
          >
            {live[0] ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-white/70">Ao vivo agora</span>
                  <LiveBadge minute={live[0].minute} />
                </div>
                <HeroMatch matchCodes={[live[0].homeCode, live[0].awayCode]} score={[live[0].homeGoals, live[0].awayGoals]} />
              </div>
            ) : null}

            {nextMatch && (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-white/70">
                  Próxima partida
                </div>
                <div className="mb-4 text-sm text-white/80">
                  {fmtDay(nextMatch.date)} · {fmtKickoff(nextMatch.date, nextMatch.cityId, tz)}
                </div>
                <HeroMatch
                  matchCodes={[nextMatch.homeCode, nextMatch.awayCode]}
                  labels={[nextMatch.homeLabel, nextMatch.awayLabel]}
                />
                <div className="mt-5 border-t border-white/15 pt-4">
                  <Countdown targetIso={nextMatch.date} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── QUICK STATS ────────────────────────────────────── */}
      <Stagger className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {quickStats.map((s) => (
          <StaggerItem key={s.label}>
            <Card className="flex items-center gap-4 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-pitch-500/10 text-pitch-600 dark:text-pitch-300">
                <s.icon size={22} />
              </span>
              <div>
                <div className="stat-num text-2xl font-extrabold">
                  <CountUp to={s.value} />
                </div>
                <div className="text-xs text-ink-400">{s.label}</div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {/* ── LIVE ───────────────────────────────────────────── */}
      {live.length > 0 && (
        <section className="mt-14">
          <SectionHeader
            eyebrow="Tempo real"
            icon={<Flame size={13} />}
            title="Jogos ao vivo"
            href="/calendario"
            description="Acompanhe os confrontos em andamento."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* ── UPCOMING ───────────────────────────────────────── */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Agenda"
          icon={<CalendarDays size={13} />}
          title="Próximos jogos"
          href="/calendario"
          description="Os confrontos que vêm aí na competição."
        />
        <Stagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 6).map((m) => (
            <StaggerItem key={m.id}>
              <MatchCard match={m} showDay />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── RECENT ─────────────────────────────────────────── */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Resultados"
          icon={<Activity size={13} />}
          title="Resultados recentes"
          href="/calendario"
        />
        <Stagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.slice(0, 6).map((m) => (
            <StaggerItem key={m.id}>
              <MatchCard match={m} showDay />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── STANDINGS + SCORERS ────────────────────────────── */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="Grupos"
            icon={<ListOrdered size={13} />}
            title="Classificação"
            href="/classificacao"
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {GROUPS.slice(0, 4).map((g) => (
              <Reveal key={g}>
                <GroupTable group={g} rows={tournament.standings[g]} compact />
              </Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="Artilharia"
            icon={<Goal size={13} />}
            title="Goleadores"
            href="/estatisticas"
          />
          <Card className="mt-5 overflow-hidden">
            <ScorersList scorers={tournament.scorers} limit={10} />
          </Card>
        </div>
      </section>

      {/* ── FEATURED TEAMS ─────────────────────────────────── */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Favoritas"
          icon={<TrendingUp size={13} />}
          title="Seleções em destaque"
          href="/selecoes"
          description="As principais forças do torneio segundo o ranking."
        />
        <Stagger className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((t) => (
            <StaggerItem key={t.code}>
              <Link href={`/selecoes/${t.code}`}>
                <Card interactive className="group flex flex-col items-center p-5 text-center">
                  <Flag code={t.code} size="lg" />
                  <div className="mt-3 text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-ink-400">{t.confederation}</div>
                  <Badge tone="pitch" className="mt-3">
                    <BarChart3 size={11} /> {t.rating} OVR
                  </Badge>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-8 sm:p-12">
          <div className="absolute inset-0 gradient-gold opacity-[0.07]" />
          <div className="relative flex flex-col items-center gap-5 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-gold text-white shadow-lg">
              <Trophy size={26} />
            </span>
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Quem será o campeão de 2026?
            </h2>
            <p className="max-w-xl text-ink-400">
              Use o simulador para preencher placares, recalcular a classificação e
              montar o chaveamento até a grande final. Construa o seu cenário.
            </p>
            <Link
              href="/simulador"
              className="group inline-flex items-center gap-2 rounded-full gradient-pitch px-6 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              Abrir simulador
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroMatch({
  matchCodes,
  labels,
  score,
}: {
  matchCodes: (string | undefined)[];
  labels?: (string | undefined)[];
  score?: (number | undefined)[];
}) {
  const [h, a] = matchCodes;
  return (
    <div className="flex items-center justify-between gap-2 text-white">
      <TeamMini code={h} label={labels?.[0]} />
      <div className="shrink-0 px-2 text-center">
        {score && score[0] != null ? (
          <div className="stat-num text-3xl font-extrabold">
            {score[0]}<span className="mx-1 text-white/50">:</span>{score[1]}
          </div>
        ) : (
          <span className="text-lg font-bold text-white/60">VS</span>
        )}
      </div>
      <TeamMini code={a} label={labels?.[1]} align="right" />
    </div>
  );
}

function TeamMini({
  code,
  label,
  align = "left",
}: {
  code?: string;
  label?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-1.5`}>
      <Flag code={code} emoji={code ? undefined : "🏳️"} size="lg" ring={false} />
      <span className="truncate text-center text-xs font-bold">
        {code ? undefined : label ?? "A definir"}
        {code && <CodeName code={code} />}
      </span>
    </div>
  );
}

function CodeName({ code }: { code: string }) {
  const t = TEAMS.find((x) => x.code === code);
  return <>{t?.name ?? code}</>;
}
