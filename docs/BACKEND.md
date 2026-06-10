# Backend — desenho de referência (NestJS + PostgreSQL + Prisma + Redis)

A versão atual roda **sem backend** (camada de dados procedural). Este documento descreve a evolução para produção, reaproveitando o modelo de domínio já existente em `lib/`.

## Stack-alvo

- **NestJS** (API modular) · **Prisma** (ORM) · **PostgreSQL** · **Redis** (cache) · **JWT** (auth) · Docker · Vercel/Cloudflare.

## Mapeamento direto

| Hoje (`lib/`) | Produção |
| --- | --- |
| `lib/data/*` | seeds Prisma + migrations (`docs/prisma/schema.prisma`) |
| `lib/engine/standings.ts` | `StandingsService` |
| `lib/engine/tournament.ts` | `TournamentService` (+ jobs ao encerrar jogo) |
| `lib/engine/projections.ts` | `ProjectionsService` (worker + cache Redis) |
| `TournamentProvider` (overrides) | `ScenariosController` (persistência por usuário) |
| `useFavorites` | `FavoritesController` |

## Módulos NestJS

```
TeamsModule       GET /teams, /teams/:code, /teams/:code/squad
PlayersModule     GET /players/:id, /players/compare?a=&b=
MatchesModule     GET /matches, /matches/:id, /matches/:id/lineups
StandingsModule   GET /standings, /standings/thirds
BracketModule     GET /bracket
StatsModule       GET /stats/scorers, /stats/teams
ProjectionsModule GET /projections
SimulatorModule   POST /scenarios, PATCH /scenarios/:id, GET /scenarios/:id
AuthModule        POST /auth/register, /auth/login (JWT)
FavoritesModule   GET/POST/DELETE /favorites
```

## Cache (Redis)

- Chaves derivadas: `standings:current`, `bracket:current`, `projections:current`, `scorers:current` — invalidadas por evento de “jogo encerrado”.
- Projeções (Monte Carlo) calculadas em worker e servidas do cache com TTL.
- Cache de leitura de seleções/jogadores (dados quase estáticos) com TTL longo.

## Atualização em tempo real

- Gateway **WebSocket** (Socket.IO) emitindo `match:update`, `standings:update`, `goal` para o front substituir o relógio de demonstração por dados ao vivo.
- O front troca `useTournament` (local) por um hook que assina o gateway e cai no cache REST como fallback.

## Auth & segurança

- JWT (access + refresh), guards por rota, rate limiting, validação com `class-validator`, CORS restrito.
- Cenários e favoritos isolados por `userId`.

## Deploy

- `Dockerfile` multi-stage (build → runtime), `docker-compose` com Postgres + Redis para dev.
- Front na **Vercel**; API atrás de **Cloudflare**; migrations Prisma no pipeline de CI/CD.
