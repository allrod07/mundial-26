import type {
  Match,
  MatchEvent,
  MatchResultMap,
  ScorerRow,
  StandingRow,
  ThirdPlaceRow,
} from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { getSquad } from "@/lib/data/squads";
import {
  BASE_MATCHES,
  BASE_GROUP_MATCHES,
  KO_DEFS,
  KO_SOURCES,
  NOW,
  assignThirdSlots,
  type SlotSource,
} from "@/lib/data/schedule";
import {
  simulateScore,
  generateEvents,
  winnerOf,
  loserOf,
  type SimScore,
} from "@/lib/engine/simulate";
import {
  computeGroupStandings,
  rankThirds,
  isGroupStageComplete,
} from "@/lib/engine/standings";
import { kickoffEpoch } from "@/lib/format";

const LIVE_MS = 115 * 60 * 1000;

export interface ResolvedTournament {
  matches: Match[];
  matchMap: Record<string, Match>;
  standings: Record<string, StandingRow[]>;
  thirds: ThirdPlaceRow[];
  scorers: ScorerRow[];
  groupComplete: boolean;
  /** group letter -> all matches in that group are finished */
  groupDone: Record<string, boolean>;
}

function ratingOf(code?: string): number {
  return code ? TEAM_MAP[code]?.rating ?? 70 : 70;
}

function scoreToResult(s: SimScore) {
  return {
    homeGoals: s.homeGoals,
    awayGoals: s.awayGoals,
    homePens: s.homePens,
    awayPens: s.awayPens,
  };
}

function fillEvents(m: Match, full = true): MatchEvent[] {
  if (m.homeGoals == null || m.awayGoals == null || !m.homeCode || !m.awayCode) return [];
  return generateEvents(
    m.homeCode,
    m.awayCode,
    getSquad(m.homeCode),
    getSquad(m.awayCode),
    { homeGoals: m.homeGoals, awayGoals: m.awayGoals },
    `${m.id}-${m.homeGoals}-${m.awayGoals}`,
  );
}

/**
 * Eventos de uma partida com resultado. Usa os eventos REAIS informados
 * (`provided`, ex.: gols digitados no /admin) quando existirem; só fabrica
 * autores quando `fabricateEvents` está ligado (ex.: simulador). Em modo ao
 * vivo, gols sem autor informado simplesmente não viram artilheiro.
 */
function eventsFor(
  m: Match,
  provided: Record<string, MatchEvent[]> | undefined,
  fabricateEvents: boolean,
): MatchEvent[] {
  const e = provided?.[m.id];
  if (e) return e;
  return fabricateEvents ? fillEvents(m) : [];
}

function resolveGroupMatch(
  m: Match,
  overrides: MatchResultMap,
  fabricate: boolean,
  providedEvents: Record<string, MatchEvent[]> | undefined,
  fabricateEvents: boolean,
) {
  // Instante REAL do pontapé (considera o fuso da sede), igual ao usado pela
  // trava de apostas (matchLockEpoch) e pela contagem regressiva da home. Antes
  // usávamos `new Date(m.date)` cru — o horário guardado é LOCAL da sede, então
  // comparar direto com NOW marcava o jogo como ao vivo/encerrado horas adiantado
  // (4h no Leste, até 7h no Pacífico), fechando o palpite do bolão cedo demais.
  const kickoff = kickoffEpoch(m.date, m.cityId);
  const now = NOW.getTime();
  const ov = overrides[m.id];

  if (ov) {
    m.homeGoals = ov.homeGoals;
    m.awayGoals = ov.awayGoals;
    m.status = "encerrado";
    m.events = eventsFor(m, providedEvents, fabricateEvents);
    return;
  }

  // live mode: only real (override) results count — no demo-clock fabrication
  if (!fabricate) {
    m.status = "agendado";
    return;
  }

  if (kickoff + LIVE_MS <= now) {
    const host = TEAM_MAP[m.homeCode!]?.host;
    const s = simulateScore(ratingOf(m.homeCode), ratingOf(m.awayCode), m.id, {
      homeAdvantage: host ? 0.32 : 0.18,
    });
    m.homeGoals = s.homeGoals;
    m.awayGoals = s.awayGoals;
    m.status = "encerrado";
    m.events = eventsFor(m, providedEvents, fabricateEvents);
    return;
  }

  if (kickoff <= now && now < kickoff + LIVE_MS) {
    // live — compute the full match then reveal only what's happened so far
    const s = simulateScore(ratingOf(m.homeCode), ratingOf(m.awayCode), m.id);
    const full = generateEvents(
      m.homeCode!,
      m.awayCode!,
      getSquad(m.homeCode!),
      getSquad(m.awayCode!),
      s,
      `${m.id}-${s.homeGoals}-${s.awayGoals}`,
    );
    const minute = Math.max(1, Math.min(90, Math.round((now - kickoff) / 60000)));
    const shown = full.filter((e) => e.minute <= minute);
    m.events = shown;
    m.homeGoals = shown.filter((e) => (e.type === "gol" || e.type === "penalti") && e.teamCode === m.homeCode).length;
    m.awayGoals = shown.filter((e) => (e.type === "gol" || e.type === "penalti") && e.teamCode === m.awayCode).length;
    m.status = "ao-vivo";
    m.minute = minute;
    return;
  }

  // future
  m.status = "agendado";
}

interface SourceCtx {
  standings: Record<string, StandingRow[]>;
  thirdAssignment: Record<string, string>;
  provThirdAssignment: Record<string, string>;
  groupDone: Record<string, boolean>;
  groupHasPlayed: Record<string, boolean>;
  matchMap: Record<string, Match>;
  provisional: boolean;
}

interface ResolvedSlot {
  code?: string;
  prov: boolean;
}

/**
 * Resolve a bracket slot to a team. With `provisional` enabled, reveals the
 * CURRENT leaders/best-thirds even before a group/phase is mathematically
 * decided, flagging them as provisional so the UI can mark them as "ao vivo".
 */
function resolveSource(s: SlotSource, side: "home" | "away", matchId: string, ctx: SourceCtx): ResolvedSlot {
  switch (s.type) {
    case "group": {
      if (ctx.groupDone[s.group]) return { code: ctx.standings[s.group][s.rank - 1]?.teamCode, prov: false };
      if (ctx.provisional && ctx.groupHasPlayed[s.group])
        return { code: ctx.standings[s.group][s.rank - 1]?.teamCode, prov: true };
      return { code: undefined, prov: false };
    }
    case "third": {
      const def = ctx.thirdAssignment[`${matchId}:${side}`];
      if (def) return { code: def, prov: false };
      if (ctx.provisional) {
        const p = ctx.provThirdAssignment[`${matchId}:${side}`];
        if (p) return { code: p, prov: true };
      }
      return { code: undefined, prov: false };
    }
    case "winner": {
      const fm = ctx.matchMap[s.matchId];
      if (!fm || fm.status !== "encerrado") return { code: undefined, prov: false };
      const code = winnerOf(fm) ?? undefined;
      const prov = code === fm.homeCode ? !!fm.homeProvisional : code === fm.awayCode ? !!fm.awayProvisional : false;
      return { code, prov };
    }
    case "loser": {
      const fm = ctx.matchMap[s.matchId];
      if (!fm || fm.status !== "encerrado") return { code: undefined, prov: false };
      const code = loserOf(fm) ?? undefined;
      const prov = code === fm.homeCode ? !!fm.homeProvisional : code === fm.awayCode ? !!fm.awayProvisional : false;
      return { code, prov };
    }
  }
}

function resolveKoResult(
  m: Match,
  overrides: MatchResultMap,
  providedEvents: Record<string, MatchEvent[]> | undefined,
  fabricateEvents: boolean,
) {
  const ov = overrides[m.id];
  if (!ov || !m.homeCode || !m.awayCode) return;
  m.homeGoals = ov.homeGoals;
  m.awayGoals = ov.awayGoals;
  if (m.homeGoals === m.awayGoals) {
    if (ov.homePens != null && ov.awayPens != null) {
      m.homePens = ov.homePens;
      m.awayPens = ov.awayPens;
    } else {
      // derive a shootout deterministically
      const s = simulateScore(ratingOf(m.homeCode), ratingOf(m.awayCode), `pen-${m.id}`, { knockout: true });
      m.homePens = s.homePens;
      m.awayPens = s.awayPens;
    }
  }
  m.status = "encerrado";
  m.events = eventsFor(m, providedEvents, fabricateEvents);
}

export function buildTournament(
  overrides: MatchResultMap = {},
  opts: {
    fabricate?: boolean;
    events?: Record<string, MatchEvent[]>;
    fabricateEvents?: boolean;
    /** reveal current leaders/best-thirds before groups finish (live bracket) */
    provisional?: boolean;
  } = {},
): ResolvedTournament {
  const fabricate = opts.fabricate ?? false;
  const providedEvents = opts.events;
  const fabricateEvents = opts.fabricateEvents ?? fabricate;
  const provisional = opts.provisional ?? false;
  const matches: Match[] = BASE_MATCHES.map((m) => ({ ...m, events: [] }));
  const matchMap: Record<string, Match> = Object.fromEntries(matches.map((m) => [m.id, m]));

  for (const m of matches) {
    if (m.stage === "Grupos") resolveGroupMatch(m, overrides, fabricate, providedEvents, fabricateEvents);
  }

  const standings = computeGroupStandings(matches);
  const thirds = rankThirds(standings);
  const thirdsQualified = thirds.filter((t) => t.qualified);
  const groupComplete = isGroupStageComplete(matches);
  const groupDone: Record<string, boolean> = {};
  const groupHasPlayed: Record<string, boolean> = {};
  for (const g of Object.keys(standings)) {
    const gm = matches.filter((m) => m.group === g);
    groupDone[g] = gm.every((m) => m.status === "encerrado");
    groupHasPlayed[g] = gm.some((m) => m.status === "encerrado");
  }

  const thirdAssignment = groupComplete
    ? assignThirdSlots(thirdsQualified.map((r) => ({ teamCode: r.teamCode, group: r.group })))
    : {};

  // provisional best-thirds: rank only the thirds whose group has already
  // started, then assign the current top 8 to bracket slots (may shift live).
  const provThirdAssignment =
    provisional && !groupComplete
      ? assignThirdSlots(
          thirds
            .filter((r) => groupHasPlayed[r.group])
            .slice(0, 8)
            .map((r) => ({ teamCode: r.teamCode, group: r.group })),
        )
      : {};

  const ctx: SourceCtx = {
    standings,
    thirdAssignment,
    provThirdAssignment,
    groupDone,
    groupHasPlayed,
    matchMap,
    provisional,
  };

  // knockout — KO_DEFS is topologically ordered (feeders before consumers)
  for (const def of KO_DEFS) {
    const m = matchMap[def.id];
    const src = KO_SOURCES[def.id];
    const h = resolveSource(src.home, "home", def.id, ctx);
    const a = resolveSource(src.away, "away", def.id, ctx);
    m.homeCode = h.code;
    m.awayCode = a.code;
    m.homeProvisional = h.prov || undefined;
    m.awayProvisional = a.prov || undefined;
    resolveKoResult(m, overrides, providedEvents, fabricateEvents);
  }

  const scorers = aggregateScorers(matches);

  return { matches, matchMap, standings, thirds, scorers, groupComplete, groupDone };
}

function aggregateScorers(matches: Match[]): ScorerRow[] {
  const map = new Map<string, ScorerRow>();
  const teamPlayed = new Map<string, number>();

  for (const m of matches) {
    if (m.status === "encerrado") {
      if (m.homeCode) teamPlayed.set(m.homeCode, (teamPlayed.get(m.homeCode) ?? 0) + 1);
      if (m.awayCode) teamPlayed.set(m.awayCode, (teamPlayed.get(m.awayCode) ?? 0) + 1);
    }
    for (const e of m.events) {
      if (e.type === "gol" || e.type === "penalti") {
        const row = ensure(map, e.playerId, e.teamCode);
        row.goals++;
        if (e.type === "penalti") row.penalties++;
        if (e.assistPlayerId) ensure(map, e.assistPlayerId, e.teamCode).assists++;
      }
    }
  }
  const rows = [...map.values()];
  for (const r of rows) r.matches = teamPlayed.get(r.teamCode) ?? 0;
  rows.sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.matches - b.matches);
  return rows;
}

function ensure(map: Map<string, ScorerRow>, playerId: string, teamCode: string): ScorerRow {
  let r = map.get(playerId);
  if (!r) {
    r = { playerId, teamCode, goals: 0, assists: 0, penalties: 0, matches: 0 };
    map.set(playerId, r);
  }
  return r;
}

// ── Full auto-simulation (used by the simulator's "Simular tudo") ─────────────
function winnerLoser(home: string | undefined, away: string | undefined, res: SimScore) {
  let winner: string | undefined;
  let loser: string | undefined;
  if (res.homeGoals > res.awayGoals) [winner, loser] = [home, away];
  else if (res.awayGoals > res.homeGoals) [winner, loser] = [away, home];
  else if ((res.homePens ?? 0) > (res.awayPens ?? 0)) [winner, loser] = [home, away];
  else [winner, loser] = [away, home];
  return { winner, loser };
}

/** Returns a complete result map that plays out every remaining match. */
export function simulateRemainder(overrides: MatchResultMap = {}): MatchResultMap {
  const ov: MatchResultMap = { ...overrides };

  // groups: simulate every match the user hasn't already filled in by hand
  for (const m of BASE_GROUP_MATCHES) {
    if (ov[m.id]) continue;
    ov[m.id] = scoreToResult(
      simulateScore(ratingOf(m.homeCode), ratingOf(m.awayCode), `sim-${m.id}`),
    );
  }

  // standings after groups
  const t = buildTournament(ov);
  const thirdsQualified = t.thirds.filter((x) => x.qualified);
  const thirdAssignment = assignThirdSlots(
    thirdsQualified.map((r) => ({ teamCode: r.teamCode, group: r.group })),
  );

  const winnerByMatch: Record<string, string | undefined> = {};
  const loserByMatch: Record<string, string | undefined> = {};

  const resolve = (s: SlotSource, side: "home" | "away", matchId: string): string | undefined => {
    switch (s.type) {
      case "group":
        return t.standings[s.group][s.rank - 1]?.teamCode;
      case "third":
        return thirdAssignment[`${matchId}:${side}`];
      case "winner":
        return winnerByMatch[s.matchId];
      case "loser":
        return loserByMatch[s.matchId];
    }
  };

  for (const def of KO_DEFS) {
    const home = resolve(def.home, "home", def.id);
    const away = resolve(def.away, "away", def.id);
    let res = ov[def.id] as SimScore | undefined;
    if (!res) {
      res = simulateScore(ratingOf(home), ratingOf(away), `sim-${def.id}`, { knockout: true });
      ov[def.id] = scoreToResult(res);
    }
    const wl = winnerLoser(home, away, res);
    winnerByMatch[def.id] = wl.winner;
    loserByMatch[def.id] = wl.loser;
  }

  return ov;
}

/** The default, demo-clock tournament with no user overrides. */
export const BASE_TOURNAMENT = buildTournament();
