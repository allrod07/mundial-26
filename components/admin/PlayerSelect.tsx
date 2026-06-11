"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { Player } from "@/lib/types";
import { getSquad } from "@/lib/data/squads";
import { POSITION_ABBR } from "@/lib/format";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Seletor compacto de jogador, filtrado pelo elenco de uma seleção. Devolve o
 * Player escolhido (ou null) para que quem chama guarde id + nome.
 */
export function PlayerSelect({
  teamCode,
  value,
  onChange,
  placeholder = "Jogador",
}: {
  teamCode?: string;
  value: string | null;
  onChange: (player: Player | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const squad = useMemo(
    () => (teamCode ? [...getSquad(teamCode)].sort((a, b) => a.number - b.number) : []),
    [teamCode],
  );
  const selected = value ? squad.find((p) => p.id === value) ?? null : null;

  const results = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return squad;
    return squad.filter((p) => norm(p.name).includes(nq) || String(p.number) === nq);
  }, [q, squad]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!teamCode}
        className="flex w-36 items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-left text-xs disabled:opacity-50"
      >
        {selected ? (
          <>
            <span className="stat-num w-5 shrink-0 text-center font-bold text-ink-400">{selected.number}</span>
            <span className="flex-1 truncate font-semibold">{selected.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-ink-400 hover:text-red-500"
            >
              <X size={12} />
            </span>
          </>
        ) : (
          <>
            <Search size={12} className="shrink-0 text-ink-400" />
            <span className="flex-1 truncate text-ink-400">{placeholder}</span>
            <ChevronDown size={12} className="shrink-0 text-ink-400" />
          </>
        )}
      </button>

      {open && teamCode && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-2">
              <Search size={13} className="text-ink-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar no elenco…"
                className="flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {results.length === 0 && (
                <div className="px-2 py-3 text-center text-xs text-ink-400">Nenhum jogador.</div>
              )}
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p); setOpen(false); setQ(""); }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-pitch-500/10"
                >
                  <span className="stat-num w-5 text-center font-bold text-ink-400">{p.number}</span>
                  <span className="flex-1 truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 text-[10px] text-ink-400">{POSITION_ABBR[p.position]}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
