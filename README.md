# 🏆 Mundial '26 — Plataforma da Copa do Mundo 2026

Plataforma web **premium** para acompanhar a Copa do Mundo de 2026 (EUA · Canadá · México) com o novo formato de **48 seleções / 12 grupos / 104 jogos**. Reúne calendário, classificação ao vivo, estatísticas avançadas, perfis de seleções e jogadores, comparador, projeções por probabilidade e um **simulador completo** do torneio — tudo em uma experiência visual sofisticada, responsiva e com tema claro/escuro.

> **Dados oficiais da FIFA**: o sorteio dos 12 grupos, o calendário dos 104 jogos (datas/horários), o chaveamento do mata-mata (incluindo a combinação dos melhores terceiros) e as **convocações reais** das 48 seleções (26 jogadores cada — nome, número, posição, data de nascimento, clube, altura) foram extraídos dos documentos oficiais. Os **rankings de força, valores de mercado e resultados** são estimados/simulados pelo motor de forma determinística. Projeto de demonstração, sem afiliação com a FIFA.

---

## ✨ Destaques

- **Home** com banner, contador regressivo, jogos ao vivo/próximos/recentes, classificação resumida, artilheiros e seleções em destaque.
- **Calendário** dos 104 jogos com filtros por fase, seleção, grupo, sede e favoritos, agrupado por dia.
- **Classificação** dinâmica dos 12 grupos + ranking dos **8 melhores terceiros**, recalculada conforme os resultados.
- **Chaveamento** completo do mata-mata (16-avos → final + disputa de 3º) que se preenche automaticamente.
- **Simulador (Modo Manual)**: preencha apenas os placares, simule um grupo, ou clique em **“Simular tudo”** para jogar a Copa inteira. A classificação (com critérios de desempate da FIFA), os classificados/eliminados e o chaveamento são recalculados na hora. A aba **Rotas** mostra o caminho de cada seleção até a final (etapa a etapa, com status e adversários). O cenário é salvo no navegador.
- **Seleções**: página por país com elenco completo (26 jogadores), histórico, técnico, capitão e estatísticas.
- **Jogadores**: perfil com atributos (radar), estatísticas na Copa, dados físicos e de mercado.
- **Comparador** de dois jogadores (radar + barras de confronto).
- **Estatísticas**: painel com artilharia, assistências, gols por confederação/grupo, aproveitamento e mais (gráficos Recharts).
- **Projeções**: modelo de **Monte Carlo** com a probabilidade de cada seleção em cada fase, até o título.
- **Partida**: página detalhada com placar, escalações em um **campo tático** (5 formações), banco, timeline de eventos, estatísticas e melhor em campo.
- **Favoritos**, **busca global** (⌘K), **tema claro/escuro**, animações suaves (Framer Motion) e layout responsivo.

---

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | **Next.js 14** (App Router) |
| Linguagem | **TypeScript** (strict) |
| Estilização | **Tailwind CSS** + design tokens |
| Animação | **Framer Motion** |
| Gráficos | **Recharts** |
| Estado | **Zustand** (favoritos) + Context (simulador) |
| Ícones | **lucide-react** |
| Tema | **next-themes** |

A camada de dados é **100% local e procedural** (sem backend necessário para rodar). O diretório [`docs/`](./docs) traz o desenho do **backend NestJS + PostgreSQL + Prisma + Redis** e o **schema Prisma** para evolução até produção.

---

## 🚀 Como rodar

Requisitos: **Node 18+**.

```bash
npm install
npm run dev      # desenvolvimento  → http://localhost:3000
# ou
npm run build && npm run start   # produção
```

Scripts: `dev`, `build`, `start`, `lint`.

---

## 🗂️ Estrutura

```
app/                 # rotas (App Router)
  page.tsx           # Home
  calendario/        classificacao/   chaveamento/
  selecoes/          selecoes/[code]/ jogadores/[id]/
  jogos/[id]/        comparar/        estatisticas/
  projecoes/         simulador/       favoritos/
components/
  layout/  ui/  match/  team/  player/  standings/  bracket/  charts/
  stats/  simulator/  projections/  home/  providers/
lib/
  types.ts  rng.ts  utils.ts  format.ts
  data/      # 48 seleções, cidades, elencos gerados, calendário, sorteio
  engine/    # standings, bracket, simulação, projeções, atributos, lineup
store/        # zustand (favoritos)
docs/         # arquitetura, design system, schema Prisma, backend
```

---

## 🧠 Como os dados funcionam

Tudo deriva de um **RNG determinístico** (`lib/rng.ts`), então o torneio é estável entre servidor e cliente (sem mismatch de hidratação) e reproduzível.

- **48 seleções** (`lib/data/teams.ts`) com os grupos oficiais A–L, técnicos reais, ranking, histórico e cores. `rating` (força) é estimado.
- **Elencos** (`lib/data/rosters.ts` → `lib/data/squads.ts`): as 26 convocações reais de cada seleção (nome, número, posição, nascimento, clube, altura). O motor deriva rating, valor de mercado, jogos e gols.
- **Calendário** (`lib/data/schedule.ts`): os 104 jogos oficiais (72 de grupos + 32 do mata-mata) com números de jogo, horários reais (ET) e o chaveamento oficial, incluindo a combinação dos 8 melhores terceiros.
- **Relógio de demonstração**: a plataforma simula a competição **em andamento** (meados da fase de grupos), então há jogos encerrados, ao vivo e futuros.
- **Motor** (`lib/engine/`): calcula classificação (com critérios de desempate da FIFA), os 8 melhores terceiros, popula e propaga o chaveamento, gera eventos (gols/assistências/cartões) e agrega artilharia.
- **Simulador**: as edições do usuário viram *overrides* que recompõem todo o estado derivado via `buildTournament(overrides)`.

Veja [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) para o desenho completo.

---

## 🔀 Três modos de preenchimento

O projeto é pensado em três modos de obter os resultados/estatísticas:

1. **Manual** *(implementado)* — você preenche apenas os placares no Simulador; o sistema calcula desempates, colocações, classificados/eliminados, o chaveamento e a **rota de cada seleção** até a final.
2. **Impressão** *(implementado)* — página `/impressao` otimizada para imprimir a tabela de grupos e o chaveamento **em branco**, para preencher à mão (nostalgia). Inclui as células de classificação em branco, os 72 jogos com caixas de placar e o chaveamento com os rótulos das vagas (1º/2º do grupo, melhores 3º). Botão **Imprimir** (`window.print()`), CSS `@media print` (A4, oculta navegação) e toggles para incluir/ocultar jogos e chaveamento.
3. **Automático via API** *(implementado)* — adaptador **API-Football** (`lib/api/apiFootball.ts`) → `POST /api/sync` → **Supabase** → `GET /api/results` → overlay no frontend. Preenche resultados, gols, assistências, cartões e estatísticas (posse etc.) reais; cai automaticamente para os dados oficiais embarcados (modo **DEMO**) quando não há credenciais. Configuração em [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md) e [`.env.example`](./.env.example).

A arquitetura de dados já isola a origem (dados oficiais embarcados), então plugar a API é uma mudança localizada — ver [`docs/BACKEND.md`](./docs/BACKEND.md).

## 📄 Documentação

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitetura, fluxo de dados, motor e estratégia de renderização.
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — identidade visual, cores, tipografia, componentes e movimento.
- [`docs/BACKEND.md`](./docs/BACKEND.md) — desenho da API NestJS, cache Redis e autenticação.
- [`docs/prisma/schema.prisma`](./docs/prisma/schema.prisma) — modelo de dados relacional para PostgreSQL.
