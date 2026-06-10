import { NextResponse } from "next/server";
import type { MatchResultMap } from "@/lib/types";
import {
  apiFootballConfigured,
  fetchFixtures,
  fetchFixtureEvents,
  fetchFixtureStatistics,
  mapStatus,
  type AfFixture,
  type AfEvent,
  type AfStatistics,
} from "@/lib/api/apiFootball";
import { codeFromTeamName } from "@/lib/data/apiMap";
import { groupMatchByPair, koMatchByPair } from "@/lib/data/matchKey";
import { buildTournament } from "@/lib/engine/tournament";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  // aceita o SYNC_SECRET (chamadas manuais) e o CRON_SECRET (Vercel Cron injeta
  // automaticamente como Authorization: Bearer <CRON_SECRET>)
  const secrets = [process.env.SYNC_SECRET, process.env.CRON_SECRET].filter(Boolean) as string[];
  if (secrets.length === 0) return true; // nenhum definido → libera (dev)
  const url = new URL(req.url);
  const got =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret") ||
    "";
  return secrets.includes(got);
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  return parseInt(String(v).replace("%", ""), 10) || 0;
}

function toSide(arr: { type: string; value: number | string | null }[]) {
  const get = (t: string) => arr.find((s) => s.type === t)?.value ?? null;
  return {
    posse: num(get("Ball Possession")),
    finalizacoes: num(get("Total Shots")),
    noGol: num(get("Shots on Goal")),
    escanteios: num(get("Corner Kicks")),
    faltas: num(get("Fouls")),
    impedimentos: num(get("Offsides")),
    defesas: num(get("Goalkeeper Saves")),
    passes: num(get("Total passes")),
    precisao: num(get("Passes %")),
    cartoes: num(get("Yellow Cards")) + num(get("Red Cards")),
  };
}

function mapStatsPair(stats: AfStatistics[], homeTeamId: number) {
  if (stats.length < 2) return null;
  const home = stats.find((s) => s.team.id === homeTeamId) ?? stats[0];
  const away = stats.find((s) => s.team.id !== homeTeamId) ?? stats[1];
  return { home: toSide(home.statistics), away: toSide(away.statistics) };
}

function mapEvents(evs: AfEvent[]) {
  const out: { minute: number; type: string; team_code: string | null; player_name: string | null; assist_name: string | null }[] = [];
  for (const e of evs) {
    const code = e.team?.name ? codeFromTeamName(e.team.name) : null;
    const minute = (e.time?.elapsed ?? 0) + (e.time?.extra ?? 0);
    if (e.type === "Goal") {
      const type = e.detail === "Own Goal" ? "gol-contra" : e.detail === "Penalty" ? "penalti" : "gol";
      out.push({ minute, type, team_code: code, player_name: e.player?.name ?? null, assist_name: e.assist?.name ?? null });
    } else if (e.type === "Card") {
      const type = /red|second yellow/i.test(e.detail) ? "vermelho" : "amarelo";
      out.push({ minute, type, team_code: code, player_name: e.player?.name ?? null, assist_name: null });
    }
  }
  return out;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!apiFootballConfigured()) return NextResponse.json({ error: "API_FOOTBALL_KEY ausente" }, { status: 400 });
  if (!supabaseConfigured()) return NextResponse.json({ error: "Supabase não configurado" }, { status: 400 });

  const url = new URL(req.url);
  const withEvents = url.searchParams.get("events") !== "false";

  let fixtures: AfFixture[];
  try {
    fixtures = await fetchFixtures();
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }

  // resolve team codes
  const resolved = fixtures
    .map((fx) => ({ fx, home: codeFromTeamName(fx.teams.home.name), away: codeFromTeamName(fx.teams.away.name) }))
    .filter((r): r is { fx: AfFixture; home: string; away: string } => !!r.home && !!r.away);

  // group matches first → results (so the bracket can resolve KO teams)
  const groupResults: MatchResultMap = {};
  const mapping: { matchId: string; fx: AfFixture; home: string; away: string }[] = [];
  const pending: typeof resolved = [];
  for (const r of resolved) {
    const gm = groupMatchByPair(r.home, r.away);
    if (gm) {
      mapping.push({ matchId: gm.id, fx: r.fx, home: r.home, away: r.away });
      if (mapStatus(r.fx.fixture.status.short) === "encerrado" && r.fx.goals.home != null) {
        groupResults[gm.id] = { homeGoals: r.fx.goals.home, awayGoals: r.fx.goals.away ?? 0 };
      }
    } else {
      pending.push(r);
    }
  }
  const t = buildTournament(groupResults);
  for (const r of pending) {
    const km = koMatchByPair(t, r.home, r.away);
    if (km) mapping.push({ matchId: km.id, fx: r.fx, home: r.home, away: r.away });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const rows = mapping.map(({ matchId, fx, home, away }) => {
    const m = t.matchMap[matchId];
    return {
      id: matchId,
      api_fixture_id: fx.fixture.id,
      stage: m?.stage ?? null,
      group_letter: m?.group ?? null,
      round: m?.round ?? null,
      kickoff: fx.fixture.date,
      city: fx.fixture.venue?.city ?? null,
      home_code: home,
      away_code: away,
      home_goals: fx.goals.home,
      away_goals: fx.goals.away,
      home_pens: fx.score?.penalty?.home ?? null,
      away_pens: fx.score?.penalty?.away ?? null,
      status: mapStatus(fx.fixture.status.short),
      minute: fx.fixture.status.elapsed,
      updated_at: now,
    };
  });
  if (rows.length) {
    const { error } = await sb.from("matches").upsert(rows, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let eventCount = 0;
  if (withEvents) {
    for (const { matchId, fx } of mapping) {
      if (mapStatus(fx.fixture.status.short) === "agendado") continue;
      try {
        const evs = await fetchFixtureEvents(fx.fixture.id);
        const mapped = mapEvents(evs);
        await sb.from("match_events").delete().eq("match_id", matchId);
        if (mapped.length) await sb.from("match_events").insert(mapped.map((e) => ({ match_id: matchId, ...e })));
        eventCount += mapped.length;

        const stats = await fetchFixtureStatistics(fx.fixture.id);
        const pair = mapStatsPair(stats, fx.teams.home.id);
        if (pair) await sb.from("match_stats").upsert({ match_id: matchId, ...pair }, { onConflict: "match_id" });
      } catch {
        /* tolera erro por fixture (rate limit, indisponível) */
      }
    }
  }

  await sb.from("sync_state").upsert(
    { id: 1, last_sync: now, source: "api-football", note: `${rows.length} jogos · ${eventCount} eventos` },
    { onConflict: "id" },
  );

  return NextResponse.json({ ok: true, fixtures: fixtures.length, mapped: rows.length, events: eventCount });
}

export async function GET(req: Request) {
  return POST(req);
}
