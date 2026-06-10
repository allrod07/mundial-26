import Link from "next/link";
import { Trophy, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl gradient-pitch text-white shadow-glow">
        <Trophy size={30} />
      </span>
      <h1 className="mt-6 text-6xl font-extrabold tracking-tight gradient-text-pitch">404</h1>
      <p className="mt-2 text-lg font-bold">Página fora de campo</p>
      <p className="mt-2 text-sm text-ink-400">
        O conteúdo que você procura não foi encontrado ou ainda não foi definido na competição.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
      >
        <Home size={16} /> Voltar ao início
      </Link>
    </div>
  );
}
