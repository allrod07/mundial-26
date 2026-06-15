import { ImageResponse } from "next/og";
import { Frame, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Chaveamento — Mundial '26";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <Frame eyebrow="Mata-mata">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 800, letterSpacing: -2 }}>Chaveamento</div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.75)", maxWidth: 860 }}>
            Do 16-avos de final à decisão do título — preenchido ao vivo conforme os resultados.
          </div>
        </div>
      </Frame>
    ),
    { ...size },
  );
}
