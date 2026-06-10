import { BASE_TOURNAMENT } from "@/lib/engine/tournament";

export interface PlayerTournamentStats {
  goals: number;
  assists: number;
  pens: number;
  yellow: number;
  red: number;
  matches: number;
}

const CACHE = new Map<string, PlayerTournamentStats>();

export function getPlayerTournamentStats(id: string, teamCode: string): PlayerTournamentStats {
  if (CACHE.has(id)) return CACHE.get(id)!;
  let goals = 0, assists = 0, pens = 0, yellow = 0, red = 0;
  for (const m of BASE_TOURNAMENT.matches) {
    for (const e of m.events) {
      if (e.playerId === id) {
        if (e.type === "gol" || e.type === "penalti") { goals++; if (e.type === "penalti") pens++; }
        if (e.type === "amarelo") yellow++;
        if (e.type === "vermelho") red++;
      }
      if (e.assistPlayerId === id) assists++;
    }
  }
  const matches = BASE_TOURNAMENT.matches.filter(
    (m) => m.status === "encerrado" && (m.homeCode === teamCode || m.awayCode === teamCode),
  ).length;
  const stats = { goals, assists, pens, yellow, red, matches };
  CACHE.set(id, stats);
  return stats;
}
