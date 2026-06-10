import type { MatchEvent, MatchResultMap } from "@/lib/types";

/** Payload returned by GET /api/results — live results overlay from Supabase. */
export interface LiveOverlay {
  source: "live" | "none";
  results: MatchResultMap;
  events: Record<string, MatchEvent[]>;
  stats: Record<string, { home: Record<string, number>; away: Record<string, number> }>;
  lastSync?: string | null;
}

export const EMPTY_OVERLAY: LiveOverlay = { source: "none", results: {}, events: {}, stats: {} };
