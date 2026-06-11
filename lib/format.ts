import type { Position, PositionGroup } from "@/lib/types";
import { BRT_DELTA } from "@/lib/data/cities";

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

/**
 * Horário do jogo no fuso escolhido. "local" mostra o horário da sede (como
 * armazenado); "brt" converte para o horário de Brasília usando o offset da
 * cidade. Acrescenta "(+1)" quando, em Brasília, o jogo cai no dia seguinte.
 */
export function fmtKickoff(iso: string, cityId: string, tz: "local" | "brt" = "local"): string {
  const d = new Date(iso);
  let hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  let dayShift = 0;
  if (tz === "brt") {
    hour += BRT_DELTA[cityId] ?? 0;
    if (hour >= 24) { hour -= 24; dayShift = 1; }
  }
  const t = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return dayShift > 0 ? `${t} (+1)` : t;
}

/**
 * Instante REAL do pontapé inicial em epoch (ms, UTC). O ISO guarda o horário
 * local da sede (rotulado como Z), então o instante real = local + offset da
 * sede; como Brasília é UTC−3, esse offset é (BRT_DELTA + 3) horas. Usado pela
 * contagem regressiva para acertar o tempo que falta, independente do fuso.
 */
export function kickoffEpoch(iso: string, cityId: string): number {
  return Date.parse(iso) + ((BRT_DELTA[cityId] ?? 0) + 3) * 3_600_000;
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
