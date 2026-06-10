import { cn } from "@/lib/utils";
import type { ReactNode, HTMLAttributes } from "react";

export function Card({
  children,
  className,
  interactive,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface rounded-2xl",
        interactive &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pitch-500/10 text-pitch-600 dark:text-pitch-300">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="truncate text-xs text-ink-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
