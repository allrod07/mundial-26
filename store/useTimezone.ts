"use client";

// Todos os visitantes do site estão no Brasil, então exibimos sempre o horário
// de Brasília (BRT). Mantemos o tipo/hook para os componentes que formatam
// horários continuarem desacoplados da decisão de fuso.

export type Tz = "local" | "brt";

export function useTz(): Tz {
  return "brt";
}
