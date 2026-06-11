"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export type Tz = "local" | "brt";

interface TzState {
  tz: Tz;
  setTz: (t: Tz) => void;
  toggle: () => void;
}

export const useTimezoneStore = create<TzState>()(
  persist(
    (set) => ({
      tz: "local",
      setTz: (tz) => set({ tz }),
      toggle: () => set((s) => ({ tz: s.tz === "local" ? "brt" : "local" })),
    }),
    { name: "mundial26:tz" },
  ),
);

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/**
 * Fuso efetivo: "local" até a hidratação (igual ao SSR) para evitar mismatch;
 * depois reflete a preferência persistida do usuário.
 */
export function useTz(): Tz {
  const tz = useTimezoneStore((s) => s.tz);
  return useHydrated() ? tz : "local";
}
