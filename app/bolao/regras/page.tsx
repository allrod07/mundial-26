"use client";

import Link from "next/link";
import { Printer, ArrowLeft, Trophy } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ✏️ EDITE AQUI o valor da entrada do bolão (em R$).
// Se ficar 0, o PDF mostra "a combinar com o admin".
const ENTRY_VALUE_BRL = 0;
// ─────────────────────────────────────────────────────────────────────────────

const fmtEntry = () =>
  ENTRY_VALUE_BRL > 0
    ? ENTRY_VALUE_BRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "a combinar com o admin";

export default function BolaoRegrasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      {/* toolbar — não imprime */}
      <div className="no-print">
        <Link
          href="/bolao"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-pitch-600 dark:hover:text-pitch-300"
        >
          <ArrowLeft size={16} /> Bolão
        </Link>
        <div className="mt-3 flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600 dark:text-pitch-400">
              Bolão da Família
            </div>
            <h1 className="text-2xl font-extrabold">📜 Regras do Bolão</h1>
            <p className="mt-1 text-sm text-ink-400">
              Imprime ou salva como PDF e manda no grupo da família.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full gradient-pitch px-5 py-3 text-sm font-bold text-white shadow-glow"
          >
            <Printer size={17} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* folha imprimível */}
      <div className="paper mt-6 space-y-5 rounded-2xl border border-[var(--border)] p-5 print:mt-0 print:space-y-4 print:rounded-none print:border-0 print:p-0">
        {/* Header */}
        <header className="border-b border-[var(--border)] pb-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-pitch-700">
            <Trophy size={14} /> Bolão da Família · Copa 2026
          </div>
          <h2 className="mt-1 text-2xl font-extrabold">🇧🇷 Tudo sobre o bolão 🏆</h2>
          <p className="mt-1 text-xs text-ink-500">
            Acertou o palpite, soma ponto. No fim da Copa, quem somar mais leva o prêmio.
          </p>
        </header>

        {/* 1) Como funciona */}
        <Section icon="🎯" title="Como funciona">
          <p className="text-sm">
            O bolão é todinho focado no <b>Brasil 🇧🇷</b> e é bem simples: você só palpita
            os <b>placares dos jogos da Seleção</b> e responde <b>uma única pergunta</b>{" "}
            antes da Copa começar — &ldquo;o Brasil vai ser campeão?&rdquo;. No fim, o
            ranking soma tudo e cria as medalhas das conquistas.
          </p>
          <p className="mt-2 text-sm text-ink-500">
            O ranking, as conquistas e o gráfico de evolução ficam no site, atualizando
            a cada jogo. Dá pra abrir tranquilamente do celular. 📱
          </p>
        </Section>

        {/* 2) Valor */}
        <Section icon="💸" title="Quanto custa entrar">
          <p className="text-sm">
            Entrada: <b className="text-lg text-pitch-700 dark:text-pitch-300">{fmtEntry()}</b>{" "}
            por participante.
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Pago direto com o organizador. Quem está &ldquo;Pago ✓&rdquo; no painel disputa os prêmios.
          </p>
        </Section>

        {/* 3) Pontuação */}
        <Section icon="📊" title="Como pontua (é só isso!)">
          <h3 className="mt-1 text-sm font-extrabold">⚽ Cada jogo do Brasil</h3>
          <Table
            rows={[
              ["✅ Acertou o resultado (Brasil ganha, empata ou perde)", "+3"],
              ["🎯 Cravou o placar exato (ex.: foi 2×1, você botou 2×1)", "+6"],
            ]}
          />

          <h3 className="mt-4 text-sm font-extrabold">🏆 O palpitão da Copa (uma vez só)</h3>
          <p className="mt-1 text-sm text-ink-500">
            Antes da Copa começar, você responde uma única pergunta:{" "}
            <b>&ldquo;O Brasil vai ser campeão?&rdquo;</b>
          </p>
          <Table
            rows={[
              ["🏆 Apostou SIM e o Brasil foi campeão", "+15"],
              ["🙅 Apostou NÃO e o Brasil não foi campeão", "+5"],
            ]}
          />
          <div className="mt-3 rounded-lg bg-pitch-500/10 px-3 py-2 text-xs text-pitch-700 dark:text-pitch-300">
            💡 Vale mais apostar no <b>título</b> porque é mais difícil de acontecer —
            quem arriscar e acertar leva vantagem! E quem é realista também pontua. 😉
          </div>
        </Section>

        {/* 4) Prazos */}
        <Section icon="⏰" title="Prazos — preste MUITA atenção!">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-red-500/40 bg-red-500/8 p-3">
              <div className="text-xs font-extrabold text-red-600 dark:text-red-300">
                🚨 O palpitão &ldquo;Brasil campeão?&rdquo;
              </div>
              <div className="mt-1.5 text-sm font-extrabold text-red-700 dark:text-red-300">
                ⛔ TRAVA às 18h do dia 13/06
                <br />
                (1h antes de Brasil × Marrocos, às 19h BRT)
              </div>
              <div className="mt-1.5 text-[11px] text-ink-500">
                Depois disso ⛔ não dá mais pra mudar.
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-3">
              <div className="text-xs font-extrabold text-amber-600 dark:text-amber-300">
                ⏱️ Placar de cada jogo do Brasil
              </div>
              <div className="mt-1.5 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                ⛔ TRAVA 1h antes do pontapé inicial de cada jogo
              </div>
              <div className="mt-1.5 text-[11px] text-ink-500">
                Conforme o Brasil avança, novos jogos aparecem pra palpitar.
              </div>
            </div>
          </div>
        </Section>

        {/* 5) Prêmios */}
        <Section icon="🎁" title="Prêmios">
          <div className="grid gap-2 sm:grid-cols-3">
            <Prize icon="🥇" title="1º lugar" desc="Prêmio principal" />
            <Prize icon="🥈" title="2º lugar" desc="Caixa de chocolates" />
            <Prize icon="🥉" title="3º lugar" desc="Caixa de bombons" />
          </div>
        </Section>

        {/* 6) Desempate */}
        <Section icon="⚖️" title="Critério de desempate">
          <ol className="ml-5 list-decimal space-y-0.5 text-sm">
            <li>🎯 Mais placares exatos</li>
            <li>✅ Mais resultados certos</li>
            <li>🎲 Sorteio (na hora do churrasco)</li>
          </ol>
        </Section>

        {/* 7) Conquistas */}
        <Section icon="🏅" title="Conquistas (medalhas só pra zoar)">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <BadgeLine icon="🏆" label="Rei dos Placares" desc="Mais placares exatos" />
            <BadgeLine icon="🎯" label="Mestre dos Palpites" desc="Mais acertos no total" />
            <BadgeLine icon="🔥" label="Mão Quente" desc="Maior sequência de acertos" />
            <BadgeLine icon="😅" label="Pé Frio" desc="Maior sequência de erros" />
          </div>
        </Section>

        {/* 8) Encerramento */}
        <Section icon="🎉" title="Boa sorte e que vença o melhor!">
          <p className="text-sm">
            Que ganhe o melhor palpiteiro 🍀 (ou o mais cara-de-pau 😎). E que o Brasil
            traga o hexa pra gente! 🇧🇷🏆🔥
          </p>
        </Section>

        <footer className="border-t border-[var(--border)] pt-3 text-center text-[10px] text-ink-400">
          Mundial &apos;26 · Bolão da Família — palpites travam 1h antes de cada jogo do
          Brasil.
        </footer>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold">
        <span className="text-xl">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table className="mt-2 w-full border-collapse text-sm">
      <tbody>
        {rows.map(([label, pts]) => (
          <tr key={label} className="border-b border-[var(--border)] last:border-0">
            <td className="py-1.5 pr-3">{label}</td>
            <td className="py-1.5 text-right font-extrabold text-pitch-700 dark:text-pitch-300">
              {pts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Prize({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="text-sm font-extrabold">{title}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
    </div>
  );
}

function BadgeLine({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm font-extrabold">{label}</div>
        <div className="text-[11px] text-ink-500">{desc}</div>
      </div>
    </div>
  );
}
