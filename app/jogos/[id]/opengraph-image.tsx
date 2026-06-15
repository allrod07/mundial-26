import { ImageResponse } from "next/og";
import { Frame, TeamBlock, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/card";
import { BASE_MATCHES } from "@/lib/data/schedule";
import { fmtDate } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "Partida — Mundial '26";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const MATCHES = Object.fromEntries(BASE_MATCHES.map((m) => [m.id, m]));

export default function Image({ params }: { params: { id: string } }) {
  const m = MATCHES[params.id];
  const eyebrow = m ? (m.group ? `Grupo ${m.group}` : m.stage) : "Partida";
  return new ImageResponse(
    (
      <Frame eyebrow={eyebrow}>
        {m ? (
          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: 36 }}>
              <TeamBlock code={m.homeCode} label={m.homeLabel} />
              <div style={{ display: "flex", fontSize: 52, fontWeight: 800, color: "rgba(255,255,255,0.45)" }}>VS</div>
              <TeamBlock code={m.awayCode} label={m.awayLabel} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", fontSize: 28, color: "rgba(255,255,255,0.7)" }}>
              {fmtDate(m.date)}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>Partida</div>
        )}
      </Frame>
    ),
    { ...size },
  );
}
