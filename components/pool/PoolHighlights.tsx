"use client";

import { Star, Crown, TrendingUp, TrendingDown, Users, Lock, Vote } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { fmtDateShort } from "@/lib/format";
import type { RoundHighlight, LeadershipRow, MoverRow, PoolConsensus } from "@/lib/engine/pool";

const who = (p: { emoji?: string | null; name: string }) => `${p.emoji ?? "👤"} ${p.name}`;

// ── 🗳️ Palpite da galera (consenso do próximo jogo) ──────────────────────────
export function ConsensusCard({ c }: { c: PoolConsensus }) {
  const m = c.match;
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="surface rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold"><Vote size={16} className="text-pitch-500" /> Palpite da galera</h2>
        <span className="text-[11px] text-ink-400">{fmtDateShort(m.date)}</span>
      </div>
      <div className="mb-3 flex items-center justify-center gap-2 text-sm font-extrabold">
        <Flag code={m.homeCode} size="xs" /> {m.homeCode}
        <span className="text-ink-300">×</span>
        {m.awayCode} <Flag code={m.awayCode} size="xs" />
      </div>

      {!c.revealed ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <Lock size={13} className="shrink-0" /> Os palpites ficam em segredo até travar (1h antes do jogo) — assim ninguém copia.
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users size={15} className="text-pitch-500" />
            <b>{c.predicted}</b> de <b>{c.totalPaid}</b> já palpitaram
          </div>
          {c.pending.length > 0 && (
            <div className="text-[11px] text-ink-400">
              Falta: {c.pending.map(who).join(", ")}
            </div>
          )}
        </div>
      ) : c.predicted === 0 ? (
        <div className="text-center text-xs text-ink-400">Ninguém palpitou esse jogo.</div>
      ) : (
        <div className="space-y-3">
          {c.topScore && (
            <div className="flex items-center justify-between rounded-xl bg-pitch-500/8 px-3 py-2">
              <span className="text-xs text-ink-500">Placar mais votado</span>
              <span className="flex items-center gap-1.5 text-sm font-extrabold">
                {c.topScore.homeCode} {c.topScore.home}–{c.topScore.away} {c.topScore.awayCode}
                <span className="text-[11px] font-normal text-ink-400">({c.topScore.count})</span>
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Consensus label="Brasil vence" value={pct(c.brazilWin)} tone="text-pitch-600 dark:text-pitch-300" />
            <Consensus label="Empate" value={pct(c.brazilDraw)} tone="text-ink-500" />
            <Consensus label="Brasil perde" value={pct(c.brazilLoss)} tone="text-red-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function Consensus({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-elevated)] px-2 py-2">
      <div className={`stat-num text-lg font-extrabold ${tone}`}>{value}</div>
      <div className="text-[10px] text-ink-400">{label}</div>
    </div>
  );
}

// ── 🌟👑🚀 Painel de destaques ───────────────────────────────────────────────
export function HighlightsPanel({
  highlights, leaders, movers,
}: {
  highlights: RoundHighlight[];
  leaders: LeadershipRow[];
  movers: { climber?: MoverRow; faller?: MoverRow };
}) {
  const lastRound = highlights.find((h) => h.winners.length > 0);
  const hasMovers = !!movers.climber || !!movers.faller;
  const topLeaders = leaders.slice(0, 4);
  if (!lastRound && topLeaders.length === 0 && !hasMovers) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {/* Craque da Rodada */}
      {lastRound && (
        <div className="surface rounded-2xl p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Star size={15} className="text-gold-500" /> Craque da Rodada</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <Flag code="BRA" size="xs" /> BRA × {lastRound.label} <Flag code={lastRound.label} size="xs" /> · {fmtDateShort(new Date(lastRound.date).toISOString())}
          </div>
          <div className="mt-1.5 text-sm font-extrabold text-pitch-600 dark:text-pitch-300">
            {lastRound.winners.map(who).join(", ")}
          </div>
          <div className="text-xs text-ink-400">+{lastRound.topPoints} pts nesse jogo</div>
        </div>
      )}

      {/* Quadro de liderança */}
      {topLeaders.length > 0 && (
        <div className="surface rounded-2xl p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><Crown size={15} className="text-gold-500" /> Mais vezes na ponta</h3>
          <div className="space-y-1">
            {topLeaders.map((l) => (
              <div key={l.participant.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{who(l.participant)}</span>
                <span className="shrink-0 font-extrabold text-pitch-600 dark:text-pitch-300">{l.timesLeading}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maior escalada / tombo */}
      {hasMovers && (
        <div className="surface rounded-2xl p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold"><TrendingUp size={15} className="text-pitch-500" /> Subiu & desceu</h3>
          <div className="space-y-2">
            {movers.climber && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp size={15} className="shrink-0 text-pitch-500" />
                <span className="min-w-0 flex-1 truncate">{who(movers.climber.participant)}</span>
                <span className="shrink-0 font-extrabold text-pitch-600 dark:text-pitch-300">▲{movers.climber.delta}</span>
              </div>
            )}
            {movers.faller && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown size={15} className="shrink-0 text-red-400" />
                <span className="min-w-0 flex-1 truncate">{who(movers.faller.participant)}</span>
                <span className="shrink-0 font-extrabold text-red-400">▼{Math.abs(movers.faller.delta)}</span>
              </div>
            )}
          </div>
          <div className="mt-1.5 text-[10px] text-ink-400">posições ganhas/perdidas no último jogo</div>
        </div>
      )}
    </div>
  );
}
