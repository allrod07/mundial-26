# Integrações — Modo Automático (API-Football → Supabase → Vercel)

Fluxo:

```
API-Football  ──►  POST /api/sync  ──►  Supabase (Postgres)  ──►  GET /api/results  ──►  Frontend (overlay)
```

Os dados **oficiais** (grupos, calendário, elencos) ficam embarcados no app e funcionam como base/fallback. Os **resultados, gols, assistências, cartões e estatísticas reais** entram por cima quando sincronizados. Sem credenciais, o app roda em modo **DEMO** (badge no cabeçalho).

---

## 1. API-Football

1. Crie a conta em <https://www.api-football.com/> e copie a chave (Dashboard → API key).
2. Defina `API_FOOTBALL_KEY`. Acesso direto usa o header `x-apisports-key` (padrão).
   - Para **RapidAPI**, defina `API_FOOTBALL_HOST=https://api-football-v1.p.rapidapi.com/v3` e `API_FOOTBALL_VIA_RAPIDAPI=true`.
3. A Copa do Mundo é `league=1`, `season=2026` (padrões; ajuste em `API_FOOTBALL_LEAGUE`/`API_FOOTBALL_SEASON` se preciso).

Endpoints consumidos: `fixtures`, `fixtures/events`, `fixtures/statistics`, `standings`. As seleções são casadas com os nossos códigos por nome (`lib/data/apiMap.ts`).

> Atenção ao **rate limit** do plano gratuito. A sincronização busca eventos/estatísticas só de jogos ao vivo/encerrados; use `?events=false` para sincronizar apenas placares e poupar requisições.

## 2. Supabase

1. Crie um projeto em <https://supabase.com>.
2. Aplique o schema: `supabase/migrations/0001_init.sql` (SQL Editor ou Supabase CLI). Cria `matches`, `match_events`, `match_stats`, `standings`, `sync_state` com RLS de **leitura pública**.
3. Em Project Settings → API, copie e defina:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública, vai ao navegador)
   - `SUPABASE_SERVICE_ROLE_KEY` (**secreta**, só servidor — usada no `/api/sync`)

## 3. Sincronização

`POST /api/sync` puxa da API-Football e grava no Supabase. Protegida por `SYNC_SECRET`:

```bash
curl -X POST "https://SEU-APP.vercel.app/api/sync" \
  -H "Authorization: Bearer $SYNC_SECRET"
# só placares (economiza requisições):
curl -X POST "https://SEU-APP.vercel.app/api/sync?events=false" -H "Authorization: Bearer $SYNC_SECRET"
```

Agende de tempos em tempos (durante a Copa, a cada poucos minutos) com **Vercel Cron** — adicione ao `vercel.json`:

```json
{ "crons": [{ "path": "/api/sync", "schedule": "*/10 * * * *" }] }
```

(O cron do Vercel chama via GET; a rota aceita GET e POST. Proteja com `SYNC_SECRET` na query se quiser.)

## 4. Leitura / overlay

`GET /api/results` lê o Supabase e devolve `{ source, results, events, stats }`. O `TournamentProvider` aplica os resultados reais como base (`fabricate:false` — sem clock de demonstração) e expõe `dataSource: "live"`. Páginas de partida usam eventos/estatísticas reais quando presentes.

## 6. Painel /admin (preenchimento manual)

Alternativa (ou complemento) à API: a página **`/admin`** permite digitar os resultados, gols/assistências e cartões **à mão**, gravando direto no Supabase. Os dados aparecem para **todos** os visitantes e o site entra em modo **AO VIVO** — sem depender de nenhuma API.

- Acesse `/<seu-app>/admin` e entre com a senha (**`ADMIN_PASSWORD`**, ou o `SYNC_SECRET` se não definir uma).
- A escrita usa a rota protegida `POST /api/matches` (service role) — portanto exige a **`SUPABASE_SERVICE_ROLE_KEY`** definida.
- Preencha os 6 jogos de cada grupo; ao completar a fase de grupos, o mata-mata resolve os times sozinho e você preenche os confrontos.
- Combina perfeitamente com a API: o que a fonte automática não trouxer (ex.: posse, escalações), você completa manualmente.

## 5. Deploy (Vercel + GitHub)

1. Suba o repositório no GitHub.
2. Importe no Vercel (framework Next.js, detectado automaticamente).
3. Em **Settings → Environment Variables**, adicione todas as variáveis do `.env.example`.
4. Deploy. Rode o primeiro `/api/sync` manualmente e/ou habilite o cron.

Variáveis: veja [`.env.example`](../.env.example).
