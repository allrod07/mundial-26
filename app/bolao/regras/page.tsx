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
            O bolão é todinho focado na campanha do <b>Brasil 🇧🇷</b>: você palpita os
            placares dos jogos da Seleção e faz alguns <b>palpites grandes</b> antes da
            Copa começar (campeão, até onde o Brasil vai, etc.). No fim, o ranking soma
            tudo e cria as medalhas das conquistas.
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
        <Section icon="📊" title="Como pontua">
          <h3 className="mt-1 text-sm font-extrabold">⚽ Jogos do Brasil (vale para CADA jogo)</h3>
          <Table
            rows={[
              ["✅ Acertou o resultado (vitória / empate / derrota)", "+3"],
              ["🎯 Placar exato (ex.: foi 2×1, você cravou 2×1)", "+5"],
            ]}
          />

          <h3 className="mt-4 text-sm font-extrabold">
            🇧🇷 Palpites grandes (uma vez só, antes da Copa começar)
          </h3>
          <Table
            rows={[
              ["1️⃣ Lugar do Brasil no grupo (1º, 2º, 3º classificado ou eliminado)", "+10"],
              ["📈 Pontos do Brasil na fase de grupos — exato", "+8"],
              ["📈 Pontos do Brasil na fase de grupos — errou por 1", "+4"],
              ["🚀 Até onde o Brasil vai — exato", "+15"],
              ["🚀 Até onde o Brasil vai — trocou campeão ↔ vice", "+5"],
              ["🏆 Campeão da Copa", "+25"],
              ["🥈 Vice da Copa", "+10"],
            ]}
          />

          <div className="mt-3 rounded-lg bg-pitch-500/10 px-3 py-2 text-xs text-pitch-700 dark:text-pitch-300">
            💡 <b>Quem mandar tudo nos palpites grandes</b> já leva <b>até 68 pontos</b>{" "}
            (10 + 8 + 15 + 25 + 10). E ainda tem os jogos do Brasil pra acumular mais!
          </div>
        </Section>

        {/* 4) Prazos */}
        <Section icon="⏰" title="Prazos — preste MUITA atenção!">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-red-500/40 bg-red-500/8 p-3">
              <div className="text-xs font-extrabold text-red-600 dark:text-red-300">
                🚨 Palpites grandes
              </div>
              <div className="mt-1 text-sm">
                Campeão, vice, fase do Brasil, lugar no grupo e pontos no grupo:
              </div>
              <div className="mt-1.5 text-sm font-extrabold text-red-700 dark:text-red-300">
                ⛔ TRAVAM às 18h do dia 13/06
                <br />
                (1h antes de Brasil × Marrocos, às 19h BRT)
              </div>
              <div className="mt-1.5 text-[11px] text-ink-500">
                Depois disso ⛔ não dá pra mudar — nem campeão, nem fase, nem nada.
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/8 p-3">
              <div className="text-xs font-extrabold text-amber-600 dark:text-amber-300">
                ⏱️ Palpites jogo a jogo
              </div>
              <div className="mt-1 text-sm">Placar de cada jogo do Brasil:</div>
              <div className="mt-1.5 text-sm font-extrabold text-amber-700 dark:text-amber-300">
                ⛔ TRAVAM 1h antes do pontapé inicial de cada jogo
              </div>
              <div className="mt-1.5 text-[11px] text-ink-500">
                Conforme o Brasil avança no torneio, novos jogos aparecem pra palpitar.
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
            <li>🏆 Quem acertou o campeão</li>
            <li>🚀 Quem acertou a fase do Brasil</li>
            <li>✅ Mais resultados certos</li>
            <li>🎲 Sorteio (na hora do churrasco)</li>
          </ol>
        </Section>

        {/* 7) Conquistas */}
        <Section icon="🏅" title="Conquistas (medalhas só pra zoar)">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <BadgeLine icon="🏆" label="Rei dos Placares" desc="Mais placares exatos" />
            <BadgeLine icon="🎯" label="Mestre dos Palpites" desc="Mais acertos no total" />
            <BadgeLine icon="🇧🇷" label="Torcedor Raiz" desc="Mais acertos envolvendo o Brasil" />
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
