import Link from "next/link";
import type { StandingRow } from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";

function FormDots({ form }: { form: string[] }) {
  const map: Record<string, string> = { V: "bg-pitch-500", E: "bg-ink-400", D: "bg-red-500" };
  return (
    <div className="hidden items-center gap-1 lg:flex">
      {form.slice(-5).map((f, i) => (
        <span key={i} className={cn("h-1.5 w-1.5 rounded-full", map[f] ?? "bg-ink-300")} title={f} />
      ))}
    </div>
  );
}

export function GroupTable({
  group,
  rows,
  compact = false,
}: {
  group: string;
  rows: StandingRow[];
  compact?: boolean;
}) {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <span className="grid h-6 w-6 place-items-center rounded-md gradient-pitch text-xs font-extrabold text-white">
            {group}
          </span>
          Grupo {group}
        </h3>
        <span className="text-[11px] text-ink-400">Pts</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-ink-400">
            <th className="py-2 pl-3 text-left font-semibold">#</th>
            <th className="py-2 text-left font-semibold">Seleção</th>
            <th className="w-7 text-center font-semibold">J</th>
            {!compact && (
              <>
                <th className="w-7 text-center font-semibold">V</th>
                <th className="w-7 text-center font-semibold">E</th>
                <th className="w-7 text-center font-semibold">D</th>
                <th className="hidden w-9 text-center font-semibold sm:table-cell">SG</th>
              </>
            )}
            <th className="w-9 pr-2 text-center font-semibold">P</th>
            {!compact && <th className="hidden pr-3 lg:table-cell" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const team = TEAM_MAP[r.teamCode];
            const qualifies = r.rank <= 2;
            const third = r.rank === 3;
            return (
              <tr
                key={r.teamCode}
                className="border-t border-[var(--border)] transition-colors hover:bg-pitch-500/5"
              >
                <td className="py-2.5 pl-3">
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded text-xs font-bold",
                      qualifies && "bg-pitch-500/15 text-pitch-600 dark:text-pitch-300",
                      third && "bg-gold-500/15 text-gold-600 dark:text-gold-300",
                      r.rank === 4 && "text-ink-400",
                    )}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-2.5">
                  <Link href={`/selecoes/${r.teamCode}`} className="flex items-center gap-2 font-semibold hover:text-pitch-600 dark:hover:text-pitch-300">
                    <Flag code={r.teamCode} size="sm" />
                    <span className="truncate">{team?.name}</span>
                  </Link>
                </td>
                <td className="text-center tabular text-ink-500">{r.played}</td>
                {!compact && (
                  <>
                    <td className="text-center tabular text-ink-500">{r.win}</td>
                    <td className="text-center tabular text-ink-500">{r.draw}</td>
                    <td className="text-center tabular text-ink-500">{r.loss}</td>
                    <td className="hidden text-center tabular text-ink-500 sm:table-cell">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                  </>
                )}
                <td className="pr-2 text-center stat-num font-extrabold">{r.points}</td>
                {!compact && (
                  <td className="hidden pr-3 lg:table-cell">
                    <FormDots form={r.form} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
