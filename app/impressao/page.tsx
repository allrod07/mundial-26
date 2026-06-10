"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Trophy, Check } from "lucide-react";
import { PrintGroups } from "@/components/print/PrintGroups";
import { PrintBracket } from "@/components/print/PrintBracket";
import { cn } from "@/lib/utils";

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
        on
          ? "border-pitch-500/40 bg-pitch-500/10 text-pitch-600 dark:text-pitch-300"
          : "border-[var(--border)] text-ink-500 hover:border-pitch-500/40",
      )}
    >
      <span className={cn("grid h-4 w-4 place-items-center rounded border", on ? "border-pitch-500 bg-pitch-500 text-white" : "border-ink-400")}>
        {on && <Check size={11} />}
      </span>
      {children}
    </button>
  );
}

export default function ImpressaoPage() {
  const [fixtures, setFixtures] = useState(true);
  const [bracket, setBracket] = useState(true);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      {/* toolbar — não imprime */}
      <div className="no-print">
        <Link href="/simulador" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300">
          <ArrowLeft size={16} /> Modo Manual
        </Link>

        <div className="relative mt-3 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pitch-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-pitch text-white shadow-glow">
                <Printer size={24} />
              </span>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-pitch-600 dark:text-pitch-400">
                  Modo Impressão
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tabela para imprimir</h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-400">
                  Imprima a tabela de grupos e o chaveamento <strong>em branco</strong> para preencher à mão, como nos velhos tempos.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Printer size={17} /> Imprimir
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-400">Incluir:</span>
          <Toggle on={fixtures} onClick={() => setFixtures((v) => !v)}>Jogos (placares)</Toggle>
          <Toggle on={bracket} onClick={() => setBracket((v) => !v)}>Chaveamento</Toggle>
        </div>
      </div>

      {/* folha imprimível */}
      <div className="paper mt-6 rounded-2xl border border-[var(--border)] p-5 shadow-card print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="mb-5 border-b border-[var(--border)] pb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pitch-700">
            <Trophy size={14} /> Copa do Mundo FIFA 2026
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Tabela para preencher</h2>
          <p className="mt-1 text-xs text-ink-500">
            Estados Unidos · Canadá · México — 11 de junho a 19 de julho de 2026
          </p>
        </header>

        <section>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide">Fase de grupos</h3>
          <PrintGroups fixtures={fixtures} />
        </section>

        {bracket && (
          <section className="mt-6 print-break-before">
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide">Mata-mata</h3>
            <PrintBracket />
          </section>
        )}

        <footer className="mt-5 border-t border-[var(--border)] pt-3 text-center text-[10px] text-ink-400">
          Mundial &apos;26 · tabela para preenchimento manual — grupos e calendário oficiais.
        </footer>
      </div>
    </div>
  );
}
