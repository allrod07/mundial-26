import type { Match } from "@/lib/types";
import { Rng } from "@/lib/rng";
import { TEAM_MAP } from "@/lib/data/teams";

export interface SideStats {
  posse: number;
  finalizacoes: number;
  noGol: number;
  escanteios: number;
  faltas: number;
  impedimentos: number;
  defesas: number;
  passes: number;
  precisao: number;
  cartoes: number;
}

export interface MatchStats {
  home: SideStats;
  away: SideStats;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function deriveMatchStats(match: Match): MatchStats | null {
  if (!match.homeCode || !match.awayCode) return null;
  if (match.status === "agendado") return null;
  const rng = new Rng(`mstats-${match.id}`);
  const rH = TEAM_MAP[match.homeCode].rating;
  const rA = TEAM_MAP[match.awayCode].rating;
  const gH = match.homeGoals ?? 0;
  const gA = match.awayGoals ?? 0;

  const posseHome = clamp(50 + (rH - rA) * 0.85 + rng.gauss(0, 4), 30, 70);
  const yellowsHome = match.events.filter((e) => e.type === "amarelo" && e.teamCode === match.homeCode).length;
  const redsHome = match.events.filter((e) => e.type === "vermelho" && e.teamCode === match.homeCode).length;
  const yellowsAway = match.events.filter((e) => e.type === "amarelo" && e.teamCode === match.awayCode).length;
  const redsAway = match.events.filter((e) => e.type === "vermelho" && e.teamCode === match.awayCode).length;

  const side = (posse: number, goals: number, oppGoals: number, cards: number): SideStats => {
    const noGol = clamp(goals + 2 + rng.int(0, 4), goals, 12);
    const finalizacoes = clamp(noGol + 3 + rng.int(1, 8), noGol, 28);
    const passes = clamp(380 + (posse - 50) * 9 + rng.int(-40, 40), 180, 800);
    return {
      posse,
      finalizacoes,
      noGol,
      escanteios: clamp(3 + rng.int(0, 8) + (posse - 50) * 0.06, 0, 14),
      faltas: clamp(8 + rng.int(0, 9), 4, 22),
      impedimentos: rng.int(0, 5),
      defesas: clamp(oppGoals === 0 ? rng.int(2, 6) : oppGoals + rng.int(1, 4), 0, 11),
      passes,
      precisao: clamp(74 + (posse - 50) * 0.35 + rng.gauss(0, 3), 60, 93),
      cartoes: cards,
    };
  };

  return {
    home: side(posseHome, gH, gA, yellowsHome + redsHome),
    away: side(100 - posseHome, gA, gH, yellowsAway + redsAway),
  };
}
