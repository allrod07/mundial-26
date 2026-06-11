import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function authError(req: Request): NextResponse | null {
  const secrets = [process.env.SYNC_SECRET, process.env.ADMIN_PASSWORD].filter(Boolean) as string[];
  if (secrets.length === 0)
    return NextResponse.json({ error: "Painel sem senha configurada no servidor (defina ADMIN_PASSWORD ou SYNC_SECRET)." }, { status: 503 });
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secrets.includes(got)) return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  return null;
}
function serviceReady(): boolean {
  return supabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export async function POST(req: Request) {
  const ae = authError(req);
  if (ae) return ae;

  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const op = String(b.op ?? "");
  if (op === "ping") return NextResponse.json({ ok: true });

  if (!serviceReady()) return NextResponse.json({ error: "Supabase service role não configurado." }, { status: 400 });

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  try {
    if (op === "participant") {
      const id = (b.id as string) || (globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      const name = String(b.name ?? "").trim();
      if (!name) return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });
      const { error } = await sb.from("pool_participants").upsert(
        { id, name, emoji: (b.emoji as string) || null, paid: b.paid !== false },
        { onConflict: "id" },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true, id });
    }

    if (op === "predictions") {
      const participant_id = String(b.participantId ?? "");
      if (!participant_id) return NextResponse.json({ error: "participantId ausente" }, { status: 400 });
      const { error } = await sb.from("pool_predictions").upsert(
        {
          participant_id,
          brazil_group_finish: (b.brazilGroupFinish as string) ?? null,
          brazil_group_points: b.brazilGroupPoints == null ? null : Number(b.brazilGroupPoints),
          brazil_stage: (b.brazilStage as string) ?? null,
          champion_code: (b.champion as string) ?? null,
          vice_code: (b.vice as string) ?? null,
          updated_at: now,
        },
        { onConflict: "participant_id" },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === "matchPrediction") {
      const participant_id = String(b.participantId ?? "");
      const match_id = String(b.matchId ?? "");
      if (!participant_id || !match_id) return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
      const { error } = await sb.from("pool_match_predictions").upsert(
        { participant_id, match_id, home_goals: Number(b.homeGoals ?? 0), away_goals: Number(b.awayGoals ?? 0), updated_at: now },
        { onConflict: "participant_id,match_id" },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === "deleteMatchPrediction") {
      const participant_id = String(b.participantId ?? "");
      const match_id = String(b.matchId ?? "");
      const { error } = await sb.from("pool_match_predictions").delete().eq("participant_id", participant_id).eq("match_id", match_id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "operação desconhecida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const ae = authError(req);
  if (ae) return ae;
  if (!serviceReady()) return NextResponse.json({ error: "Supabase service role não configurado." }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("pool_participants").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
