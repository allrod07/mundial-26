"use client";

import { useEffect, useState } from "react";
import type { Match, MatchEvent, Player } from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";
import { PlayerSelect } from "@/components/admin/PlayerSelect";
import { Minus, Plus, Save, Trash2, Check, Loader2, Goal, Square } from "lucide-react";

const EVENT_TYPES = [
  { value: "gol", label: "⚽ Gol" },
  { value: "penalti", label: "🎯 Pênalti" },
  { value: "gol-contra", label: "🙃 Gol contra" },
  { value: "amarelo", label: "🟨 Amarelo" },
  { value: "vermelho", label: "🟥 Vermelho" },
];

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] text-ink-400 hover:text-red-500" aria-label="-">
        <Minus size={13} />
      </button>
      <span className="w-7 text-center stat-num text-xl font-extrabold">{value}</span>
      <button onClick={() => onChange(Math.min(30, value + 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] text-ink-400 hover:text-pitch-500" aria-label="+">
        <Plus size={13} />
      </button>
    </div>
  );
}

export function AdminMatchEditor({
  match,
  result,
  events,
  password,
  onSaved,
  onCleared,
}: {
  match: Match;
  result?: { homeGoals: number; awayGoals: number; homePens?: number; awayPens?: number };
  events?: MatchEvent[];
  password: string;
  onSaved: (id: string, result: { homeGoals: number; awayGoals: number; homePens?: number; awayPens?: number }, events: MatchEvent[]) => void;
  onCleared: (id: string) => void;
}) {
  const home = match.homeCode ? TEAM_MAP[match.homeCode] : undefined;
  const away = match.awayCode ? TEAM_MAP[match.awayCode] : undefined;
  const knockout = match.stage !== "Grupos";

  const [hg, setHg] = useState(result?.homeGoals ?? 0);
  const [ag, setAg] = useState(result?.awayGoals ?? 0);
  const [hp, setHp] = useState(result?.homePens ?? 4);
  const [ap, setAp] = useState(result?.awayPens ?? 2);
  const [evs, setEvs] = useState<MatchEvent[]>(events ?? []);
  const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  // novo evento
  const [evSide, setEvSide] = useState<"home" | "away">("home");
  const [evType, setEvType] = useState("gol");
  const [evPlayer, setEvPlayer] = useState<Player | null>(null);
  const [evAssist, setEvAssist] = useState<Player | null>(null);
  const [evMin, setEvMin] = useState("");
  const [evMsg, setEvMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Quem marcou: em gol-contra é um jogador do time adversário; nos demais
  // casos, do próprio lado. A assistência é sempre do lado escolhido.
  const evScorerTeam =
    evType === "gol-contra"
      ? evSide === "home" ? match.awayCode : match.homeCode
      : evSide === "home" ? match.homeCode : match.awayCode;
  const evAssistTeam = evSide === "home" ? match.homeCode : match.awayCode;

  // trocar de lado / alternar gol-contra muda a seleção: limpa o jogador.
  useEffect(() => {
    setEvPlayer(null);
    setEvAssist(null);
  }, [evScorerTeam]);

  // Os dados salvos (result/events) chegam do /api/results de forma assíncrona,
  // depois da montagem. Sem sincronizar, os campos ficariam presos no estado
  // inicial (0 a 0) mesmo com o jogo já salvo no banco. Dependemos dos valores
  // primitivos (não do objeto) para não sobrescrever uma edição em andamento.
  useEffect(() => {
    setHg(result?.homeGoals ?? 0);
    setAg(result?.awayGoals ?? 0);
    setHp(result?.homePens ?? 4);
    setAp(result?.awayPens ?? 2);
  }, [result?.homeGoals, result?.awayGoals, result?.homePens, result?.awayPens]);

  useEffect(() => {
    setEvs(events ?? []);
  }, [events]);

  if (!home || !away) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-3 text-sm text-ink-400">
        <span className="flex-1 truncate text-right">{match.homeLabel}</span>
        <span className="text-xs">a definir</span>
        <span className="flex-1 truncate">{match.awayLabel}</span>
      </div>
    );
  }

  const isDraw = knockout && hg === ag;

  const addEvent = () => {
    if (!evPlayer) { setEvMsg("Selecione o jogador."); return; }
    if (evMin.trim() === "") { setEvMsg("Informe o minuto."); return; }
    const minute = parseInt(evMin, 10);
    if (isNaN(minute) || minute < 0 || minute > 130) { setEvMsg("Minuto inválido (0–130)."); return; }
    if (!evScorerTeam) { setEvMsg("Time inválido."); return; }
    setEvMsg("");
    setEvs((l) =>
      [...l, {
        minute,
        type: evType as MatchEvent["type"],
        teamCode: evScorerTeam,
        playerId: evPlayer.id,
        playerName: evPlayer.name,
        assistPlayerId: evAssist?.id,
        assistName: evAssist?.name,
      }].sort((a, b) => a.minute - b.minute),
    );
    setEvPlayer(null);
    setEvAssist(null);
    setEvMin("");
  };

  const save = async () => {
    setState("saving");
    setMsg("");
    const body = {
      id: match.id,
      stage: match.stage,
      group: match.group ?? null,
      round: match.round ?? null,
      homeCode: match.homeCode,
      awayCode: match.awayCode,
      homeGoals: hg,
      awayGoals: ag,
      homePens: isDraw ? hp : null,
      awayPens: isDraw ? ap : null,
      events: evs.map((e) => ({ minute: e.minute, type: e.type, teamCode: e.teamCode, playerId: e.playerId || null, playerName: e.playerName ?? null, assistPlayerId: e.assistPlayerId || null, assistName: e.assistName ?? null })),
    };
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${password}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setState("ok");
      setMsg("Salvo!");
      onSaved(match.id, { homeGoals: hg, awayGoals: ag, homePens: isDraw ? hp : undefined, awayPens: isDraw ? ap : undefined }, evs);
      setTimeout(() => setState("idle"), 2000);
    } catch (e) {
      setState("err");
      setMsg(String(e instanceof Error ? e.message : e));
    }
  };

  const clear = async () => {
    setState("saving");
    try {
      const res = await fetch(`/api/matches?id=${encodeURIComponent(match.id)}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHg(0); setAg(0); setEvs([]);
      setState("idle"); setMsg("");
      onCleared(match.id);
    } catch (e) {
      setState("err");
      setMsg(String(e instanceof Error ? e.message : e));
    }
  };

  return (
    <div className="surface rounded-xl p-3">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
          <span className="truncate text-sm font-semibold">{home.name}</span>
          <Flag code={match.homeCode} size="sm" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Stepper value={hg} onChange={setHg} />
          <span className="text-ink-300">:</span>
          <Stepper value={ag} onChange={setAg} />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag code={match.awayCode} size="sm" />
          <span className="truncate text-sm font-semibold">{away.name}</span>
        </div>
      </div>

      {isDraw && (
        <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-ink-400">
          <span>Pênaltis</span>
          <Stepper value={hp} onChange={setHp} />
          <span className="text-ink-300">:</span>
          <Stepper value={ap} onChange={setAp} />
        </div>
      )}

      {/* eventos */}
      <div className="mt-2 rounded-lg bg-ink-500/5 p-2">
        {evs.length > 0 && (
          <ul className="mb-2 space-y-1">
            {evs.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="w-8 stat-num font-bold text-ink-400">{e.minute}'</span>
                {e.type === "amarelo" ? <Square size={11} className="text-yellow-500" fill="currentColor" /> : e.type === "vermelho" ? <Square size={11} className="text-red-500" fill="currentColor" /> : <Goal size={11} className="text-pitch-500" />}
                <Flag code={e.teamCode} size="xs" />
                <span className="flex-1 truncate font-medium">{e.playerName}{e.assistName ? ` (assist. ${e.assistName})` : ""}</span>
                <button onClick={() => setEvs((l) => l.filter((_, j) => j !== i))} className="text-ink-400 hover:text-red-500"><Trash2 size={12} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <select aria-label="Time do lance" value={evSide} onChange={(e) => setEvSide(e.target.value as "home" | "away")} className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-1 text-xs">
            <option value="home">{home.code}</option>
            <option value="away">{away.code}</option>
          </select>
          <select aria-label="Tipo de lance" value={evType} onChange={(e) => setEvType(e.target.value)} className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-1 text-xs">
            {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <PlayerSelect
            teamCode={evScorerTeam}
            value={evPlayer?.id ?? null}
            onChange={(p) => { setEvPlayer(p); if (evMsg) setEvMsg(""); }}
            placeholder={evType === "amarelo" || evType === "vermelho" ? "Jogador" : "Autor do gol"}
          />
          {(evType === "gol" || evType === "penalti") && (
            <PlayerSelect
              teamCode={evAssistTeam}
              value={evAssist?.id ?? null}
              onChange={setEvAssist}
              placeholder="Assistência (opc.)"
            />
          )}
          <input aria-label="Minuto do lance" value={evMin} onChange={(e) => { setEvMin(e.target.value); if (evMsg) setEvMsg(""); }} placeholder="min" inputMode="numeric" maxLength={3} className="w-12 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-xs" />
          <button onClick={addEvent} className="rounded-lg bg-pitch-500/15 px-2 py-1 text-xs font-bold text-pitch-600 dark:text-pitch-300">+ add</button>
          <span aria-live="polite" className="text-[11px] font-semibold text-red-500">{evMsg}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <span aria-live="polite" className={`text-xs ${state === "err" ? "text-red-500" : "text-pitch-600 dark:text-pitch-300"}`}>{msg}</span>
        {confirmClear ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-red-500">Apagar o placar?</span>
            <button onClick={() => { setConfirmClear(false); clear(); }} className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/25">
              <Check size={13} /> Sim
            </button>
            <button onClick={() => setConfirmClear(false)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold text-ink-400">
              Não
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold text-ink-400 hover:text-red-500">
            <Trash2 size={13} /> Limpar
          </button>
        )}
        <button onClick={save} disabled={state === "saving"} className="inline-flex items-center gap-1.5 rounded-lg gradient-pitch px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
          {state === "saving" ? <Loader2 size={13} className="animate-spin" /> : state === "ok" ? <Check size={13} /> : <Save size={13} />}
          Salvar
        </button>
      </div>
    </div>
  );
}
