import type { Player, Position } from "@/lib/types";

export type RoleKey =
  | "GK" | "RB" | "CB" | "LB" | "RWB" | "LWB"
  | "DM" | "CM" | "AM" | "RM" | "LM" | "RW" | "LW" | "ST";

export interface FormationSlot {
  role: RoleKey;
  x: number; // 0 (left) .. 100 (right)
  y: number; // 0 (own goal) .. 100 (attack)
}

export interface Formation {
  key: string;
  name: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Formation[] = [
  {
    key: "4-3-3",
    name: "4-3-3",
    slots: [
      { role: "GK", x: 50, y: 7 },
      { role: "LB", x: 15, y: 28 }, { role: "CB", x: 38, y: 24 }, { role: "CB", x: 62, y: 24 }, { role: "RB", x: 85, y: 28 },
      { role: "CM", x: 28, y: 52 }, { role: "DM", x: 50, y: 46 }, { role: "CM", x: 72, y: 52 },
      { role: "LW", x: 18, y: 78 }, { role: "ST", x: 50, y: 86 }, { role: "RW", x: 82, y: 78 },
    ],
  },
  {
    key: "4-4-2",
    name: "4-4-2",
    slots: [
      { role: "GK", x: 50, y: 7 },
      { role: "LB", x: 15, y: 28 }, { role: "CB", x: 37, y: 24 }, { role: "CB", x: 63, y: 24 }, { role: "RB", x: 85, y: 28 },
      { role: "LM", x: 15, y: 56 }, { role: "CM", x: 40, y: 52 }, { role: "CM", x: 60, y: 52 }, { role: "RM", x: 85, y: 56 },
      { role: "ST", x: 38, y: 84 }, { role: "ST", x: 62, y: 84 },
    ],
  },
  {
    key: "4-2-3-1",
    name: "4-2-3-1",
    slots: [
      { role: "GK", x: 50, y: 7 },
      { role: "LB", x: 15, y: 28 }, { role: "CB", x: 37, y: 24 }, { role: "CB", x: 63, y: 24 }, { role: "RB", x: 85, y: 28 },
      { role: "DM", x: 38, y: 44 }, { role: "DM", x: 62, y: 44 },
      { role: "LW", x: 18, y: 68 }, { role: "AM", x: 50, y: 64 }, { role: "RW", x: 82, y: 68 },
      { role: "ST", x: 50, y: 88 },
    ],
  },
  {
    key: "3-5-2",
    name: "3-5-2",
    slots: [
      { role: "GK", x: 50, y: 7 },
      { role: "CB", x: 30, y: 24 }, { role: "CB", x: 50, y: 22 }, { role: "CB", x: 70, y: 24 },
      { role: "LWB", x: 12, y: 50 }, { role: "CM", x: 35, y: 52 }, { role: "DM", x: 50, y: 44 }, { role: "CM", x: 65, y: 52 }, { role: "RWB", x: 88, y: 50 },
      { role: "ST", x: 38, y: 84 }, { role: "ST", x: 62, y: 84 },
    ],
  },
  {
    key: "5-3-2",
    name: "5-3-2",
    slots: [
      { role: "GK", x: 50, y: 7 },
      { role: "LWB", x: 12, y: 36 }, { role: "CB", x: 32, y: 24 }, { role: "CB", x: 50, y: 22 }, { role: "CB", x: 68, y: 24 }, { role: "RWB", x: 88, y: 36 },
      { role: "CM", x: 32, y: 56 }, { role: "DM", x: 50, y: 50 }, { role: "CM", x: 68, y: 56 },
      { role: "ST", x: 38, y: 84 }, { role: "ST", x: 62, y: 84 },
    ],
  },
];

export const FORMATION_MAP: Record<string, Formation> = Object.fromEntries(
  FORMATIONS.map((f) => [f.key, f]),
);

// role -> ordered position preferences
const ROLE_PREFS: Record<RoleKey, Position[]> = {
  GK: ["Goleiro"],
  RB: ["Lateral-direito", "Lateral-esquerdo", "Zagueiro"],
  LB: ["Lateral-esquerdo", "Lateral-direito", "Zagueiro"],
  CB: ["Zagueiro", "Volante"],
  RWB: ["Lateral-direito", "Ponta-direita", "Lateral-esquerdo"],
  LWB: ["Lateral-esquerdo", "Ponta-esquerda", "Lateral-direito"],
  DM: ["Volante", "Meio-campista"],
  CM: ["Meio-campista", "Volante", "Meia-atacante"],
  AM: ["Meia-atacante", "Meio-campista", "Ponta-direita"],
  RM: ["Ponta-direita", "Meio-campista", "Lateral-direito"],
  LM: ["Ponta-esquerda", "Meio-campista", "Lateral-esquerdo"],
  RW: ["Ponta-direita", "Ponta-esquerda", "Meia-atacante"],
  LW: ["Ponta-esquerda", "Ponta-direita", "Meia-atacante"],
  ST: ["Centroavante", "Meia-atacante", "Ponta-direita"],
};

export interface LineupSpot extends FormationSlot {
  player: Player;
}

export interface Lineup {
  formation: Formation;
  starters: LineupSpot[];
  bench: Player[];
}

/** Picks a sensible best-XI for a formation from a 26-man squad. */
export function buildLineup(squad: Player[], formationKey = "4-3-3"): Lineup {
  const formation = FORMATION_MAP[formationKey] ?? FORMATIONS[0];
  const used = new Set<string>();
  const pool = [...squad].sort((a, b) => b.rating - a.rating);

  const pickFor = (role: RoleKey): Player => {
    for (const pref of ROLE_PREFS[role]) {
      const cand = pool.find((p) => !used.has(p.id) && p.position === pref);
      if (cand) { used.add(cand.id); return cand; }
    }
    // any best available outfield (or GK for GK)
    const fallback = pool.find(
      (p) => !used.has(p.id) && (role === "GK" ? p.position === "Goleiro" : p.position !== "Goleiro"),
    ) ?? pool.find((p) => !used.has(p.id))!;
    used.add(fallback.id);
    return fallback;
  };

  const starters: LineupSpot[] = formation.slots.map((slot) => ({
    ...slot,
    player: pickFor(slot.role),
  }));

  const bench = pool.filter((p) => !used.has(p.id));
  return { formation, starters, bench };
}
