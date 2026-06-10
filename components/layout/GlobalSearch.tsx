"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAMS } from "@/lib/data/teams";
import { ALL_PLAYERS } from "@/lib/data/squads";
import { Flag } from "@/components/ui/Flag";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

interface Item {
  type: "team" | "player";
  id: string;
  title: string;
  sub: string;
  href: string;
  teamCode: string;
  number?: number;
}

function buildIndex(): Item[] {
  const teams: Item[] = TEAMS.map((t) => ({
    type: "team",
    id: t.code,
    title: t.name,
    sub: `${t.confederation} · Grupo ${t.group}`,
    href: `/selecoes/${t.code}`,
    teamCode: t.code,
  }));
  const players: Item[] = ALL_PLAYERS.map((p) => ({
    type: "player",
    id: p.id,
    title: p.name,
    sub: `${p.position} · ${p.club}`,
    href: `/jogadores/${p.id}`,
    teamCode: p.teamCode,
    number: p.number,
  }));
  return [...teams, ...players];
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return index.filter((i) => i.type === "team").slice(0, 8);
    return index
      .map((i) => ({ i, score: norm(i.title).indexOf(nq) }))
      .filter((x) => x.score > -1 || norm(x.i.sub).includes(nq))
      .sort((a, b) => {
        if (a.i.type !== b.i.type) return a.i.type === "team" ? -1 : 1;
        return a.score - b.score;
      })
      .slice(0, 12)
      .map((x) => x.i);
  }, [q, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else setQ("");
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-ink-400 transition-colors hover:border-pitch-500/40 sm:w-56"
      >
        <Search size={16} />
        <span className="hidden flex-1 text-left sm:inline">Buscar...</span>
        <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-semibold text-ink-400 sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
                <Search size={18} className="text-ink-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && results[0]) go(results[0].href);
                  }}
                  placeholder="Buscar seleções, jogadores..."
                  className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-ink-400"
                />
                <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[52vh] overflow-y-auto p-2">
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-ink-400">
                    Nenhum resultado para “{q}”.
                  </p>
                )}
                {results.map((r) => (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-pitch-500/10"
                  >
                    {r.type === "team" ? (
                      <Flag code={r.teamCode} size="sm" />
                    ) : (
                      <PlayerAvatar name={r.title} teamCode={r.teamCode} size="sm" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{r.title}</div>
                      <div className="truncate text-xs text-ink-400">{r.sub}</div>
                    </div>
                    <span className="chip bg-ink-500/10 text-ink-500">
                      {r.type === "team" ? "Seleção" : "Jogador"}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2.5 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={12} /> para abrir
                </span>
                <span>Busca global · Mundial '26</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
