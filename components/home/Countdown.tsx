"use client";

import { useEffect, useState } from "react";
import { NOW } from "@/lib/data/schedule";

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

/** Counts down to `targetIso`, advancing in real time from the demo clock. */
export function Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState(() => diff(target, NOW.getTime()));

  useEffect(() => {
    const mount = Date.now();
    const tick = () => {
      const effectiveNow = NOW.getTime() + (Date.now() - mount);
      setParts(diff(target, effectiveNow));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    { v: parts.d, l: "dias" },
    { v: parts.h, l: "horas" },
    { v: parts.m, l: "min" },
    { v: parts.s, l: "seg" },
  ];

  return (
    <div className="flex items-center gap-2">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-2">
          <div className="flex min-w-[3.25rem] flex-col items-center rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur">
            <span className="stat-num text-2xl font-extrabold tabular-nums text-white">
              {String(c.v).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-white/70">{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className="text-xl font-bold text-white/40">:</span>}
        </div>
      ))}
    </div>
  );
}
