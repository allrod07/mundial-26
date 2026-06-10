import { cn } from "@/lib/utils";
import { TEAM_MAP } from "@/lib/data/teams";
import { flagUrl } from "@/lib/data/flagcodes";

// height in px per size; width follows a 3:2 flag ratio
const SIZE_PX: Record<string, number> = {
  xs: 13,
  sm: 18,
  md: 26,
  lg: 40,
  xl: 64,
};

export function Flag({
  code,
  emoji,
  size = "md",
  className,
  ring = true,
}: {
  code?: string;
  emoji?: string;
  size?: keyof typeof SIZE_PX;
  className?: string;
  ring?: boolean;
}) {
  const h = SIZE_PX[size];
  const w = Math.round(h * 1.45);
  const url = code ? flagUrl(code) : null;

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={TEAM_MAP[code!]?.name ?? code}
        width={w}
        height={h}
        loading="lazy"
        className={cn(
          "inline-block shrink-0 rounded-[3px] object-cover",
          ring && "ring-1 ring-black/10 dark:ring-white/15",
          className,
        )}
        style={{ width: w, height: h }}
      />
    );
  }

  // fallback: emoji glyph (host-city flags, placeholders)
  const glyph = emoji ?? TEAM_MAP[code ?? ""]?.flag ?? "🏳️";
  return (
    <span
      role="img"
      aria-label={code ? TEAM_MAP[code]?.name : "bandeira"}
      className={cn("inline-flex select-none items-center justify-center leading-none", className)}
      style={{ fontSize: h }}
    >
      {glyph}
    </span>
  );
}
