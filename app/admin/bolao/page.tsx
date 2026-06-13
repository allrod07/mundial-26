"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Lock, Trophy, UserPlus, Trash2, Save, Loader2, Check, Minus, Plus, ChevronDown, ArrowLeft,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import {
  brazilFacts, GLOBAL_LOCK_EPOCH, matchLockEpoch, isLocked,
  type PoolData, type PoolParticipant, type PoolPrediction,
} from "@/lib/engine/pool";
import { PageHeader } from "@/components/ui/PageHeader";
import { Flag } from "@/components/ui/Flag";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };

export default function PoolAdminPage() {
  const { tournament } = useTournament();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [data, setData] = useState<PoolData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function verify(pw: string): Promise<{ ok: boolean; msg?: string }> {
    try {
      const res = await fetch("/api/pool/admin", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${pw}` },
        body: JSON.stringify({ op: "ping" }),
      });
      if (res.ok) return { ok: true };
      const d = await res.json().catch(() => ({}));
      return { ok: false, msg: d.error || `HTTP ${res.status}` };
    } catch { return { ok: false, msg: "Erro de conexão." }; }
  }

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("m26:admin") : null;
    if (!saved) { setChecking(false); return; }
    verify(saved).then((r) => {
      if (r.ok) { setPassword(saved); setAuthed(true); }
      else { try { sessionStorage.removeItem("m26:admin"); } catch {} setAuthError(r.msg ?? ""); }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/pool", { cache: "no-store" }).then((r) => r.json()).then((d: PoolData) => setData(d ?? EMPTY)).catch(() => {}).finally(() => setLoading(false));
  }, [authed]);

  const facts = useMemo(() => brazilFacts(tournament), [tournament]);
  const globalLocked = isLocked(GLOBAL_LOCK_EPOCH);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/pool/admin", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${password}` },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
    return d;
  };

  const addParticipant = async (name: string, emoji: string, paid: boolean) => {
    setError("");
    try {
      const d = await post({ op: "participant", name, emoji, paid });
      setData((s) => ({ ...s, participants: [...s.participants, { id: d.id, name, emoji, paid }] }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); throw e; }
  };
  const togglePaid = async (p: PoolParticipant) => {
    setError("");
    try {
      await post({ op: "participant", id: p.id, name: p.name, emoji: p.emoji, paid: !p.paid });
      setData((s) => ({ ...s, participants: s.participants.map((x) => (x.id === p.id ? { ...x, paid: !p.paid } : x)) }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  const removeParticipant = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/pool/admin?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { authorization: `Bearer ${password}` } });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`); }
      setData((s) => {
        const participants = s.participants.filter((p) => p.id !== id);
        const predictions = { ...s.predictions }; delete predictions[id];
        const matchPredictions = { ...s.matchPredictions }; delete matchPredictions[id];
        return { participants, predictions, matchPredictions };
      });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  const savePredictions = async (id: string, pred: PoolPrediction) => {
    setError("");
    try {
      await post({ op: "predictions", ...pred, participantId: id });
      setData((s) => ({ ...s, predictions: { ...s.predictions, [id]: { ...pred, participantId: id } } }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); throw e; }
  };
  const saveMatch = async (id: string, matchId: string, h: number, a: number) => {
    setError("");
    try {
      await post({ op: "matchPrediction", participantId: id, matchId, homeGoals: h, awayGoals: a });
      setData((s) => ({ ...s, matchPredictions: { ...s.matchPredictions, [id]: { ...(s.matchPredictions[id] ?? {}), [matchId]: { homeGoals: h, awayGoals: a } } } }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); throw e; }
  };

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-pitch text-white shadow-glow"><Lock size={26} /></span>
        <h1 className="mt-5 text-2xl font-extrabold">Admin do Bolão</h1>
        <p className="mt-2 text-sm text-ink-400">Digite a senha do painel (a mesma do <code>/admin</code> — valor de <code>ADMIN_PASSWORD</code> ou <code>SYNC_SECRET</code>).</p>
        {checking ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> verificando…</div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const pw = input.trim(); if (!pw) return;
              setAuthError(""); setBusy(true);
              const r = await verify(pw);
              setBusy(false);
              if (!r.ok) { setAuthError(r.msg ?? "Senha incorreta."); return; }
              setPassword(pw); setAuthed(true); try { sessionStorage.setItem("m26:admin", pw); } catch {}
            }}
            className="mt-6 flex w-full flex-col gap-2"
          >
            <div className="flex w-full gap-2">
              <input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Senha" className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm outline-none focus:border-pitch-500" />
              <button disabled={busy} className="inline-flex items-center gap-1.5 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : null} Entrar</button>
            </div>
            {authError && <span className="text-sm font-semibold text-red-500">⚠️ {authError}</span>}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Administração"
        icon={<Trophy size={24} />}
        title="Bolão da Família — admin"
        description="Cadastre os participantes (que pagaram a entrada) e lance os palpites de cada um."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/bolao" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 hover:text-pitch-600"><Trophy size={15} /> Ver bolão</Link>
            <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 hover:text-pitch-600"><ArrowLeft size={15} /> Resultados</Link>
            <button onClick={() => { setAuthed(false); setPassword(""); try { sessionStorage.removeItem("m26:admin"); } catch {} }} className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 hover:text-red-500">Sair</button>
          </div>
        }
      />

      {error && <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">⚠️ {error}</div>}

      <AddForm onAdd={addParticipant} />

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-400"><Loader2 size={16} className="animate-spin" /> carregando…</div>
      ) : (
        <div className="mt-5 space-y-3">
          {data.participants.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-ink-400">Nenhum participante ainda. Adicione acima.</div>}
          {data.participants.map((p) => (
            <ParticipantEditor
              key={p.id}
              participant={p}
              prediction={data.predictions[p.id]}
              matchPreds={data.matchPredictions[p.id] ?? {}}
              brazilMatches={facts.matches}
              globalLocked={globalLocked}
              onTogglePaid={() => togglePaid(p)}
              onRemove={() => removeParticipant(p.id)}
              onSavePred={(pred) => savePredictions(p.id, pred)}
              onSaveMatch={(mid, h, a) => saveMatch(p.id, mid, h, a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddForm({ onAdd }: { onAdd: (name: string, emoji: string, paid: boolean) => Promise<void> }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const [paid, setPaid] = useState(true);
  const [saving, setSaving] = useState(false);
  const EMOJIS = [
    "👤", "🧔", "👩", "👧", "👦", "👴", "👵", "🧑", "🤴", "👸",
    "👫", "👬", "👭", "💑", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "💏",
    "🦁", "🐯", "🐶", "🐱", "⚽", "🔥",
  ];
  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); const n = name.trim(); if (!n) return; setSaving(true); try { await onAdd(n, emoji, paid); setName(""); } catch { /* erro no banner */ } finally { setSaving(false); } }}
      className="surface mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-3"
    >
      <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2 text-lg" aria-label="Emoji">
        {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do participante" className="min-w-[10rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-pitch-500" />
      <button type="button" onClick={() => setPaid((v) => !v)} title="Marcar se o participante pagou a entrada" className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${paid ? "bg-pitch-500/15 text-pitch-600 dark:text-pitch-300" : "bg-red-500/15 text-red-500"}`}>
        {paid ? "Pago ✓" : "Não pago"}
      </button>
      <button disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg gradient-pitch px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
        {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Adicionar
      </button>
    </form>
  );
}

function StepperMini({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={disabled} onClick={() => onChange(Math.max(0, value - 1))} className="grid h-6 w-6 place-items-center rounded border border-[var(--border)] text-ink-400 hover:text-red-500 disabled:opacity-40"><Minus size={11} /></button>
      <span className="w-5 text-center stat-num font-extrabold">{value}</span>
      <button type="button" disabled={disabled} onClick={() => onChange(Math.min(20, value + 1))} className="grid h-6 w-6 place-items-center rounded border border-[var(--border)] text-ink-400 hover:text-pitch-500 disabled:opacity-40"><Plus size={11} /></button>
    </div>
  );
}

function ParticipantEditor({
  participant, prediction, matchPreds, brazilMatches, globalLocked,
  onTogglePaid, onRemove, onSavePred, onSaveMatch,
}: {
  participant: PoolParticipant;
  prediction?: PoolPrediction;
  matchPreds: Record<string, { homeGoals: number; awayGoals: number }>;
  brazilMatches: import("@/lib/types").Match[];
  globalLocked: boolean;
  onTogglePaid: () => void;
  onRemove: () => void;
  onSavePred: (p: PoolPrediction) => Promise<void>;
  onSaveMatch: (matchId: string, h: number, a: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  // Palpite único: null = ainda não escolheu; true = Brasil campeão; false = não.
  const [champ, setChamp] = useState<boolean | null>(prediction?.brazilChampion ?? null);
  const [savingPred, setSavingPred] = useState<"idle" | "saving" | "ok">("idle");

  const saveChamp = async (value: boolean) => {
    setChamp(value);
    setSavingPred("saving");
    try {
      await onSavePred({ participantId: participant.id, brazilChampion: value });
      setSavingPred("ok");
      setTimeout(() => setSavingPred("idle"), 1500);
    } catch { setSavingPred("idle"); }
  };

  return (
    <div className="surface rounded-2xl">
      <div className="flex items-center gap-2 p-3">
        <span className="text-xl">{participant.emoji ?? "👤"}</span>
        <span className="flex-1 truncate font-bold">{participant.name}</span>
        <button onClick={onTogglePaid} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${participant.paid ? "bg-pitch-500/15 text-pitch-600 dark:text-pitch-300" : "bg-red-500/15 text-red-500"}`}>
          {participant.paid ? "Pago ✓" : "Não pago"}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-ink-400 hover:text-pitch-600"><ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
        <button onClick={onRemove} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-ink-400 hover:text-red-500"><Trash2 size={14} /></button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-[var(--border)] p-3">
          {/* palpite único da campanha */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-400">
              O Brasil vai ser campeão? 🇧🇷🏆
              {globalLocked && <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] normal-case text-amber-600 dark:text-amber-300"><Lock size={10} /> encerrado (1h antes do 1º jogo)</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={globalLocked}
                onClick={() => saveChamp(true)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${champ === true ? "border-pitch-500 bg-pitch-500/15 text-pitch-600 dark:text-pitch-300" : "border-[var(--border)] text-ink-500 hover:border-pitch-500/40"}`}
              >
                🏆 SIM, campeão <span className="text-[11px] font-normal text-ink-400">(+15 se acertar)</span>
              </button>
              <button
                type="button"
                disabled={globalLocked}
                onClick={() => saveChamp(false)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${champ === false ? "border-pitch-500 bg-pitch-500/15 text-pitch-600 dark:text-pitch-300" : "border-[var(--border)] text-ink-500 hover:border-pitch-500/40"}`}
              >
                🙅 NÃO será <span className="text-[11px] font-normal text-ink-400">(+5 se acertar)</span>
              </button>
            </div>
            <div className="mt-1.5 flex h-4 items-center gap-1.5 text-[11px]">
              {savingPred === "saving" && <span className="inline-flex items-center gap-1 text-ink-400"><Loader2 size={11} className="animate-spin" /> salvando…</span>}
              {savingPred === "ok" && <span className="inline-flex items-center gap-1 text-pitch-600 dark:text-pitch-300"><Check size={11} /> salvo</span>}
              {savingPred === "idle" && champ == null && <span className="text-ink-400">Toque em SIM ou NÃO para registrar o palpite.</span>}
            </div>
          </div>

          {/* jogos do Brasil */}
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Palpites dos jogos do Brasil</div>
            <div className="space-y-1.5">
              {brazilMatches.length === 0 && <div className="text-xs text-ink-400">Os jogos do Brasil aparecem aqui conforme são definidos.</div>}
              {brazilMatches.map((m) => (
                <MatchGuess key={m.id} match={m} current={matchPreds[m.id]} onSave={(h, a) => onSaveMatch(m.id, h, a)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchGuess({ match, current, onSave }: { match: import("@/lib/types").Match; current?: { homeGoals: number; awayGoals: number }; onSave: (h: number, a: number) => Promise<void> }) {
  const [h, setH] = useState(current?.homeGoals ?? 0);
  const [a, setA] = useState(current?.awayGoals ?? 0);
  // `dirty` evita gravar 0×0 acidental: o botão Salvar só ativa após o admin
  // mexer nos steppers (ou se já existe um palpite salvo e ele decide reeditar).
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "ok">("idle");
  const locked = isLocked(matchLockEpoch(match.id));
  const hasSaved = !!current;
  useEffect(() => {
    setH(current?.homeGoals ?? 0);
    setA(current?.awayGoals ?? 0);
    setDirty(false);
  }, [current?.homeGoals, current?.awayGoals]);
  const bump = (setter: (v: number) => void, v: number) => { setter(v); setDirty(true); };
  const canSave = dirty && !locked;
  const save = async () => {
    if (!canSave) return;
    setState("saving");
    try { await onSave(h, a); setState("ok"); setDirty(false); setTimeout(() => setState("idle"), 1200); } catch { setState("idle"); }
  };
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-2 py-1.5 text-sm ${locked ? "opacity-70" : ""}`}>
      <Flag code={match.homeCode} size="xs" />
      <span className="w-9 font-semibold">{match.homeCode}</span>
      <span className={hasSaved || dirty ? "" : "opacity-40"}>
        <StepperMini value={h} onChange={(v) => bump(setH, v)} disabled={locked} />
      </span>
      <span className="text-ink-300">:</span>
      <span className={hasSaved || dirty ? "" : "opacity-40"}>
        <StepperMini value={a} onChange={(v) => bump(setA, v)} disabled={locked} />
      </span>
      <span className="w-9 text-right font-semibold">{match.awayCode}</span>
      <Flag code={match.awayCode} size="xs" />
      {locked ? (
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-300" title="Palpite encerrado (1h antes do jogo)"><Lock size={12} /> Encerrado</span>
      ) : hasSaved && !dirty ? (
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-pitch-600 dark:text-pitch-300" title="Palpite salvo">
          <Check size={12} /> salvo
        </span>
      ) : (
        <button
          onClick={save}
          disabled={state === "saving" || !canSave}
          title={!canSave ? "Toque nos botões + ou − para palpitar" : undefined}
          className="ml-auto inline-flex items-center gap-1 rounded-lg bg-pitch-500/15 px-2 py-1 text-xs font-bold text-pitch-600 disabled:opacity-40 dark:text-pitch-300"
        >
          {state === "saving" ? <Loader2 size={12} className="animate-spin" /> : state === "ok" ? <Check size={12} /> : <Save size={12} />} {state === "ok" ? "" : "Salvar"}
        </button>
      )}
    </div>
  );
}

