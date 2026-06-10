import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TournamentProvider } from "@/components/providers/TournamentProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://mundial26.example"),
  title: {
    default: "Mundial '26 — Plataforma da Copa do Mundo 2026",
    template: "%s · Mundial '26",
  },
  description:
    "A plataforma premium da Copa do Mundo de 2026: calendário, classificação ao vivo, estatísticas avançadas, simuladores, chaveamento e projeções por probabilidade.",
  keywords: ["Copa do Mundo", "2026", "Mundial", "futebol", "estatísticas", "simulador"],
  openGraph: {
    title: "Mundial '26 — Plataforma da Copa do Mundo 2026",
    description:
      "Calendário, estatísticas avançadas, simuladores e projeções da Copa do Mundo 2026.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080a12" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn(sans.variable, display.variable, mono.variable)}>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <TournamentProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </TournamentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
