import type { Match } from "@/lib/types";
import type { ResolvedTournament } from "@/lib/engine/tournament";
import { winnerOf, loserOf } from "@/lib/engine/simulate";
import { TEAM_MAP } from "@/lib/data/teams";
import { BASE_MATCHES } from "@/lib/data/schedule";
import { kickoffEpoch } from "@/lib/format";

// ── Bolão da Família — motor de pontuação ─────────────────────────────────────
// Tudo é calculado contra os RESULTADOS REAIS (árvore `tournament`, nunca o
// simulador). As regras privilegiam a campanha do Brasil para equilibrar quem
// entende muito e quem entende pouco de futebol.

export const BRAZIL = "BRA";

export type GroupFinish = "1" | "2" | "3q" | "out";
export type BrazilStage = "grupos" | "r32" | "r16" | "qf" | "sf" | "vice" | "campeao";

export const GROUP_FINISH_OPTIONS: { value: GroupFinish; label: string }[] = [
  { value: "1", label: "1º lugar do grupo" },
  { value: "2", label: "2º lugar do grupo" },
  { value: "3q", label: "3º lugar (classificado entre os melhores 3os)" },
  { value: "out", label: "Eliminado na fase de grupos" },
];
export const GROUP_FINISH_LABEL: Record<GroupFinish, string> = {
  "1": "1º lugar", "2": "2º lugar", "3q": "3º (classificado)", out: "Eliminado",
};

export const STAGE_OPTIONS: { value: BrazilStage; label: string; short: string }[] = [
  { value: "grupos", label: "Eliminado na fase de grupos", short: "Fase de grupos" },
  { value: "r32", label: "16-avos de final", short: "16-avos" },
  { value: "r16", label: "Oitavas de final", short: "Oitavas" },
  { value: "qf", label: "Quartas de final", short: "Quartas" },
  { value: "sf", label: "Semifinal", short: "Semifinal" },
  { value: "vice", label: "Vice-campeão", short: "Vice" },
  { value: "campeao", label: "Campeão", short: "Campeão" },
];
export const STAGE_LABEL = Object.fromEntries(STAGE_OPTIONS.map((o) => [o.value, o.short])) as Record<BrazilStage, string>;

const STAGE_FROM_KO: Record<string, BrazilStage> = {
  "16-avos": "r32",
  Oitavas: "r16",
  Quartas: "qf",
  Semifinal: "sf",
};

// ── Travas das apostas (1h antes de cada jogo do Brasil) ─────────────────────
export const LOCK_MS = 60 * 60 * 1000;
const MATCH_BY_ID = new Map(BASE_MATCHES.map((m) => [m.id, m]));

/** Instante (epoch ms) em que o palpite de um jogo trava: 1h antes do pontapé. */
export function matchLockEpoch(matchId: string): number | null {
  const m = MATCH_BY_ID.get(matchId);
  return m ? kickoffEpoch(m.date, m.cityId) - LOCK_MS : null;
}

/** Trava das apostas pré-Copa (campeão, fase, grupo): 1h antes do 1º jogo do Brasil. */
export const GLOBAL_LOCK_EPOCH: number | null = (() => {
  const firsts = BASE_MATCHES
    .filter((m) => m.homeCode === BRAZIL || m.awayCode === BRAZIL)
    .map((m) => kickoffEpoch(m.date, m.cityId))
    .sort((a, b) => a - b);
  return firsts.length ? firsts[0] - LOCK_MS : null;
})();

export function isLocked(epoch: number | null, now: number = Date.now()): boolean {
  return epoch != null && now >= epoch;
}

// ── Tipos de dados (vêm do Supabase via /api/pool) ───────────────────────────
export interface PoolParticipant {
  id: string;
  name: string;
  emoji?: string | null;
  paid: boolean;
}
export interface PoolPrediction {
  participantId: string;
  /** Palpite único da campanha: o usuário acha que o Brasil vai ser campeão?
   * true = aposta no título (vale +15 se acertar); false = aposta que NÃO
   * será campeão (vale +5 se acertar); null = ainda não palpitou. */
  brazilChampion?: boolean | null;
}
export interface PoolData {
  participants: PoolParticipant[];
  predictions: Record<string, PoolPrediction>;
  matchPredictions: Record<string, Record<string, { homeGoals: number; awayGoals: number }>>;
}

// ── Fatos reais da campanha do Brasil ────────────────────────────────────────
export interface BrazilFacts {
  group: string;
  matches: Match[]; // todos os jogos do Brasil já definidos, em ordem cronológica
  groupComplete: boolean; // o grupo do Brasil terminou
  allGroupsComplete: boolean; // toda a fase de grupos terminou (define melhor 3º)
  groupRank?: number;
  groupPoints?: number;
  advanced: boolean;
  eliminatedInGroups: boolean;
  actualGroupFinish?: GroupFinish; // 1 | 2 | 3q | out, quando já resolvido
  stageReached?: BrazilStage;
  champion?: string;
  vice?: string;
  lastGroupDate?: number;
  stageResolvedDate?: number;
  finalDate?: number;
}

export function brazilFacts(t: ResolvedTournament): BrazilFacts {
  const group = TEAM_MAP[BRAZIL]?.group ?? "C";
  const matches = t.matches
    .filter((m) => m.homeCode === BRAZIL || m.awayCode === BRAZIL)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const rows = t.standings[group] ?? [];
  const braRow = rows.find((r) => r.teamCode === BRAZIL);
  const groupComplete = t.groupDone[group] ?? false;
  const allGroupsComplete = t.groupComplete;
  // O Brasil avançou se aparece em algum jogo de mata-mata (só resolve quando
  // toda a fase de grupos termina e os melhores 3os são definidos).
  const advanced = t.matches.some((m) => m.stage !== "Grupos" && (m.homeCode === BRAZIL || m.awayCode === BRAZIL));
  const eliminatedInGroups = allGroupsComplete && !advanced;

  // Colocação real no grupo: 1º/2º assim que o grupo do Brasil termina; para 3º,
  // só dá para saber se classificou (melhor 3º) ou não quando TODA a fase acaba.
  let actualGroupFinish: GroupFinish | undefined;
  if (groupComplete && braRow) {
    if (braRow.rank === 1) actualGroupFinish = "1";
    else if (braRow.rank === 2) actualGroupFinish = "2";
    else if (braRow.rank >= 4) actualGroupFinish = "out";
    else if (allGroupsComplete) actualGroupFinish = advanced ? "3q" : "out";
  }

  const groupMatches = matches.filter((m) => m.stage === "Grupos");
  const lastGroupDate = groupMatches.length ? Math.max(...groupMatches.map((m) => +new Date(m.date))) : undefined;

  const final = t.matchMap["FINAL"];
  const finalDone = final?.status === "encerrado";
  const finalDate = finalDone ? +new Date(final.date) : undefined;
  const champion = finalDone ? winnerOf(final) ?? undefined : undefined;
  const vice = finalDone ? loserOf(final) ?? undefined : undefined;

  let stageReached: BrazilStage | undefined;
  let stageResolvedDate: number | undefined;
  if (eliminatedInGroups) {
    stageReached = "grupos";
    stageResolvedDate = lastGroupDate;
  } else if (finalDone && (final.homeCode === BRAZIL || final.awayCode === BRAZIL)) {
    stageReached = winnerOf(final) === BRAZIL ? "campeao" : "vice";
    stageResolvedDate = finalDate;
  } else {
    const koBra = matches.filter((m) => m.stage !== "Grupos" && m.status === "encerrado");
    for (const m of koBra) {
      const w = winnerOf(m);
      if (w && w !== BRAZIL) {
        stageReached = STAGE_FROM_KO[m.stage];
        stageResolvedDate = +new Date(m.date);
        break;
      }
    }
  }

  return {
    group, matches, groupComplete, allGroupsComplete,
    groupRank: braRow?.rank, groupPoints: braRow?.points,
    advanced, eliminatedInGroups, actualGroupFinish, stageReached, champion, vice,
    lastGroupDate, stageResolvedDate, finalDate,
  };
}

// ── Resultado por participante ───────────────────────────────────────────────
export type MatchHitKind = "exact" | "result" | "miss" | "pending" | "none";
export interface PoolMatchDetail {
  match: Match;
  pred?: { homeGoals: number; awayGoals: number };
  pts: number;
  kind: MatchHitKind;
}
export interface PoolResult {
  participant: PoolParticipant;
  prediction?: PoolPrediction;
  rank: number;
  points: number;
  breakdown: { matches: number; champion: number };
  exactCount: number;
  resultCount: number;
  brazilHits: number;
  overallHits: number;
  hotStreak: number;
  coldStreak: number;
  /** O palpite feito: true (campeão), false (não campeão) ou null (não palpitou). */
  championBet?: boolean | null;
  /** Se o palpite de campeão/não-campeão bateu com a realidade (já resolvido). */
  championBetCorrect: boolean;
  matchDetails: PoolMatchDetail[];
  badges: BadgeKey[];
}

function longestRun(seq: boolean[], val: boolean): number {
  let best = 0, cur = 0;
  for (const s of seq) { if (s === val) { cur++; best = Math.max(best, cur); } else cur = 0; }
  return best;
}

function scoreOne(
  participant: PoolParticipant,
  pred: PoolPrediction | undefined,
  mps: Record<string, { homeGoals: number; awayGoals: number }>,
  facts: BrazilFacts,
  cutoff = Infinity,
): PoolResult {
  let points = 0, exactCount = 0, resultCount = 0, brazilHits = 0, overallHits = 0;
  const breakdown = { matches: 0, champion: 0 };
  const seq: boolean[] = [];
  const matchDetails: PoolMatchDetail[] = [];

  for (const m of facts.matches) {
    const mp = mps[m.id];
    const within = +new Date(m.date) <= cutoff;
    if (m.status !== "encerrado" || !within) {
      matchDetails.push({ match: m, pred: mp, pts: 0, kind: mp ? "pending" : "none" });
      continue;
    }
    if (!mp) { matchDetails.push({ match: m, pred: undefined, pts: 0, kind: "none" }); continue; }
    const rh = m.homeGoals ?? 0, ra = m.awayGoals ?? 0;
    const exact = mp.homeGoals === rh && mp.awayGoals === ra;
    const result = Math.sign(mp.homeGoals - mp.awayGoals) === Math.sign(rh - ra);
    if (exact) {
      points += 6; breakdown.matches += 6; exactCount++; resultCount++; brazilHits++; overallHits++;
      seq.push(true); matchDetails.push({ match: m, pred: mp, pts: 6, kind: "exact" });
    } else if (result) {
      points += 3; breakdown.matches += 3; resultCount++; brazilHits++; overallHits++;
      seq.push(true); matchDetails.push({ match: m, pred: mp, pts: 3, kind: "result" });
    } else {
      seq.push(false); matchDetails.push({ match: m, pred: mp, pts: 0, kind: "miss" });
    }
  }

  // ── Palpite único da campanha: "o Brasil vai ser campeão?" ─────────────────
  // Resolve assim que o destino do Brasil é selado (stageReached preenchido):
  //   • apostou CAMPEÃO e o Brasil foi campeão → +15
  //   • apostou NÃO CAMPEÃO e o Brasil não foi campeão → +5
  // Vale mais acertar o título porque, estatisticamente, é o palpite difícil.
  let championBetCorrect = false;
  const brazilSettled = facts.stageReached != null && facts.stageResolvedDate != null && facts.stageResolvedDate <= cutoff;
  if (brazilSettled && pred?.brazilChampion != null) {
    const brazilIsChampion = facts.stageReached === "campeao";
    if (pred.brazilChampion && brazilIsChampion) {
      points += 15; breakdown.champion = 15; brazilHits++; overallHits++; championBetCorrect = true;
    } else if (!pred.brazilChampion && !brazilIsChampion) {
      points += 5; breakdown.champion = 5; overallHits++; championBetCorrect = true;
    }
  }

  return {
    participant, prediction: pred, rank: 0, points, breakdown,
    exactCount, resultCount, brazilHits, overallHits,
    hotStreak: longestRun(seq, true), coldStreak: longestRun(seq, false),
    championBet: pred?.brazilChampion ?? null, championBetCorrect, matchDetails, badges: [],
  };
}

// ── Medalhas / conquistas ────────────────────────────────────────────────────
export type BadgeKey = "rei" | "mestre" | "quente" | "frio";
export const BADGES: Record<BadgeKey, { icon: string; label: string; desc: string }> = {
  rei: { icon: "🏆", label: "Rei dos Placares", desc: "Mais placares exatos" },
  mestre: { icon: "🎯", label: "Mestre dos Palpites", desc: "Mais acertos no total" },
  quente: { icon: "🔥", label: "Mão Quente", desc: "Maior sequência de acertos" },
  frio: { icon: "😅", label: "Pé Frio", desc: "Maior sequência de erros" },
};

function assignBadges(results: PoolResult[]) {
  const give = (key: BadgeKey, sel: (r: PoolResult) => number, min = 1) => {
    const max = Math.max(0, ...results.map(sel));
    if (max < min) return;
    for (const r of results) if (sel(r) === max) r.badges.push(key);
  };
  give("rei", (r) => r.exactCount);
  give("mestre", (r) => r.overallHits);
  give("quente", (r) => r.hotStreak, 2);
  give("frio", (r) => r.coldStreak, 2);
}

export interface PoolStanding {
  facts: BrazilFacts;
  results: PoolResult[];
}

export function scorePool(t: ResolvedTournament, data: PoolData): PoolStanding {
  const facts = brazilFacts(t);
  const results = data.participants.map((p) =>
    scoreOne(p, data.predictions[p.id], data.matchPredictions[p.id] ?? {}, facts),
  );

  // Desempate: mais pontos → mais placares exatos → mais resultados certos →
  // nome (ordem estável; o "sorteio" real fica para o churrasco da família).
  results.sort(
    (a, b) =>
      b.points - a.points ||
      b.exactCount - a.exactCount ||
      b.resultCount - a.resultCount ||
      a.participant.name.localeCompare(b.participant.name),
  );
  results.forEach((r, i) => (r.rank = i + 1));
  assignBadges(results);

  return { facts, results };
}

// ── Evolução da classificação (pontos acumulados por marco) ──────────────────
export interface PoolEvolution {
  checkpoints: { label: string; date: number }[];
  series: Record<string, number[]>; // participantId -> pontos acumulados em cada checkpoint
}

export function poolEvolution(t: ResolvedTournament, data: PoolData): PoolEvolution {
  const facts = brazilFacts(t);
  const finished = facts.matches.filter((m) => m.status === "encerrado");

  const checkpoints = finished.map((m) => {
    const opp = m.homeCode === BRAZIL ? m.awayCode : m.homeCode;
    const label = `${TEAM_MAP[opp ?? ""]?.code ?? "?"}`;
    return { label, date: +new Date(m.date) };
  });
  // marco extra para a final, se o Brasil não estiver nela mas a Copa terminou
  if (facts.finalDate != null && !finished.some((m) => m.id === "FINAL")) {
    checkpoints.push({ label: "Final", date: facts.finalDate });
  }
  checkpoints.sort((a, b) => a.date - b.date);

  const series: Record<string, number[]> = {};
  for (const p of data.participants) {
    series[p.id] = checkpoints.map(
      (c) => scoreOne(p, data.predictions[p.id], data.matchPredictions[p.id] ?? {}, facts, c.date).points,
    );
  }
  return { checkpoints, series };
}
