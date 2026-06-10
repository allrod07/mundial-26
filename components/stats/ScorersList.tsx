import Link from "next/link";
import type { ScorerRow } from "@/lib/types";
import { getPlayer } from "@/lib/data/squads";
import { TEAM_MAP } from "@/lib/data/teams";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils";
import { Goal } from "lucide-react";

export function ScorersList({
  scorers,
  limit = 8,
  metric = "goals",
}: {
  scorers: ScorerRow[];
  limit?: number;
  metric?: "goals" | "assists";
}) {
  const rows = [...scorers]
    .sort((a, b) =>
      metric === "goals"
        ? b.goals - a.goals || b.assists - a.assists
        : b.assists - a.assists || b.goals - a.goals,
    )
    .filter((r) => (metric === "goals" ? r.goals > 0 : r.assists > 0))
    .slice(0, limit);

  return (
    <ol className="divide-y divide-[var(--border)]">
      {rows.map((r, i) => {
        const player = getPlayer(r.playerId);
        if (!player) return null;
        const team = TEAM_MAP[r.teamCode];
        const value = metric === "goals" ? r.goals : r.assists;
        return (
          <li key={r.playerId}>
            <Link
              href={`/jogadores/${r.playerId}`}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-pitch-500/5"
            >
              <span
                className={cn(
                  "w-5 text-center stat-num text-sm font-bold",
                  i === 0 ? "text-gold-500" : "text-ink-400",
                )}
              >
                {i + 1}
              </span>
              <Flag code={r.teamCode} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{player.name}</div>
                <div className="truncate text-xs text-ink-400">{team?.name}</div>
              </div>
              {metric === "goals" && r.assists > 0 && (
                <span className="hidden text-xs text-ink-400 sm:inline">{r.assists} ass.</span>
              )}
              <span className="flex items-center gap-1.5 stat-num text-lg font-extrabold">
                {value}
                <Goal size={15} className="text-pitch-500" />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
