"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Filter, Star, X } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAMS, GROUPS } from "@/lib/data/teams";
import { CITIES } from "@/lib/data/cities";
import { useFavorites, useFavoritesHydrated } from "@/store/useFavorites";
import { MatchCard } from "@/components/match/MatchCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/ui/Reveal";
import { fmtDate, dayKey } from "@/lib/format";
import type { Stage } from "@/lib/types";

const STAGES: { id: string; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "Grupos", label: "Grupos" },
  { id: "16-avos", label: "16-avos" },
  { id: "Oitavas", label: "Oitavas" },
  { id: "Quartas", label: "Quartas" },
  { id: "Semifinal", label: "Semis" },
  { id: "Final", label: "Final" },
];

export default function CalendarioPage() {
  const { tournament } = useTournament();
  const hydrated = useFavoritesHydrated();
  const favMatches = useFavorites((s) => s.matches);

  const [stage, setStage] = useState("all");
  const [team, setTeam] = useState("");
  const [group, setGroup] = useState("");
  const [city, setCity] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);

  const filtered = useMemo(() => {
    return tournament.matches
      .filter((m) => {
        if (stage !== "all" && m.stage !== stage) return false;
        if (group && m.group !== group) return false;
        if (city && m.cityId !== city) return false;
        if (team && m.homeCode !== team && m.awayCode !== team) return false;
        if (onlyFav && !favMatches.includes(m.id)) return false;
        return true;
      })
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [tournament, stage, group, city, team, onlyFav, favMatches]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const k = dayKey(m.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return [...map.entries()];
  }, [filtered]);

  const clear = () => {
    setStage("all"); setTeam(""); setGroup(""); setCity(""); setOnlyFav(false);
  };
  const hasFilters = stage !== "all" || team || group || city || onlyFav;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <PageHeader
        eyebrow="Competição"
        icon={<CalendarDays size={24} />}
        title="Calendário"
        description="Todos os 104 jogos da Copa do Mundo 2026 — filtre por fase, seleção, grupo ou sede."
      />

      {/* filters */}
      <div className="sticky top-16 z-30 mt-5">
        <div className="glass rounded-2xl p-3">
          <div className="flex flex-col gap-3">
            <Tabs
              items={STAGES}
              value={stage}
              onChange={setStage}
              size="sm"
              idPrefix="cal-stage"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={team}
                onChange={setTeam}
                placeholder="Todas as seleções"
                className="min-w-[12rem] flex-1"
                options={[...TEAMS]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((t) => ({ value: t.code, label: `${t.flag} ${t.name}` }))}
              />
              <Select
                value={group}
                onChange={setGroup}
                placeholder="Todos os grupos"
                className="w-40"
                options={GROUPS.map((g) => ({ value: g, label: `Grupo ${g}` }))}
              />
              <Select
                value={city}
                onChange={setCity}
                placeholder="Todas as sedes"
                className="min-w-[10rem] flex-1"
                options={CITIES.map((c) => ({ value: c.id, label: c.name }))}
              />
              <button
                onClick={() => setOnlyFav((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  onlyFav
                    ? "border-gold-500/40 bg-gold-500/10 text-gold-600 dark:text-gold-300"
                    : "border-[var(--border)] text-ink-500 hover:border-gold-500/40"
                }`}
              >
                <Star size={15} fill={onlyFav ? "currentColor" : "none"} /> Favoritos
              </button>
              {hasFilters && (
                <button
                  onClick={clear}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold text-ink-400 hover:text-red-500"
                >
                  <X size={15} /> Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* results */}
      <div className="mt-6 flex items-center justify-between px-1 text-sm text-ink-400">
        <span className="flex items-center gap-1.5">
          <Filter size={14} /> {filtered.length} jogos encontrados
        </span>
        {!hydrated && onlyFav && <span>carregando favoritos…</span>}
      </div>

      {byDay.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-ink-400">
          Nenhum jogo encontrado com esses filtros.
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          {byDay.map(([day, matches]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold capitalize">{fmtDate(day)}</h2>
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs text-ink-400">{matches.length} jogos</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
