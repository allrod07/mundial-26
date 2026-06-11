import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Escrita protegida: aceita SYNC_SECRET ou ADMIN_PASSWORD via Authorization Bearer.
function authed(req: Request): boolean {
  const secrets = [process.env.SYNC_SECRET, process.env.ADMIN_PASSWORD].filter(Boolean) as string[];
  if (secrets.length === 0) return false; // exige um segredo configurado para escrever
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return secrets.includes(got);
}

interface EventInput {
  minute: number;
  type: string;
  teamCode: string | null;
  playerId?: string | null;
  playerName?: string | null;
  assistPlayerId?: string | null;
  assistName?: string | null;
}

interface Body {
  id: string;
  stage?: string | null;
  group?: string | null;
  round?: number | null;
  homeCode?: string | null;
  awayCode?: string | null;
  homeGoals: number;
  awayGoals: number;
  homePens?: number | null;
  awayPens?: number | null;
  status?: string;
  events?: EventInput[];
}

function serviceReady(): boolean {
  return supabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!serviceReady())
    return NextResponse.json({ error: "Supabase service role não configurado (defina SUPABASE_SERVICE_ROLE_KEY)." }, { status: 400 });

  let b: Body;
  try {
    b = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!b.id) return NextResponse.json({ error: "id ausente" }, { status: 400 });

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { error } = await sb.from("matches").upsert(
    {
      id: b.id,
      stage: b.stage ?? null,
      group_letter: b.group ?? null,
      round: b.round ?? null,
      home_code: b.homeCode ?? null,
      away_code: b.awayCode ?? null,
      home_goals: b.homeGoals,
      away_goals: b.awayGoals,
      home_pens: b.homePens ?? null,
      away_pens: b.awayPens ?? null,
      status: b.status ?? "encerrado",
      minute: null,
      updated_at: now,
    },
    { onConflict: "id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (b.events) {
    await sb.from("match_events").delete().eq("match_id", b.id);
    if (b.events.length) {
      const rows = b.events.map((e) => ({
        match_id: b.id,
        minute: e.minute,
        type: e.type,
        team_code: e.teamCode,
        player_id: e.playerId ?? null,
        player_name: e.playerName ?? null,
        assist_player_id: e.assistPlayerId ?? null,
        assist_name: e.assistName ?? null,
      }));
      const { error: evErr } = await sb.from("match_events").insert(rows);
      if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });
    }
  }

  await sb.from("sync_state").upsert(
    { id: 1, last_sync: now, source: "manual", note: `jogo ${b.id} salvo manualmente` },
    { onConflict: "id" },
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  if (!serviceReady())
    return NextResponse.json({ error: "Supabase service role não configurado." }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("matches").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
