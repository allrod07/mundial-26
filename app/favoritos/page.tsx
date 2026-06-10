"use client";

import Link from "next/link";
import { Star, Users, CalendarDays, User, Heart } from "lucide-react";
import { useTournament } from "@/components/providers/TournamentProvider";
import { useFavorites, useFavoritesHydrated } from "@/store/useFavorites";
import { TEAM_MAP } from "@/lib/data/teams";
import { getPlayer } from "@/lib/data/squads";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { MatchCard } from "@/components/match/MatchCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { POSITION_ABBR } from "@/lib/format";

export default function FavoritosPage() {
  const hydrated = useFavoritesHydrated();
  const { tournament } = useTournament();
  const { teams, matches, players } = useFavorites();

  const empty = hydrated && teams.length === 0 && matches.length === 0 && players.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Painel pessoal"
        icon={<Heart size={24} />}
        title="Meus favoritos"
        description="Sua central personalizada com as seleções, partidas e jogadores que você acompanha."
      />

      {!hydrated ? (
        <div className="mt-10 text-center text-sm text-ink-400">Carregando favoritos…</div>
      ) : empty ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] py-16 text-center">
          <Star className="mx-auto mb-3 text-gold-500" size={32} />
          <p className="font-bold">Você ainda não tem favoritos</p>
          <p className="mt-1 text-sm text-ink-400">Toque na estrela em qualquer seleção, partida ou jogador para salvá-los aqui.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/selecoes" className="rounded-full gradient-pitch px-4 py-2 text-sm font-bold text-white">Explorar seleções</Link>
            <Link href="/calendario" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold">Ver calendário</Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {teams.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold"><Users size={18} className="text-pitch-500" /> Seleções</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {teams.map((code) => {
                  const t = TEAM_MAP[code];
                  if (!t) return null;
                  return (
                    <Link key={code} href={`/selecoes/${code}`}>
                      <Card interactive className="relative p-5 text-center">
                        <div className="absolute right-2 top-2"><FavoriteButton kind="team" id={code} size={15} /></div>
                        <Flag code={code} size="lg" />
                        <div className="mt-3 text-sm font-bold">{t.name}</div>
                        <Badge tone="ink" className="mt-2">#{t.fifaRank} FIFA</Badge>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {matches.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold"><CalendarDays size={18} className="text-pitch-500" /> Partidas</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((id) => {
                  const m = tournament.matchMap[id];
                  return m ? <MatchCard key={id} match={m} showDay /> : null;
                })}
              </div>
            </section>
          )}

          {players.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold"><User size={18} className="text-pitch-500" /> Jogadores</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {players.map((id) => {
                  const p = getPlayer(id);
                  if (!p) return null;
                  return (
                    <Card key={id} interactive className="flex items-center gap-3 p-3">
                      <PlayerAvatar name={p.name} teamCode={p.teamCode} number={p.number} size="md" />
                      <Link href={`/jogadores/${id}`} className="min-w-0 flex-1">
                        <div className="truncate font-bold">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-400">
                          <Flag code={p.teamCode} size="xs" /> {TEAM_MAP[p.teamCode]?.name} · {POSITION_ABBR[p.position]}
                        </div>
                      </Link>
                      <span className="stat-num text-lg font-extrabold text-pitch-600 dark:text-pitch-300">{p.rating}</span>
                      <FavoriteButton kind="player" id={id} size={15} />
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
