import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "pitch" | "gold" | "ink" | "blue" | "red" | "live";

const TONES: Record<Tone, string> = {
  pitch: "bg-pitch-500/12 text-pitch-700 dark:text-pitch-300 ring-1 ring-pitch-500/20",
  gold: "bg-gold-500/12 text-gold-700 dark:text-gold-300 ring-1 ring-gold-500/20",
  ink: "bg-ink-500/10 text-ink-600 dark:text-ink-300 ring-1 ring-ink-500/15",
  blue: "bg-blue-500/12 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20",
  red: "bg-red-500/12 text-red-700 dark:text-red-300 ring-1 ring-red-500/20",
  live: "bg-red-500 text-white shadow-sm",
};

export function Badge({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn("chip", TONES[tone], className)}>{children}</span>;
}

export function LiveBadge({ minute }: { minute?: number }) {
  return (
    <span className="chip bg-red-500 text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
      {minute != null ? `${minute}'` : "AO VIVO"}
    </span>
  );
}
