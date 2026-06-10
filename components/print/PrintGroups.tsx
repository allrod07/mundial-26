import { GROUPS, teamsByGroup, TEAM_MAP } from "@/lib/data/teams";
import { BASE_GROUP_MATCHES } from "@/lib/data/schedule";
import { Flag } from "@/components/ui/Flag";

const STAT_COLS = ["J", "V", "E", "D", "SG", "P"];

function ScoreBox() {
  return <span className="print-box inline-block h-5 w-6 rounded-[3px] border border-ink-400/50 align-middle" />;
}

function GroupCard({ group, fixtures }: { group: string; fixtures: boolean }) {
  const teams = teamsByGroup(group);
  const matches = BASE_GROUP_MATCHES.filter((m) => m.group === group).sort(
    (a, b) => (a.round! - b.round!) || a.id.localeCompare(b.id, undefined, { numeric: true }),
  );

  return (
    <div className="print-avoid print-card surface overflow-hidden rounded-xl">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-pitch-500/5 px-3 py-2 print:bg-transparent">
        <span className="grid h-5 w-5 place-items-center rounded gradient-pitch text-[11px] font-extrabold text-white print:bg-ink-900 print:text-white">
          {group}
        </span>
        <h3 className="text-sm font-extrabold">Grupo {group}</h3>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] uppercase text-ink-400">
            <th className="py-1 pl-2 text-left font-semibold">Seleção</th>
            {STAT_COLS.map((c) => (
              <th key={c} className="w-6 text-center font-semibold">{c}</th>
            ))}
            <th className="w-7 pr-2 text-center font-semibold">Pos</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.code} className="border-t border-[var(--border)]">
              <td className="py-1.5 pl-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Flag code={t.code} size="xs" />
                  <span className="truncate">{t.name}</span>
                </span>
              </td>
              {STAT_COLS.map((c) => (
                <td key={c} className="border-l border-[var(--border)] text-center">
                  <span className="block h-5" />
                </td>
              ))}
              <td className="border-l border-[var(--border)] pr-1 text-center">
                <span className="block h-5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fixtures && (
        <div className="space-y-1 border-t border-[var(--border)] px-2 py-2">
          {matches.map((m) => (
            <div key={m.id} className="flex items-center justify-center gap-1.5 text-[11px]">
              <span className="flex min-w-0 flex-1 items-center justify-end gap-1 truncate text-right font-medium">
                <span className="truncate">{TEAM_MAP[m.homeCode!]?.name}</span>
                <Flag code={m.homeCode} size="xs" />
              </span>
              <ScoreBox />
              <span className="text-ink-400">x</span>
              <ScoreBox />
              <span className="flex min-w-0 flex-1 items-center gap-1 truncate font-medium">
                <Flag code={m.awayCode} size="xs" />
                <span className="truncate">{TEAM_MAP[m.awayCode!]?.name}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PrintGroups({ fixtures }: { fixtures: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
      {GROUPS.map((g) => (
        <GroupCard key={g} group={g} fixtures={fixtures} />
      ))}
    </div>
  );
}
