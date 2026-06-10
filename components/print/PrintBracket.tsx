import { KO_DEFS, labelForSource } from "@/lib/data/schedule";

function TeamLine({ label }: { label?: string }) {
  return (
    <div className="flex items-end gap-1">
      <span className="print-line min-w-0 flex-1 truncate border-b border-ink-400/40 pb-[1px] text-[9px] leading-4 text-ink-400 print:text-[7px]">
        {label ?? " "}
      </span>
      <span className="print-box h-4 w-5 shrink-0 rounded-[2px] border border-ink-400/50" />
    </div>
  );
}

function MatchSlot({ home, away }: { home?: string; away?: string }) {
  return (
    <div className="print-card rounded-md border border-[var(--border)] p-1">
      <TeamLine label={home} />
      <div className="mt-1" />
      <TeamLine label={away} />
    </div>
  );
}

function Column({ title, slots }: { title: string; slots: { home?: string; away?: string }[] }) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col print:min-w-0">
      <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink-400 print:text-[8px]">
        {title}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-1.5">
        {slots.map((s, i) => (
          <MatchSlot key={i} home={s.home} away={s.away} />
        ))}
      </div>
    </div>
  );
}

export function PrintBracket() {
  const r32 = KO_DEFS.filter((d) => d.stage === "16-avos").map((d) => ({
    home: labelForSource(d.home),
    away: labelForSource(d.away),
  }));
  const blank = (n: number) => Array.from({ length: n }, () => ({ home: undefined, away: undefined }));

  return (
    <div className="print-avoid">
      <div className="no-scrollbar overflow-x-auto pb-2">
        <div className="flex min-w-[820px] gap-3 print:min-w-0">
          <Column title="16-avos" slots={r32} />
          <Column title="Oitavas" slots={blank(8)} />
          <Column title="Quartas" slots={blank(4)} />
          <Column title="Semifinais" slots={blank(2)} />
          <Column title="Final" slots={blank(1)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-stretch gap-4">
        <div className="print-card min-w-[220px] flex-1 rounded-md border border-[var(--border)] p-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gold-600">Disputa de 3º lugar</div>
          <TeamLine />
          <div className="mt-1.5" />
          <TeamLine />
        </div>
        <div className="print-card min-w-[220px] flex-1 rounded-md border border-gold-500/40 p-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gold-600">
            🏆 Campeão Mundial 2026
          </div>
          <span className="print-line block h-7 border-b border-ink-400/50" />
        </div>
      </div>
    </div>
  );
}
