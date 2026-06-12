import type { Match, StandingRow, ThirdPlaceRow } from "@/lib/types";
import { GROUPS, teamsByGroup, TEAM_MAP } from "@/lib/data/teams";

function emptyRow(teamCode: string, group: string): StandingRow {
  return {
    teamCode,
    group,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    rank: 0,
    form: [],
  };
}

/** Count only finished matches into the table. */
function applyMatch(rows: Record<string, StandingRow>, m: Match) {
  if (m.status !== "encerrado" || m.homeGoals == null || m.awayGoals == null) return;
  if (!m.homeCode || !m.awayCode) return;
  const h = rows[m.homeCode];
  const a = rows[m.awayCode];
  if (!h || !a) return;
  h.played++;
  a.played++;
  h.gf += m.homeGoals;
  h.ga += m.awayGoals;
  a.gf += m.awayGoals;
  a.ga += m.homeGoals;
  if (m.homeGoals > m.awayGoals) {
    h.win++; h.points += 3; h.form.push("V");
    a.loss++; a.form.push("D");
  } else if (m.homeGoals < m.awayGoals) {
    a.win++; a.points += 3; a.form.push("V");
    h.loss++; h.form.push("D");
  } else {
    h.draw++; h.points++; h.form.push("E");
    a.draw++; a.points++; a.form.push("E");
  }
  h.gd = h.gf - h.ga;
  a.gd = a.gf - a.ga;
}

interface MiniStats { pts: number; gd: number; gf: number }

/** Mini-liga FIFA: aplica pts/sg/gp considerando APENAS os jogos disputados
 * entre os times empatados (`codes`). */
function buildMiniTable(codes: Set<string>, groupMatches: Match[]): Map<string, MiniStats> {
  const mini = new Map<string, MiniStats>();
  for (const code of codes) mini.set(code, { pts: 0, gd: 0, gf: 0 });
  for (const m of groupMatches) {
    if (m.status !== "encerrado" || m.homeGoals == null || m.awayGoals == null) continue;
    if (!m.homeCode || !m.awayCode) continue;
    if (!codes.has(m.homeCode) || !codes.has(m.awayCode)) continue;
    const h = mini.get(m.homeCode)!;
    const a = mini.get(m.awayCode)!;
    h.gf += m.homeGoals; a.gf += m.awayGoals;
    h.gd += m.homeGoals - m.awayGoals;
    a.gd += m.awayGoals - m.homeGoals;
    if (m.homeGoals > m.awayGoals) h.pts += 3;
    else if (m.awayGoals > m.homeGoals) a.pts += 3;
    else { h.pts++; a.pts++; }
  }
  return mini;
}

function tiedByOverall(a: StandingRow, b: StandingRow): boolean {
  return a.points === b.points && a.gd === b.gd && a.gf === b.gf;
}

/** Reordena clusters de times com pts/sg/gp idênticos usando a mini-liga
 * entre eles (regra FIFA: pts, sg e gp considerando só os confrontos diretos),
 * caindo para FIFA Ranking quando o confronto direto também empata. */
function applyHeadToHead(arr: StandingRow[], groupMatches: Match[]): StandingRow[] {
  let i = 0;
  while (i < arr.length) {
    let j = i + 1;
    while (j < arr.length && tiedByOverall(arr[i], arr[j])) j++;
    if (j - i > 1) {
      const tied = arr.slice(i, j);
      const codes = new Set(tied.map((r) => r.teamCode));
      const mini = buildMiniTable(codes, groupMatches);
      tied.sort((x, y) => {
        const mx = mini.get(x.teamCode)!;
        const my = mini.get(y.teamCode)!;
        if (my.pts !== mx.pts) return my.pts - mx.pts;
        if (my.gd !== mx.gd) return my.gd - mx.gd;
        if (my.gf !== mx.gf) return my.gf - mx.gf;
        return TEAM_MAP[x.teamCode].fifaRank - TEAM_MAP[y.teamCode].fifaRank;
      });
      arr.splice(i, tied.length, ...tied);
    }
    i = j;
  }
  return arr;
}

export function computeGroupStandings(matches: Match[]): Record<string, StandingRow[]> {
  const byGroup: Record<string, StandingRow[]> = {};
  for (const group of GROUPS) {
    const rows: Record<string, StandingRow> = {};
    for (const team of teamsByGroup(group)) rows[team.code] = emptyRow(team.code, group);
    const groupMatches = matches.filter((m) => m.group === group);
    for (const m of groupMatches) applyMatch(rows, m);

    const arr = Object.values(rows);
    arr.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return 0;
    });
    applyHeadToHead(arr, groupMatches);
    arr.forEach((r, i) => (r.rank = i + 1));
    byGroup[group] = arr;
  }
  return byGroup;
}

/** Rank the 12 third-placed teams; top 8 advance. */
export function rankThirds(standings: Record<string, StandingRow[]>): ThirdPlaceRow[] {
  const thirds = GROUPS.map((g) => standings[g][2]).filter(Boolean);
  const sorted = [...thirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return TEAM_MAP[a.teamCode].fifaRank - TEAM_MAP[b.teamCode].fifaRank;
  });
  return sorted.map((r, i) => ({
    ...r,
    overallRank: i + 1,
    qualified: i < 8,
  }));
}

export function isGroupStageComplete(matches: Match[]): boolean {
  const groupMatches = matches.filter((m) => m.stage === "Grupos");
  return groupMatches.length > 0 && groupMatches.every((m) => m.status === "encerrado");
}
