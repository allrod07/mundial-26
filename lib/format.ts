import type { Position, PositionGroup } from "@/lib/types";

// Fixed timezone so server & client render identical strings (no hydration drift).
// Stored kickoff times are treated as venue-local; we display them as-is (UTC).
const TZ = "UTC";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
const MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function fmtDay(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} de ${MONTHS_LONG[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function fmtMoney(millions: number): string {
  if (millions >= 1000) return `€${(millions / 1000).toFixed(1)}B`;
  if (millions >= 1) return `€${millions.toFixed(millions < 10 ? 1 : 0)}M`;
  return `€${(millions * 1000).toFixed(0)}K`;
}

export function fmtPct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export const POSITION_ABBR: Record<Position, string> = {
  Goleiro: "GOL",
  Zagueiro: "ZAG",
  "Lateral-direito": "LD",
  "Lateral-esquerdo": "LE",
  Volante: "VOL",
  "Meio-campista": "MC",
  "Meia-atacante": "MEA",
  "Ponta-direita": "PD",
  "Ponta-esquerda": "PE",
  Centroavante: "CA",
};

export const POSITION_GROUP_LABEL: Record<PositionGroup, string> = {
  GOL: "Goleiros",
  DEF: "Defensores",
  MEI: "Meio-campistas",
  ATA: "Atacantes",
};

export const POSITION_GROUP_COLOR: Record<PositionGroup, string> = {
  GOL: "#e0991f",
  DEF: "#3b82f6",
  MEI: "#00c75f",
  ATA: "#ef4444",
};

export function ageFromBirth(iso: string, ref = new Date("2026-06-11")): number {
  const b = new Date(iso);
  let age = ref.getUTCFullYear() - b.getUTCFullYear();
  const md = ref.getUTCMonth() - b.getUTCMonth();
  if (md < 0 || (md === 0 && ref.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
