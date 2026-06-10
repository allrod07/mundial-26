import type { Team } from "@/lib/types";

// ────────────────────────────────────────────────────────────────────────────
// 48 seleções — Copa do Mundo 2026 (sorteio OFICIAL, 12 grupos A–L).
// Grupos, técnicos e sedes conforme documentos oficiais da FIFA.
// `rating` (0–100) alimenta o motor de simulação. `captain` é resolvido em
// tempo de execução a partir do elenco real.
// ────────────────────────────────────────────────────────────────────────────

export const TEAMS: Team[] = [
  // GRUPO A
  { code: "MEX", name: "México", flag: "🇲🇽", confederation: "CONCACAF", fifaRank: 15, rating: 78, coach: "Javier Aguirre", group: "A", host: true, titles: 0, appearances: 18, bestResult: "Quartas (1970, 1986)", nickname: "El Tri", colors: ["#006847", "#ce1126"], firstColor: "#006847" },
  { code: "RSA", name: "África do Sul", flag: "🇿🇦", confederation: "CAF", fifaRank: 61, rating: 73, coach: "Hugo Broos", group: "A", titles: 0, appearances: 4, bestResult: "1ª fase", nickname: "Bafana Bafana", colors: ["#007a4d", "#ffb612"], firstColor: "#007a4d" },
  { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷", confederation: "AFC", fifaRank: 23, rating: 78, coach: "Hong Myung-bo", group: "A", titles: 0, appearances: 12, bestResult: "4º lugar (2002)", nickname: "Tigres da Ásia", colors: ["#cd2e3a", "#0047a0"], firstColor: "#cd2e3a" },
  { code: "CZE", name: "Tchéquia", flag: "🇨🇿", confederation: "UEFA", fifaRank: 44, rating: 76, coach: "Miroslav Koubek", group: "A", titles: 0, appearances: 11, bestResult: "Vice (1934, 1962)", nickname: "Národní tým", colors: ["#d7141a", "#11457e"], firstColor: "#d7141a" },

  // GRUPO B
  { code: "CAN", name: "Canadá", flag: "🇨🇦", confederation: "CONCACAF", fifaRank: 31, rating: 76, coach: "Jesse Marsch", group: "B", host: true, titles: 0, appearances: 2, bestResult: "1ª fase (1986, 2022)", nickname: "Les Rouges", colors: ["#ff0000", "#ffffff"], firstColor: "#d80621" },
  { code: "BIH", name: "Bósnia e Herzegovina", flag: "🇧🇦", confederation: "UEFA", fifaRank: 74, rating: 75, coach: "Sergej Barbarez", group: "B", titles: 0, appearances: 1, bestResult: "1ª fase (2014)", nickname: "Zmajevi", colors: ["#002f6c", "#ffce00"], firstColor: "#002f6c" },
  { code: "QAT", name: "Catar", flag: "🇶🇦", confederation: "AFC", fifaRank: 36, rating: 73, coach: "Julen Lopetegui", group: "B", titles: 0, appearances: 1, bestResult: "1ª fase (2022)", nickname: "Al-Annabi", colors: ["#8a1538", "#ffffff"], firstColor: "#8a1538" },
  { code: "SUI", name: "Suíça", flag: "🇨🇭", confederation: "UEFA", fifaRank: 16, rating: 79, coach: "Murat Yakin", group: "B", titles: 0, appearances: 12, bestResult: "Quartas (1934, 1938, 1954)", nickname: "Nati", colors: ["#d52b1e", "#ffffff"], firstColor: "#d52b1e" },

  // GRUPO C
  { code: "BRA", name: "Brasil", flag: "🇧🇷", confederation: "CONMEBOL", fifaRank: 7, rating: 89, coach: "Carlo Ancelotti", group: "C", titles: 5, appearances: 22, bestResult: "Campeã (5×)", nickname: "Seleção Canarinho", colors: ["#ffdf00", "#009c3b"], firstColor: "#ffdf00" },
  { code: "MAR", name: "Marrocos", flag: "🇲🇦", confederation: "CAF", fifaRank: 11, rating: 82, coach: "Mohamed Ouahbi", group: "C", titles: 0, appearances: 7, bestResult: "4º lugar (2022)", nickname: "Leões do Atlas", colors: ["#c1272d", "#006233"], firstColor: "#c1272d" },
  { code: "HAI", name: "Haiti", flag: "🇭🇹", confederation: "CONCACAF", fifaRank: 83, rating: 67, coach: "Sébastien Migné", group: "C", titles: 0, appearances: 1, bestResult: "1ª fase (1974)", nickname: "Les Grenadiers", colors: ["#00209f", "#d21034"], firstColor: "#00209f" },
  { code: "SCO", name: "Escócia", flag: "🏴", confederation: "UEFA", fifaRank: 39, rating: 78, coach: "Steve Clarke", group: "C", titles: 0, appearances: 8, bestResult: "1ª fase", nickname: "Tartan Army", colors: ["#0065bd", "#ffffff"], firstColor: "#0065bd" },

  // GRUPO D
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", confederation: "CONCACAF", fifaRank: 14, rating: 78, coach: "Mauricio Pochettino", group: "D", host: true, titles: 0, appearances: 11, bestResult: "3º lugar (1930)", nickname: "Stars and Stripes", colors: ["#002868", "#bf0a30"], firstColor: "#1d3a8a" },
  { code: "PAR", name: "Paraguai", flag: "🇵🇾", confederation: "CONMEBOL", fifaRank: 41, rating: 75, coach: "Gustavo Alfaro", group: "D", titles: 0, appearances: 9, bestResult: "Quartas (2010)", nickname: "La Albirroja", colors: ["#d52b1e", "#0038a8"], firstColor: "#d52b1e" },
  { code: "AUS", name: "Austrália", flag: "🇦🇺", confederation: "AFC", fifaRank: 24, rating: 75, coach: "Tony Popovic", group: "D", titles: 0, appearances: 7, bestResult: "Oitavas (2006, 2022)", nickname: "Socceroos", colors: ["#00843d", "#ffcd00"], firstColor: "#00843d" },
  { code: "TUR", name: "Turquia", flag: "🇹🇷", confederation: "UEFA", fifaRank: 26, rating: 79, coach: "Vincenzo Montella", group: "D", titles: 0, appearances: 3, bestResult: "3º lugar (2002)", nickname: "Ay-Yıldızlılar", colors: ["#e30a17", "#ffffff"], firstColor: "#e30a17" },

  // GRUPO E
  { code: "GER", name: "Alemanha", flag: "🇩🇪", confederation: "UEFA", fifaRank: 9, rating: 85, coach: "Julian Nagelsmann", group: "E", titles: 4, appearances: 21, bestResult: "Campeã (4×)", nickname: "Die Mannschaft", colors: ["#000000", "#dd0000"], firstColor: "#111827" },
  { code: "CUW", name: "Curaçao", flag: "🇨🇼", confederation: "CONCACAF", fifaRank: 90, rating: 64, coach: "Dick Advocaat", group: "E", titles: 0, appearances: 0, bestResult: "Estreante", nickname: "Famia Kòrsou", colors: ["#002b7f", "#f9e814"], firstColor: "#002b7f" },
  { code: "CIV", name: "Costa do Marfim", flag: "🇨🇮", confederation: "CAF", fifaRank: 40, rating: 77, coach: "Emerse Faé", group: "E", titles: 0, appearances: 4, bestResult: "1ª fase", nickname: "Os Elefantes", colors: ["#ff8200", "#009e60"], firstColor: "#ff8200" },
  { code: "ECU", name: "Equador", flag: "🇪🇨", confederation: "CONMEBOL", fifaRank: 23, rating: 77, coach: "Sebastián Beccacece", group: "E", titles: 0, appearances: 5, bestResult: "Oitavas (2006)", nickname: "La Tri", colors: ["#ffdd00", "#003893"], firstColor: "#ffce00" },

  // GRUPO F
  { code: "NED", name: "Países Baixos", flag: "🇳🇱", confederation: "UEFA", fifaRank: 6, rating: 86, coach: "Ronald Koeman", group: "F", titles: 0, appearances: 12, bestResult: "Vice (1974, 1978, 2010)", nickname: "Oranje", colors: ["#ff7900", "#ffffff"], firstColor: "#ff6a13" },
  { code: "JPN", name: "Japão", flag: "🇯🇵", confederation: "AFC", fifaRank: 17, rating: 80, coach: "Hajime Moriyasu", group: "F", titles: 0, appearances: 8, bestResult: "Oitavas (4×)", nickname: "Samurai Blue", colors: ["#0b1560", "#ffffff"], firstColor: "#13205e" },
  { code: "SWE", name: "Suécia", flag: "🇸🇪", confederation: "UEFA", fifaRank: 42, rating: 76, coach: "Graham Potter", group: "F", titles: 0, appearances: 12, bestResult: "Vice (1958)", nickname: "Blågult", colors: ["#006aa7", "#fecc02"], firstColor: "#006aa7" },
  { code: "TUN", name: "Tunísia", flag: "🇹🇳", confederation: "CAF", fifaRank: 49, rating: 74, coach: "Sabri Lamouchi", group: "F", titles: 0, appearances: 7, bestResult: "1ª fase", nickname: "Águias de Cartago", colors: ["#e70013", "#ffffff"], firstColor: "#e70013" },

  // GRUPO G
  { code: "BEL", name: "Bélgica", flag: "🇧🇪", confederation: "UEFA", fifaRank: 8, rating: 83, coach: "Rudi Garcia", group: "G", titles: 0, appearances: 14, bestResult: "3º lugar (2018)", nickname: "Diabos Vermelhos", colors: ["#e30613", "#ffd700"], firstColor: "#e30613" },
  { code: "EGY", name: "Egito", flag: "🇪🇬", confederation: "CAF", fifaRank: 33, rating: 76, coach: "Hossam Hassan", group: "G", titles: 0, appearances: 4, bestResult: "1ª fase", nickname: "Os Faraós", colors: ["#ce1126", "#000000"], firstColor: "#ce1126" },
  { code: "IRN", name: "Irã", flag: "🇮🇷", confederation: "AFC", fifaRank: 19, rating: 76, coach: "Amir Ghalehnoei", group: "G", titles: 0, appearances: 7, bestResult: "1ª fase", nickname: "Team Melli", colors: ["#239f40", "#da0000"], firstColor: "#239f40" },
  { code: "NZL", name: "Nova Zelândia", flag: "🇳🇿", confederation: "OFC", fifaRank: 86, rating: 66, coach: "Darren Bazeley", group: "G", titles: 0, appearances: 3, bestResult: "1ª fase", nickname: "All Whites", colors: ["#ffffff", "#000000"], firstColor: "#111827" },

  // GRUPO H
  { code: "ESP", name: "Espanha", flag: "🇪🇸", confederation: "UEFA", fifaRank: 2, rating: 92, coach: "Luis de la Fuente", group: "H", titles: 1, appearances: 16, bestResult: "Campeã (2010)", nickname: "La Roja", colors: ["#aa151b", "#f1bf00"], firstColor: "#c60b1e" },
  { code: "CPV", name: "Cabo Verde", flag: "🇨🇻", confederation: "CAF", fifaRank: 70, rating: 67, coach: "Pedro Brito (Bubista)", group: "H", titles: 0, appearances: 0, bestResult: "Estreante", nickname: "Tubarões Azuis", colors: ["#003893", "#ffffff"], firstColor: "#003893" },
  { code: "KSA", name: "Arábia Saudita", flag: "🇸🇦", confederation: "AFC", fifaRank: 58, rating: 71, coach: "Georgios Donis", group: "H", titles: 0, appearances: 7, bestResult: "Oitavas (1994)", nickname: "Os Falcões Verdes", colors: ["#006c35", "#ffffff"], firstColor: "#006c35" },
  { code: "URU", name: "Uruguai", flag: "🇺🇾", confederation: "CONMEBOL", fifaRank: 13, rating: 83, coach: "Marcelo Bielsa", group: "H", titles: 2, appearances: 15, bestResult: "Campeã (1930, 1950)", nickname: "La Celeste", colors: ["#5cbfeb", "#000000"], firstColor: "#5cbfeb" },

  // GRUPO I
  { code: "FRA", name: "França", flag: "🇫🇷", confederation: "UEFA", fifaRank: 3, rating: 91, coach: "Didier Deschamps", group: "I", titles: 2, appearances: 17, bestResult: "Campeã (1998, 2018)", nickname: "Les Bleus", colors: ["#002395", "#ed2939"], firstColor: "#1e3a8a" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", confederation: "CAF", fifaRank: 18, rating: 80, coach: "Pape Thiaw", group: "I", titles: 0, appearances: 4, bestResult: "Quartas (2002)", nickname: "Leões de Teranga", colors: ["#00853f", "#fdef42"], firstColor: "#00853f" },
  { code: "IRQ", name: "Iraque", flag: "🇮🇶", confederation: "AFC", fifaRank: 58, rating: 70, coach: "Graham Arnold", group: "I", titles: 0, appearances: 1, bestResult: "1ª fase (1986)", nickname: "Leões da Mesopotâmia", colors: ["#007a3d", "#ce1126"], firstColor: "#007a3d" },
  { code: "NOR", name: "Noruega", flag: "🇳🇴", confederation: "UEFA", fifaRank: 30, rating: 81, coach: "Ståle Solbakken", group: "I", titles: 0, appearances: 4, bestResult: "Oitavas (1998)", nickname: "Løvene", colors: ["#ba0c2f", "#00205b"], firstColor: "#ba0c2f" },

  // GRUPO J
  { code: "ARG", name: "Argentina", flag: "🇦🇷", confederation: "CONMEBOL", fifaRank: 1, rating: 90, coach: "Lionel Scaloni", group: "J", titles: 3, appearances: 19, bestResult: "Campeã (1978, 1986, 2022)", nickname: "La Albiceleste", colors: ["#75aadb", "#ffffff"], firstColor: "#6cace4" },
  { code: "ALG", name: "Argélia", flag: "🇩🇿", confederation: "CAF", fifaRank: 38, rating: 77, coach: "Vladimir Petković", group: "J", titles: 0, appearances: 5, bestResult: "Oitavas (2014)", nickname: "Os Guerreiros do Deserto", colors: ["#007229", "#ffffff"], firstColor: "#007229" },
  { code: "AUT", name: "Áustria", flag: "🇦🇹", confederation: "UEFA", fifaRank: 25, rating: 79, coach: "Ralf Rangnick", group: "J", titles: 0, appearances: 8, bestResult: "3º lugar (1954)", nickname: "Das Team", colors: ["#ed2939", "#ffffff"], firstColor: "#ed2939" },
  { code: "JOR", name: "Jordânia", flag: "🇯🇴", confederation: "AFC", fifaRank: 62, rating: 70, coach: "Jamal Sellami", group: "J", titles: 0, appearances: 0, bestResult: "Estreante", nickname: "Al-Nashama", colors: ["#007a3d", "#ce1126"], firstColor: "#007a3d" },

  // GRUPO K
  { code: "POR", name: "Portugal", flag: "🇵🇹", confederation: "UEFA", fifaRank: 5, rating: 88, coach: "Roberto Martínez", group: "K", titles: 0, appearances: 9, bestResult: "3º lugar (1966)", nickname: "A Seleção", colors: ["#006600", "#ff0000"], firstColor: "#c8102e" },
  { code: "COD", name: "Congo (RDC)", flag: "🇨🇩", confederation: "CAF", fifaRank: 56, rating: 75, coach: "Sébastien Desabre", group: "K", titles: 0, appearances: 2, bestResult: "Quartas (1974)", nickname: "Léopards", colors: ["#007fff", "#f7d618"], firstColor: "#007fff" },
  { code: "UZB", name: "Uzbequistão", flag: "🇺🇿", confederation: "AFC", fifaRank: 57, rating: 71, coach: "Fabio Cannavaro", group: "K", titles: 0, appearances: 0, bestResult: "Estreante", nickname: "Os Lobos Brancos", colors: ["#1eb53a", "#0099b5"], firstColor: "#1eb53a" },
  { code: "COL", name: "Colômbia", flag: "🇨🇴", confederation: "CONMEBOL", fifaRank: 12, rating: 81, coach: "Néstor Lorenzo", group: "K", titles: 0, appearances: 7, bestResult: "Quartas (2014)", nickname: "Los Cafeteros", colors: ["#ffcd00", "#003087"], firstColor: "#ffcd00" },

  // GRUPO L
  { code: "ENG", name: "Inglaterra", flag: "🏴", confederation: "UEFA", fifaRank: 4, rating: 89, coach: "Thomas Tuchel", group: "L", titles: 1, appearances: 17, bestResult: "Campeã (1966)", nickname: "Three Lions", colors: ["#ffffff", "#cf081f"], firstColor: "#cf081f" },
  { code: "CRO", name: "Croácia", flag: "🇭🇷", confederation: "UEFA", fifaRank: 10, rating: 82, coach: "Zlatko Dalić", group: "L", titles: 0, appearances: 7, bestResult: "Vice-campeã (2018)", nickname: "Vatreni", colors: ["#ff0000", "#ffffff"], firstColor: "#e4002b" },
  { code: "GHA", name: "Gana", flag: "🇬🇭", confederation: "CAF", fifaRank: 73, rating: 76, coach: "Carlos Queiroz", group: "L", titles: 0, appearances: 5, bestResult: "Quartas (2010)", nickname: "Estrelas Negras", colors: ["#006b3f", "#fcd116"], firstColor: "#006b3f" },
  { code: "PAN", name: "Panamá", flag: "🇵🇦", confederation: "CONCACAF", fifaRank: 31, rating: 70, coach: "Thomas Christiansen", group: "L", titles: 0, appearances: 1, bestResult: "1ª fase (2018)", nickname: "La Marea Roja", colors: ["#da121a", "#005293"], firstColor: "#da121a" },
];

export const TEAM_MAP: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t]),
);

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export function teamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}
