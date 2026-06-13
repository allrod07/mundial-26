// Bolão da Família — configuração central
// ─────────────────────────────────────────────────────────────────────────────
// Esses valores governam os prêmios em R$ mostrados nos cards do /bolao, no
// PDF de regras (/bolao/regras) e na prestação de contas (/bolao/impressao).
// Trocou aqui, todos os lugares atualizam.

/** Valor da entrada por participante (R$). */
export const ENTRY_VALUE_BRL = 20;

/** Distribuição do bolo entre os 3 primeiros (precisa somar 1). */
export const PRIZE_SPLIT = {
  first: 0.70,
  second: 0.20,
  third: 0.10,
} as const;

/** Calcula o bolo arrecadado a partir do nº de participantes pagantes. */
export function computePot(paidParticipants: number): number {
  return paidParticipants * ENTRY_VALUE_BRL;
}

/** Devolve os 3 prêmios em R$, calculados a partir do bolo. */
export function computePrizes(paidParticipants: number) {
  const pot = computePot(paidParticipants);
  return {
    pot,
    first: Math.round(pot * PRIZE_SPLIT.first * 100) / 100,
    second: Math.round(pot * PRIZE_SPLIT.second * 100) / 100,
    third: Math.round(pot * PRIZE_SPLIT.third * 100) / 100,
  };
}

/** Formata um valor em R$ no padrão pt-BR. */
export function fmtBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
