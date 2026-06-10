import type { Match, MatchEvent, Player } from "@/lib/types";
import { Rng } from "@/lib/rng";

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

export interface SimScore {
  homeGoals: number;
  awayGoals: number;
  homePens?: number;
  awayPens?: number;
}

/** Deterministic scoreline from team ratings. */
export function simulateScore(
  homeRating: number,
  awayRating: number,
  seed: string,
  opts: { knockout?: boolean; homeAdvantage?: number } = {},
): SimScore {
  const rng = new Rng(seed);
  const diff = (homeRating - awayRating) / 10;
  const adv = opts.homeAdvantage ?? (opts.knockout ? 0 : 0.18);
  const lambdaHome = Math.max(0.18, Math.min(4.6, 1.38 + diff * 0.46 + adv));
  const lambdaAway = Math.max(0.18, Math.min(4.6, 1.16 - diff * 0.46));
  let homeGoals = poisson(lambdaHome, rng);
  let awayGoals = poisson(lambdaAway, rng);

  if (opts.knockout && homeGoals === awayGoals) {
    // shootout — stronger side slightly favoured
    const edge = (homeRating - awayRating) / 200;
    let hp = 0;
    let ap = 0;
    for (let i = 0; i < 5; i++) {
      if (rng.float() < 0.75 + edge) hp++;
      if (rng.float() < 0.75 - edge) ap++;
    }
    while (hp === ap) {
      if (rng.float() < 0.75 + edge) hp++;
      if (rng.float() < 0.75 - edge) ap++;
    }
    return { homeGoals, awayGoals, homePens: hp, awayPens: ap };
  }
  return { homeGoals, awayGoals };
}

const POS_GOAL_WEIGHT: Record<string, number> = {
  GOL: 0.01,
  DEF: 0.7,
  MEI: 2.1,
  ATA: 5,
};
const POS_ASSIST_WEIGHT: Record<string, number> = {
  GOL: 0.02,
  DEF: 1,
  MEI: 2.6,
  ATA: 3.2,
};
const POS_CARD_WEIGHT: Record<string, number> = {
  GOL: 0.5,
  DEF: 2.4,
  MEI: 2,
  ATA: 1,
};

function pickWeighted(squad: Player[], weights: Record<string, number>, rng: Rng): Player {
  const w = squad.map((p) => weights[p.positionGroup] * Math.pow(p.rating / 75, 2));
  return rng.weighted(squad, w);
}

/** Generate goal/assist/card events consistent with a final scoreline. */
export function generateEvents(
  homeCode: string,
  awayCode: string,
  homeSquad: Player[],
  awaySquad: Player[],
  score: SimScore,
  seed: string,
): MatchEvent[] {
  const rng = new Rng(`ev-${seed}`);
  const events: MatchEvent[] = [];

  const addGoals = (code: string, squad: Player[], n: number) => {
    for (let i = 0; i < n; i++) {
      const minute = rng.int(1, 94);
      const isPen = rng.bool(0.1);
      const scorer = pickWeighted(squad, POS_GOAL_WEIGHT, rng);
      events.push({
        minute,
        type: isPen ? "penalti" : "gol",
        teamCode: code,
        playerId: scorer.id,
        assistPlayerId:
          !isPen && rng.bool(0.62)
            ? pickWeighted(
                squad.filter((p) => p.id !== scorer.id),
                POS_ASSIST_WEIGHT,
                rng,
              ).id
            : undefined,
      });
    }
  };

  addGoals(homeCode, homeSquad, score.homeGoals);
  addGoals(awayCode, awaySquad, score.awayGoals);

  // cards
  const addCards = (code: string, squad: Player[]) => {
    const yellows = rng.int(0, 3);
    for (let i = 0; i < yellows; i++) {
      events.push({
        minute: rng.int(10, 92),
        type: "amarelo",
        teamCode: code,
        playerId: pickWeighted(squad, POS_CARD_WEIGHT, rng).id,
      });
    }
    if (rng.bool(0.07)) {
      events.push({
        minute: rng.int(35, 92),
        type: "vermelho",
        teamCode: code,
        playerId: pickWeighted(squad, POS_CARD_WEIGHT, rng).id,
      });
    }
  };
  addCards(homeCode, homeSquad);
  addCards(awayCode, awaySquad);

  return events.sort((a, b) => a.minute - b.minute);
}

/** winner team code for a (possibly knockout) finished match; null on draw */
export function winnerOf(m: Match): string | null {
  if (m.homeGoals == null || m.awayGoals == null) return null;
  if (m.homeGoals > m.awayGoals) return m.homeCode ?? null;
  if (m.awayGoals > m.homeGoals) return m.awayCode ?? null;
  if (m.homePens != null && m.awayPens != null) {
    return m.homePens > m.awayPens ? m.homeCode ?? null : m.awayCode ?? null;
  }
  return null;
}

export function loserOf(m: Match): string | null {
  const wcode = winnerOf(m);
  if (!wcode) return null;
  return wcode === m.homeCode ? m.awayCode ?? null : m.homeCode ?? null;
}
