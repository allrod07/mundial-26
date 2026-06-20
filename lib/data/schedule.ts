import type { Match, Stage } from "@/lib/types";
import { OFFICIAL_THIRD_TABLE, THIRD_COLUMN_ORDER } from "@/lib/data/thirdsAllocation";

// ── Demo clock ───────────────────────────────────────────────────────────────
// Pinned to the middle of the group stage so the platform is alive: finished
// matches feed real standings & scorers, a few are live, the rest upcoming.
export const NOW = new Date("2026-06-24T20:00:00Z");
export const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z");
export const TOURNAMENT_END = new Date("2026-07-19T19:00:00Z");

function iso(day: string, hour: number, minute: number): string {
  return `${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
}

// ── Calendário oficial da fase de grupos (Copa do Mundo FIFA 2026) ────────────
// [nº, mandante, visitante, grupo, data, hora, minuto, cidade]
// Datas, sedes e horários OFICIAIS, conforme o sorteio de 5/12/2025. O horário
// é o LOCAL da sede (24h), exibido como está. A fase de grupos vai de 11 a 27
// de junho; cada rodada ocupa dias próprios e, na 3ª rodada, os dois jogos de
// cada grupo são simultâneos. `cidade` referencia os ids de lib/data/cities.ts.
type Fixture = [number, string, string, string, string, number, number, string];

const GROUP_FIXTURES: Fixture[] = [
  // ── Rodada 1 (11–17 jun) ──
  [1, "MEX", "RSA", "A", "2026-06-11", 13, 0, "mex"],
  [2, "KOR", "CZE", "A", "2026-06-11", 20, 0, "gdl"],
  [3, "CAN", "BIH", "B", "2026-06-12", 15, 0, "tor"],
  [4, "USA", "PAR", "D", "2026-06-12", 18, 0, "la"],
  [5, "HAI", "SCO", "C", "2026-06-13", 21, 0, "bos"],
  [6, "AUS", "TUR", "D", "2026-06-13", 21, 0, "van"],
  [7, "BRA", "MAR", "C", "2026-06-13", 18, 0, "nyc"],
  [8, "QAT", "SUI", "B", "2026-06-13", 12, 0, "sf"],
  [9, "CIV", "ECU", "E", "2026-06-14", 19, 0, "phi"],
  [10, "GER", "CUW", "E", "2026-06-14", 12, 0, "hou"],
  [11, "NED", "JPN", "F", "2026-06-14", 15, 0, "dal"],
  [12, "SWE", "TUN", "F", "2026-06-14", 20, 0, "mty"],
  [13, "KSA", "URU", "H", "2026-06-15", 18, 0, "mia"],
  [14, "ESP", "CPV", "H", "2026-06-15", 12, 0, "atl"],
  [15, "IRN", "NZL", "G", "2026-06-15", 18, 0, "la"],
  [16, "BEL", "EGY", "G", "2026-06-15", 12, 0, "sea"],
  [17, "FRA", "SEN", "I", "2026-06-16", 15, 0, "nyc"],
  [18, "IRQ", "NOR", "I", "2026-06-16", 18, 0, "bos"],
  [19, "ARG", "ALG", "J", "2026-06-16", 20, 0, "kc"],
  [20, "AUT", "JOR", "J", "2026-06-16", 21, 0, "sf"],
  [21, "GHA", "PAN", "L", "2026-06-17", 19, 0, "tor"],
  [22, "ENG", "CRO", "L", "2026-06-17", 15, 0, "dal"],
  [23, "POR", "COD", "K", "2026-06-17", 12, 0, "hou"],
  [24, "UZB", "COL", "K", "2026-06-17", 20, 0, "mex"],
  // ── Rodada 2 (18–23 jun) ──
  [25, "CZE", "RSA", "A", "2026-06-18", 12, 0, "atl"],
  [26, "SUI", "BIH", "B", "2026-06-18", 12, 0, "la"],
  [27, "CAN", "QAT", "B", "2026-06-18", 15, 0, "van"],
  [28, "MEX", "KOR", "A", "2026-06-18", 21, 0, "gdl"],
  [29, "BRA", "HAI", "C", "2026-06-19", 20, 30, "phi"],
  [30, "SCO", "MAR", "C", "2026-06-19", 18, 0, "bos"],
  [31, "TUR", "PAR", "D", "2026-06-19", 20, 0, "sf"],
  [32, "USA", "AUS", "D", "2026-06-19", 12, 0, "sea"],
  [33, "GER", "CIV", "E", "2026-06-20", 16, 0, "tor"],
  [34, "ECU", "CUW", "E", "2026-06-20", 19, 0, "kc"],
  [35, "NED", "SWE", "F", "2026-06-20", 12, 0, "hou"],
  [36, "TUN", "JPN", "F", "2026-06-20", 22, 0, "mty"],
  [37, "URU", "CPV", "H", "2026-06-21", 18, 0, "mia"],
  [38, "ESP", "KSA", "H", "2026-06-21", 12, 0, "atl"],
  [39, "BEL", "IRN", "G", "2026-06-21", 12, 0, "la"],
  [40, "NZL", "EGY", "G", "2026-06-21", 18, 0, "van"],
  [41, "NOR", "SEN", "I", "2026-06-22", 20, 0, "nyc"],
  [42, "FRA", "IRQ", "I", "2026-06-22", 17, 0, "phi"],
  [43, "ARG", "AUT", "J", "2026-06-22", 12, 0, "dal"],
  [44, "JOR", "ALG", "J", "2026-06-22", 20, 0, "sf"],
  [45, "ENG", "GHA", "L", "2026-06-23", 16, 0, "bos"],
  [46, "PAN", "CRO", "L", "2026-06-23", 19, 0, "tor"],
  [47, "POR", "UZB", "K", "2026-06-23", 12, 0, "hou"],
  [48, "COL", "COD", "K", "2026-06-23", 20, 0, "gdl"],
  // ── Rodada 3 (24–27 jun) — jogos simultâneos por grupo ──
  [49, "SCO", "BRA", "C", "2026-06-24", 18, 0, "mia"],
  [50, "MAR", "HAI", "C", "2026-06-24", 18, 0, "atl"],
  [51, "SUI", "CAN", "B", "2026-06-24", 12, 0, "van"],
  [52, "BIH", "QAT", "B", "2026-06-24", 12, 0, "sea"],
  [53, "CZE", "MEX", "A", "2026-06-24", 19, 0, "mex"],
  [54, "RSA", "KOR", "A", "2026-06-24", 19, 0, "mty"],
  [55, "CUW", "CIV", "E", "2026-06-25", 16, 0, "phi"],
  [56, "ECU", "GER", "E", "2026-06-25", 16, 0, "nyc"],
  [57, "JPN", "SWE", "F", "2026-06-25", 18, 0, "dal"],
  [58, "TUN", "NED", "F", "2026-06-25", 18, 0, "kc"],
  [59, "TUR", "USA", "D", "2026-06-25", 19, 0, "la"],
  [60, "PAR", "AUS", "D", "2026-06-25", 19, 0, "sf"],
  [61, "NOR", "FRA", "I", "2026-06-26", 15, 0, "bos"],
  [62, "SEN", "IRQ", "I", "2026-06-26", 15, 0, "tor"],
  [63, "EGY", "IRN", "G", "2026-06-26", 20, 0, "sea"],
  [64, "NZL", "BEL", "G", "2026-06-26", 20, 0, "van"],
  [65, "CPV", "KSA", "H", "2026-06-26", 19, 0, "hou"],
  [66, "URU", "ESP", "H", "2026-06-26", 18, 0, "gdl"],
  [67, "PAN", "ENG", "L", "2026-06-27", 17, 0, "nyc"],
  [68, "CRO", "GHA", "L", "2026-06-27", 17, 0, "phi"],
  [69, "ALG", "AUT", "J", "2026-06-27", 21, 0, "kc"],
  [70, "JOR", "ARG", "J", "2026-06-27", 21, 0, "dal"],
  [71, "COL", "POR", "K", "2026-06-27", 19, 30, "mia"],
  [72, "COD", "UZB", "K", "2026-06-27", 19, 30, "atl"],
];

function groupMatchday(num: number): number {
  return num <= 24 ? 1 : num <= 48 ? 2 : 3;
}

function buildGroupMatches(): Match[] {
  return GROUP_FIXTURES.map(([num, home, away, group, date, hour, minute, cityId]) => ({
    id: `G-${num}`,
    stage: "Grupos" as const,
    matchNo: num,
    group,
    round: groupMatchday(num),
    date: iso(date, hour, minute),
    cityId,
    homeCode: home,
    awayCode: away,
    status: "agendado" as const,
    events: [],
  }));
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

  // Cruzamento OFICIAL das metades do chaveamento (jogos 101 e 102): a SF1 junta
  // os vencedores das quartas 97 (QF-1) e 98 (QF-3); a SF2, das quartas 99 (QF-2)
  // e 100 (QF-4). Ver KO_SCHEDULE para o nº oficial de cada partida.
  { id: "SF-1", stage: "Semifinal", home: w("QF-1"), away: w("QF-3") },
  { id: "SF-2", stage: "Semifinal", home: w("QF-2"), away: w("QF-4") },

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

/**
 * Allocate the qualified third-placed teams to their round-of-32 slots.
 *
 * Quando há exatamente os 8 terceiros classificados (cenário definitivo), usa a
 * TABELA OFICIAL da FIFA (495 combinações) — a alocação depende apenas de QUAIS
 * 8 grupos avançam, não do ranking. No cenário provisório/incompleto (menos de
 * 8 terceiros conhecidos), cai para uma atribuição gulosa aproximada.
 */
export function assignThirdSlots(
  qualified: { teamCode: string; group: string }[],
): Record<string, string> {
  if (qualified.length === 8) {
    const groups = qualified.map((q) => q.group);
    if (new Set(groups).size === 8) {
      const key = [...groups].sort().join("");
      const row = OFFICIAL_THIRD_TABLE[key];
      if (row) {
        const teamByGroup: Record<string, string> = {};
        for (const q of qualified) teamByGroup[q.group] = q.teamCode;
        const out: Record<string, string> = {};
        for (let i = 0; i < THIRD_COLUMN_ORDER.length; i++) {
          const team = teamByGroup[row[i]];
          if (team) out[THIRD_COL_TO_SLOT[THIRD_COLUMN_ORDER[i]]] = team;
        }
        return out;
      }
    }
  }
  return greedyThirdSlots(qualified);
}

/** Coluna da tabela oficial (1º colocado anfitrião) → vaga (matchId:side). */
const THIRD_COL_TO_SLOT: Record<string, string> = {
  "1A": "R32-7:away",
  "1B": "R32-15:away",
  "1D": "R32-11:away",
  "1E": "R32-1:away",
  "1G": "R32-12:away",
  "1I": "R32-2:away",
  "1K": "R32-16:away",
  "1L": "R32-8:away",
};

/** Fallback guloso — só para cenários incompletos (chaveamento provisório). */
function greedyThirdSlots(
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

// ── Cronograma OFICIAL do mata-mata (FIFA World Cup 2026, schedule v17) ────────
// Cada confronto do bracket (KO_DEFS) recebe o nº oficial da partida, a sede e o
// horário. A tabela oficial publica TODOS os horários em ET (Eastern Time); aqui
// já estão convertidos para o horário LOCAL de cada sede — mesma convenção da
// fase de grupos. A conversão ET → local subtrai o offset da sede (Pacífico −3,
// México −2, Central −1, Leste 0); o app converte para Brasília via fmtKickoff
// (BRT = local + BRT_DELTA, ou seja, sempre ET+1).
interface KoSchedule {
  matchNo: number;
  date: string; // YYYY-MM-DD
  hour: number; // horário LOCAL da sede (24h)
  minute: number;
  cityId: string;
}

const KO_SCHEDULE: Record<string, KoSchedule> = {
  // 16-avos (Round of 32) — 28/jun a 3/jul
  "R32-1": { matchNo: 74, date: "2026-06-29", hour: 16, minute: 30, cityId: "bos" },
  "R32-2": { matchNo: 77, date: "2026-06-30", hour: 17, minute: 0, cityId: "nyc" },
  "R32-3": { matchNo: 73, date: "2026-06-28", hour: 12, minute: 0, cityId: "la" },
  "R32-4": { matchNo: 75, date: "2026-06-29", hour: 19, minute: 0, cityId: "mty" },
  "R32-5": { matchNo: 76, date: "2026-06-29", hour: 12, minute: 0, cityId: "hou" },
  "R32-6": { matchNo: 78, date: "2026-06-30", hour: 12, minute: 0, cityId: "dal" },
  "R32-7": { matchNo: 79, date: "2026-06-30", hour: 19, minute: 0, cityId: "mex" },
  "R32-8": { matchNo: 80, date: "2026-07-01", hour: 12, minute: 0, cityId: "atl" },
  "R32-9": { matchNo: 83, date: "2026-07-02", hour: 19, minute: 0, cityId: "tor" },
  "R32-10": { matchNo: 84, date: "2026-07-02", hour: 12, minute: 0, cityId: "la" },
  "R32-11": { matchNo: 81, date: "2026-07-01", hour: 17, minute: 0, cityId: "sf" },
  "R32-12": { matchNo: 82, date: "2026-07-01", hour: 13, minute: 0, cityId: "sea" },
  "R32-13": { matchNo: 86, date: "2026-07-03", hour: 18, minute: 0, cityId: "mia" },
  "R32-14": { matchNo: 88, date: "2026-07-03", hour: 13, minute: 0, cityId: "dal" },
  "R32-15": { matchNo: 85, date: "2026-07-02", hour: 20, minute: 0, cityId: "van" },
  "R32-16": { matchNo: 87, date: "2026-07-03", hour: 20, minute: 30, cityId: "kc" },
  // Oitavas (Round of 16) — 4 a 7/jul
  "R16-1": { matchNo: 89, date: "2026-07-04", hour: 17, minute: 0, cityId: "phi" },
  "R16-2": { matchNo: 90, date: "2026-07-04", hour: 12, minute: 0, cityId: "hou" },
  "R16-3": { matchNo: 91, date: "2026-07-05", hour: 16, minute: 0, cityId: "nyc" },
  "R16-4": { matchNo: 92, date: "2026-07-05", hour: 18, minute: 0, cityId: "mex" },
  "R16-5": { matchNo: 93, date: "2026-07-06", hour: 14, minute: 0, cityId: "dal" },
  "R16-6": { matchNo: 94, date: "2026-07-06", hour: 17, minute: 0, cityId: "sea" },
  "R16-7": { matchNo: 95, date: "2026-07-07", hour: 12, minute: 0, cityId: "atl" },
  "R16-8": { matchNo: 96, date: "2026-07-07", hour: 13, minute: 0, cityId: "van" },
  // Quartas de final — 9 a 11/jul
  "QF-1": { matchNo: 97, date: "2026-07-09", hour: 16, minute: 0, cityId: "bos" },
  "QF-2": { matchNo: 99, date: "2026-07-11", hour: 17, minute: 0, cityId: "mia" },
  "QF-3": { matchNo: 98, date: "2026-07-10", hour: 12, minute: 0, cityId: "la" },
  "QF-4": { matchNo: 100, date: "2026-07-11", hour: 20, minute: 0, cityId: "kc" },
  // Semifinais — 14 e 15/jul
  "SF-1": { matchNo: 101, date: "2026-07-14", hour: 14, minute: 0, cityId: "dal" },
  "SF-2": { matchNo: 102, date: "2026-07-15", hour: 15, minute: 0, cityId: "atl" },
  // Disputa de 3º lugar — 18/jul
  TP: { matchNo: 103, date: "2026-07-18", hour: 17, minute: 0, cityId: "mia" },
  // Final — 19/jul
  FINAL: { matchNo: 104, date: "2026-07-19", hour: 15, minute: 0, cityId: "nyc" },
};

function buildKnockoutMatches(): Match[] {
  return KO_DEFS.map((d) => {
    const s = KO_SCHEDULE[d.id];
    return {
      id: d.id,
      stage: d.stage,
      matchNo: s.matchNo,
      date: iso(s.date, s.hour, s.minute),
      cityId: s.cityId,
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
