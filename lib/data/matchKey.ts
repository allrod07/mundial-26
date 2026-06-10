import type { Match } from "@/lib/types";
import type { ResolvedTournament } from "@/lib/engine/tournament";
import { BASE_GROUP_MATCHES } from "@/lib/data/schedule";

const pair = (a: string, b: string) => [a, b].sort().join("|");

const GROUP_BY_PAIR: Record<string, Match> = Object.fromEntries(
  BASE_GROUP_MATCHES.filter((m) => m.homeCode && m.awayCode).map((m) => [
    pair(m.homeCode!, m.awayCode!),
    m,
  ]),
);

/** Group-stage match for an (unordered) pair of team codes. */
export function groupMatchByPair(a: string, b: string): Match | undefined {
  return GROUP_BY_PAIR[pair(a, b)];
}

/** Resolved knockout match (teams already known) for an unordered pair. */
export function koMatchByPair(t: ResolvedTournament, a: string, b: string): Match | undefined {
  const key = pair(a, b);
  return t.matches.find(
    (m) => m.stage !== "Grupos" && m.homeCode && m.awayCode && pair(m.homeCode, m.awayCode) === key,
  );
}
