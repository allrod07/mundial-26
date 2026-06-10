import type { Player, Position, PositionGroup } from "@/lib/types";
import { Rng } from "@/lib/rng";
import { TEAMS, TEAM_MAP } from "@/lib/data/teams";
import { ROSTERS, type Pos, type RosterEntry } from "@/lib/data/rosters";

// POS (GK/DF/MF/FW) -> position group used by the engine & UI
const POS_GROUP: Record<Pos, PositionGroup> = {
  GK: "GOL",
  DF: "DEF",
  MF: "MEI",
  FW: "ATA",
};

// Heuristic fine positions assigned in roster order within each group, so the
// tactical pitch / formations have full-backs, holding mids, wingers, etc.
const DEF_SEQ: Position[] = ["Zagueiro", "Zagueiro", "Lateral-direito", "Lateral-esquerdo", "Zagueiro", "Lateral-direito", "Lateral-esquerdo", "Zagueiro", "Zagueiro"];
const MEI_SEQ: Position[] = ["Volante", "Meio-campista", "Volante", "Meio-campista", "Meia-atacante", "Meio-campista", "Volante", "Meia-atacante", "Meio-campista"];
const ATA_SEQ: Position[] = ["Centroavante", "Ponta-direita", "Ponta-esquerda", "Centroavante", "Ponta-direita", "Ponta-esquerda", "Centroavante"];

// Elite-club prestige (substring match against the real club strings).
const ELITE: [string, number][] = [
  ["Real Madrid", 99], ["Manchester City", 98], ["FC Barcelona", 97], ["Bayern München", 96],
  ["Paris Saint-Germain", 95], ["Liverpool", 95], ["Arsenal", 93], ["Internazionale", 91],
  ["Chelsea", 90], ["Atlético De Madrid", 90], ["Tottenham", 87], ["Borussia Dortmund", 87],
  ["Juventus", 87], ["Manchester United", 86], ["AC Milan", 86], ["SSC Napoli", 86],
  ["Bayer 04 Leverkusen", 86], ["Newcastle", 84], ["Aston Villa", 83], ["Atalanta", 83],
  ["RB Leipzig", 83], ["AS Roma", 82], ["Benfica", 82], ["Sporting CP", 82], ["FC Porto", 81],
  ["Real Sociedad", 80], ["Villarreal", 80], ["Athletic Club", 80], ["Olympique Marseille", 80],
  ["AS Monaco", 80], ["Brighton", 79], ["Galatasaray", 79], ["Fenerbahçe", 78], ["AFC Ajax", 79],
  ["PSV Eindhoven", 79], ["Olympique Lyonnais", 78], ["West Ham", 78], ["Nottingham Forest", 78],
  ["VfB Stuttgart", 78], ["Eintracht Frankfurt", 78], ["Real Betis", 78], ["Fiorentina", 78],
  ["Sevilla", 78], ["Bologna", 78], ["Al Hilal", 80], ["Al Nassr", 78], ["Al Ahli", 77],
  ["Al Ittihad", 77], ["CR Flamengo", 78], ["SE Palmeiras", 78], ["Feyenoord", 77], ["Girona", 77],
  ["Crystal Palace", 77], ["Sunderland", 76], ["Everton", 76], ["Wolverhampton", 75], ["Celtic", 74],
];
function clubPrestige(club: string): number {
  for (const [k, v] of ELITE) if (club.includes(k)) return v;
  return 68;
}

// Star ratings so icons stand out and captain the side.
const ICONS: Record<string, number> = {
  "ARG:MESSI": 93, "ARG:L. MARTINEZ": 89, "ARG:J. ALVAREZ": 88, "ARG:MAC ALLISTER": 86, "ARG:E. MARTINEZ": 88, "ARG:DE PAUL": 85, "ARG:ROMERO": 85, "ARG:E. FERNANDEZ": 85,
  "FRA:MBAPPE": 93, "FRA:DEMBELE": 89, "FRA:THURAM": 86, "FRA:SALIBA": 87, "FRA:KONATE": 85, "FRA:TCHOUAMENI": 86, "FRA:MAIGNAN": 87, "FRA:OLISE": 85,
  "ESP:LAMINE YAMAL": 91, "ESP:PEDRI": 90, "ESP:RODRIGO": 91, "ESP:GAVI": 85, "ESP:OLMO": 86, "ESP:CUBARSÍ": 84, "ESP:UNAI SIMÓN": 85, "ESP:ZUBIMENDI": 85, "ESP:OYARZABAL": 85, "ESP:CUCURELLA": 84,
  "ENG:BELLINGHAM": 90, "ENG:KANE": 91, "ENG:SAKA": 89, "ENG:RICE": 87, "ENG:STONES": 85, "ENG:PICKFORD": 85, "ENG:RASHFORD": 84, "ENG:GUÉHI": 84,
  "POR:RONALDO": 89, "POR:B. FERNANDES": 88, "POR:RAFA LEÃO": 86, "POR:BERNARDO": 87, "POR:RÚBEN DIAS": 87, "POR:VITINHA": 87, "POR:JOÃO NEVES": 86, "POR:DIOGO COSTA": 85, "POR:N. MENDES": 85,
  "BRA:VINI JR.": 91, "BRA:RAPHINHA": 89, "BRA:A. BECKER": 89, "BRA:MARQUINHOS": 85, "BRA:BRUNO G.": 85, "BRA:CUNHA": 84, "BRA:NEYMAR JR": 85, "BRA:MARTINELLI": 84, "BRA:GABRIEL": 86,
  "NED:VIRGIL": 89, "NED:F. DE JONG": 87, "NED:GAKPO": 85, "NED:DUMFRIES": 84, "NED:REIJNDERS": 85,
  "GER:MUSIALA": 90, "GER:WIRTZ": 89, "GER:KIMMICH": 87, "GER:RÜDIGER": 86, "GER:NEUER": 86, "GER:SANÉ": 84, "GER:HAVERTZ": 85, "GER:TAH": 84,
  "BEL:DE BRUYNE": 89, "BEL:COURTOIS": 88, "BEL:DOKU": 85, "BEL:LUKAKU": 84,
  "CRO:MODRIĆ": 87, "CRO:GVARDIOL": 86, "CRO:KOVAČIĆ": 84,
  "URU:F. VALVERDE": 89, "URU:R. ARAUJO": 85, "URU:D. NUÑEZ": 84, "URU:J.M. GIMÉNEZ": 84,
  "COL:LUIS DIAZ": 87, "COL:JAMES": 83,
  "NOR:BRAUT HAALAND": 92, "NOR:ØDEGAARD": 88, "NOR:SØRLOTH": 84, "NOR:NUSA": 82,
  "SEN:MANÉ": 84, "SEN:JACKSON": 83, "SEN:KOULIBALY": 82,
  "MAR:HAKIMI": 87, "MAR:BRAHIM": 84, "MAR:BONO": 84,
  "EGY:M. SALAH": 89, "EGY:MARMOUSH": 84,
  "KOR:HEUNGMIN": 86, "KOR:MINJAE": 85, "KOR:KANGIN": 83,
  "JPN:KUBO": 84, "JPN:KAMADA": 82,
  "SWE:ISAK": 88, "SWE:GYÖKERES": 87, "SWE:ELANGA": 83,
  "SUI:AKANJI": 84, "SUI:XHAKA": 84, "SUI:KOBEL": 84,
  "AUT:ALABA": 84, "AUT:SABITZER": 83,
  "TUR:ARDA GÜLER": 86, "TUR:ÇALHANOĞLU": 86, "TUR:YILDIZ": 85,
  "USA:PULISIC": 85, "USA:BALOGUN": 82,
  "ECU:M. CAICEDO": 86, "ECU:PACHO": 83,
  "CIV:AMAD": 83, "CIV:NDICKA": 82,
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function dobToIso(dob: string): string {
  const [d, m, y] = dob.split("/");
  return `${y}-${m}-${d}`;
}
function ageFrom(iso: string): number {
  const b = new Date(iso);
  const ref = new Date("2026-06-11");
  let age = ref.getUTCFullYear() - b.getUTCFullYear();
  const md = ref.getUTCMonth() - b.getUTCMonth();
  if (md < 0 || (md === 0 && ref.getUTCDate() < b.getUTCDate())) age--;
  return age;
}

function buildSquad(code: string): Player[] {
  const team = TEAM_MAP[code];
  const roster = ROSTERS[code] ?? [];
  const counters = { DEF: 0, MEI: 0, ATA: 0 };

  const players = roster.map((entry: RosterEntry): Player => {
    const [number, pos, name, dob, club, height] = entry;
    const group = POS_GROUP[pos];
    const rng = new Rng(`p-${code}-${number}`);
    const birth = dobToIso(dob);
    const age = ageFrom(birth);

    let position: Position;
    if (group === "GOL") position = "Goleiro";
    else if (group === "DEF") position = DEF_SEQ[counters.DEF++ % DEF_SEQ.length];
    else if (group === "MEI") position = MEI_SEQ[counters.MEI++ % MEI_SEQ.length];
    else position = ATA_SEQ[counters.ATA++ % ATA_SEQ.length];

    const icon = ICONS[`${code}:${name}`];
    let rating: number;
    if (icon) rating = icon;
    else {
      // team.rating reflects top-XI strength; squad depth sits a notch below,
      // with club prestige differentiating the better-placed players.
      const prestige = clubPrestige(club);
      const posAdj = group === "ATA" ? 1 : group === "GOL" ? -1 : 0;
      rating = clamp(team.rating - 7 + (prestige - 78) * 0.12 + posAdj + rng.gauss(0, 3), 50, team.rating - 1);
    }

    const clubCountry = /\(([A-Z]{3})\)\s*$/.exec(club)?.[1] ?? "";
    const goalRate = group === "ATA" ? 0.42 : group === "MEI" ? 0.18 : group === "DEF" ? 0.05 : 0.005;
    const caps = Math.max(1, Math.round((age - 17) * (0.5 + rating / 140) * (0.7 + rng.float() * 0.9)));
    const peak = 1 - Math.abs(age - 26) / 24;
    let value = Math.pow(Math.max(0, rating - 58) / 34, 3) * 220 * (0.7 + peak * 0.5);
    value *= 0.82 + rng.float() * 0.42;
    const marketValue = value >= 20 ? Math.round(value) : Math.round(value * 2) / 2;

    const lefty = position === "Lateral-esquerdo" || position === "Ponta-esquerda";

    return {
      id: `${code}-${number}`,
      teamCode: code,
      name,
      number,
      position,
      positionGroup: group,
      age,
      birth,
      height,
      weight: clamp(height - 100 + rng.int(-6, 4), 60, 100),
      foot: lefty ? (rng.bool(0.6) ? "Canhoto" : "Destro") : rng.bool(0.18) ? "Canhoto" : "Destro",
      club,
      clubCountry,
      clubFlag: "",
      caps,
      intlGoals: Math.round(caps * goalRate * (0.4 + rng.float())),
      marketValue,
      rating,
    };
  });

  // captain = highest-rated player
  if (players.length) {
    let best = 0;
    for (let i = 1; i < players.length; i++) if (players[i].rating > players[best].rating) best = i;
    players[best].isCaptain = true;
  }
  return players;
}

const SQUAD_CACHE = new Map<string, Player[]>();

export function getSquad(code: string): Player[] {
  if (!SQUAD_CACHE.has(code)) SQUAD_CACHE.set(code, buildSquad(code));
  return SQUAD_CACHE.get(code)!;
}

export const ALL_PLAYERS: Player[] = TEAMS.flatMap((t) => getSquad(t.code));

export const PLAYER_MAP: Record<string, Player> = Object.fromEntries(
  ALL_PLAYERS.map((p) => [p.id, p]),
);

export function getPlayer(id: string): Player | undefined {
  return PLAYER_MAP[id];
}

export function getCaptain(code: string): Player {
  const squad = getSquad(code);
  return squad.find((p) => p.isCaptain) ?? squad[0];
}
