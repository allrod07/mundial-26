# Design System — Mundial '26

Identidade visual que evoca **prestígio, emoção, competição e tecnologia** — gramado, ouro de troféu e uma base sóbria “ink”, com microinterações suaves.

## Cores

Tokens em `tailwind.config.ts`. Escalas 50–950.

| Token | Uso | Base |
| --- | --- | --- |
| `pitch` (verde) | marca primária, ações, destaques | `#00c75f` |
| `gold` (ouro) | troféu, campeão, favoritos, acentos | `#e0991f` |
| `ink` (grafite) | texto, superfícies, neutros | `#10131f` / `#080a12` |
| `blue` / `red` | estados (info, ao vivo, eliminação) | Tailwind |

**Cores semânticas** por variável CSS (`--bg`, `--bg-elevated`, `--border`, `--shadow`) trocadas no `.dark`, garantindo tema claro/escuro consistente. Gradientes utilitários: `.gradient-pitch`, `.gradient-gold`, `.gradient-text-pitch`, `.gradient-text-gold`.

Cada seleção tem `colors` próprias usadas em heróis, avatares e campos táticos. Confederações têm cores em `CONFEDERATION_COLORS`.

## Tipografia

- **Display** — *Sora* (títulos, números/estatísticas, `letter-spacing` negativo).
- **Texto** — *Inter* (corpo, UI).
- **Mono** — *JetBrains Mono*.
- Utilitários: `.stat-num` (números tabulares de destaque), `.tabular`.

## Superfícies & elevação

- `.surface` — card base (fundo elevado + borda + sombra por token).
- `.glass` — header/overlays com `backdrop-blur`.
- Sombras: `shadow-card`, `shadow-card-dark`, `shadow-glow` (brilho verde em hover).
- Raio: cards `rounded-2xl`/`3xl`, chips `rounded-full`.

## Componentes (`components/ui/`)

`Card` · `Badge`/`LiveBadge` · `Flag` (imagens reais, multiplataforma) · `PlayerAvatar` (gradiente por seleção + iniciais) · `Tabs` (pill animada com `layoutId`) · `Select` · `SectionHeader` · `PageHeader` · `StatBar`/`VersusBar` · `FavoriteButton` · `CountUp` · `Reveal`/`Stagger` (entrada animada).

Módulos especializados: `MatchCard`, `GroupTable`, `Bracket`, `Pitch` (campo tático SVG), `SquadList`, `PlayerPicker`, `RadarStats`, `Donut`, `BarTrend`, `RankingBars`, `ProjectionsTable`, `SimMatchRow`.

## Movimento (Framer Motion)

- Entrada de seções: `fade-up` com easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Listas: `Stagger` (cascata ~60ms).
- Navegação/abas: indicador deslizante via `layoutId`.
- Estado “ao vivo”: pulso (`animate-pulse-live`).
- Contadores numéricos animados ao entrar na viewport.

## Responsividade

Mobile-first. Grid fluido (`grid-cols-2 → lg:grid-cols-4` etc.), nav com gaveta em telas pequenas, tabelas com colunas progressivamente reveladas e blocos roláveis horizontalmente (chaveamento, abas) com `.no-scrollbar`.

## Acessibilidade

Contraste cuidado em ambos os temas, `aria-label` em ícones interativos, foco visível, `prefers-color-scheme` respeitado via `next-themes`.
