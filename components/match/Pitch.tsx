import Link from "next/link";
import type { LineupSpot } from "@/lib/engine/lineup";

function PitchMarkings() {
  return (
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5">
        <rect x="3" y="3" width="94" height="144" />
        <line x1="3" y1="75" x2="97" y2="75" />
        <circle cx="50" cy="75" r="11" />
        <circle cx="50" cy="75" r="0.8" fill="rgba(255,255,255,0.5)" />
        {/* bottom box */}
        <rect x="22" y="129" width="56" height="18" />
        <rect x="37" y="141" width="26" height="6" />
        <circle cx="50" cy="123" r="0.8" fill="rgba(255,255,255,0.5)" />
        {/* top box */}
        <rect x="22" y="3" width="56" height="18" />
        <rect x="37" y="3" width="26" height="6" />
        <circle cx="50" cy="27" r="0.8" fill="rgba(255,255,255,0.5)" />
      </g>
    </svg>
  );
}

export function Pitch({
  spots,
  color = "#ffffff",
  textColor = "#04130b",
}: {
  spots: LineupSpot[];
  color?: string;
  textColor?: string;
}) {
  return (
    <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl">
      <div className="absolute inset-0" style={{ background: "linear-gradient(170deg,#0a8f4a,#067a3e 55%,#0a8f4a)" }} />
      <div className="pitch-stripes absolute inset-0" />
      <PitchMarkings />

      {spots.map((s) => (
        <Link
          key={s.player.id}
          href={`/jogadores/${s.player.id}`}
          className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${s.x}%`, top: `${100 - s.y}%` }}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold shadow-md ring-2 ring-white/40 transition-transform group-hover:scale-110 sm:h-9 sm:w-9"
            style={{ background: color, color: textColor }}
          >
            {s.player.number}
          </span>
          <span className="mt-1 max-w-[5rem] truncate rounded bg-black/40 px-1 text-[9px] font-semibold text-white backdrop-blur sm:text-[10px]">
            {s.player.name.split(" ").slice(-1)[0]}
          </span>
        </Link>
      ))}
    </div>
  );
}
