-- Mundial '26 — schema da camada de resultados ao vivo (API-Football → Supabase)
-- Os dados oficiais (grupos, calendário, elencos) ficam embarcados no app;
-- estas tabelas guardam os RESULTADOS/EVENTOS reais sincronizados da API.

create table if not exists public.matches (
  id              text primary key,          -- id interno do app (ex.: "G-1", "R32-1")
  api_fixture_id  bigint unique,             -- id do fixture na API-Football
  stage           text,
  group_letter    text,
  round           int,
  kickoff         timestamptz,
  city            text,
  home_code       text,
  away_code       text,
  home_goals      int,
  away_goals      int,
  home_pens       int,
  away_pens       int,
  status          text not null default 'agendado',  -- agendado | ao-vivo | encerrado
  minute          int,
  updated_at      timestamptz not null default now()
);

create table if not exists public.match_events (
  id          bigserial primary key,
  match_id    text not null references public.matches(id) on delete cascade,
  minute      int not null,
  type        text not null,                 -- gol | penalti | gol-contra | amarelo | vermelho
  team_code   text,
  player_name text,
  assist_name text
);
create index if not exists match_events_match_id_idx on public.match_events(match_id);

create table if not exists public.match_stats (
  match_id text primary key references public.matches(id) on delete cascade,
  home     jsonb not null default '{}'::jsonb,
  away     jsonb not null default '{}'::jsonb
);

create table if not exists public.standings (
  team_code  text primary key,
  group_letter text,
  played     int default 0,
  win        int default 0,
  draw       int default 0,
  loss       int default 0,
  gf         int default 0,
  ga         int default 0,
  gd         int default 0,
  points     int default 0,
  rank       int default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_state (
  id         int primary key default 1,
  last_sync  timestamptz,
  source     text,
  note       text
);
insert into public.sync_state (id) values (1) on conflict (id) do nothing;

-- ── Row Level Security: leitura pública (anon), escrita só via service role ──
alter table public.matches      enable row level security;
alter table public.match_events enable row level security;
alter table public.match_stats  enable row level security;
alter table public.standings    enable row level security;
alter table public.sync_state   enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'matches' and policyname = 'public read matches') then
    create policy "public read matches" on public.matches for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'match_events' and policyname = 'public read events') then
    create policy "public read events" on public.match_events for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'match_stats' and policyname = 'public read stats') then
    create policy "public read stats" on public.match_stats for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'standings' and policyname = 'public read standings') then
    create policy "public read standings" on public.standings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sync_state' and policyname = 'public read sync') then
    create policy "public read sync" on public.sync_state for select using (true);
  end if;
end $$;
