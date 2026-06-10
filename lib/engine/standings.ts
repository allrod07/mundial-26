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

function compareRows(a: StandingRow, b: StandingRow, headToHead: Map<string, number>): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  // head-to-head (simplified): more wins between tied teams
  const h2h = (headToHead.get(b.teamCode) ?? 0) - (headToHead.get(a.teamCode) ?? 0);
  if (h2h !== 0) return h2h;
  // fair play / FIFA ranking fallback
  return TEAM_MAP[a.teamCode].fifaRank - TEAM_MAP[b.teamCode].fifaRank;
}

export function computeGroupStandings(matches: Match[]): Record<string, StandingRow[]> {
  const byGroup: Record<string, StandingRow[]> = {};
  for (const group of GROUPS) {
    const rows: Record<string, StandingRow> = {};
    for (const team of teamsByGroup(group)) rows[team.code] = emptyRow(team.code, group);
    const groupMatches = matches.filter((m) => m.group === group);
    for (const m of groupMatches) applyMatch(rows, m);

    const arr = Object.values(rows);
    // head-to-head points among the group (wins count)
    const h2h = new Map<string, number>();
    for (const m of groupMatches) {
      if (m.status !== "encerrado" || m.homeGoals == null || m.awayGoals == null) continue;
      if (m.homeGoals > m.awayGoals) h2h.set(m.homeCode!, (h2h.get(m.homeCode!) ?? 0) + 3);
      else if (m.awayGoals > m.homeGoals) h2h.set(m.awayCode!, (h2h.get(m.awayCode!) ?? 0) + 3);
      else {
        h2h.set(m.homeCode!, (h2h.get(m.homeCode!) ?? 0) + 1);
        h2h.set(m.awayCode!, (h2h.get(m.awayCode!) ?? 0) + 1);
      }
    }
    arr.sort((a, b) => compareRows(a, b, h2h));
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
