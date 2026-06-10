import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function supabaseConfigured(): boolean {
  return URL.length > 0 && ANON.length > 0;
}

/** Read-only client (anon key, respects RLS public-read policies). */
export function supabasePublic(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

/**
 * Server-only read client. Prefers the anon key (least privilege); falls back
 * to the service role when the anon key isn't configured. Used by /api/results,
 * which only ever returns public match data (never the key) to clients.
 */
export function supabaseRead(): SupabaseClient | null {
  if (!URL) return null;
  // prefer the service role (proven to work server-side); anon as fallback.
  const key = SERVICE || ANON;
  if (!key) return null;
  return createClient(URL, key, { auth: { persistSession: false } });
}

/** Privileged client (service role) for the sync job — server only, bypasses RLS. */
export function supabaseAdmin(): SupabaseClient {
  if (!URL || !SERVICE) throw new Error("Supabase service role não configurado.");
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}
