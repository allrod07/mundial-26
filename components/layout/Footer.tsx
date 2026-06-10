import Link from "next/link";
import { Trophy, Github, Sparkles } from "lucide-react";

const COLS = [
  {
    title: "Competição",
    links: [
      { href: "/calendario", label: "Calendário" },
      { href: "/classificacao", label: "Classificação" },
      { href: "/chaveamento", label: "Chaveamento" },
      { href: "/estatisticas", label: "Estatísticas" },
    ],
  },
  {
    title: "Explorar",
    links: [
      { href: "/selecoes", label: "Seleções" },
      { href: "/comparar", label: "Comparar jogadores" },
      { href: "/projecoes", label: "Projeções & probabilidades" },
      { href: "/simulador", label: "Simulador" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { href: "/simulador", label: "Simulador (Modo Manual)" },
      { href: "/impressao", label: "Imprimir tabela" },
      { href: "/favoritos", label: "Meus favoritos" },
      { href: "/", label: "Página inicial" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-pitch shadow-glow">
              <Trophy size={18} className="text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Mundial<span className="gradient-text-gold">'26</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-400">
            A plataforma premium da Copa do Mundo de 2026 — calendário, estatísticas
            avançadas, simuladores e projeções em um só lugar.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-ink-400">
            <Sparkles size={13} className="text-pitch-500" />
            Grupos, calendário e convocações oficiais · resultados simulados
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-500 transition-colors hover:text-pitch-600 dark:hover:text-pitch-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-ink-400 sm:flex-row sm:px-6">
          <p>© 2026 Mundial '26. Projeto de demonstração — sem afiliação com a FIFA.</p>
          <div className="flex items-center gap-4">
            <span>Next.js · TypeScript · Tailwind</span>
            <Github size={15} />
          </div>
        </div>
      </div>
    </footer>
  );
}
