import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pitch-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-pitch text-white shadow-glow">
              {icon}
            </span>
          )}
          <div>
            {eyebrow && (
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-pitch-600 dark:text-pitch-400">
                {eyebrow}
              </div>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm text-ink-400">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
