import type { Confederation, ConfederationCode } from "@/lib/types";

export const CONFEDERATIONS: Record<ConfederationCode, Confederation> = {
  UEFA: { code: "UEFA", name: "UEFA", region: "Europa" },
  CONMEBOL: { code: "CONMEBOL", name: "CONMEBOL", region: "América do Sul" },
  CONCACAF: {
    code: "CONCACAF",
    name: "CONCACAF",
    region: "América do Norte e Central",
  },
  CAF: { code: "CAF", name: "CAF", region: "África" },
  AFC: { code: "AFC", name: "AFC", region: "Ásia" },
  OFC: { code: "OFC", name: "OFC", region: "Oceania" },
};

export const CONFEDERATION_COLORS: Record<ConfederationCode, string> = {
  UEFA: "#3b82f6",
  CONMEBOL: "#f59e0b",
  CONCACAF: "#10b981",
  CAF: "#ef4444",
  AFC: "#8b5cf6",
  OFC: "#06b6d4",
};
