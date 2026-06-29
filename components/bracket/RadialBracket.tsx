"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Match } from "@/lib/types";
import type { ResolvedTournament } from "@/lib/engine/tournament";
import { TEAM_MAP } from "@/lib/data/teams";
import { winnerOf } from "@/lib/engine/simulate";
import { KO_SOURCES } from "@/lib/data/schedule";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";

// ── Chaveamento RADIAL ────────────────────────────────────────────────────────
// A final fica no centro e cada fase irradia para fora: Semis → Quartas →
// Oitavas → 16-avos (anel externo). As posições saem da PRÓPRIA árvore do
// bracket (KO_SOURCES), então os conectores nunca se cruzam mesmo com o
// cruzamento oficial das semifinais. Passar o mouse num confronto acende o
// caminho dele até o título.

const STAGE_RADIUS: Record<string, number> = {
  "16-avos": 43,
  Oitavas: 34,
  Quartas: 25,
  Semifinal: 16,
  Final: 0,
};

const RINGS = [
  { r: 43, label: "16-avos" },
  { r: 34, label: "Oitavas" },
  { r: 25, label: "Quartas" },
  { r: 16, label: "Semi" },
];

const WHEEL_PX = 720;
const CARD_W = 80;

const TAU = Math.PI * 2;
const A0 = -Math.PI / 2; // começa no topo
const f = (n: number) => n.toFixed(2);
const xy = (r: number, a: number): [number, number] => [50 + r * Math.cos(a), 50 + r * Math.sin(a)];

/** Os jogos que alimentam `id` (vencedores). Vazio para os 16-avos (folhas). */
function childrenOf(id: string): string[] {
  const src = KO_SOURCES[id];
  if (!src) return [];
  const out: string[] = [];
  for (const s of [src.home, src.away]) if (s.type === "winner") out.push(s.matchId);
  return out;
}

/** Rótulo curto para uma vaga ainda sem time definido. */
function seed(label?: string): string {
  if (!label) return "—";
  const g = label.match(/^(\d)º Grupo ([A-L])/);
  if (g) return `${g[1]}${g[2]}`;
  if (/Melhor 3º/.test(label)) return "3º";
  if (/^Vencedor|^Perdedor/.test(label)) return "—";
  return label.slice(0, 3);
}

interface Node {
  id: string;
  stage: string;
  x: number;
  y: number;
}

export function RadialBracket({ tournament }: { tournament: ResolvedTournament }) {
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, links, parent } = useMemo(() => {
    // ordem angular das 16 folhas = travessia em ordem da árvore
    const order = (id: string): string[] => {
      const ch = childrenOf(id);
      return ch.length ? ch.flatMap(order) : [id];
    };
    const leaves = order("FINAL");
    const leafAngle = new Map<string, number>();
    leaves.forEach((id, i) => leafAngle.set(id, A0 + ((i + 0.5) / leaves.length) * TAU));

    const angleCache = new Map<string, number>();
    const angleOf = (id: string): number => {
      const cached = angleCache.get(id);
      if (cached !== undefined) return cached;
      const ch = childrenOf(id);
      const a = ch.length ? ch.reduce((s, c) => s + angleOf(c), 0) / ch.length : leafAngle.get(id)!;
      angleCache.set(id, a);
      return a;
    };

    const ids = Object.keys(KO_SOURCES).filter((id) => id !== "TP");
    const nodes: Node[] = [];
    const parent: Record<string, string> = {};
    const links: { from: string; to: string; d: string }[] = [];

    for (const id of ids) {
      const m = tournament.matchMap[id];
      if (!m) continue;
      const [x, y] = xy(STAGE_RADIUS[m.stage] ?? 0, angleOf(id));
      nodes.push({ id, stage: m.stage, x, y });
    }
    for (const id of ids) {
      const rp = STAGE_RADIUS[tournament.matchMap[id]?.stage ?? "Final"] ?? 0;
      const ap = angleOf(id);
      for (const c of childrenOf(id)) {
        parent[c] = id;
        const rc = STAGE_RADIUS[tournament.matchMap[c]?.stage ?? "16-avos"] ?? 0;
        const ac = angleOf(c);
        const rm = (rp + rc) / 2;
        const [px, py] = xy(rp, ap);
        const [b1x, b1y] = xy(rm, ap);
        const [b2x, b2y] = xy(rm, ac);
        const [cx, cy] = xy(rc, ac);
        links.push({
          from: id,
          to: c,
          d: `M${f(px)},${f(py)} C${f(b1x)},${f(b1y)} ${f(b2x)},${f(b2y)} ${f(cx)},${f(cy)}`,
        });
      }
    }
    return { nodes, links, parent };
  }, [tournament]);

  // caminho aceso: do confronto sob o mouse até a FINAL
  const lit = useMemo(() => {
    const s = new Set<string>();
    let cur: string | undefined = hover ?? undefined;
    while (cur) {
      s.add(cur);
      cur = parent[cur];
    }
    return s;
  }, [hover, parent]);

  const ringNodes = nodes.filter((n) => n.stage !== "Final");

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto pb-2">
        <div className="relative mx-auto" style={{ width: WHEEL_PX, height: WHEEL_PX }}>
          {/* conectores + anéis-guia */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <radialGradient id="rb-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgb(0 199 95 / 0.18)" />
                <stop offset="100%" stopColor="rgb(0 199 95 / 0)" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="20" fill="url(#rb-core)" />
            {RINGS.map((ring) => (
              <circle
                key={ring.r}
                cx="50"
                cy="50"
                r={ring.r}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.12"
                strokeDasharray="0.5 1"
                className="text-ink-500/20"
              />
            ))}
            {links.map((l) => {
              const on = lit.has(l.from) && lit.has(l.to);
              return (
                <path
                  key={`${l.from}-${l.to}`}
                  d={l.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={on ? 2 : 1}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className={cn("transition-all duration-300", on ? "text-pitch-500" : "text-ink-500/25")}
                />
              );
            })}
          </svg>

          {/* rótulos das fases (topo de cada anel) */}
          {RINGS.map((ring) => (
            <span
              key={ring.label}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-400 shadow-sm"
              style={{ left: "50%", top: `${50 - ring.r}%` }}
            >
              {ring.label}
            </span>
          ))}

          {/* confrontos */}
          {ringNodes.map((n, i) => (
            <NodeCard
              key={n.id}
              node={n}
              match={tournament.matchMap[n.id]}
              active={lit.has(n.id)}
              dim={hover != null && !lit.has(n.id)}
              index={i}
              onEnter={() => setHover(n.id)}
              onLeave={() => setHover(null)}
            />
          ))}

          {/* final / campeão no centro */}
          <Medallion
            match={tournament.matchMap["FINAL"]}
            onEnter={() => setHover("FINAL")}
            onLeave={() => setHover(null)}
          />
        </div>
      </div>

      {/* disputa de 3º lugar */}
      {tournament.matchMap["TP"] && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-500">Disputa de 3º lugar</span>
          <ThirdPlace match={tournament.matchMap["TP"]} />
        </div>
      )}

      <p className="mt-4 text-center text-xs text-ink-400">
        Passe o mouse (ou toque) num confronto para acender o caminho até o título. Clique para abrir a partida.
      </p>
    </div>
  );
}

function Slot({ match, side }: { match: Match; side: "home" | "away" }) {
  const code = side === "home" ? match.homeCode : match.awayCode;
  const label = side === "home" ? match.homeLabel : match.awayLabel;
  const prov = side === "home" ? match.homeProvisional : match.awayProvisional;
  const goals = side === "home" ? match.homeGoals : match.awayGoals;
  const w = match.status === "encerrado" ? winnerOf(match) : null;
  const decided = !!w;
  const isWinner = !!code && w === code;
  const showScore = match.status === "encerrado" || match.status === "ao-vivo";

  return (
    <div className={cn("flex items-center gap-1 text-[10px] leading-none", decided && !isWinner && "opacity-45")}>
      {code ? (
        <Flag code={code} size="xs" />
      ) : (
        <span className="inline-block h-[9px] w-[13px] shrink-0 rounded-[2px] bg-ink-500/15" />
      )}
      <span className={cn("min-w-0 flex-1 truncate font-bold", prov && "italic text-ink-400")}>
        {code ?? seed(label)}
      </span>
      {isWinner && <span className="h-1 w-1 shrink-0 rounded-full bg-pitch-500" />}
      {showScore && <span className="stat-num shrink-0 font-extrabold">{goals ?? 0}</span>}
    </div>
  );
}

function NodeCard({
  node,
  match,
  active,
  dim,
  index,
  onEnter,
  onLeave,
}: {
  node: Node;
  match?: Match;
  active: boolean;
  dim: boolean;
  index: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  if (!match) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: dim ? 0.35 : 1, scale: 1 }}
      transition={{ delay: 0.12 + index * 0.012, type: "spring", stiffness: 220, damping: 22 }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%`, width: CARD_W }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link
        href={`/jogos/${match.id}`}
        onFocus={onEnter}
        onBlur={onLeave}
        className={cn(
          "block rounded-lg border bg-[var(--bg-elevated)] px-1.5 py-1 shadow-sm transition-all",
          active ? "border-pitch-500 shadow-glow" : "border-[var(--border)] hover:border-pitch-500/50",
        )}
      >
        <Slot match={match} side="home" />
        <div className="my-1 h-px bg-[var(--border)]" />
        <Slot match={match} side="away" />
      </Link>
    </motion.div>
  );
}

function MiniSlot({ match, side }: { match: Match; side: "home" | "away" }) {
  const code = side === "home" ? match.homeCode : match.awayCode;
  const label = side === "home" ? match.homeLabel : match.awayLabel;
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold">
      {code ? <Flag code={code} size="xs" /> : <span className="inline-block h-[9px] w-[13px] rounded-[2px] bg-ink-500/15" />}
      <span className="max-w-[52px] truncate">{code ?? seed(label)}</span>
    </span>
  );
}

function Medallion({ match, onEnter, onLeave }: { match?: Match; onEnter: () => void; onLeave: () => void }) {
  const w = match && match.status === "encerrado" ? winnerOf(match) : null;
  const champ = w ? TEAM_MAP[w] : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.04, type: "spring", stiffness: 160, damping: 16 }}
      className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {champ && <div className="absolute inset-0 -z-10 rounded-full bg-gold-500/25 blur-xl" />}
      <Link
        href={match ? `/jogos/${match.id}` : "#"}
        onFocus={onEnter}
        onBlur={onLeave}
        className={cn(
          "flex flex-col items-center justify-center rounded-full border bg-[var(--bg-elevated)] text-center shadow-lg transition-all",
          champ ? "border-gold-500/60 shadow-glow" : "border-[var(--border)]",
        )}
        style={{ width: 118, height: 118 }}
      >
        {champ && w ? (
          <>
            <Trophy size={16} className="text-gold-500" />
            <Flag code={w} size="md" className="my-1" />
            <span className="max-w-[100px] truncate px-1 text-[11px] font-extrabold leading-tight">{champ.name}</span>
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-gold-500">Campeão</span>
          </>
        ) : (
          <>
            <Trophy size={15} className="text-ink-400" />
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-ink-400">Final</span>
            {match && (
              <div className="mt-1 flex flex-col items-center gap-0.5">
                <MiniSlot match={match} side="home" />
                <span className="text-[7px] uppercase tracking-wide text-ink-300">vs</span>
                <MiniSlot match={match} side="away" />
              </div>
            )}
          </>
        )}
      </Link>
    </motion.div>
  );
}

function ThirdPlace({ match }: { match: Match }) {
  return (
    <Link
      href={`/jogos/${match.id}`}
      className="block w-[150px] rounded-xl border border-gold-500/30 bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-sm transition-all hover:border-gold-500/60"
    >
      <Slot match={match} side="home" />
      <div className="my-1 h-px bg-[var(--border)]" />
      <Slot match={match} side="away" />
    </Link>
  );
}
