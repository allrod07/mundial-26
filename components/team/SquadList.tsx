"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Player, PositionGroup } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { POSITION_ABBR, POSITION_GROUP_LABEL, POSITION_GROUP_COLOR, fmtMoney } from "@/lib/format";
import { Shirt, Cake, Goal } from "lucide-react";

const GROUP_TABS = [
  { id: "all", label: "Todos" },
  { id: "GOL", label: "Goleiros" },
  { id: "DEF", label: "Defensores" },
  { id: "MEI", label: "Meio-campo" },
  { id: "ATA", label: "Ataque" },
];

const ORDER: PositionGroup[] = ["GOL", "DEF", "MEI", "ATA"];

export function SquadList({ squad }: { squad: Player[] }) {
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState("number");

  const sorted = useMemo(() => {
    const arr = [...squad];
    const cmp: Record<string, (a: Player, b: Player) => number> = {
      number: (a, b) => a.number - b.number,
      rating: (a, b) => b.rating - a.rating,
      age: (a, b) => a.age - b.age,
      value: (a, b) => b.marketValue - a.marketValue,
      caps: (a, b) => b.caps - a.caps,
    };
    return arr.sort(cmp[sort] ?? cmp.number);
  }, [squad, sort]);

  const groups = useMemo(() => {
    const visible = group === "all" ? sorted : sorted.filter((p) => p.positionGroup === group);
    const byGroup = new Map<PositionGroup, Player[]>();
    for (const p of visible) {
      if (!byGroup.has(p.positionGroup)) byGroup.set(p.positionGroup, []);
      byGroup.get(p.positionGroup)!.push(p);
    }
    return ORDER.filter((g) => byGroup.has(g)).map((g) => [g, byGroup.get(g)!] as const);
  }, [sorted, group]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs items={GROUP_TABS} value={group} onChange={setGroup} size="sm" idPrefix="squad-grp" />
        <Select
          value={sort}
          onChange={setSort}
          className="w-44"
          options={[
            { value: "number", label: "Ordenar: nº camisa" },
            { value: "rating", label: "Ordenar: rating" },
            { value: "value", label: "Ordenar: valor" },
            { value: "age", label: "Ordenar: idade" },
            { value: "caps", label: "Ordenar: jogos" },
          ]}
        />
      </div>

      <div className="mt-5 space-y-6">
        {groups.map(([g, players]) => (
          <div key={g}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: POSITION_GROUP_COLOR[g] }} />
              <h3 className="text-sm font-bold">{POSITION_GROUP_LABEL[g]}</h3>
              <span className="text-xs text-ink-400">({players.length})</span>
            </div>
            <div className="surface overflow-hidden rounded-2xl">
              {players.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/jogadores/${p.id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-pitch-500/5 ${
                    i > 0 ? "border-t border-[var(--border)]" : ""
                  }`}
                >
                  <span className="w-7 text-center stat-num text-sm font-bold text-ink-400">
                    {p.number}
                  </span>
                  <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{p.name}</span>
                      {p.isCaptain && (
                        <span className="rounded bg-gold-500/15 px-1 text-[9px] font-bold text-gold-600 dark:text-gold-300">
                          C
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <span>{POSITION_ABBR[p.position]}</span>
                      <span className="opacity-50">·</span>
                      <span className="truncate">{p.clubFlag} {p.club}</span>
                    </div>
                  </div>
                  <div className="hidden items-center gap-4 text-xs text-ink-400 sm:flex">
                    <span className="flex items-center gap-1" title="Idade">
                      <Cake size={12} /> {p.age}
                    </span>
                    <span className="flex items-center gap-1" title="Jogos pela seleção">
                      <Shirt size={12} /> {p.caps}
                    </span>
                    <span className="flex items-center gap-1" title="Gols pela seleção">
                      <Goal size={12} /> {p.intlGoals}
                    </span>
                    <span className="w-14 text-right font-semibold text-ink-500">{fmtMoney(p.marketValue)}</span>
                  </div>
                  <span className="grid h-8 w-9 shrink-0 place-items-center rounded-lg bg-pitch-500/10 stat-num text-sm font-extrabold text-pitch-600 dark:text-pitch-300">
                    {p.rating}
                  </span>
                  <FavoriteButton kind="player" id={p.id} size={15} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
