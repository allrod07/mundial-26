// Server-only client for API-Football (api-football.com / api-sports.io).
// Auth: header `x-apisports-key` (direct) or `x-rapidapi-key` (via RapidAPI).
// Never import this in client components — it reads the secret key from env.

import "server-only";
import { API_LEAGUE_ID, API_SEASON } from "@/lib/data/apiMap";

const BASE = (process.env.API_FOOTBALL_HOST || "https://v3.football.api-sports.io").replace(/\/$/, "");
const KEY = process.env.API_FOOTBALL_KEY || "";
const VIA_RAPID = process.env.API_FOOTBALL_VIA_RAPIDAPI === "true";

export function apiFootballConfigured(): boolean {
  return KEY.length > 0;
}

async function af<T = unknown>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  if (!KEY) throw new Error("API_FOOTBALL_KEY ausente — defina a variável de ambiente.");
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${BASE}/${path}${qs ? `?${qs}` : ""}`;
  const headers: Record<string, string> = VIA_RAPID
    ? { "x-rapidapi-key": KEY, "x-rapidapi-host": BASE.replace(/^https?:\/\//, "") }
    : { "x-apisports-key": KEY };

  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API-Football ${res.status} em ${path}`);
  const json = await res.json();
  const errs = json.errors;
  if (errs && (Array.isArray(errs) ? errs.length : Object.keys(errs).length)) {
    throw new Error(`API-Football erro: ${JSON.stringify(errs)}`);
  }
  return (json.response ?? []) as T[];
}

// ── Response shapes (subset we consume) ──────────────────────────────────────
export interface AfFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { name: string | null; city: string | null };
  };
  league: { round: string };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals: { home: number | null; away: number | null };
  score: { penalty: { home: number | null; away: number | null } };
}

export interface AfEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string; // "Goal" | "Card" | "subst" | "Var"
  detail: string; // "Normal Goal" | "Penalty" | "Own Goal" | "Yellow Card" | "Red Card" | ...
}

export interface AfStatistics {
  team: { id: number; name: string };
  statistics: { type: string; value: number | string | null }[];
}

// ── Endpoints ────────────────────────────────────────────────────────────────
export const fetchFixtures = (season = API_SEASON) =>
  af<AfFixture>("fixtures", { league: API_LEAGUE_ID, season });

export const fetchFixtureEvents = (fixture: number) =>
  af<AfEvent>("fixtures/events", { fixture });

export const fetchFixtureStatistics = (fixture: number) =>
  af<AfStatistics>("fixtures/statistics", { fixture });

export const fetchFixtureLineups = (fixture: number) =>
  af<unknown>("fixtures/lineups", { fixture });

export const fetchStandings = (season = API_SEASON) =>
  af<unknown>("standings", { league: API_LEAGUE_ID, season });

/** Map API-Football status.short to our domain status. */
export function mapStatus(short: string): "agendado" | "ao-vivo" | "encerrado" {
  if (["FT", "AET", "PEN", "WO", "AWD"].includes(short)) return "encerrado";
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(short)) return "ao-vivo";
  return "agendado";
}
