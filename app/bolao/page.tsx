"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Trophy, Medal, ShieldCheck, ChevronDown, Goal, Activity, Info, Loader2, Settings, Gift,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAM_MAP } from "@/lib/data/teams";
import {
  scorePool, poolEvolution, BADGES, STAGE_LABEL, BRAZIL,
  type PoolData, type PoolResult, type BadgeKey,
} from "@/lib/engine/pool";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Flag } from "@/components/ui/Flag";
import { PoolEvolutionChart } from "@/components/pool/PoolEvolutionChart";
import { fmtDateShort } from "@/lib/format";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };
const MEDALS = ["🥇", "🥈", "🥉"];
const PRIZES = [
  { icon: "🥇", title: "Campeão do Bolão", desc: "Prêmio principal" },
  { icon: "🥈", title: "Vice", desc: "Caixa de chocolates" },
  { icon: "🥉", title: "3º lugar", desc: "Caixa de bombons" },
];

export default function BolaoPage() {
  const { tournament } = useTournament();
  const [data, setData] = useState<PoolData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    fetch("/api/pool")
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d: PoolData) => setData(d ?? EMPTY))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { facts, results } = useMemo(() => scorePool(tournament, data), [tournament, data]);
  const evo = useMemo(() => poolEvolution(tournament, data), [tournament, data]);

  const badgeOwners = useMemo(() => {
    const map: Record<BadgeKey, PoolResult[]> = { rei: [], mestre: [], raiz: [], quente: [], frio: [] };
    for (const r of results) for (const b of r.badges) map[b].push(r);
    return map;
  }, [results]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Família"
        icon={<Trophy size={24} />}
        title="🏆 Bolão da Família"
        description="Pontue acertando a campanha do Brasil na Copa. Simples e equilibrado: todo mundo briga até a final, entendendo muito ou pouco de futebol."
        action={
          <Link href="/admin/bolao" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-ink-500 transition-colors hover:border-pitch-500/40 hover:text-pitch-600 dark:hover:text-pitch-300">
            <Settings size={15} /> Administrar
          </Link>
        }
      />

      {/* Prêmios */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PRIZES.map((p, i) => {
          const who = results[i];
          return (
            <Card key={p.title} className="flex items-center gap-3 p-4">
              <span className="text-3xl">{p.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-extrabold">{p.title}</div>
                <div className="truncate text-xs text-ink-400">{p.desc}</div>
                {who && <div className="mt-0.5 truncate text-xs font-bold text-pitch-600 dark:text-pitch-300">{who.participant.emoji ?? "👤"} {who.participant.name}</div>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Situação real do Brasil */}
      <Card className="mt-4 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Flag code={BRAZIL} size="sm" /> Campanha do Brasil (oficial)</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Chip label="Grupo" value={facts.groupComplete ? (facts.eliminatedInGroups ? "Eliminado" : `${facts.groupRank}º lugar`) : "Em andamento"} />
          <Chip label="Pontos no grupo" value={facts.groupPoints != null ? String(facts.groupPoints) : "—"} />
          <Chip label="Chegou até" value={facts.stageReached ? STAGE_LABEL[facts.stageReached] : "—"} />
          <Chip label="Campeão da Copa" value={facts.champion ? `${TEAM_MAP[facts.champion]?.flag ?? ""} ${TEAM_MAP[facts.champion]?.name ?? facts.champion}` : "a definir"} />
        </div>
      </Card>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-ink-400">
          <Loader2 size={16} className="animate-spin" /> carregando bolão…
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] py-14 text-center text-ink-400">
          Nenhum participante cadastrado ainda.
          <div className="mt-3">
            <Link href="/admin/bolao" className="inline-flex items-center gap-1.5 rounded-full gradient-pitch px-4 py-2 text-sm font-bold text-white">
              <ShieldCheck size={15} /> Cadastrar participantes
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Medalhas/conquistas */}
          {Object.values(badgeOwners).some((a) => a.length) && (
            <div className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Medal size={16} className="text-gold-500" /> Conquistas</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(BADGES) as BadgeKey[]).map((k) => {
                  const owners = badgeOwners[k];
                  if (!owners.length) return null;
                  return (
                    <Card key={k} className="flex items-start gap-3 p-3">
                      <span className="text-2xl">{BADGES[k].icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold">{BADGES[k].label}</div>
                        <div className="text-[11px] text-ink-400">{BADGES[k].desc}</div>
                        <div className="mt-1 truncate text-xs font-bold text-pitch-600 dark:text-pitch-300">
                          {owners.map((o) => `${o.participant.emoji ?? ""} ${o.participant.name}`).join(", ")}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ranking */}
          <h2 className="mb-3 mt-8 flex items-center gap-2 text-sm font-bold"><Trophy size={16} className="text-pitch-500" /> Classificação geral</h2>
          <div className="surface overflow-hidden rounded-2xl">
            <div className="hidden items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-400 sm:flex">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Participante</span>
              <span className="w-10 text-center" title="Placares exatos">Exa</span>
              <span className="w-10 text-center" title="Resultados certos">Res</span>
              <span className="w-12 text-center">Pts</span>
              <span className="w-24 text-right">Palpites</span>
            </div>
            {results.map((r) => (
              <div key={r.participant.id} className="border-b border-[var(--border)] last:border-0">
                <button
                  onClick={() => setExpanded((e) => (e === r.participant.id ? null : r.participant.id))}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-pitch-500/5"
                >
                  <span className="w-6 shrink-0 text-center text-sm font-extrabold">{r.rank <= 3 ? MEDALS[r.rank - 1] : r.rank}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-lg">{r.participant.emoji ?? "👤"}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{r.participant.name}</span>
                      {r.badges.length > 0 && (
                        <span className="flex items-center gap-1">
                          {r.badges.map((b) => <span key={b} title={BADGES[b].label} className="text-xs">{BADGES[b].icon}</span>)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="hidden w-10 shrink-0 text-center text-sm text-ink-500 sm:block">{r.exactCount}</span>
                  <span className="hidden w-10 shrink-0 text-center text-sm text-ink-500 sm:block">{r.resultCount}</span>
                  <span className="w-12 shrink-0 stat-num text-center text-lg font-extrabold text-pitch-600 dark:text-pitch-300">{r.points}</span>
                  <span className="flex shrink-0 items-center justify-end gap-1.5 text-xs text-ink-400 sm:w-24">
                    {r.prediction?.champion && <span title="Palpite de campeão"><Flag code={r.prediction.champion} size="xs" /></span>}
                    {r.prediction?.brazilStage && <span className="hidden rounded-full bg-ink-500/10 px-2 py-0.5 font-semibold lg:inline">🇧🇷 {STAGE_LABEL[r.prediction.brazilStage]}</span>}
                    <ChevronDown size={15} className={`transition-transform ${expanded === r.participant.id ? "rotate-180" : ""}`} />
                  </span>
                </button>

                {expanded === r.participant.id && <ParticipantDetail r={r} />}
              </div>
            ))}
          </div>

          {/* Evolução */}
          {evo.checkpoints.length > 0 && (
            <Card className="mt-8 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold"><Activity size={16} className="text-pitch-500" /> Evolução na Copa</h2>
              <p className="mb-3 text-xs text-ink-400">Pontos acumulados a cada jogo do Brasil (top 8).</p>
              <PoolEvolutionChart evo={evo} results={results} />
            </Card>
          )}
        </>
      )}

      {/* Regras */}
      <Card className="mt-8 overflow-hidden">
        <button onClick={() => setShowRules((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold">
          <span className="flex items-center gap-2"><Info size={16} className="text-pitch-500" /> Como pontua o bolão</span>
          <ChevronDown size={16} className={`transition-transform ${showRules ? "rotate-180" : ""}`} />
        </button>
        {showRules && (
          <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-ink-500">
            <ul className="space-y-1.5">
              <li><b>Jogos do Brasil:</b> acertar o resultado (vitória/empate/derrota) vale <b>+3</b>; placar exato vale <b>+10</b>.</li>
              <li><b>Colocação do Brasil no grupo</b> (1º/2º/eliminado): <b>+10</b> se acertar.</li>
              <li><b>Pontos do Brasil na fase de grupos:</b> exato <b>+8</b>; errar por 1 <b>+4</b>.</li>
              <li><b>Até onde o Brasil vai:</b> exato <b>+15</b>; trocar Campeão↔Vice <b>+5</b>.</li>
              <li><b>Campeão da Copa:</b> acertar o campeão <b>+25</b>; o vice <b>+10</b> (ambos <b>+35</b>).</li>
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              <Gift size={12} className="mr-1 inline" /> Desempate: mais placares exatos → acertou o campeão → acertou a fase do Brasil → mais resultados certos → sorteio.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-500/8 px-3 py-1.5">
      <span className="text-ink-400">{label}:</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

function ParticipantDetail({ r }: { r: PoolResult }) {
  const bd = r.breakdown;
  const p = r.prediction;
  return (
    <div className="bg-ink-500/[0.03] px-3 py-3 text-xs sm:px-4">
      {/* jogos do Brasil */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center gap-1.5 font-bold text-ink-500"><Goal size={13} className="text-pitch-500" /> Jogos do Brasil</div>
        <div className="space-y-1">
          {r.matchDetails.map((d) => {
            const m = d.match;
            const real = m.status === "encerrado" ? `${m.homeGoals}–${m.awayGoals}` : "—";
            const guess = d.pred ? `${d.pred.homeGoals}–${d.pred.awayGoals}` : "—";
            const tone = d.kind === "exact" ? "text-pitch-600 dark:text-pitch-300" : d.kind === "result" ? "text-blue-500" : d.kind === "miss" ? "text-red-400" : "text-ink-400";
            return (
              <div key={m.id} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-ink-400">{fmtDateShort(m.date)}</span>
                <Flag code={m.homeCode} size="xs" />
                <span className="font-semibold">{m.homeCode}</span>
                <span className="stat-num">{real}</span>
                <span className="font-semibold">{m.awayCode}</span>
                <Flag code={m.awayCode} size="xs" />
                <span className="ml-auto text-ink-400">palpite: <b className="text-ink-600 dark:text-ink-200">{guess}</b></span>
                <span className={`w-9 text-right font-bold ${tone}`}>{d.kind === "none" ? "—" : d.kind === "pending" ? "·" : `+${d.pts}`}</span>
              </div>
            );
          })}
          {r.matchDetails.length === 0 && <div className="text-ink-400">Brasil ainda não tem jogos definidos.</div>}
        </div>
      </div>
      {/* bônus */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        <Bonus label="Colocação no grupo" pick={p?.brazilGroupFinish ? (p.brazilGroupFinish === "out" ? "Eliminado" : `${p.brazilGroupFinish}º`) : "—"} pts={bd.groupFinish} />
        <Bonus label="Pontos no grupo" pick={p?.brazilGroupPoints != null ? String(p.brazilGroupPoints) : "—"} pts={bd.groupPoints} />
        <Bonus label="Fase do Brasil" pick={p?.brazilStage ? STAGE_LABEL[p.brazilStage] : "—"} pts={bd.stage} />
        <Bonus label="Campeão" pick={p?.champion ? (TEAM_MAP[p.champion]?.name ?? p.champion) : "—"} pts={bd.champion} />
        <Bonus label="Vice" pick={p?.vice ? (TEAM_MAP[p.vice]?.name ?? p.vice) : "—"} pts={bd.vice} />
        <Bonus label="Sequências" pick={`🔥${r.hotStreak} · 😅${r.coldStreak}`} pts={0} hidePts />
      </div>
    </div>
  );
}

function Bonus({ label, pick, pts, hidePts }: { label: string; pick: string; pts: number; hidePts?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--bg-elevated)] px-2 py-1">
      <span className="min-w-0">
        <span className="block text-[10px] text-ink-400">{label}</span>
        <span className="block truncate font-semibold">{pick}</span>
      </span>
      {!hidePts && <span className={`shrink-0 text-sm font-bold ${pts > 0 ? "text-pitch-600 dark:text-pitch-300" : "text-ink-300"}`}>+{pts}</span>}
    </div>
  );
}
