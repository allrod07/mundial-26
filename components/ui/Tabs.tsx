"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: ReactNode;
}

export function Tabs({
  items,
  value,
  onChange,
  size = "md",
  className,
  idPrefix = "tabs",
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  className?: string;
  idPrefix?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 rounded-full font-semibold transition-colors",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-white" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-100",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${idPrefix}-pill`}
                className="absolute inset-0 rounded-full gradient-pitch shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Uncontrolled convenience wrapper */
export function useTabs(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, setValue };
}
