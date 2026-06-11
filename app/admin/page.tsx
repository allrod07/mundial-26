"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, ListOrdered, GitMerge, Info, Loader2, Trophy } from "lucide-react";
import type { MatchEvent, MatchResultMap } from "@/lib/types";
import { buildTournament } from "@/lib/engine/tournament";
import { GROUPS, TEAM_MAP } from "@/lib/data/teams";
import { winnerOf } from "@/lib/engine/simulate";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Flag } from "@/components/ui/Flag";
import { AdminMatchEditor } from "@/components/admin/AdminMatchEditor";

const KO_ROUNDS = [
  { label: "16-avos de final", ids: Array.from({ length: 16 }, (_, i) => `R32-${i + 1}`) },
  { label: "Oitavas de final", ids: Array.from({ length: 8 }, (_, i) => `R16-${i + 1}`) },
  { label: "Quartas de final", ids: Array.from({ length: 4 }, (_, i) => `QF-${i + 1}`) },
  { label: "Semifinais", ids: ["SF-1", "SF-2"] },
  { label: "Disputa de 3º e Final", ids: ["TP", "FINAL"] },
];

interface Live {
  results: MatchResultMap;
  events: Record<string, MatchEvent[]>;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState<Live>({ results: {}, events: {} });
  const [tab, setTab] = useState("grupos");
  const [group, setGroup] = useState("A");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("m26:admin") : null;
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/results")
      .then((r) => r.json())
      .then((d) => setLive({ results: d.results ?? {}, events: d.events ?? {} }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authed]);

  const tournament = useMemo(
    () => buildTournament(live.results, { fabricate: false, events: live.events, fabricateEvents: false }),
    [live.results, live.events],
  );

  const onSaved = (id: string, result: { homeGoals: number; awayGoals: number; homePens?: number; awayPens?: number }, events: MatchEvent[]) =>
    setLive((l) => ({ results: { ...l.results, [id]: result }, events: { ...l.events, [id]: events } }));

  const onCleared = (id: string) =>
    setLive((l) => {
      const results = { ...l.results };
      const events = { ...l.events };
      delete results[id];
      delete events[id];
      return { results, events };
    });

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-pitch text-white shadow-glow">
          <Lock size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">Painel de Administração</h1>
        <p className="mt-2 text-sm text-ink-400">Digite a senha (o valor de <code>ADMIN_PASSWORD</code> ou <code>SYNC_SECRET</code>) para preencher os resultados.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            setPassword(input.trim());
            setAuthed(true);
            try { sessionStorage.setItem("m26:admin", input.trim()); } catch {}
          }}
          className="mt-6 flex w-full gap-2"
        >
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Senha do painel"
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm outline-none focus:border-pitch-500"
          />
          <button className="rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white">Entrar</button>
        </form>
      </div>
    );
  }

  const champion = tournament.matchMap["FINAL"]?.status === "encerrado" ? winnerOf(tournament.matchMap["FINAL"]) : null;
  const playedGroup = tournament.matches.filter((m) => m.stage === "Grupos" && m.status === "encerrado").length;
  const groupMatches = tournament.matches.filter((m) => m.group === group).sort((a, b) => (a.round! - b.round!) || a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Administração"
        icon={<ShieldCheck size={24} />}
        title="Preenchimento dos resultados"
        description="Os resultados e eventos que você salvar aqui vão para o banco (Supabase) e aparecem para todos os visitantes — o site entra em modo AO VIVO."
        action={
          <div className="flex gap-2">
            <Link href="/admin/bolao" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-ink-500 transition-colors hover:border-pitch-500/40 hover:text-pitch-600 dark:hover:text-pitch-300">
              <Trophy size={15} /> Bolão
            </Link>
            <button
              onClick={() => { setAuthed(false); setPassword(""); try { sessionStorage.removeItem("m26:admin"); } catch {} }}
              className="rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-ink-500 hover:text-red-500"
            >
              Sair
            </button>
          </div>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="surface rounded-2xl px-4 py-3"><div className="text-[11px] text-ink-400">Jogos de grupos salvos</div><div className="mt-0.5 text-sm font-extrabold">{playedGroup}/72</div></div>
        <div className="surface rounded-2xl px-4 py-3"><div className="text-[11px] text-ink-400">Fase de grupos</div><div className="mt-0.5 text-sm font-extrabold">{tournament.groupComplete ? "Completa" : "Em andamento"}</div></div>
        <div className="surface rounded-2xl px-4 py-3"><div className="text-[11px] text-ink-400">Campeão</div><div className="mt-0.5 flex items-center gap-1.5 text-sm font-extrabold">{champion ? <><Flag code={champion} size="xs" /> {TEAM_MAP[champion].name}</> : "—"}</div></div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-pitch-500/5 px-4 py-2.5 text-xs text-ink-500">
        <Info size={14} className="shrink-0 text-pitch-500" />
        Dica: preencha os 6 jogos de cada grupo; ao completar a fase de grupos, o chaveamento define os times automaticamente e você preenche o mata-mata.
      </div>

      <div className="mt-5 flex justify-center">
        <Tabs items={[{ id: "grupos", label: "Fase de grupos" }, { id: "mata", label: "Mata-mata" }]} value={tab} onChange={setTab} idPrefix="admin-tab" />
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-400">
          <Loader2 size={16} className="animate-spin" /> carregando dados salvos…
        </div>
      )}

      {tab === "grupos" ? (
        <div className="mt-5">
          <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
            {GROUPS.map((g) => (
              <button key={g} onClick={() => setGroup(g)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition-colors ${group === g ? "gradient-pitch text-white" : "surface text-ink-500 hover:text-pitch-600"}`}>{g}</button>
            ))}
          </div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold"><ListOrdered size={16} className="text-pitch-500" /> Grupo {group}</div>
          <div className="space-y-3">
            {groupMatches.map((m) => (
              <AdminMatchEditor key={m.id} match={m} result={live.results[m.id]} events={live.events[m.id]} password={password} onSaved={onSaved} onCleared={onCleared} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {!tournament.groupComplete && (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-ink-500">
              <Info size={16} className="shrink-0 text-pitch-500" /> Complete a fase de grupos para liberar os confrontos do mata-mata.
            </div>
          )}
          {tournament.groupComplete && KO_ROUNDS.map((round) => {
            const matches = round.ids.map((id) => tournament.matchMap[id]).filter(Boolean);
            if (!matches.some((m) => m.homeCode && m.awayCode)) return null;
            return (
              <div key={round.label}>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold"><GitMerge size={16} className="text-pitch-500" /> {round.label}</div>
                <div className="space-y-3">
                  {matches.map((m) => (
                    <AdminMatchEditor key={m.id} match={m} result={live.results[m.id]} events={live.events[m.id]} password={password} onSaved={onSaved} onCleared={onCleared} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
