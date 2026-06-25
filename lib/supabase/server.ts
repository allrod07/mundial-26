import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// O Next.js cacheia fetches por padrão (Data Cache), inclusive os GETs que o
// supabase-js faz ao PostgREST. Isso fazia /api/results e /api/pool devolverem
// dados DEFASADOS mesmo com as rotas `force-dynamic`/`no-store`: a escrita (POST)
// ia fresca pro banco, mas a leitura voltava de um cache (cada tabela com seu
// próprio TTL, o que congelava placares/palpites recém-gravados). Forçar
// `cache: "no-store"` no fetch do cliente garante leitura sempre atual.
const noStoreFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
  fetch(input, { ...init, cache: "no-store" });

const CLIENT_OPTS = {
  auth: { persistSession: false },
  global: { fetch: noStoreFetch },
} as const;

export function supabaseConfigured(): boolean {
  return URL.length > 0 && ANON.length > 0;
}

/** Read-only client (anon key, respects RLS public-read policies). */
export function supabasePublic(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  return createClient(URL, ANON, CLIENT_OPTS);
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
  return createClient(URL, key, CLIENT_OPTS);
}

/** Privileged client (service role) for the sync job — server only, bypasses RLS. */
export function supabaseAdmin(): SupabaseClient {
  if (!URL || !SERVICE) throw new Error("Supabase service role não configurado.");
  return createClient(URL, SERVICE, CLIENT_OPTS);
}
