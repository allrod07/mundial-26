"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Lock, Trophy, UserPlus, Trash2, Save, Loader2, Check, Minus, Plus, ChevronDown, ArrowLeft,
} from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { TEAMS } from "@/lib/data/teams";
import {
  brazilFacts, GROUP_FINISH_OPTIONS, STAGE_OPTIONS,
  type PoolData, type PoolParticipant, type PoolPrediction, type GroupFinish, type BrazilStage,
} from "@/lib/engine/pool";
import { PageHeader } from "@/components/ui/PageHeader";
import { Flag } from "@/components/ui/Flag";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };
const SORTED_TEAMS = [...TEAMS].sort((a, b) => a.name.localeCompare(b.name));

export default function PoolAdminPage() {
  const { tournament } = useTournament();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [data, setData] = useState<PoolData>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("m26:admin") : null;
    if (saved) { setPassword(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/pool").then((r) => r.json()).then((d: PoolData) => setData(d ?? EMPTY)).catch(() => {}).finally(() => setLoading(false));
  }, [authed]);

  const facts = useMemo(() => brazilFacts(tournament), [tournament]);

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

  const addParticipant = async (name: string, emoji: string) => {
    const d = await post({ op: "participant", name, emoji, paid: true });
    setData((s) => ({ ...s, participants: [...s.participants, { id: d.id, name, emoji, paid: true }] }));
  };
  const togglePaid = async (p: PoolParticipant) => {
    await post({ op: "participant", id: p.id, name: p.name, emoji: p.emoji, paid: !p.paid });
    setData((s) => ({ ...s, participants: s.participants.map((x) => (x.id === p.id ? { ...x, paid: !p.paid } : x)) }));
  };
  const removeParticipant = async (id: string) => {
    const res = await fetch(`/api/pool/admin?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { authorization: `Bearer ${password}` } });
    if (!res.ok) return;
    setData((s) => {
      const participants = s.participants.filter((p) => p.id !== id);
      const predictions = { ...s.predictions }; delete predictions[id];
      const matchPredictions = { ...s.matchPredictions }; delete matchPredictions[id];
      return { participants, predictions, matchPredictions };
    });
  };
  const savePredictions = async (id: string, pred: PoolPrediction) => {
    await post({ op: "predictions", ...pred, participantId: id });
    setData((s) => ({ ...s, predictions: { ...s.predictions, [id]: { ...pred, participantId: id } } }));
  };
  const saveMatch = async (id: string, matchId: string, h: number, a: number) => {
    await post({ op: "matchPrediction", participantId: id, matchId, homeGoals: h, awayGoals: a });
    setData((s) => ({ ...s, matchPredictions: { ...s.matchPredictions, [id]: { ...(s.matchPredictions[id] ?? {}), [matchId]: { homeGoals: h, awayGoals: a } } } }));
  };

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-pitch text-white shadow-glow"><Lock size={26} /></span>
        <h1 className="mt-5 text-2xl font-extrabold">Admin do Bolão</h1>
        <p className="mt-2 text-sm text-ink-400">Digite a senha do painel (<code>ADMIN_PASSWORD</code> ou <code>SYNC_SECRET</code>).</p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; setPassword(input.trim()); setAuthed(true); try { sessionStorage.setItem("m26:admin", input.trim()); } catch {} }}
          className="mt-6 flex w-full gap-2"
        >
          <input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Senha" className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm outline-none focus:border-pitch-500" />
          <button className="rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white">Entrar</button>
        </form>
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
          <div className="flex gap-2">
            <Link href="/bolao" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 hover:text-pitch-600"><Trophy size={15} /> Ver bolão</Link>
            <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 hover:text-pitch-600"><ArrowLeft size={15} /> Resultados</Link>
          </div>
        }
      />

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

function AddForm({ onAdd }: { onAdd: (name: string, emoji: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const [saving, setSaving] = useState(false);
  const EMOJIS = ["👤", "🧔", "👩", "👧", "👦", "👴", "👵", "🧑", "🤴", "👸", "🦁", "🐯", "🐶", "🐱", "⚽", "🔥"];
  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); if (!name.trim()) return; setSaving(true); try { await onAdd(name.trim(), emoji); setName(""); } finally { setSaving(false); } }}
      className="surface mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-3"
    >
      <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2 text-lg">
        {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do participante" className="min-w-[12rem] flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-pitch-500" />
      <button disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg gradient-pitch px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
        {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Adicionar
      </button>
    </form>
  );
}

function StepperMini({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="grid h-6 w-6 place-items-center rounded border border-[var(--border)] text-ink-400 hover:text-red-500"><Minus size={11} /></button>
      <span className="w-5 text-center stat-num font-extrabold">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className="grid h-6 w-6 place-items-center rounded border border-[var(--border)] text-ink-400 hover:text-pitch-500"><Plus size={11} /></button>
    </div>
  );
}

function ParticipantEditor({
  participant, prediction, matchPreds, brazilMatches,
  onTogglePaid, onRemove, onSavePred, onSaveMatch,
}: {
  participant: PoolParticipant;
  prediction?: PoolPrediction;
  matchPreds: Record<string, { homeGoals: number; awayGoals: number }>;
  brazilMatches: import("@/lib/types").Match[];
  onTogglePaid: () => void;
  onRemove: () => void;
  onSavePred: (p: PoolPrediction) => Promise<void>;
  onSaveMatch: (matchId: string, h: number, a: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [gf, setGf] = useState<GroupFinish | "">((prediction?.brazilGroupFinish as GroupFinish) ?? "");
  const [gp, setGp] = useState<number | "">(prediction?.brazilGroupPoints ?? "");
  const [stage, setStage] = useState<BrazilStage | "">((prediction?.brazilStage as BrazilStage) ?? "");
  const [champion, setChampion] = useState(prediction?.champion ?? "");
  const [vice, setVice] = useState(prediction?.vice ?? "");
  const [savingPred, setSavingPred] = useState<"idle" | "saving" | "ok">("idle");

  const savePred = async () => {
    setSavingPred("saving");
    try {
      await onSavePred({
        participantId: participant.id,
        brazilGroupFinish: gf || null,
        brazilGroupPoints: gp === "" ? null : Number(gp),
        brazilStage: stage || null,
        champion: champion || null,
        vice: vice || null,
      });
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
          {/* palpites pré-Copa */}
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Palpites da campanha do Brasil 🇧🇷</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Field label="Colocação no grupo">
                <select value={gf} onChange={(e) => setGf(e.target.value as GroupFinish)} className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm">
                  <option value="">—</option>
                  {GROUP_FINISH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Pontos na fase de grupos (0–9)">
                <input type="number" min={0} max={9} value={gp} onChange={(e) => setGp(e.target.value === "" ? "" : Number(e.target.value))} className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm" />
              </Field>
              <Field label="Até onde o Brasil vai">
                <select value={stage} onChange={(e) => setStage(e.target.value as BrazilStage)} className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm">
                  <option value="">—</option>
                  {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Campeão da Copa"><TeamSelect value={champion} onChange={setChampion} /></Field>
                <Field label="Vice-campeão"><TeamSelect value={vice} onChange={setVice} /></Field>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button onClick={savePred} disabled={savingPred === "saving"} className="inline-flex items-center gap-1.5 rounded-lg gradient-pitch px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
                {savingPred === "saving" ? <Loader2 size={13} className="animate-spin" /> : savingPred === "ok" ? <Check size={13} /> : <Save size={13} />} Salvar palpites
              </button>
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
  const [state, setState] = useState<"idle" | "saving" | "ok">("idle");
  useEffect(() => { setH(current?.homeGoals ?? 0); setA(current?.awayGoals ?? 0); }, [current?.homeGoals, current?.awayGoals]);
  const save = async () => { setState("saving"); try { await onSave(h, a); setState("ok"); setTimeout(() => setState("idle"), 1200); } catch { setState("idle"); } };
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-2 py-1.5 text-sm">
      <Flag code={match.homeCode} size="xs" />
      <span className="w-9 font-semibold">{match.homeCode}</span>
      <StepperMini value={h} onChange={setH} />
      <span className="text-ink-300">:</span>
      <StepperMini value={a} onChange={setA} />
      <span className="w-9 text-right font-semibold">{match.awayCode}</span>
      <Flag code={match.awayCode} size="xs" />
      <button onClick={save} disabled={state === "saving"} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-pitch-500/15 px-2 py-1 text-xs font-bold text-pitch-600 disabled:opacity-60 dark:text-pitch-300">
        {state === "saving" ? <Loader2 size={12} className="animate-spin" /> : state === "ok" ? <Check size={12} /> : <Save size={12} />} {current ? "" : "Salvar"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-ink-400">{label}</span>
      {children}
    </label>
  );
}

function TeamSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm">
      <option value="">—</option>
      {SORTED_TEAMS.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
    </select>
  );
}
