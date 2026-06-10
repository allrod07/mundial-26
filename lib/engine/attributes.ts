import type { Player, PositionGroup } from "@/lib/types";
import { Rng } from "@/lib/rng";

export interface Attributes {
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
  velocidade: number;
}

export const ATTR_LABELS: { key: keyof Attributes; label: string; short: string }[] = [
  { key: "finalizacao", label: "Finalização", short: "FIN" },
  { key: "passe", label: "Passe", short: "PAS" },
  { key: "drible", label: "Drible", short: "DRI" },
  { key: "defesa", label: "Defesa", short: "DEF" },
  { key: "fisico", label: "Físico", short: "FÍS" },
  { key: "velocidade", label: "Velocidade", short: "VEL" },
];

// per position-group weighting of each axis
const WEIGHTS: Record<PositionGroup, Attributes> = {
  GOL: { finalizacao: 0.4, passe: 0.78, drible: 0.5, defesa: 1.15, fisico: 1.0, velocidade: 0.7 },
  DEF: { finalizacao: 0.62, passe: 0.92, drible: 0.78, defesa: 1.15, fisico: 1.1, velocidade: 0.95 },
  MEI: { finalizacao: 0.9, passe: 1.15, drible: 1.08, defesa: 0.85, fisico: 0.92, velocidade: 0.98 },
  ATA: { finalizacao: 1.15, passe: 0.95, drible: 1.1, defesa: 0.5, fisico: 0.9, velocidade: 1.12 },
};

const CACHE = new Map<string, Attributes>();

function clamp(n: number) {
  return Math.max(38, Math.min(99, Math.round(n)));
}

export function deriveAttributes(player: Player): Attributes {
  if (CACHE.has(player.id)) return CACHE.get(player.id)!;
  const rng = new Rng(`attr-${player.id}`);
  const w = WEIGHTS[player.positionGroup];
  const base = player.rating;
  const a: Attributes = {
    finalizacao: clamp(base * w.finalizacao + rng.gauss(0, 4)),
    passe: clamp(base * w.passe + rng.gauss(0, 4)),
    drible: clamp(base * w.drible + rng.gauss(0, 4)),
    defesa: clamp(base * w.defesa + rng.gauss(0, 4)),
    fisico: clamp(base * w.fisico + rng.gauss(0, 4)),
    velocidade: clamp(base * w.velocidade + rng.gauss(0, 4)),
  };
  CACHE.set(player.id, a);
  return a;
}
