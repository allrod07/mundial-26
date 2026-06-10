import { cn } from "@/lib/utils";
import { TEAM_MAP } from "@/lib/data/teams";
import { initials } from "@/lib/format";

const SIZES: Record<string, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

/** Deterministic gradient avatar with the player's initials + team accent. */
export function PlayerAvatar({
  name,
  teamCode,
  number,
  size = "md",
  className,
}: {
  name: string;
  teamCode: string;
  number?: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const team = TEAM_MAP[teamCode];
  const c1 = team?.colors?.[0] ?? "#00c75f";
  const c2 = team?.colors?.[1] ?? "#037e40";
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full font-extrabold text-white ring-2 ring-white/20",
        SIZES[size],
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <span className="drop-shadow">{initials(name)}</span>
      {number != null && (
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--bg-elevated)] text-[10px] font-bold text-ink-700 ring-1 ring-[var(--border)] dark:text-ink-200">
          {number}
        </span>
      )}
    </div>
  );
}
