"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";
import { DataSourceBadge } from "./DataSourceBadge";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/calendario", label: "Calendário" },
  { href: "/classificacao", label: "Classificação" },
  { href: "/chaveamento", label: "Chaveamento" },
  { href: "/selecoes", label: "Seleções" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/projecoes", label: "Projeções" },
  { href: "/comparar", label: "Comparar" },
  { href: "/simulador", label: "Simulador" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 glass print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-pitch shadow-glow">
            <Trophy size={18} className="text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Mundial<span className="gradient-text-gold">'26</span>
          </span>
        </Link>

        <nav className="ml-2 hidden flex-1 items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                isActive(item.href)
                  ? "text-pitch-600 dark:text-pitch-300"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-ink-100",
              )}
            >
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full bg-pitch-500/12"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <DataSourceBadge />
          <GlobalSearch />
          <ThemeToggle />
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-ink-500 xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] xl:hidden"
          >
            <div className="grid grid-cols-2 gap-1 p-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    isActive(item.href)
                      ? "bg-pitch-500/12 text-pitch-600 dark:text-pitch-300"
                      : "hover:bg-ink-500/5",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
