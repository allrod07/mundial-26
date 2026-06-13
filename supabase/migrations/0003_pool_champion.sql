-- Mundial '26 — Bolão simplificado (modelo "censo comum" da família)
-- O bolão deixa de ter vários palpites pré-Copa (lugar no grupo, pontos no
-- grupo, fase do Brasil, campeão e vice da Copa). Agora há UM palpite único:
--   "o Brasil vai ser campeão?"  → true (aposta no título) | false (aposta que não)
-- A pontuação dos jogos do Brasil continua (resultado +3 / placar exato +6).

-- Coluna do novo palpite único (idempotente).
alter table public.pool_predictions
  add column if not exists brazil_champion boolean;

-- As colunas/constraints antigas (brazil_group_finish, brazil_group_points,
-- brazil_stage, champion_code, vice_code) ficam como herança nula e param de
-- ser escritas pelo app. Removemos as constraints que não fazem mais sentido
-- para não atrapalhar inserts (todas viram nulas).
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'pool_predictions_champion_neq_vice') then
    alter table public.pool_predictions drop constraint pool_predictions_champion_neq_vice;
  end if;
  if exists (select 1 from pg_constraint where conname = 'pool_predictions_group_points_range') then
    alter table public.pool_predictions drop constraint pool_predictions_group_points_range;
  end if;
end $$;
