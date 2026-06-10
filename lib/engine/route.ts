import type { Match, Stage } from "@/lib/types";
import type { ResolvedTournament } from "@/lib/engine/tournament";
import { KO_DEFS, KO_SOURCES, labelForSource } from "@/lib/data/schedule";
import { winnerOf } from "@/lib/engine/simulate";
import { TEAM_MAP } from "@/lib/data/teams";

type Side = "home" | "away";

// match whose winner feeds the next round: feederMatchId -> { matchId, side }
const WINNER_FEEDS: Record<string, { matchId: string; side: Side }> = {};
// group entry slot: `${rank}${group}` -> R32 match + side the team enters at
const GROUP_SLOT: Record<string, { matchId: string; side: Side }> = {};

for (const def of KO_DEFS) {
  if (def.home.type === "winner") WINNER_FEEDS[def.home.matchId] = { matchId: def.id, side: "home" };
  if (def.away.type === "winner") WINNER_FEEDS[def.away.matchId] = { matchId: def.id, side: "away" };
  if (def.home.type === "group") GROUP_SLOT[`${def.home.rank}${def.home.group}`] = { matchId: def.id, side: "home" };
  if (def.away.type === "group") GROUP_SLOT[`${def.away.rank}${def.away.group}`] = { matchId: def.id, side: "away" };
}

export type StepStatus = "won" | "playing" | "projected" | "lost";

export interface RouteStep {
  stage: Stage;
  matchId: string;
  teamSide: Side;
  opponentCode?: string;
  opponentLabel?: string;
  status: StepStatus;
  score?: [number, number];
  pens?: [number, number];
}

export interface TeamRoute {
  code: string;
  group: string;
  groupRank: number;
  qualified: boolean | "pending";
  entry?: string; // "1º do Grupo C" / "Melhor 3º (...)"
  steps: RouteStep[];
  eliminatedAt?: Stage;
  champion: boolean;
}

function findEntry(
  t: ResolvedTournament,
  code: string,
): { matchId: string; side: Side; entry: string } | null {
  // already placed in the bracket?
  for (const m of t.matches) {
    if (m.stage !== "16-avos") continue;
    if (m.homeCode === code) return { matchId: m.id, side: "home", entry: labelForSource(KO_SOURCES[m.id].home) };
    if (m.awayCode === code) return { matchId: m.id, side: "away", entry: labelForSource(KO_SOURCES[m.id].away) };
  }
  // project from current group position (1º/2º)
  const team = TEAM_MAP[code];
  const rows = t.standings[team.group];
  const rank = rows.findIndex((r) => r.teamCode === code) + 1;
  if (rank === 1 || rank === 2) {
    const slot = GROUP_SLOT[`${rank}${team.group}`];
    if (slot) return { matchId: slot.matchId, side: slot.side, entry: `${rank}º do Grupo ${team.group} (projeção)` };
  }
  return null;
}

export function getTeamRoute(t: ResolvedTournament, code: string): TeamRoute {
  const team = TEAM_MAP[code];
  const rows = t.standings[team.group];
  const groupRank = rows.findIndex((r) => r.teamCode === code) + 1;
  const final = t.matchMap["FINAL"];
  const champion = final?.status === "encerrado" && winnerOf(final) === code;

  const entry = findEntry(t, code);
  if (!entry) {
    const third = t.thirds.find((x) => x.teamCode === code);
    const qualified = groupRank === 3 && (!t.groupComplete || (third?.qualified ?? false)) ? "pending" : false;
    return { code, group: team.group, groupRank, qualified, steps: [], champion: false };
  }

  const steps: RouteStep[] = [];
  let curId: string | undefined = entry.matchId;
  let curSide: Side = entry.side;
  let eliminatedAt: Stage | undefined;

  while (curId) {
    const m: Match = t.matchMap[curId];
    const oppSide: Side = curSide === "home" ? "away" : "home";
    const oppCode = oppSide === "home" ? m.homeCode : m.awayCode;
    const oppLabel = oppSide === "home" ? m.homeLabel : m.awayLabel;
    const teamHere = m.homeCode === code || m.awayCode === code;

    let status: StepStatus;
    if (m.status === "encerrado") {
      status = teamHere ? (winnerOf(m) === code ? "won" : "lost") : "projected";
    } else if (m.status === "ao-vivo" && teamHere) {
      status = "playing";
    } else if (teamHere) {
      status = "playing";
    } else {
      status = "projected";
    }

    steps.push({
      stage: m.stage,
      matchId: curId,
      teamSide: curSide,
      opponentCode: oppCode,
      opponentLabel: oppLabel,
      status,
      score: m.homeGoals != null && m.awayGoals != null ? [m.homeGoals, m.awayGoals] : undefined,
      pens: m.homePens != null && m.awayPens != null ? [m.homePens, m.awayPens] : undefined,
    });

    if (status === "lost") {
      eliminatedAt = m.stage;
      break;
    }
    const feed: { matchId: string; side: Side } | undefined = WINNER_FEEDS[curId];
    curId = feed?.matchId;
    if (feed) curSide = feed.side;
  }

  return {
    code,
    group: team.group,
    groupRank,
    qualified: true,
    entry: entry.entry,
    steps,
    eliminatedAt,
    champion,
  };
}
