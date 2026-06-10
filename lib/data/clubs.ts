export interface Club {
  name: string;
  country: string;
  flag: string;
  /** prestige 0-100 — stars cluster at top clubs */
  prestige: number;
}

export const CLUBS: Club[] = [
  { name: "Real Madrid", country: "Espanha", flag: "🇪🇸", prestige: 99 },
  { name: "Manchester City", country: "Inglaterra", flag: "🏴", prestige: 98 },
  { name: "FC Barcelona", country: "Espanha", flag: "🇪🇸", prestige: 96 },
  { name: "Bayern de Munique", country: "Alemanha", flag: "🇩🇪", prestige: 96 },
  { name: "Paris Saint-Germain", country: "França", flag: "🇫🇷", prestige: 95 },
  { name: "Liverpool", country: "Inglaterra", flag: "🏴", prestige: 95 },
  { name: "Arsenal", country: "Inglaterra", flag: "🏴", prestige: 93 },
  { name: "Inter de Milão", country: "Itália", flag: "🇮🇹", prestige: 91 },
  { name: "Chelsea", country: "Inglaterra", flag: "🏴", prestige: 90 },
  { name: "Atlético de Madrid", country: "Espanha", flag: "🇪🇸", prestige: 90 },
  { name: "Tottenham", country: "Inglaterra", flag: "🏴", prestige: 87 },
  { name: "Borussia Dortmund", country: "Alemanha", flag: "🇩🇪", prestige: 87 },
  { name: "Manchester United", country: "Inglaterra", flag: "🏴", prestige: 87 },
  { name: "Juventus", country: "Itália", flag: "🇮🇹", prestige: 87 },
  { name: "AC Milan", country: "Itália", flag: "🇮🇹", prestige: 86 },
  { name: "Napoli", country: "Itália", flag: "🇮🇹", prestige: 85 },
  { name: "Bayer Leverkusen", country: "Alemanha", flag: "🇩🇪", prestige: 85 },
  { name: "Newcastle", country: "Inglaterra", flag: "🏴", prestige: 82 },
  { name: "Aston Villa", country: "Inglaterra", flag: "🏴", prestige: 81 },
  { name: "Atalanta", country: "Itália", flag: "🇮🇹", prestige: 81 },
  { name: "RB Leipzig", country: "Alemanha", flag: "🇩🇪", prestige: 82 },
  { name: "AS Roma", country: "Itália", flag: "🇮🇹", prestige: 80 },
  { name: "Benfica", country: "Portugal", flag: "🇵🇹", prestige: 80 },
  { name: "Sporting CP", country: "Portugal", flag: "🇵🇹", prestige: 80 },
  { name: "FC Porto", country: "Portugal", flag: "🇵🇹", prestige: 79 },
  { name: "Real Sociedad", country: "Espanha", flag: "🇪🇸", prestige: 78 },
  { name: "Villarreal", country: "Espanha", flag: "🇪🇸", prestige: 77 },
  { name: "Athletic Bilbao", country: "Espanha", flag: "🇪🇸", prestige: 78 },
  { name: "Olympique de Marseille", country: "França", flag: "🇫🇷", prestige: 78 },
  { name: "AS Monaco", country: "França", flag: "🇫🇷", prestige: 78 },
  { name: "Olympique Lyonnais", country: "França", flag: "🇫🇷", prestige: 76 },
  { name: "Brighton", country: "Inglaterra", flag: "🏴", prestige: 76 },
  { name: "West Ham", country: "Inglaterra", flag: "🏴", prestige: 76 },
  { name: "Crystal Palace", country: "Inglaterra", flag: "🏴", prestige: 73 },
  { name: "Fenerbahçe", country: "Turquia", flag: "🇹🇷", prestige: 74 },
  { name: "Galatasaray", country: "Turquia", flag: "🇹🇷", prestige: 75 },
  { name: "Ajax", country: "Países Baixos", flag: "🇳🇱", prestige: 76 },
  { name: "PSV Eindhoven", country: "Países Baixos", flag: "🇳🇱", prestige: 76 },
  { name: "Feyenoord", country: "Países Baixos", flag: "🇳🇱", prestige: 74 },
  { name: "VfB Stuttgart", country: "Alemanha", flag: "🇩🇪", prestige: 75 },
  { name: "Eintracht Frankfurt", country: "Alemanha", flag: "🇩🇪", prestige: 75 },
  { name: "Al-Hilal", country: "Arábia Saudita", flag: "🇸🇦", prestige: 74 },
  { name: "Al-Nassr", country: "Arábia Saudita", flag: "🇸🇦", prestige: 73 },
  { name: "Flamengo", country: "Brasil", flag: "🇧🇷", prestige: 76 },
  { name: "Palmeiras", country: "Brasil", flag: "🇧🇷", prestige: 76 },
  { name: "River Plate", country: "Argentina", flag: "🇦🇷", prestige: 73 },
  { name: "Boca Juniors", country: "Argentina", flag: "🇦🇷", prestige: 73 },
  { name: "Inter Miami", country: "EUA", flag: "🇺🇸", prestige: 70 },
  { name: "Los Angeles FC", country: "EUA", flag: "🇺🇸", prestige: 68 },
  { name: "Club América", country: "México", flag: "🇲🇽", prestige: 69 },
];

export const TOP_CLUBS = CLUBS.filter((c) => c.prestige >= 85);
export const MID_CLUBS = CLUBS.filter((c) => c.prestige >= 73 && c.prestige < 85);
export const LOW_CLUBS = CLUBS.filter((c) => c.prestige < 73);
