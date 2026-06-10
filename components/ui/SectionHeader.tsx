import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "Ver tudo",
  icon,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  hrefLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-pitch-600 dark:text-pitch-400">
            {icon}
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-ink-400">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition-colors hover:border-pitch-500/40 hover:text-pitch-600 dark:hover:text-pitch-300 sm:inline-flex"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
