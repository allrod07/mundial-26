"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GitCompare, Swords } from "lucide-react";
import { getPlayer } from "@/lib/data/squads";
import { TEAM_MAP } from "@/lib/data/teams";
import { deriveAttributes, ATTR_LABELS } from "@/lib/engine/attributes";
import { getPlayerTournamentStats } from "@/lib/engine/playerStats";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlayerPicker } from "@/components/player/PlayerPicker";
import { RadarStats } from "@/components/charts/RadarStats";
import { Flag } from "@/components/ui/Flag";
import { fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const C1 = "#00c75f";
const C2 = "#e0991f";

function CompareRow({ label, a, b, fmt }: { label: string; a: number; b: number; fmt?: (n: number) => string }) {
  const max = Math.max(a, b, 1);
  const f = fmt ?? ((n: number) => String(n));
  const aWin = a > b;
  const bWin = b > a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
      <div className="flex items-center justify-end gap-2">
        <span className={cn("stat-num text-sm font-extrabold tabular", aWin ? "text-pitch-600 dark:text-pitch-300" : "text-ink-400")}>
          {f(a)}
        </span>
        <div className="h-1.5 w-full max-w-[7rem] overflow-hidden rounded-full bg-ink-500/10">
          <div className="ml-auto h-full rounded-full" style={{ width: `${(a / max) * 100}%`, background: C1 }} />
        </div>
      </div>
      <span className="w-24 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-full max-w-[7rem] overflow-hidden rounded-full bg-ink-500/10">
          <div className="h-full rounded-full" style={{ width: `${(b / max) * 100}%`, background: C2 }} />
        </div>
        <span className={cn("stat-num text-sm font-extrabold tabular", bWin ? "text-gold-600 dark:text-gold-300" : "text-ink-400")}>
          {f(b)}
        </span>
      </div>
    </div>
  );
}

function Comparador() {
  const params = useSearchParams();
  const [p1, setP1] = useState<string | null>(params.get("p1"));
  const [p2, setP2] = useState<string | null>(params.get("p2"));

  const player1 = p1 ? getPlayer(p1) : null;
  const player2 = p2 ? getPlayer(p2) : null;
  const both = player1 && player2;

  const a1 = player1 ? deriveAttributes(player1) : null;
  const a2 = player2 ? deriveAttributes(player2) : null;
  const s1 = player1 ? getPlayerTournamentStats(player1.id, player1.teamCode) : null;
  const s2 = player2 ? getPlayerTournamentStats(player2.id, player2.teamCode) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Análise"
        icon={<GitCompare size={24} />}
        title="Comparador de jogadores"
        description="Escolha dois atletas e confronte atributos, números na Copa e dados de mercado."
      />

      <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <PlayerPicker value={p1} onChange={setP1} placeholder="Jogador 1" accent={C1} />
        <div className="hidden justify-center sm:flex">
          <span className="grid h-11 w-11 place-items-center rounded-full gradient-pitch text-white shadow-glow">
            <Swords size={18} />
          </span>
        </div>
        <PlayerPicker value={p2} onChange={setP2} placeholder="Jogador 2" accent={C2} />
      </div>

      {!both ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] py-16 text-center text-ink-400">
          Selecione dois jogadores para iniciar a comparação.
        </div>
      ) : (
        <>
          {/* Headline cards */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[{ p: player1!, c: C1 }, { p: player2!, c: C2 }].map(({ p, c }) => (
              <div key={p.id} className="surface rounded-2xl p-4 text-center" style={{ boxShadow: `inset 0 -3px 0 ${c}` }}>
                <div className="mx-auto mb-2 flex items-center justify-center gap-2">
                  <Flag code={p.teamCode} size="sm" />
                  <span className="text-xs text-ink-400">{TEAM_MAP[p.teamCode]?.name}</span>
                </div>
                <div className="text-base font-extrabold leading-tight">{p.name}</div>
                <div className="text-xs text-ink-400">{p.position}</div>
                <div className="mt-2 stat-num text-3xl font-extrabold" style={{ color: c }}>{p.rating}</div>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div className="surface mt-4 rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-bold">Atributos</h2>
            <RadarStats
              series={[
                { name: player1!.name, color: C1, attrs: a1! },
                { name: player2!.name, color: C2, attrs: a2! },
              ]}
              height={360}
            />
            <div className="mt-2 space-y-0.5">
              {ATTR_LABELS.map((attr) => (
                <CompareRow key={attr.key} label={attr.label} a={a1![attr.key]} b={a2![attr.key]} />
              ))}
            </div>
          </div>

          {/* Tournament stats */}
          <div className="surface mt-4 rounded-2xl p-5">
            <h2 className="mb-2 text-sm font-bold">Números na Copa 2026</h2>
            <CompareRow label="Partidas" a={s1!.matches} b={s2!.matches} />
            <CompareRow label="Gols" a={s1!.goals} b={s2!.goals} />
            <CompareRow label="Assistências" a={s1!.assists} b={s2!.assists} />
            <CompareRow label="G+A" a={s1!.goals + s1!.assists} b={s2!.goals + s2!.assists} />
            <CompareRow label="Amarelos" a={s1!.yellow} b={s2!.yellow} />
          </div>

          {/* Bio / market */}
          <div className="surface mt-4 rounded-2xl p-5">
            <h2 className="mb-2 text-sm font-bold">Perfil e mercado</h2>
            <CompareRow label="Idade" a={player1!.age} b={player2!.age} fmt={(n) => `${n}a`} />
            <CompareRow label="Altura" a={player1!.height} b={player2!.height} fmt={(n) => `${n}cm`} />
            <CompareRow label="Jogos seleção" a={player1!.caps} b={player2!.caps} />
            <CompareRow label="Gols seleção" a={player1!.intlGoals} b={player2!.intlGoals} />
            <CompareRow label="Valor (M€)" a={player1!.marketValue} b={player2!.marketValue} fmt={fmtMoney} />
          </div>
        </>
      )}
    </div>
  );
}

export default function CompararPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-center text-ink-400">Carregando…</div>}>
      <Comparador />
    </Suspense>
  );
}
