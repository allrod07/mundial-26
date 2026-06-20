// ────────────────────────────────────────────────────────────────────────────
// Domain types — Mundial '26
// ────────────────────────────────────────────────────────────────────────────

export type ConfederationCode =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export interface Confederation {
  code: ConfederationCode;
  name: string;
  region: string;
}

export type PositionGroup = "GOL" | "DEF" | "MEI" | "ATA";

export type Position =
  | "Goleiro"
  | "Zagueiro"
  | "Lateral-direito"
  | "Lateral-esquerdo"
  | "Volante"
  | "Meio-campista"
  | "Meia-atacante"
  | "Ponta-direita"
  | "Ponta-esquerda"
  | "Centroavante";

export interface Team {
  /** 3-letter code, e.g. BRA */
  code: string;
  name: string;
  flag: string; // emoji
  confederation: ConfederationCode;
  fifaRank: number;
  /** internal 0-100 strength used by the simulation engine */
  rating: number;
  coach: string;
  /** resolved at runtime from the squad's marked captain */
  captain?: string;
  group: string; // A..L
  /** host nation? */
  host?: boolean;
  titles: number;
  appearances: number;
  bestResult: string;
  nickname: string;
  colors: [string, string]; // primary, secondary hex
  firstColor: string; // kit accent
}

export interface Player {
  id: string;
  teamCode: string;
  name: string;
  number: number;
  position: Position;
  positionGroup: PositionGroup;
  age: number;
  birth: string; // ISO date
  height: number; // cm
  weight: number; // kg
  foot: "Destro" | "Canhoto" | "Ambidestro";
  club: string;
  clubCountry: string;
  clubFlag: string;
  caps: number; // jogos pela seleção
  intlGoals: number; // gols pela seleção (carreira)
  marketValue: number; // em milhões de euros
  /** 0-100 overall rating used by the engine */
  rating: number;
  isCaptain?: boolean;
}

export interface City {
  id: string;
  name: string;
  country: "EUA" | "Canadá" | "México";
  countryFlag: string;
  stadium: string;
  capacity: number;
}

export type Stage =
  | "Grupos"
  | "16-avos"
  | "Oitavas"
  | "Quartas"
  | "Semifinal"
  | "Disputa de 3º"
  | "Final";

export type MatchStatus = "agendado" | "ao-vivo" | "encerrado";

export interface MatchEvent {
  minute: number;
  type: "gol" | "gol-contra" | "penalti" | "amarelo" | "vermelho" | "assist";
  teamCode: string;
  playerId: string;
  assistPlayerId?: string;
  /** present for live/API events whose players aren't in our generated squads */
  playerName?: string;
  assistName?: string;
}

export interface Match {
  id: string;
  stage: Stage;
  /** número oficial da partida na tabela da FIFA (1..104) */
  matchNo?: number;
  group?: string; // A..L for group stage
  /** matchday within group stage (1..3) */
  round?: number;
  /** ISO datetime (kickoff) */
  date: string;
  cityId: string;
  /** team codes — may be undefined for knockout placeholders */
  homeCode?: string;
  awayCode?: string;
  /** human label when team not yet decided, e.g. "1º Grupo A" */
  homeLabel?: string;
  awayLabel?: string;
  homeGoals?: number;
  awayGoals?: number;
  homePens?: number;
  awayPens?: number;
  status: MatchStatus;
  /** live clock minute when status === ao-vivo */
  minute?: number;
  events: MatchEvent[];
  /** bracket wiring */
  bracketSlot?: number; // 1..16 for R32 ordering
  feedsInto?: { matchId: string; slot: "home" | "away" };
  /** true when the team in the slot comes from a still-undecided group/phase
   * (live "provisional" bracket) — may change as more results come in */
  homeProvisional?: boolean;
  awayProvisional?: boolean;
}

export interface StandingRow {
  teamCode: string;
  group: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  /** rank within group after tiebreakers (1-based) */
  rank: number;
  /** form, most recent last: 'V' | 'E' | 'D' */
  form: string[];
}

export interface ThirdPlaceRow extends StandingRow {
  /** rank among all 12 third-placed teams */
  overallRank: number;
  qualified: boolean;
}

export interface ScorerRow {
  playerId: string;
  teamCode: string;
  goals: number;
  assists: number;
  penalties: number;
  matches: number;
}

export type MatchResultMap = Record<
  string,
  { homeGoals: number; awayGoals: number; homePens?: number; awayPens?: number }
>;
