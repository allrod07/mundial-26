import Link from "next/link";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";

export interface RankingRow {
  teamCode: string;
  value: number;
  sub?: string;
}

export function RankingBars({
  rows,
  color = "#00c75f",
  format = (n: number) => String(n),
  max,
}: {
  rows: RankingRow[];
  color?: string;
  format?: (n: number) => string;
  max?: number;
}) {
  const top = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => {
        const team = TEAM_MAP[r.teamCode];
        return (
          <Link
            key={r.teamCode}
            href={`/selecoes/${r.teamCode}`}
            className="flex items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-pitch-500/5"
          >
            <span className="w-4 text-center text-xs font-bold text-ink-400">{i + 1}</span>
            <Flag code={r.teamCode} size="xs" />
            <span className="w-28 shrink-0 truncate text-sm font-semibold sm:w-36">{team?.name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-500/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(r.value / top) * 100}%`, background: color }}
              />
            </div>
            <span className="w-12 text-right stat-num text-sm font-extrabold tabular">{format(r.value)}</span>
          </Link>
        );
      })}
    </div>
  );
}
