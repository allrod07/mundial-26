"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Printer, ArrowLeft, Trophy } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAM_MAP } from "@/lib/data/teams";
import {
  scorePool, STAGE_LABEL, GROUP_FINISH_LABEL, type PoolData,
} from "@/lib/engine/pool";
import { fmtDateShort } from "@/lib/format";
import { computePrizes, fmtBRL, ENTRY_VALUE_BRL, PRIZE_SPLIT } from "@/lib/data/pool-config";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };
const MEDALS = ["🥇", "🥈", "🥉"];

function fmtGenerated(d: Date): string {
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }) + " (BRT)";
}

export default function BolaoImpressaoPage() {
  const { tournament } = useTournament();
  const [data, setData] = useState<PoolData>(EMPTY);

  useEffect(() => {
    fetch("/api/pool", { cache: "no-store" }).then((r) => (r.ok ? r.json() : EMPTY)).then((d: PoolData) => setData(d ?? EMPTY)).catch(() => {});
  }, []);

  const { facts, results } = useMemo(() => scorePool(tournament, data), [tournament, data]);

  // Snapshot da prestação de contas: arrecadado, prêmios e último jogo do
  // Brasil considerado (data + adversário) — para o PDF ser pós-jogo.
  const paidCount = data.participants.filter((p) => p.paid).length;
  const prizes = computePrizes(paidCount);
  const finishedBrazil = facts.matches.filter((m) => m.status === "encerrado");
  const lastBrazil = finishedBrazil[finishedBrazil.length - 1];
  const lastBrazilOpp = lastBrazil
    ? lastBrazil.homeCode === "BRA"
      ? lastBrazil.awayCode
      : lastBrazil.homeCode
    : null;
  const generatedAt = useMemo(() => fmtGenerated(new Date()), [data, tournament]);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      {/* toolbar — não imprime */}
      <div className="no-print">
        <Link href="/bolao" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300">
          <ArrowLeft size={16} /> Bolão
        </Link>
        <div className="mt-3 flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600 dark:text-pitch-400">Bolão da Família</div>
            <h1 className="text-2xl font-extrabold">Prestação de contas — PDF</h1>
            <p className="mt-1 text-sm text-ink-400">Clique em imprimir e escolha “Salvar como PDF”. Pode mandar no grupo da família após cada jogo do Brasil.</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white shadow-glow">
            <Printer size={17} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* folha imprimível */}
      <div className="paper mt-6 rounded-2xl border border-[var(--border)] p-5 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <header className="mb-4 border-b border-[var(--border)] pb-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pitch-700"><Trophy size={14} /> Bolão da Família · Copa 2026</div>
          <h2 className="mt-1 text-center text-xl font-extrabold">Prestação de contas</h2>
          <p className="mt-1 text-center text-[11px] text-ink-500">
            Gerado em <b>{generatedAt}</b>
            {lastBrazil && lastBrazilOpp ? (
              <> · Atualizado após <b>BRA × {lastBrazilOpp} ({lastBrazil.homeGoals}–{lastBrazil.awayGoals}) em {fmtDateShort(lastBrazil.date)}</b></>
            ) : (
              <> · Aguardando o 1º jogo do Brasil</>
            )}
          </p>
          <p className="mt-1 text-center text-[11px] text-ink-500">
            Campeão (oficial): {facts.champion ? TEAM_MAP[facts.champion]?.name : "a definir"} · Brasil: {facts.actualGroupFinish ? GROUP_FINISH_LABEL[facts.actualGroupFinish] : "fase de grupos"}{facts.stageReached ? ` · chegou até ${STAGE_LABEL[facts.stageReached]}` : ""}
          </p>

          {/* Bloco financeiro */}
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] p-2 text-[11px] sm:grid-cols-4">
            <div>
              <div className="text-ink-400">Participantes pagantes</div>
              <div className="text-sm font-extrabold">{paidCount} <span className="font-normal text-ink-400">× {fmtBRL(ENTRY_VALUE_BRL)}</span></div>
            </div>
            <div>
              <div className="text-ink-400">Total arrecadado</div>
              <div className="text-sm font-extrabold text-pitch-700">{fmtBRL(prizes.pot)}</div>
            </div>
            <div>
              <div className="text-ink-400">🥇 1º · {Math.round(PRIZE_SPLIT.first * 100)}%</div>
              <div className="text-sm font-extrabold">{fmtBRL(prizes.first)}</div>
            </div>
            <div>
              <div className="text-ink-400">🥈 2º · {Math.round(PRIZE_SPLIT.second * 100)}% · 🥉 3º · {Math.round(PRIZE_SPLIT.third * 100)}%</div>
              <div className="text-sm font-extrabold">{fmtBRL(prizes.second)} · {fmtBRL(prizes.third)}</div>
            </div>
          </div>
        </header>

        {/* ranking resumido */}
        <table className="mb-5 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-ink-500">
              <th className="py-1 pr-2">#</th>
              <th className="pr-2">Participante</th>
              <th className="pr-2">Pago</th>
              <th className="pr-2 text-center">Exatos</th>
              <th className="pr-2 text-center">Result.</th>
              <th className="pr-2">Brasil campeão?</th>
              <th className="text-right">Pontos</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.participant.id} className="border-b border-[var(--border)]">
                <td className="py-1 pr-2 font-bold">{r.rank <= 3 ? MEDALS[r.rank - 1] : r.rank}</td>
                <td className="pr-2 font-semibold">{r.participant.emoji} {r.participant.name}</td>
                <td className="pr-2">{r.participant.paid ? "sim" : "não"}</td>
                <td className="pr-2 text-center">{r.exactCount}</td>
                <td className="pr-2 text-center">{r.resultCount}</td>
                <td className="pr-2">{r.prediction?.brazilChampion == null ? "—" : r.prediction.brazilChampion ? "Sim 🏆" : "Não"}</td>
                <td className="text-right font-extrabold">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* detalhe por participante */}
        {results.map((r) => (
          <div key={r.participant.id} className="mb-4 break-inside-avoid">
            <div className="mb-1 flex items-center justify-between border-b border-[var(--border)] pb-1">
              <h3 className="text-sm font-extrabold">{r.rank}. {r.participant.emoji} {r.participant.name}{!r.participant.paid && <span className="ml-2 text-[10px] font-bold text-red-500">(não pago)</span>}</h3>
              <span className="text-sm font-extrabold text-pitch-700">{r.points} pts</span>
            </div>
            <div className="mb-1 text-[11px] text-ink-500">
              Palpite &ldquo;Brasil campeão?&rdquo;: <b>{r.prediction?.brazilChampion == null ? "—" : r.prediction.brazilChampion ? "Sim 🏆 (+15 se acertar)" : "Não (+5 se acertar)"}</b>
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="text-left text-ink-500">
                  <th className="py-0.5 pr-2">Data</th>
                  <th className="pr-2">Jogo</th>
                  <th className="pr-2 text-center">Resultado</th>
                  <th className="pr-2 text-center">Palpite</th>
                  <th className="text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {r.matchDetails.map((d) => (
                  <tr key={d.match.id} className="border-t border-[var(--border)]">
                    <td className="py-0.5 pr-2">{fmtDateShort(d.match.date)}</td>
                    <td className="pr-2">{d.match.homeCode} x {d.match.awayCode}</td>
                    <td className="pr-2 text-center">{d.match.status === "encerrado" ? `${d.match.homeGoals}-${d.match.awayGoals}` : "—"}</td>
                    <td className="pr-2 text-center">{d.pred ? `${d.pred.homeGoals}-${d.pred.awayGoals}` : "—"}</td>
                    <td className="text-right font-bold">{d.kind === "none" ? "—" : d.kind === "pending" ? "·" : `+${d.pts}`}</td>
                  </tr>
                ))}
                {r.matchDetails.length === 0 && <tr><td colSpan={5} className="py-1 text-ink-400">Sem jogos do Brasil definidos.</td></tr>}
              </tbody>
            </table>
          </div>
        ))}

        {results.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Nenhum participante cadastrado.</p>}

        <footer className="mt-4 border-t border-[var(--border)] pt-2 text-center text-[10px] text-ink-400">
          Mundial &apos;26 · Bolão da Família — resultado +3, placar exato +6, Brasil campeão +15 (ou +5 se apostar que não será campeão e acertar).
        </footer>
      </div>
    </div>
  );
}
