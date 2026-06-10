import { cn } from "@/lib/utils";

export function StatBar({
  value,
  max = 100,
  color = "#00c75f",
  className,
  height = 8,
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-ink-500/10", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/** Two-sided comparison bar (home vs away) */
export function VersusBar({
  left,
  right,
  leftColor = "#00c75f",
  rightColor = "#3b82f6",
}: {
  left: number;
  right: number;
  leftColor?: string;
  rightColor?: string;
}) {
  const total = left + right || 1;
  const lp = (left / total) * 100;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink-500/10">
      <div className="h-full transition-all duration-700" style={{ width: `${lp}%`, background: leftColor }} />
      <div className="h-full flex-1 transition-all duration-700" style={{ background: rightColor }} />
    </div>
  );
}
