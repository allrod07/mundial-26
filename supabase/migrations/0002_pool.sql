-- Mundial '26 — Bolão da Família
-- Estas tabelas suportam o /bolao: cadastro de participantes, palpites
-- pré-Copa (campeão, vice, fase do Brasil, etc.) e palpites jogo a jogo dos
-- jogos do Brasil. A migração é IDEMPOTENTE: pode rodar em projetos onde as
-- tabelas já foram criadas manualmente sem efeito colateral.

create table if not exists public.pool_participants (
  id          text primary key,
  name        text not null,
  emoji       text,
  paid        boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.pool_predictions (
  participant_id        text primary key references public.pool_participants(id) on delete cascade,
  brazil_group_finish   text,         -- "1" | "2" | "3q" | "out"
  brazil_group_points   int,          -- 0..9 (validado no app)
  brazil_stage          text,         -- "grupos" | "r32" | "r16" | "qf" | "sf" | "vice" | "campeao"
  champion_code         text,
  vice_code             text,
  updated_at            timestamptz not null default now(),
  -- Campeão e vice não podem ser o mesmo time (palpite inválido).
  constraint pool_predictions_champion_neq_vice
    check (champion_code is null or vice_code is null or champion_code <> vice_code),
  constraint pool_predictions_group_points_range
    check (brazil_group_points is null or (brazil_group_points between 0 and 9))
);

create table if not exists public.pool_match_predictions (
  participant_id  text not null references public.pool_participants(id) on delete cascade,
  match_id        text not null,
  home_goals      int  not null,
  away_goals      int  not null,
  updated_at      timestamptz not null default now(),
  primary key (participant_id, match_id),
  constraint pool_match_predictions_goals_range
    check (home_goals between 0 and 20 and away_goals between 0 and 20)
);

create index if not exists pool_match_predictions_match_idx
  on public.pool_match_predictions(match_id);

-- Em tabelas já criadas à mão sem as constraints, garante a aplicação delas.
-- (Funções `if not exists` em constraints só existem no PG 16+, então usamos DO).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pool_predictions_champion_neq_vice'
  ) then
    alter table public.pool_predictions
      add constraint pool_predictions_champion_neq_vice
      check (champion_code is null or vice_code is null or champion_code <> vice_code);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pool_predictions_group_points_range'
  ) then
    alter table public.pool_predictions
      add constraint pool_predictions_group_points_range
      check (brazil_group_points is null or (brazil_group_points between 0 and 9));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pool_match_predictions_goals_range'
  ) then
    alter table public.pool_match_predictions
      add constraint pool_match_predictions_goals_range
      check (home_goals between 0 and 20 and away_goals between 0 and 20);
  end if;
end $$;

-- ── Row Level Security: leitura pública, escrita só via service role ─────────
alter table public.pool_participants        enable row level security;
alter table public.pool_predictions         enable row level security;
alter table public.pool_match_predictions   enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'pool_participants' and policyname = 'public read participants') then
    create policy "public read participants" on public.pool_participants for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pool_predictions' and policyname = 'public read predictions') then
    create policy "public read predictions" on public.pool_predictions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pool_match_predictions' and policyname = 'public read match preds') then
    create policy "public read match preds" on public.pool_match_predictions for select using (true);
  end if;
end $$;
