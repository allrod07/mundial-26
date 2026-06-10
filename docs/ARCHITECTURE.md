# Arquitetura — Mundial '26

## Visão geral

Aplicação **Next.js 14 (App Router)** com uma camada de domínio **pura em TypeScript**. Não há banco de dados em runtime: todo o torneio é gerado e simulado em memória de forma **determinística**, o que mantém o app rápido, reproduzível e livre de mismatch de hidratação entre servidor e cliente.

```
┌────────────────────────────────────────────────────────────┐
│  app/ (rotas, RSC + client components)                      │
│   ├─ Server Components → leem BASE_TOURNAMENT (SSG/SSR)      │
│   └─ Client Components → useTournament() (reativo)          │
├────────────────────────────────────────────────────────────┤
│  components/ (UI, charts, módulos)                          │
├────────────────────────────────────────────────────────────┤
│  lib/engine/  ← motor de simulação (puro, testável)         │
│  lib/data/    ← dados-semente determinísticos               │
│  lib/rng.ts   ← PRNG seedável (mulberry32)                  │
└────────────────────────────────────────────────────────────┘
```

## Princípio central: determinismo

`lib/rng.ts` expõe um PRNG (`mulberry32`) semeado por string. Toda geração — placares, eventos, elencos, atributos, Monte Carlo — recebe uma *seed* derivada de um id estável (ex.: `sim-G-A-1-1`). Resultado:

- O mesmo torneio é renderizado no servidor e no cliente → sem flicker/hidratação divergente.
- A simulação é **reproduzível** e auditável.

## Fluxo de dados

### 1. Sementes (`lib/data/`)
- `teams.ts` — 48 seleções (rating, técnico, grupo, histórico, cores).
- `squads.ts` — gera 26 jogadores por seleção (memoizado).
- `cities.ts` — 16 sedes oficiais.
- `schedule.ts` — 72 jogos de grupos + 32 do mata-mata + `NOW` (relógio de demonstração) + template do chaveamento (`KO_DEFS`, `KO_SOURCES`).

### 2. Motor (`lib/engine/`)
- `simulate.ts` — `simulateScore` (modelo de Poisson por força relativa), geração de eventos, `winnerOf/loserOf`, pênaltis.
- `standings.ts` — tabela por grupo com critérios de desempate (pontos → saldo → gols pró → confronto direto → ranking FIFA) e ranking dos 8 melhores terceiros.
- `tournament.ts` — **orquestrador**. `buildTournament(overrides)` resolve:
  1. resultados e status dos jogos de grupos (encerrado / ao vivo / agendado, com base em `NOW`);
  2. classificação + melhores terceiros + grupos concluídos;
  3. chaveamento (resolve times via `KO_SOURCES` em ordem topológica e propaga vencedores/perdedores);
  4. agregação de artilharia.
  `simulateRemainder(overrides)` joga todo o restante do torneio (usado por “Simular tudo”).
- `projections.ts` — **Monte Carlo** (≈1.600 iterações) condicionado aos resultados já encerrados; estima probabilidade por fase até o título.
- `attributes.ts` / `lineup.ts` / `matchStats.ts` — atributos (radar), escalações por formação e estatísticas de partida.

### 3. Estado de UI
- **`TournamentProvider`** (Context, client): mantém o mapa de *overrides* do simulador, persiste em `localStorage` e memoiza `buildTournament`. Expõe `setResult`, `clearResult`, `simulateAll`, `resetAll`.
- **`useFavorites`** (Zustand + persist): seleções, partidas e jogadores favoritos.

## Estratégia de renderização

| Página | Render | Motivo |
| --- | --- | --- |
| `/selecoes/[code]`, `/jogadores/[id]`, `/projecoes` | **Server (SSG/SSR)** | conteúdo estável, bom para SEO; 48 páginas de seleção são pré-geradas |
| Home, calendário, classificação, chaveamento, estatísticas, simulador, comparar, favoritos, partida | **Client** (`useTournament`) | refletem em tempo real os *overrides* do simulador e favoritos |

Server Components leem `BASE_TOURNAMENT` (cenário padrão, computado uma vez). Client Components leem o contexto reativo. Ambos partem do mesmo estado-base, garantindo HTML consistente no primeiro paint.

## Performance

- `BASE_TOURNAMENT`, elencos, atributos e projeções são **memoizados** em nível de módulo.
- `buildTournament` só é re-executado quando os *overrides* mudam (memo no provider).
- Componentes pesados de gráfico são client-only; flags são imagens (`flagcdn`) com `loading="lazy"`.
- Fontes via `next/font` (Inter, Sora, JetBrains Mono) com `display: swap`.

## Caminho para produção

O modelo de domínio mapeia 1:1 para um backend relacional. Veja [`BACKEND.md`](./BACKEND.md) e [`prisma/schema.prisma`](./prisma/schema.prisma): as funções de `lib/engine/` viram *services* NestJS, `lib/data/` vira *seeds*/migrations Prisma, e o `TournamentProvider` passa a consumir uma API com cache Redis.
