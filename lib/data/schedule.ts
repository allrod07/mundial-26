import type { Match, Stage } from "@/lib/types";
import { CITIES } from "@/lib/data/cities";

// ── Demo clock ───────────────────────────────────────────────────────────────
// Pinned to the middle of the group stage so the platform is alive: finished
// matches feed real standings & scorers, a few are live, the rest upcoming.
export const NOW = new Date("2026-06-24T20:00:00Z");
export const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z");
export const TOURNAMENT_END = new Date("2026-07-19T19:00:00Z");

function iso(day: string, hour: number, minute: number): string {
  return `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
}

function addDays(base: string, n: number): string {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── Official group-stage fixtures (104-match schedule, FWC26) ─────────────────
// [matchNo, home, away, group, hour, minute] — kickoff times in ET.
type Fixture = [number, string, string, string, number, number];

const GROUP_FIXTURES: Fixture[] = [
  [1, "MEX", "RSA", "A", 15, 0], [2, "KOR", "CZE", "A", 22, 0],
  [3, "CAN", "BIH", "B", 15, 0], [4, "USA", "PAR", "D", 21, 0],
  [5, "HAI", "SCO", "C", 21, 0], [6, "AUS", "TUR", "D", 0, 0],
  [7, "BRA", "MAR", "C", 18, 0], [8, "QAT", "SUI", "B", 15, 0],
  [9, "CIV", "ECU", "E", 19, 0], [10, "GER", "CUW", "E", 13, 0],
  [11, "NED", "JPN", "F", 16, 0], [12, "SWE", "TUN", "F", 22, 0],
  [13, "KSA", "URU", "H", 18, 0], [14, "ESP", "CPV", "H", 12, 0],
  [15, "IRN", "NZL", "G", 21, 0], [16, "BEL", "EGY", "G", 15, 0],
  [17, "FRA", "SEN", "I", 15, 0], [18, "IRQ", "NOR", "I", 18, 0],
  [19, "ARG", "ALG", "J", 21, 0], [20, "AUT", "JOR", "J", 0, 0],
  [21, "GHA", "PAN", "L", 19, 0], [22, "ENG", "CRO", "L", 16, 0],
  [23, "POR", "COD", "K", 13, 0], [24, "UZB", "COL", "K", 22, 0],
  [25, "CZE", "RSA", "A", 12, 0], [26, "SUI", "BIH", "B", 15, 0],
  [27, "CAN", "QAT", "B", 18, 0], [28, "MEX", "KOR", "A", 21, 0],
  [29, "BRA", "HAI", "C", 20, 30], [30, "SCO", "MAR", "C", 18, 0],
  [31, "TUR", "PAR", "D", 23, 0], [32, "USA", "AUS", "D", 15, 0],
  [33, "GER", "CIV", "E", 16, 0], [34, "ECU", "CUW", "E", 20, 0],
  [35, "NED", "SWE", "F", 13, 0], [36, "TUN", "JPN", "F", 0, 0],
  [37, "URU", "CPV", "H", 18, 0], [38, "ESP", "KSA", "H", 12, 0],
  [39, "BEL", "IRN", "G", 15, 0], [40, "NZL", "EGY", "G", 21, 0],
  [41, "NOR", "SEN", "I", 20, 0], [42, "FRA", "IRQ", "I", 17, 0],
  [43, "ARG", "AUT", "J", 13, 0], [44, "JOR", "ALG", "J", 23, 0],
  [45, "ENG", "GHA", "L", 16, 0], [46, "PAN", "CRO", "L", 19, 0],
  [47, "POR", "UZB", "K", 13, 0], [48, "COL", "COD", "K", 22, 0],
  [49, "SCO", "BRA", "C", 18, 0], [50, "MAR", "HAI", "C", 18, 0],
  [51, "SUI", "CAN", "B", 15, 0], [52, "BIH", "QAT", "B", 15, 0],
  [53, "CZE", "MEX", "A", 21, 0], [54, "RSA", "KOR", "A", 21, 0],
  [55, "CUW", "CIV", "E", 16, 0], [56, "ECU", "GER", "E", 16, 0],
  [57, "JPN", "SWE", "F", 19, 0], [58, "TUN", "NED", "F", 19, 0],
  [59, "TUR", "USA", "D", 22, 0], [60, "PAR", "AUS", "D", 22, 0],
  [61, "NOR", "FRA", "I", 15, 0], [62, "SEN", "IRQ", "I", 15, 0],
  [63, "EGY", "IRN", "G", 23, 0], [64, "NZL", "BEL", "G", 23, 0],
  [65, "CPV", "KSA", "H", 20, 0], [66, "URU", "ESP", "H", 20, 0],
  [67, "PAN", "ENG", "L", 17, 0], [68, "CRO", "GHA", "L", 17, 0],
  [69, "ALG", "AUT", "J", 22, 0], [70, "JOR", "ARG", "J", 22, 0],
  [71, "COL", "POR", "K", 19, 30], [72, "COD", "UZB", "K", 19, 30],
];

function groupMatchday(num: number): number {
  return num <= 24 ? 1 : num <= 48 ? 2 : 3;
}

function buildGroupMatches(): Match[] {
  return GROUP_FIXTURES.map(([num, home, away, group, hour, minute]) => {
    const dayOffset = Math.min(16, Math.floor((num - 1) / 4.5));
    const day = addDays("2026-06-11", dayOffset);
    // opening match in Mexico City; otherwise rotate venues
    const city = num === 1 ? CITIES.find((c) => c.id === "mex")! : CITIES[(num + 3) % CITIES.length];
    return {
      id: `G-${num}`,
      stage: "Grupos",
      group,
      round: groupMatchday(num),
      date: iso(day, hour, minute),
      cityId: city.id,
      homeCode: home,
      awayCode: away,
      status: "agendado",
      events: [],
    };
  });
}

// ── Knockout template (official 2026 bracket) ────────────────────────────────
export type SlotSource =
  | { type: "group"; rank: 1 | 2; group: string }
  | { type: "third"; groups: string[] } // best third from one of these groups
  | { type: "winner"; matchId: string }
  | { type: "loser"; matchId: string };

interface KoDef {
  id: string;
  stage: Stage;
  home: SlotSource;
  away: SlotSource;
  bracketSlot?: number;
}

const g = (rank: 1 | 2, group: string): SlotSource => ({ type: "group", rank, group });
const t = (groups: string): SlotSource => ({ type: "third", groups: groups.split("") });
const w = (matchId: string): SlotSource => ({ type: "winner", matchId });
const l = (matchId: string): SlotSource => ({ type: "loser", matchId });

// R32 ids ordered so the bracket tree pairs (R32-1,R32-2)→R16-1, etc. matching
// the official knockout draw.
export const KO_DEFS: KoDef[] = [
  { id: "R32-1", stage: "16-avos", home: g(1, "E"), away: t("ABCDF"), bracketSlot: 1 },
  { id: "R32-2", stage: "16-avos", home: g(1, "I"), away: t("CDFGH"), bracketSlot: 2 },
  { id: "R32-3", stage: "16-avos", home: g(2, "A"), away: g(2, "B"), bracketSlot: 3 },
  { id: "R32-4", stage: "16-avos", home: g(1, "F"), away: g(2, "C"), bracketSlot: 4 },
  { id: "R32-5", stage: "16-avos", home: g(1, "C"), away: g(2, "F"), bracketSlot: 5 },
  { id: "R32-6", stage: "16-avos", home: g(2, "E"), away: g(2, "I"), bracketSlot: 6 },
  { id: "R32-7", stage: "16-avos", home: g(1, "A"), away: t("CEFHI"), bracketSlot: 7 },
  { id: "R32-8", stage: "16-avos", home: g(1, "L"), away: t("EHIJK"), bracketSlot: 8 },
  { id: "R32-9", stage: "16-avos", home: g(2, "K"), away: g(2, "L"), bracketSlot: 9 },
  { id: "R32-10", stage: "16-avos", home: g(1, "H"), away: g(2, "J"), bracketSlot: 10 },
  { id: "R32-11", stage: "16-avos", home: g(1, "D"), away: t("BEFIJ"), bracketSlot: 11 },
  { id: "R32-12", stage: "16-avos", home: g(1, "G"), away: t("AEHIJ"), bracketSlot: 12 },
  { id: "R32-13", stage: "16-avos", home: g(1, "J"), away: g(2, "H"), bracketSlot: 13 },
  { id: "R32-14", stage: "16-avos", home: g(2, "D"), away: g(2, "G"), bracketSlot: 14 },
  { id: "R32-15", stage: "16-avos", home: g(1, "B"), away: t("EFGIJ"), bracketSlot: 15 },
  { id: "R32-16", stage: "16-avos", home: g(1, "K"), away: t("DEIJL"), bracketSlot: 16 },

  { id: "R16-1", stage: "Oitavas", home: w("R32-1"), away: w("R32-2") },
  { id: "R16-2", stage: "Oitavas", home: w("R32-3"), away: w("R32-4") },
  { id: "R16-3", stage: "Oitavas", home: w("R32-5"), away: w("R32-6") },
  { id: "R16-4", stage: "Oitavas", home: w("R32-7"), away: w("R32-8") },
  { id: "R16-5", stage: "Oitavas", home: w("R32-9"), away: w("R32-10") },
  { id: "R16-6", stage: "Oitavas", home: w("R32-11"), away: w("R32-12") },
  { id: "R16-7", stage: "Oitavas", home: w("R32-13"), away: w("R32-14") },
  { id: "R16-8", stage: "Oitavas", home: w("R32-15"), away: w("R32-16") },

  { id: "QF-1", stage: "Quartas", home: w("R16-1"), away: w("R16-2") },
  { id: "QF-2", stage: "Quartas", home: w("R16-3"), away: w("R16-4") },
  { id: "QF-3", stage: "Quartas", home: w("R16-5"), away: w("R16-6") },
  { id: "QF-4", stage: "Quartas", home: w("R16-7"), away: w("R16-8") },

  { id: "SF-1", stage: "Semifinal", home: w("QF-1"), away: w("QF-2") },
  { id: "SF-2", stage: "Semifinal", home: w("QF-3"), away: w("QF-4") },

  { id: "TP", stage: "Disputa de 3º", home: l("SF-1"), away: l("SF-2") },
  { id: "FINAL", stage: "Final", home: w("SF-1"), away: w("SF-2") },
];

export const KO_SOURCES: Record<string, { home: SlotSource; away: SlotSource }> =
  Object.fromEntries(KO_DEFS.map((d) => [d.id, { home: d.home, away: d.away }]));

// Ordered third-place slots for the greedy assignment of the 8 best thirds.
export interface ThirdSlot {
  matchId: string;
  side: "home" | "away";
  groups: string[];
}
export const THIRD_SLOTS: ThirdSlot[] = KO_DEFS.flatMap((d) => {
  const out: ThirdSlot[] = [];
  if (d.home.type === "third") out.push({ matchId: d.id, side: "home", groups: d.home.groups });
  if (d.away.type === "third") out.push({ matchId: d.id, side: "away", groups: d.away.groups });
  return out;
});

/** Greedily assign the qualified thirds (best-first) to the bracket's third slots. */
export function assignThirdSlots(
  qualified: { teamCode: string; group: string }[],
): Record<string, string> {
  const used = new Set<string>();
  const out: Record<string, string> = {};
  for (const slot of THIRD_SLOTS) {
    const pick =
      qualified.find((q) => !used.has(q.teamCode) && slot.groups.includes(q.group)) ??
      qualified.find((q) => !used.has(q.teamCode));
    if (pick) {
      used.add(pick.teamCode);
      out[`${slot.matchId}:${slot.side}`] = pick.teamCode;
    }
  }
  return out;
}

export function labelForSource(s: SlotSource): string {
  switch (s.type) {
    case "group":
      return `${s.rank}º Grupo ${s.group}`;
    case "third":
      return `Melhor 3º (${s.groups.join("/")})`;
    case "winner":
      return `Vencedor ${s.matchId}`;
    case "loser":
      return `Perdedor ${s.matchId}`;
  }
}

const KO_DATES: Record<Stage, string[]> = {
  Grupos: [],
  "16-avos": ["2026-06-28", "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03"],
  Oitavas: ["2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07"],
  Quartas: ["2026-07-09", "2026-07-10", "2026-07-11", "2026-07-11"],
  Semifinal: ["2026-07-14", "2026-07-15"],
  "Disputa de 3º": ["2026-07-18"],
  Final: ["2026-07-19"],
};

function buildKnockoutMatches(): Match[] {
  const stageCounter: Record<string, number> = {};
  let koCityIdx = 0;
  return KO_DEFS.map((d) => {
    const idx = (stageCounter[d.stage] = (stageCounter[d.stage] ?? 0) + 1) - 1;
    const dates = KO_DATES[d.stage];
    const day = dates[idx % dates.length];
    const hour = idx % 2 === 0 ? 19 : 16;
    const city =
      d.id === "FINAL"
        ? CITIES.find((c) => c.id === "nyc")!
        : CITIES[koCityIdx++ % CITIES.length];
    return {
      id: d.id,
      stage: d.stage,
      date: iso(day, hour, 0),
      cityId: city.id,
      homeLabel: labelForSource(d.home),
      awayLabel: labelForSource(d.away),
      status: "agendado" as const,
      events: [],
      bracketSlot: d.bracketSlot,
    };
  });
}

export const BASE_GROUP_MATCHES: Match[] = buildGroupMatches();
export const BASE_KO_MATCHES: Match[] = buildKnockoutMatches();
export const BASE_MATCHES: Match[] = [...BASE_GROUP_MATCHES, ...BASE_KO_MATCHES];
