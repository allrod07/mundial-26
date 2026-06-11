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

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };
const MEDALS = ["🥇", "🥈", "🥉"];

export default function BolaoImpressaoPage() {
  const { tournament } = useTournament();
  const [data, setData] = useState<PoolData>(EMPTY);

  useEffect(() => {
    fetch("/api/pool").then((r) => (r.ok ? r.json() : EMPTY)).then((d: PoolData) => setData(d ?? EMPTY)).catch(() => {});
  }, []);

  const { facts, results } = useMemo(() => scorePool(tournament, data), [tournament, data]);

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
            <h1 className="text-2xl font-extrabold">Apostas e pontuação — PDF</h1>
            <p className="mt-1 text-sm text-ink-400">Clique em imprimir e escolha “Salvar como PDF”.</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white shadow-glow">
            <Printer size={17} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* folha imprimível */}
      <div className="paper mt-6 rounded-2xl border border-[var(--border)] p-5 print:mt-0 print:rounded-none print:border-0 print:p-0">
        <header className="mb-4 border-b border-[var(--border)] pb-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pitch-700"><Trophy size={14} /> Bolão da Família · Copa 2026</div>
          <h2 className="mt-1 text-xl font-extrabold">Apostas e pontuação</h2>
          <p className="mt-1 text-[11px] text-ink-500">
            Campeão (oficial): {facts.champion ? TEAM_MAP[facts.champion]?.name : "a definir"} · Brasil: {facts.actualGroupFinish ? GROUP_FINISH_LABEL[facts.actualGroupFinish] : "fase de grupos"}{facts.stageReached ? ` · chegou até ${STAGE_LABEL[facts.stageReached]}` : ""}
          </p>
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
              <th className="pr-2">Campeão</th>
              <th className="pr-2">Fase BRA</th>
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
                <td className="pr-2">{r.prediction?.champion ? TEAM_MAP[r.prediction.champion]?.name : "—"}</td>
                <td className="pr-2">{r.prediction?.brazilStage ? STAGE_LABEL[r.prediction.brazilStage] : "—"}</td>
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
              Campeão: <b>{r.prediction?.champion ? TEAM_MAP[r.prediction.champion]?.name : "—"}</b> · Vice: <b>{r.prediction?.vice ? TEAM_MAP[r.prediction.vice]?.name : "—"}</b> · Grupo: <b>{r.prediction?.brazilGroupFinish ? GROUP_FINISH_LABEL[r.prediction.brazilGroupFinish] : "—"}</b> · Pontos grupo: <b>{r.prediction?.brazilGroupPoints ?? "—"}</b> · Fase: <b>{r.prediction?.brazilStage ? STAGE_LABEL[r.prediction.brazilStage] : "—"}</b>
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
          Mundial &apos;26 · Bolão da Família — placar exato +5, resultado +3, colocação no grupo +10, pontos no grupo +8/+4, fase +15/+5, campeão +25, vice +10.
        </footer>
      </div>
    </div>
  );
}
