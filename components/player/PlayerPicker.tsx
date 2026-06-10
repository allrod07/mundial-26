"use client";

import { useMemo, useRef, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { ALL_PLAYERS, getPlayer } from "@/lib/data/squads";
import { TEAM_MAP } from "@/lib/data/teams";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Flag } from "@/components/ui/Flag";
import { POSITION_ABBR } from "@/lib/format";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function PlayerPicker({
  value,
  onChange,
  placeholder = "Selecionar jogador",
  accent = "#00c75f",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = value ? getPlayer(value) : null;

  const results = useMemo(() => {
    const nq = norm(q.trim());
    const base = nq
      ? ALL_PLAYERS.filter(
          (p) => norm(p.name).includes(nq) || norm(TEAM_MAP[p.teamCode]?.name ?? "").includes(nq),
        )
      : [...ALL_PLAYERS].sort((a, b) => b.rating - a.rating);
    return base.slice(0, 30);
  }, [q]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-left transition-colors hover:border-pitch-500/40"
        style={selected ? { borderColor: `${accent}55` } : undefined}
      >
        {selected ? (
          <>
            <PlayerAvatar name={selected.name} teamCode={selected.teamCode} number={selected.number} size="md" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{selected.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-ink-400">
                <Flag code={selected.teamCode} size="xs" />
                {TEAM_MAP[selected.teamCode]?.name} · {POSITION_ABBR[selected.position]}
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="grid h-7 w-7 place-items-center rounded-full text-ink-400 hover:bg-red-500/10 hover:text-red-500"
            >
              <X size={15} />
            </span>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-500/10 text-ink-400">
              <Search size={18} />
            </span>
            <span className="flex-1 font-semibold text-ink-400">{placeholder}</span>
            <ChevronDown size={18} className="text-ink-400" />
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
              <Search size={16} className="text-ink-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar jogador ou seleção..."
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onChange(p.id); setOpen(false); setQ(""); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-pitch-500/10"
                >
                  <PlayerAvatar name={p.name} teamCode={p.teamCode} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="truncate text-xs text-ink-400">
                      {TEAM_MAP[p.teamCode]?.name} · {POSITION_ABBR[p.position]}
                    </div>
                  </div>
                  <span className="stat-num text-sm font-bold text-pitch-600 dark:text-pitch-300">{p.rating}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
