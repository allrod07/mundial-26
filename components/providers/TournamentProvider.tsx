"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MatchEvent, MatchResultMap } from "@/lib/types";
import {
  buildTournament,
  simulateRemainder,
  BASE_TOURNAMENT,
  type ResolvedTournament,
} from "@/lib/engine/tournament";
import type { LiveOverlay } from "@/lib/api/overlay";

const STORAGE_KEY = "mundial26:sim";

interface TournamentCtx {
  /** Mundo REAL: só resultados oficiais (Supabase). Imune ao simulador. */
  tournament: ResolvedTournament;
  /** Mundo REAL com chaveamento PROVISÓRIO ao vivo: revela líderes e melhores
   * 3ºs parciais antes dos grupos fecharem (podem mudar a cada placar). */
  liveTournament: ResolvedTournament;
  /** Simulador: realidade atual + palpites do usuário (localStorage). */
  simTournament: ResolvedTournament;
  overrides: MatchResultMap;
  isSimulated: boolean;
  hydrated: boolean;
  /** "live" when results come from the synced API, "demo" for the bundled clock */
  dataSource: "live" | "demo";
  lastSync?: string | null;
  liveEvents: Record<string, MatchEvent[]>;
  liveStats: Record<string, { home: Record<string, number>; away: Record<string, number> }>;
  setResult: (id: string, homeGoals: number, awayGoals: number, pens?: [number, number]) => void;
  clearResult: (id: string) => void;
  simulateAll: () => void;
  resetAll: () => void;
}

const Ctx = createContext<TournamentCtx | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<MatchResultMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [live, setLive] = useState<LiveOverlay | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Busca o overlay ao vivo (resultados sincronizados API-Football → Supabase)
  // e mantém atualizado sozinho: re-busca a cada 30s e sempre que a aba volta
  // ao foco. Assim placares novos aparecem sem o usuário precisar recarregar.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/results", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: LiveOverlay | null) => {
          if (!cancelled && data && data.source === "live") setLive(data);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(() => {
      // Só busca quando a aba está visível — evita requisições à toa em
      // segundo plano; ao voltar ao foco, o listener abaixo já atualiza.
      if (typeof document === "undefined" || document.visibilityState === "visible") load();
    }, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (Object.keys(overrides).length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [overrides, hydrated]);

  const isLive = live?.source === "live";

  // ── Mundo REAL ────────────────────────────────────────────────────────────
  // Apenas resultados oficiais (Supabase). NUNCA mescla os palpites do
  // simulador, então classificação, artilharia, calendário e chaveamento ficam
  // imunes ao que o usuário faz no simulador.
  const tournament = useMemo<ResolvedTournament>(() => {
    if (isLive) {
      return buildTournament(live!.results, {
        fabricate: false,
        events: live!.events,
        fabricateEvents: false,
      });
    }
    return BASE_TOURNAMENT;
  }, [isLive, live]);

  // ── Mundo REAL com chaveamento provisório ──────────────────────────────────
  // Mesmos resultados oficiais do `tournament`, mas o mata-mata se preenche ao
  // vivo com os classificados ATUAIS (1º/2º e melhores 3ºs parciais). Usado na
  // tela de chaveamento para refletir cada placar registrado em tempo real.
  const liveTournament = useMemo<ResolvedTournament>(() => {
    if (isLive) {
      return buildTournament(live!.results, {
        fabricate: false,
        events: live!.events,
        fabricateEvents: false,
        provisional: true,
      });
    }
    return BASE_TOURNAMENT;
  }, [isLive, live]);

  // ── Simulador ─────────────────────────────────────────────────────────────
  // Parte da realidade atual e aplica por cima os palpites do usuário. Usado
  // SOMENTE na tela do simulador — não vaza para as páginas de informação.
  const simTournament = useMemo<ResolvedTournament>(() => {
    if (isLive) {
      return buildTournament(
        { ...live!.results, ...overrides },
        { fabricate: false, events: live!.events, fabricateEvents: true },
      );
    }
    return Object.keys(overrides).length
      ? buildTournament(overrides, { fabricate: false, fabricateEvents: true })
      : BASE_TOURNAMENT;
  }, [overrides, isLive, live]);

  const value = useMemo<TournamentCtx>(
    () => ({
      tournament,
      liveTournament,
      simTournament,
      overrides,
      isSimulated: Object.keys(overrides).length > 0,
      hydrated,
      dataSource: isLive ? "live" : "demo",
      lastSync: live?.lastSync ?? null,
      liveEvents: live?.events ?? {},
      liveStats: live?.stats ?? {},
      setResult: (id, homeGoals, awayGoals, pens) =>
        setOverrides((o) => ({
          ...o,
          [id]: { homeGoals, awayGoals, homePens: pens?.[0], awayPens: pens?.[1] },
        })),
      clearResult: (id) =>
        setOverrides((o) => {
          const next = { ...o };
          delete next[id];
          return next;
        }),
      simulateAll: () => setOverrides((o) => simulateRemainder(o)),
      resetAll: () => setOverrides({}),
    }),
    [tournament, liveTournament, simTournament, overrides, hydrated, isLive, live],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTournament(): TournamentCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTournament deve ser usado dentro de TournamentProvider");
  return ctx;
}
