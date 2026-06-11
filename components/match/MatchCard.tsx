"use client";

import Link from "next/link";
import type { Match } from "@/lib/types";
import { TEAM_MAP } from "@/lib/data/teams";
import { CITY_MAP } from "@/lib/data/cities";
import { Flag } from "@/components/ui/Flag";
import { Badge, LiveBadge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { fmtKickoff, fmtDay } from "@/lib/format";
import { useTz } from "@/store/useTimezone";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

function Side({
  code,
  label,
  align,
  winner,
}: {
  code?: string;
  label?: string;
  align: "left" | "right";
  winner?: boolean;
}) {
  const team = code ? TEAM_MAP[code] : undefined;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      {team ? (
        <Flag code={code} size="md" />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ink-500/10 text-xs">?</span>
      )}
      <span
        className={cn(
          "truncate text-sm font-bold sm:text-[15px]",
          winner === false && "text-ink-400",
        )}
      >
        {team?.name ?? label ?? "A definir"}
      </span>
    </div>
  );
}

export function MatchCard({
  match,
  showDay = false,
  className,
}: {
  match: Match;
  showDay?: boolean;
  className?: string;
}) {
  const tz = useTz();
  const city = CITY_MAP[match.cityId];
  const finished = match.status === "encerrado";
  const live = match.status === "ao-vivo";
  const stageLabel =
    match.stage === "Grupos" ? `Grupo ${match.group}` : match.stage;

  const homeWin = finished && (match.homeGoals ?? 0) > (match.awayGoals ?? 0);
  const awayWin = finished && (match.awayGoals ?? 0) > (match.homeGoals ?? 0);
  const penHome = match.homePens != null && match.awayPens != null && match.homePens > match.awayPens;
  const penAway = match.homePens != null && match.awayPens != null && match.awayPens > match.homePens;

  return (
    <Link
      href={`/jogos/${match.id}`}
      className={cn(
        "group surface block rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Badge tone={match.stage === "Grupos" ? "ink" : "gold"}>{stageLabel}</Badge>
          {showDay && <span className="text-ink-400">{fmtDay(match.date)}</span>}
        </div>
        <div className="flex items-center gap-1">
          {live ? (
            <LiveBadge minute={match.minute} />
          ) : finished ? (
            <Badge tone="pitch">Encerrado</Badge>
          ) : (
            <span className="text-xs font-semibold text-ink-400">{fmtKickoff(match.date, match.cityId, tz)}</span>
          )}
          <FavoriteButton kind="match" id={match.id} size={15} className="-mr-1.5 p-1.5" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Side code={match.homeCode} label={match.homeLabel} align="left" winner={finished ? homeWin || penHome : undefined} />
        <div className="shrink-0 px-1 text-center">
          {finished || live ? (
            <div className="flex items-center gap-1.5 stat-num text-xl font-extrabold">
              <span className={cn(awayWin && "text-ink-400")}>{match.homeGoals}</span>
              <span className="text-ink-300">:</span>
              <span className={cn(homeWin && "text-ink-400")}>{match.awayGoals}</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-ink-300">×</span>
          )}
          {match.homePens != null && (
            <div className="mt-0.5 text-[10px] font-semibold text-ink-400">
              pên {match.homePens}-{match.awayPens}
            </div>
          )}
        </div>
        <Side code={match.awayCode} label={match.awayLabel} align="right" winner={finished ? awayWin || penAway : undefined} />
      </div>

      {city && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-2.5 text-[11px] text-ink-400">
          <MapPin size={12} />
          <span className="truncate">
            {city.stadium} · {city.name} {city.countryFlag}
          </span>
        </div>
      )}
    </Link>
  );
}
