import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Mundial '26 — Plataforma da Copa do Mundo 2026";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <Frame eyebrow="Copa do Mundo 2026">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, maxWidth: 900 }}>
            A Copa de 2026, em um só lugar.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.75)", maxWidth: 820 }}>
            Calendário, classificação ao vivo, estatísticas, simulador, chaveamento e projeções.
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 16, fontSize: 26, color: "rgba(255,255,255,0.8)" }}>
            <span style={{ display: "flex" }}>48 seleções</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>12 grupos</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>104 jogos</span>
          </div>
        </div>
      </Frame>
    ),
    { ...size },
  );
}
