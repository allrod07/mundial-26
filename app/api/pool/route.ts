import { NextResponse } from "next/server";
import { supabaseRead } from "@/lib/supabase/server";
import type { PoolData } from "@/lib/engine/pool";

export const dynamic = "force-dynamic";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };
// Nunca cachear: o painel lê isto logo após gravar e precisa do estado atual.
const NO_STORE = { headers: { "cache-control": "no-store, max-age=0" } } as const;

export async function GET() {
  const sb = supabaseRead();
  if (!sb) return NextResponse.json(EMPTY, NO_STORE);
  try {
    const [{ data: participants }, { data: preds }, { data: mps }] = await Promise.all([
      sb.from("pool_participants").select("id,name,emoji,paid").order("created_at"),
      sb.from("pool_predictions").select("participant_id,brazil_champion"),
      sb.from("pool_match_predictions").select("participant_id,match_id,home_goals,away_goals"),
    ]);

    const predictions: PoolData["predictions"] = {};
    for (const p of preds ?? []) {
      predictions[p.participant_id] = {
        participantId: p.participant_id,
        brazilChampion: p.brazil_champion ?? null,
      };
    }
    const matchPredictions: PoolData["matchPredictions"] = {};
    for (const m of mps ?? []) {
      (matchPredictions[m.participant_id] ??= {})[m.match_id] = { homeGoals: m.home_goals, awayGoals: m.away_goals };
    }
    return NextResponse.json({ participants: participants ?? [], predictions, matchPredictions } satisfies PoolData, NO_STORE);
  } catch {
    return NextResponse.json(EMPTY, NO_STORE);
  }
}
