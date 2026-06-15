import { TEAM_MAP } from "@/lib/data/teams";

// Tamanho padrão de cartão social (Open Graph / Twitter).
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const ACCENT = "#1fe27e";
const GOLD = "#f4df8d";

/** Moldura de marca compartilhada por todos os cartões (sem emojis/fontes
 * externas — só estilos inline, seguro para o renderizador Satori). */
export function Frame({
  eyebrow,
  accent = ACCENT,
  children,
}: {
  eyebrow: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #07130c 0%, #0b1220 55%, #0a0f1a 100%)",
        color: "#ffffff",
        padding: "60px 64px",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -90,
          width: 460,
          height: 460,
          borderRadius: 9999,
          background: accent,
          opacity: 0.2,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -100,
          width: 420,
          height: 420,
          borderRadius: 9999,
          background: "#00a14d",
          opacity: 0.16,
          display: "flex",
        }}
      />

      {/* topo: marca + eyebrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg,#00a14d,#1fe27e)",
              fontSize: 26,
              fontWeight: 800,
              color: "#04130b",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Mundial
            <span style={{ color: GOLD, marginLeft: 6 }}>&apos;26</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {eyebrow}
        </div>
      </div>

      {/* conteúdo central */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", paddingTop: 20 }}>{children}</div>

      {/* rodapé */}
      <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
        Copa do Mundo 2026 · EUA · Canadá · México
      </div>
    </div>
  );
}

/** Bloco de uma seleção (código grande + nome) para os cartões. */
export function TeamBlock({ code, label, align = "center" }: { code?: string; label?: string; align?: "center" }) {
  const team = code ? TEAM_MAP[code] : undefined;
  const accent = team?.firstColor ?? "#ffffff";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align, gap: 10, flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 150,
          padding: "6px 22px",
          borderRadius: 18,
          border: `4px solid ${accent}`,
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        {code ?? "?"}
      </div>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700, textAlign: "center", maxWidth: 360 }}>
        {team?.name ?? label ?? "A definir"}
      </div>
    </div>
  );
}
