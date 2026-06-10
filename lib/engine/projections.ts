import type { MatchResultMap } from "@/lib/types";
import { Rng } from "@/lib/rng";
import { TEAMS, TEAM_MAP, GROUPS } from "@/lib/data/teams";
import { KO_DEFS, assignThirdSlots, type SlotSource } from "@/lib/data/schedule";
import { buildTournament } from "@/lib/engine/tournament";

export interface TeamProjection {
  code: string;
  group: string;
  groupWinner: number; // P(1º do grupo)
  qualify: number; // P(avançar à fase final)
  oitavas: number; // P(chegar às oitavas)
  quartas: number;
  semis: number;
  final: number;
  titulo: number;
}

interface GroupFixture {
  group: string;
  homeCode: string;
  awayCode: string;
  fixed?: { hg: number; ag: number };
}

function poisson(lambda: number, rng: Rng): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.float();
  } while (p > L);
  return k - 1;
}

function simScore(rng: Rng, rh: number, ra: number, knockout: boolean) {
  const diff = (rh - ra) / 10;
  const adv = knockout ? 0 : 0.16;
  const lh = Math.max(0.18, Math.min(4.6, 1.38 + diff * 0.46 + adv));
  const la = Math.max(0.18, Math.min(4.6, 1.16 - diff * 0.46));
  let hg = poisson(lh, rng);
  let ag = poisson(la, rng);
  let homeWins: boolean;
  if (hg > ag) homeWins = true;
  else if (ag > hg) homeWins = false;
  else if (knockout) homeWins = rng.float() < 0.5 + (rh - ra) / 200;
  else homeWins = false; // draw handled by points
  return { hg, ag, homeWins };
}

// precompute fixtures from the demo-clock tournament (finished = fixed)
function buildFixtures(overrides: MatchResultMap): GroupFixture[] {
  const t = buildTournament(overrides);
  return t.matches
    .filter((m) => m.stage === "Grupos" && m.homeCode && m.awayCode)
    .map((m) => ({
      group: m.group!,
      homeCode: m.homeCode!,
      awayCode: m.awayCode!,
      fixed:
        m.status === "encerrado" && m.homeGoals != null && m.awayGoals != null
          ? { hg: m.homeGoals, ag: m.awayGoals }
          : undefined,
    }));
}

interface Row {
  code: string;
  pts: number;
  gd: number;
  gf: number;
}

function runOnce(
  rng: Rng,
  fixtures: GroupFixture[],
  counters: Record<string, TeamProjection>,
) {
  // group tables
  const rows: Record<string, Row> = {};
  for (const t of TEAMS) rows[t.code] = { code: t.code, pts: 0, gd: 0, gf: 0 };

  for (const f of fixtures) {
    let hg: number, ag: number;
    if (f.fixed) {
      hg = f.fixed.hg;
      ag = f.fixed.ag;
    } else {
      const s = simScore(rng, TEAM_MAP[f.homeCode].rating, TEAM_MAP[f.awayCode].rating, false);
      hg = s.hg;
      ag = s.ag;
    }
    const h = rows[f.homeCode];
    const a = rows[f.awayCode];
    h.gf += hg; a.gf += ag;
    h.gd += hg - ag; a.gd += ag - hg;
    if (hg > ag) h.pts += 3;
    else if (ag > hg) a.pts += 3;
    else { h.pts++; a.pts++; }
  }

  const cmp = (x: Row, y: Row) =>
    y.pts - x.pts || y.gd - x.gd || y.gf - x.gf ||
    TEAM_MAP[x.code].fifaRank - TEAM_MAP[y.code].fifaRank;

  const tablesByGroup: Record<string, Row[]> = {};
  const thirds: Row[] = [];
  for (const g of GROUPS) {
    const table = TEAMS.filter((t) => t.group === g).map((t) => rows[t.code]).sort(cmp);
    tablesByGroup[g] = table;
    counters[table[0].code].groupWinner++;
    counters[table[0].code].qualify++;
    counters[table[1].code].qualify++;
    thirds.push(table[2]);
  }
  thirds.sort(cmp);
  const qualifiedThirds = thirds.slice(0, 8);
  for (const r of qualifiedThirds) counters[r.code].qualify++;

  // knockout
  const thirdAssignment = assignThirdSlots(
    qualifiedThirds.map((r) => ({ teamCode: r.code, group: TEAM_MAP[r.code].group })),
  );
  const teamAt = (s: SlotSource, side: "home" | "away", matchId: string): string => {
    switch (s.type) {
      case "group": return tablesByGroup[s.group][s.rank - 1].code;
      case "third": return thirdAssignment[`${matchId}:${side}`];
      case "winner": return winnerByMatch[s.matchId];
      case "loser": return loserByMatch[s.matchId];
    }
  };
  const winnerByMatch: Record<string, string> = {};
  const loserByMatch: Record<string, string> = {};
  const stageKey: Record<string, keyof TeamProjection> = {
    "16-avos": "oitavas", // winning a R32 match => reach Oitavas
    Oitavas: "quartas",
    Quartas: "semis",
    Semifinal: "final",
    Final: "titulo",
  };

  for (const def of KO_DEFS) {
    if (def.stage === "Disputa de 3º") continue;
    const home = teamAt(def.home, "home", def.id);
    const away = teamAt(def.away, "away", def.id);
    const s = simScore(rng, TEAM_MAP[home].rating, TEAM_MAP[away].rating, true);
    const winner = s.homeWins ? home : away;
    const loser = s.homeWins ? away : home;
    winnerByMatch[def.id] = winner;
    loserByMatch[def.id] = loser;
    const key = stageKey[def.stage];
    if (key) counters[winner][key]++;
  }
}

const CACHE = new Map<string, TeamProjection[]>();

export function getProjections(
  overrides: MatchResultMap = {},
  iterations = 1600,
): TeamProjection[] {
  const cacheKey = JSON.stringify(Object.keys(overrides).sort()) + ":" + iterations;
  if (Object.keys(overrides).length === 0 && CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey)!;
  }

  const fixtures = buildFixtures(overrides);
  const counters: Record<string, TeamProjection> = {};
  for (const t of TEAMS) {
    counters[t.code] = {
      code: t.code,
      group: t.group,
      groupWinner: 0,
      qualify: 0,
      oitavas: 0,
      quartas: 0,
      semis: 0,
      final: 0,
      titulo: 0,
    };
  }

  for (let i = 0; i < iterations; i++) {
    runOnce(new Rng(`proj-${i}`), fixtures, counters);
  }

  const result = Object.values(counters)
    .map((c) => ({
      ...c,
      groupWinner: c.groupWinner / iterations,
      qualify: c.qualify / iterations,
      oitavas: c.oitavas / iterations,
      quartas: c.quartas / iterations,
      semis: c.semis / iterations,
      final: c.final / iterations,
      titulo: c.titulo / iterations,
    }))
    .sort((a, b) => b.titulo - a.titulo || b.final - a.final);

  if (Object.keys(overrides).length === 0) CACHE.set(cacheKey, result);
  return result;
}

export function getProjectionMap(overrides: MatchResultMap = {}): Record<string, TeamProjection> {
  return Object.fromEntries(getProjections(overrides).map((p) => [p.code, p]));
}
