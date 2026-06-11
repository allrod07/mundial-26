import { NextResponse } from "next/server";
import type { MatchEvent, MatchResultMap } from "@/lib/types";
import { supabaseRead } from "@/lib/supabase/server";
import { EMPTY_OVERLAY as EMPTY, type LiveOverlay } from "@/lib/api/overlay";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = supabaseRead();
  if (!sb) return NextResponse.json(EMPTY);

  try {
    const [{ data: matches }, { data: events }, { data: stats }, { data: sync }] = await Promise.all([
      sb.from("matches").select("id,home_goals,away_goals,home_pens,away_pens,status").not("home_goals", "is", null),
      sb.from("match_events").select("match_id,minute,type,team_code,player_id,player_name,assist_player_id,assist_name").order("minute"),
      sb.from("match_stats").select("match_id,home,away"),
      sb.from("sync_state").select("last_sync").eq("id", 1).maybeSingle(),
    ]);

    if (!matches || matches.length === 0) return NextResponse.json(EMPTY);

    const results: MatchResultMap = {};
    for (const m of matches) {
      results[m.id] = {
        homeGoals: m.home_goals,
        awayGoals: m.away_goals,
        homePens: m.home_pens ?? undefined,
        awayPens: m.away_pens ?? undefined,
      };
    }

    const evMap: Record<string, MatchEvent[]> = {};
    for (const e of events ?? []) {
      (evMap[e.match_id] ??= []).push({
        minute: e.minute,
        type: e.type,
        teamCode: e.team_code ?? "",
        playerId: e.player_id ?? "",
        playerName: e.player_name ?? undefined,
        assistPlayerId: e.assist_player_id ?? undefined,
        assistName: e.assist_name ?? undefined,
      });
    }

    const statMap: LiveOverlay["stats"] = {};
    for (const s of stats ?? []) statMap[s.match_id] = { home: s.home, away: s.away };

    return NextResponse.json({
      source: "live",
      results,
      events: evMap,
      stats: statMap,
      lastSync: sync?.last_sync ?? null,
    } satisfies LiveOverlay);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
