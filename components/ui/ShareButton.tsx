"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botão de compartilhamento. Usa a Web Share API nativa (abre o menu de
 * compartilhar do celular) quando disponível; senão, copia o link e mostra
 * confirmação. O link compartilhado puxa o cartão social (Open Graph) da página.
 */
export function ShareButton({
  title,
  text,
  className,
  label = "Compartilhar",
}: {
  title?: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const data: ShareData = { title: title ?? document.title, text, url };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* usuário cancelou ou clipboard indisponível — ignora */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Compartilhar esta página"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-bold text-ink-500 transition-colors hover:text-pitch-600",
        className,
      )}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? "Link copiado" : label}
    </button>
  );
}
