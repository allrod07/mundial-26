// Mapping between API-Football team names and our 3-letter codes, plus the
// World Cup league/season config. World Cup league id in API-Football is 1.

export const API_LEAGUE_ID = Number(process.env.API_FOOTBALL_LEAGUE || 1);
export const API_SEASON = Number(process.env.API_FOOTBALL_SEASON || 2026);

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// normalized API-Football name (and aliases) -> our team code
const NAME_TO_CODE: Record<string, string> = {};
const add = (code: string, ...names: string[]) => {
  for (const n of names) NAME_TO_CODE[norm(n)] = code;
};

add("MEX", "Mexico");
add("RSA", "South Africa");
add("KOR", "South Korea", "Korea Republic", "Korea South");
add("CZE", "Czech Republic", "Czechia");
add("CAN", "Canada");
add("BIH", "Bosnia and Herzegovina", "Bosnia & Herzegovina", "Bosnia");
add("QAT", "Qatar");
add("SUI", "Switzerland");
add("BRA", "Brazil");
add("MAR", "Morocco");
add("HAI", "Haiti");
add("SCO", "Scotland");
add("USA", "USA", "United States");
add("PAR", "Paraguay");
add("AUS", "Australia");
add("TUR", "Turkey", "Turkiye", "Türkiye");
add("GER", "Germany");
add("CUW", "Curacao", "Curaçao");
add("CIV", "Ivory Coast", "Cote D'Ivoire", "Côte d'Ivoire");
add("ECU", "Ecuador");
add("NED", "Netherlands", "Holland");
add("JPN", "Japan");
add("SWE", "Sweden");
add("TUN", "Tunisia");
add("BEL", "Belgium");
add("EGY", "Egypt");
add("IRN", "Iran", "IR Iran");
add("NZL", "New Zealand");
add("ESP", "Spain");
add("CPV", "Cape Verde Islands", "Cape Verde", "Cabo Verde");
add("KSA", "Saudi Arabia");
add("URU", "Uruguay");
add("FRA", "France");
add("SEN", "Senegal");
add("IRQ", "Iraq");
add("NOR", "Norway");
add("ARG", "Argentina");
add("ALG", "Algeria");
add("AUT", "Austria");
add("JOR", "Jordan");
add("POR", "Portugal");
add("COD", "Congo DR", "DR Congo", "Democratic Republic of Congo", "Congo Democratic Republic");
add("UZB", "Uzbekistan");
add("COL", "Colombia");
add("ENG", "England");
add("CRO", "Croatia");
add("GHA", "Ghana");
add("PAN", "Panama");

export function codeFromTeamName(name: string): string | null {
  return NAME_TO_CODE[norm(name)] ?? null;
}
