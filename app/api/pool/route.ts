import { NextResponse } from "next/server";
import { supabaseRead } from "@/lib/supabase/server";
import type { PoolData } from "@/lib/engine/pool";

export const dynamic = "force-dynamic";

const EMPTY: PoolData = { participants: [], predictions: {}, matchPredictions: {} };

export async function GET() {
  const sb = supabaseRead();
  if (!sb) return NextResponse.json(EMPTY);
  try {
    const [{ data: participants }, { data: preds }, { data: mps }] = await Promise.all([
      sb.from("pool_participants").select("id,name,emoji,paid").order("created_at"),
      sb.from("pool_predictions").select("participant_id,brazil_group_finish,brazil_group_points,brazil_stage,champion_code,vice_code"),
      sb.from("pool_match_predictions").select("participant_id,match_id,home_goals,away_goals"),
    ]);

    const predictions: PoolData["predictions"] = {};
    for (const p of preds ?? []) {
      predictions[p.participant_id] = {
        participantId: p.participant_id,
        brazilGroupFinish: p.brazil_group_finish ?? null,
        brazilGroupPoints: p.brazil_group_points ?? null,
        brazilStage: p.brazil_stage ?? null,
        champion: p.champion_code ?? null,
        vice: p.vice_code ?? null,
      };
    }
    const matchPredictions: PoolData["matchPredictions"] = {};
    for (const m of mps ?? []) {
      (matchPredictions[m.participant_id] ??= {})[m.match_id] = { homeGoals: m.home_goals, awayGoals: m.away_goals };
    }
    return NextResponse.json({ participants: participants ?? [], predictions, matchPredictions } satisfies PoolData);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
