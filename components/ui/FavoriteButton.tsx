"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites, useFavoritesHydrated } from "@/store/useFavorites";

export function FavoriteButton({
  kind,
  id,
  className,
  size = 18,
}: {
  kind: "team" | "match" | "player";
  id: string;
  className?: string;
  size?: number;
}) {
  const hydrated = useFavoritesHydrated();
  const { teams, matches, players, toggleTeam, toggleMatch, togglePlayer } = useFavorites();
  const active =
    hydrated &&
    (kind === "team" ? teams.includes(id) : kind === "match" ? matches.includes(id) : players.includes(id));

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (kind === "team") toggleTeam(id);
    else if (kind === "match") toggleMatch(id);
    else togglePlayer(id);
  };

  return (
    <button
      onClick={onClick}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "grid place-items-center rounded-full p-2 transition-all hover:bg-gold-500/10",
        active ? "text-gold-500" : "text-ink-400 hover:text-gold-500",
        className,
      )}
    >
      <Star size={size} className={cn("transition-transform", active && "scale-110")} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
