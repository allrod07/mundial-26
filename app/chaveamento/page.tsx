"use client";

import Link from "next/link";
import { useState } from "react";
import { GitMerge, Trophy, Info, CircleDot, Rows3 } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { Bracket } from "@/components/bracket/Bracket";
import { RadialBracket } from "@/components/bracket/RadialBracket";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareButton } from "@/components/ui/ShareButton";
import { Flag } from "@/components/ui/Flag";
import { TEAM_MAP } from "@/lib/data/teams";
import { winnerOf } from "@/lib/engine/simulate";
import { motion } from "framer-motion";

export default function ChaveamentoPage() {
  const { liveTournament: tournament } = useTournament();
  const [view, setView] = useState<"radial" | "classico">("radial");
  const final = tournament.matchMap["FINAL"];
  const champion = final?.status === "encerrado" ? winnerOf(final) : null;
  const championTeam = champion ? TEAM_MAP[champion] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <PageHeader
        eyebrow="Mata-mata"
        icon={<GitMerge size={24} />}
        title="Chaveamento"
        description="Do 16-avos de final à decisão do título. Os confrontos se preenchem ao vivo conforme os placares são registrados."
        action={<ShareButton title="Chaveamento — Mundial '26" />}
      />

      {championTeam && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 overflow-hidden rounded-3xl border border-gold-500/30"
        >
          <div className="relative flex flex-col items-center gap-3 p-8 text-center">
            <div className="absolute inset-0 gradient-gold opacity-10" />
            <Trophy className="relative text-gold-500" size={36} />
            <div className="relative text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
              Campeão Mundial 2026
            </div>
            <div className="relative flex items-center gap-4">
              <Flag code={champion!} size="xl" />
              <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                {championTeam.name}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {!tournament.groupComplete && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-ink-500">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <span>
            Enquanto a fase de grupos não termina, os confrontos aparecem com a
            classificação <b>provisória</b> (marcada com{" "}
            <span className="rounded bg-amber-500/15 px-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">prov</span>
            ) e mudam a cada novo placar. Eles se consolidam quando cada grupo
            fecha — e os 8 melhores 3ºs, quando todos os grupos terminam. Para
            testar cenários hipotéticos, use o{" "}
            <Link href="/simulador" className="font-semibold text-pitch-600 hover:underline dark:text-pitch-300">
              simulador
            </Link>
            .
          </span>
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
          <button
            onClick={() => setView("radial")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${view === "radial" ? "gradient-pitch text-white shadow-sm" : "text-ink-500 hover:text-pitch-600 dark:hover:text-pitch-300"}`}
          >
            <CircleDot size={15} /> Radial
          </button>
          <button
            onClick={() => setView("classico")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${view === "classico" ? "gradient-pitch text-white shadow-sm" : "text-ink-500 hover:text-pitch-600 dark:hover:text-pitch-300"}`}
          >
            <Rows3 size={15} /> Clássico
          </button>
        </div>
      </div>

      <div className="mt-4 surface rounded-3xl p-4 sm:p-6">
        {view === "radial" ? <RadialBracket tournament={tournament} /> : <Bracket tournament={tournament} />}
      </div>
    </div>
  );
}
