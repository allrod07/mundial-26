"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Users, Search, Trophy } from "lucide-react";
import { TEAMS, GROUPS } from "@/lib/data/teams";
import { CONFEDERATIONS } from "@/lib/data/confederations";
import type { ConfederationCode } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

const CONF_TABS = [
  { id: "all", label: "Todas" },
  ...Object.values(CONFEDERATIONS).map((c) => ({ id: c.code, label: c.code })),
];

export default function SelecoesPage() {
  const [conf, setConf] = useState("all");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");

  const teams = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return [...TEAMS]
      .filter((t) => (conf === "all" ? true : t.confederation === (conf as ConfederationCode)))
      .filter((t) => (group ? t.group === group : true))
      .filter((t) => (nq ? t.name.toLowerCase().includes(nq) : true))
      .sort((a, b) => a.fifaRank - b.fifaRank);
  }, [conf, group, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <PageHeader
        eyebrow="Participantes"
        icon={<Users size={24} />}
        title="Seleções"
        description="As 48 seleções da Copa do Mundo 2026. Explore elencos, históricos e estatísticas de cada país."
      />

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs items={CONF_TABS} value={conf} onChange={setConf} size="sm" idPrefix="conf" className="lg:max-w-fit" />
        <div className="flex flex-1 items-center gap-2">
          <Select
            value={group}
            onChange={setGroup}
            placeholder="Todos os grupos"
            className="w-40"
            options={GROUPS.map((g) => ({ value: g, label: `Grupo ${g}` }))}
          />
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar seleção..."
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-pitch-500"
            />
          </div>
        </div>
      </div>

      <p className="mt-4 px-1 text-sm text-ink-400">{teams.length} seleções</p>

      <Stagger className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {teams.map((t) => (
          <StaggerItem key={t.code}>
            <Link href={`/selecoes/${t.code}`}>
              <Card interactive className="group relative overflow-hidden p-5">
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
                  style={{ background: t.firstColor }}
                />
                <div className="absolute right-2 top-2">
                  <FavoriteButton kind="team" id={t.code} size={16} />
                </div>
                <div className="relative flex flex-col items-center text-center">
                  <Flag code={t.code} size="lg" />
                  <h3 className="mt-3 text-sm font-bold leading-tight">{t.name}</h3>
                  <div className="mt-1 text-xs text-ink-400">
                    {t.confederation} · Grupo {t.group}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge tone="ink">#{t.fifaRank} FIFA</Badge>
                    {t.titles > 0 && (
                      <Badge tone="gold">
                        <Trophy size={10} /> {t.titles}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
