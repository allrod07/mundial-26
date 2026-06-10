"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  teams: string[];
  matches: string[];
  players: string[];
  toggleTeam: (code: string) => void;
  toggleMatch: (id: string) => void;
  togglePlayer: (id: string) => void;
  isTeam: (code: string) => boolean;
  isMatch: (id: string) => boolean;
  isPlayer: (id: string) => boolean;
}

const toggle = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      teams: [],
      matches: [],
      players: [],
      toggleTeam: (code) => set((s) => ({ teams: toggle(s.teams, code) })),
      toggleMatch: (id) => set((s) => ({ matches: toggle(s.matches, id) })),
      togglePlayer: (id) => set((s) => ({ players: toggle(s.players, id) })),
      isTeam: (code) => get().teams.includes(code),
      isMatch: (id) => get().matches.includes(id),
      isPlayer: (id) => get().players.includes(id),
    }),
    { name: "mundial26:favorites" },
  ),
);

/** SSR-safe hydration flag to avoid mismatches on persisted stores. */
export function useFavoritesHydrated() {
  return useHydrated();
}

import { useEffect, useState } from "react";
function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
