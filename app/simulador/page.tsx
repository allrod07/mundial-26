"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Gamepad2, Wand2, RotateCcw, Trophy, Dices, Eraser, Info, ListOrdered, GitMerge, Printer,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { GROUPS, TEAM_MAP } from "@/lib/data/teams";
import { simulateScore, winnerOf } from "@/lib/engine/simulate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Flag } from "@/components/ui/Flag";
import { GroupTable } from "@/components/standings/GroupTable";
import { Bracket } from "@/components/bracket/Bracket";
import { SimMatchRow } from "@/components/simulator/SimMatchRow";
import { TeamRoute } from "@/components/simulator/TeamRoute";

const KO_ROUNDS = [
  { label: "16-avos de final", ids: Array.from({ length: 16 }, (_, i) => `R32-${i + 1}`) },
  { label: "Oitavas de final", ids: Array.from({ length: 8 }, (_, i) => `R16-${i + 1}`) },
  { label: "Quartas de final", ids: Array.from({ length: 4 }, (_, i) => `QF-${i + 1}`) },
  { label: "Semifinais", ids: ["SF-1", "SF-2"] },
  { label: "Disputa de 3º e Final", ids: ["TP", "FINAL"] },
];

export default function SimuladorPage() {
  const { tournament, setResult, clearResult, simulateAll, resetAll, isSimulated } = useTournament();
  const [tab, setTab] = useState("grupos");
  const [group, setGroup] = useState("A");

  const groupMatches = useMemo(
    () => tournament.matches.filter((m) => m.group === group).sort((a, b) => (a.round! - b.round!) || a.id.localeCompare(b.id)),
    [tournament, group],
  );

  const playedGroup = tournament.matches.filter((m) => m.stage === "Grupos" && m.status === "encerrado").length;
  const final = tournament.matchMap["FINAL"];
  const champion = final?.status === "encerrado" ? winnerOf(final) : null;

  const simulateGroup = (g: string) => {
    tournament.matches
      .filter((m) => m.group === g && m.homeCode && m.awayCode)
      .forEach((m) => {
        const s = simulateScore(TEAM_MAP[m.homeCode!].rating, TEAM_MAP[m.awayCode!].rating, `sim-${m.id}`);
        setResult(m.id, s.homeGoals, s.awayGoals);
      });
  };
  const clearGroup = (g: string) => {
    tournament.matches.filter((m) => m.group === g).forEach((m) => clearResult(m.id));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Modo Manual"
        icon={<Gamepad2 size={24} />}
        title="Simulador da Copa"
        description="Preencha apenas os placares. O sistema calcula os critérios de desempate, as colocações e a rota de cada seleção até a final — tudo recalculado automaticamente."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateAll}
              className="inline-flex items-center gap-2 rounded-full gradient-pitch px-4 py-2.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Wand2 size={16} /> Simular tudo
            </button>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-ink-500 transition-colors hover:border-red-500/40 hover:text-red-500"
            >
              <RotateCcw size={16} /> Resetar
            </button>
            <Link
              href="/impressao"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-ink-500 transition-colors hover:border-pitch-500/40 hover:text-pitch-600 dark:hover:text-pitch-300"
            >
              <Printer size={16} /> Tabela p/ imprimir
            </Link>
          </div>
        }
      />

      {/* status strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Jogos da fase de grupos" value={`${playedGroup}/72`} />
        <StatChip label="Fase de grupos" value={tournament.groupComplete ? "Completa" : "Em andamento"} />
        <StatChip label="Cenário" value={isSimulated ? "Personalizado" : "Padrão"} />
        <StatChip
          label="Campeão"
          value={champion ? `${TEAM_MAP[champion].flag} ${TEAM_MAP[champion].name}` : "—"}
          gold={!!champion}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <Tabs
          items={[
            { id: "grupos", label: "Fase de grupos" },
            { id: "mata", label: "Mata-mata" },
            { id: "rotas", label: "Rotas" },
          ]}
          value={tab}
          onChange={setTab}
          idPrefix="sim-tab"
        />
      </div>

      {tab === "rotas" ? (
        <div className="mt-6">
          <TeamRoute />
        </div>
      ) : tab === "grupos" ? (
        <div className="mt-6">
          <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition-colors ${
                  group === g ? "gradient-pitch text-white shadow-sm" : "surface text-ink-500 hover:text-pitch-600"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold"><ListOrdered size={16} className="text-pitch-500" /> Grupo {group}</h2>
                <div className="flex gap-2">
                  <button onClick={() => simulateGroup(group)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold transition-colors hover:border-pitch-500/40 hover:text-pitch-600">
                    <Dices size={13} /> Simular grupo
                  </button>
                  <button onClick={() => clearGroup(group)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-ink-400 transition-colors hover:border-red-500/40 hover:text-red-500">
                    <Eraser size={13} /> Limpar
                  </button>
                </div>
              </div>
              <GroupTable group={group} rows={tournament.standings[group]} />
            </div>

            <div>
              <h2 className="mb-3 text-sm font-bold">Resultados</h2>
              <div className="surface divide-y divide-[var(--border)] rounded-2xl">
                {groupMatches.map((m) => (
                  <SimMatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {champion && (
            <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/5 px-5 py-4">
              <Trophy className="text-gold-500" size={22} />
              <span className="text-sm font-semibold">Campeão do seu cenário:</span>
              <Flag code={champion} size="sm" />
              <span className="font-extrabold">{TEAM_MAP[champion].name}</span>
            </div>
          )}

          {!tournament.groupComplete && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-pitch-500/5 px-4 py-3 text-sm text-ink-500">
              <Info size={16} className="shrink-0 text-pitch-500" />
              Complete a fase de grupos (ou clique em “Simular tudo”) para liberar os confrontos do mata-mata.
            </div>
          )}

          <div className="surface mb-6 rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold"><GitMerge size={16} className="text-pitch-500" /> Chaveamento</h2>
            <Bracket tournament={tournament} />
          </div>

          {tournament.groupComplete && (
            <div className="space-y-5">
              {KO_ROUNDS.map((round) => {
                const matches = round.ids.map((id) => tournament.matchMap[id]).filter(Boolean);
                const anyDecided = matches.some((m) => m.homeCode && m.awayCode);
                if (!anyDecided) return null;
                return (
                  <div key={round.label}>
                    <h3 className="mb-2 text-sm font-bold">{round.label}</h3>
                    <div className="surface divide-y divide-[var(--border)] rounded-2xl">
                      {matches.map((m) => (
                        <SimMatchRow key={m.id} match={m} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="surface rounded-2xl px-4 py-3">
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className={`mt-0.5 text-sm font-extrabold ${gold ? "gradient-text-gold" : ""}`}>{value}</div>
    </div>
  );
}
