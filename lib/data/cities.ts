import type { City } from "@/lib/types";

// 16 sedes oficiais da Copa do Mundo de 2026 (EUA, Canadá e México).
export const CITIES: City[] = [
  { id: "nyc", name: "Nova York / Nova Jersey", country: "EUA", countryFlag: "🇺🇸", stadium: "MetLife Stadium", capacity: 82500 },
  { id: "dal", name: "Dallas", country: "EUA", countryFlag: "🇺🇸", stadium: "AT&T Stadium", capacity: 80000 },
  { id: "mex", name: "Cidade do México", country: "México", countryFlag: "🇲🇽", stadium: "Estádio Azteca", capacity: 83000 },
  { id: "kc", name: "Kansas City", country: "EUA", countryFlag: "🇺🇸", stadium: "Arrowhead Stadium", capacity: 76000 },
  { id: "hou", name: "Houston", country: "EUA", countryFlag: "🇺🇸", stadium: "NRG Stadium", capacity: 72000 },
  { id: "atl", name: "Atlanta", country: "EUA", countryFlag: "🇺🇸", stadium: "Mercedes-Benz Stadium", capacity: 71000 },
  { id: "la", name: "Los Angeles", country: "EUA", countryFlag: "🇺🇸", stadium: "SoFi Stadium", capacity: 70000 },
  { id: "sea", name: "Seattle", country: "EUA", countryFlag: "🇺🇸", stadium: "Lumen Field", capacity: 69000 },
  { id: "phi", name: "Filadélfia", country: "EUA", countryFlag: "🇺🇸", stadium: "Lincoln Financial Field", capacity: 69000 },
  { id: "sf", name: "São Francisco", country: "EUA", countryFlag: "🇺🇸", stadium: "Levi's Stadium", capacity: 68500 },
  { id: "mia", name: "Miami", country: "EUA", countryFlag: "🇺🇸", stadium: "Hard Rock Stadium", capacity: 65000 },
  { id: "bos", name: "Boston", country: "EUA", countryFlag: "🇺🇸", stadium: "Gillette Stadium", capacity: 65000 },
  { id: "van", name: "Vancouver", country: "Canadá", countryFlag: "🇨🇦", stadium: "BC Place", capacity: 54000 },
  { id: "mty", name: "Monterrey", country: "México", countryFlag: "🇲🇽", stadium: "Estádio BBVA", capacity: 53000 },
  { id: "gdl", name: "Guadalajara", country: "México", countryFlag: "🇲🇽", stadium: "Estádio Akron", capacity: 46000 },
  { id: "tor", name: "Toronto", country: "Canadá", countryFlag: "🇨🇦", stadium: "BMO Field", capacity: 45000 },
];

export const CITY_MAP: Record<string, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
);
