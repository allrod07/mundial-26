import { ImageResponse } from "next/og";
import { Frame, TeamBlock, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/card";
import { TEAMS, TEAM_MAP } from "@/lib/data/teams";

export const runtime = "nodejs";
export const alt = "Seleção — Mundial '26";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return TEAMS.map((t) => ({ code: t.code }));
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 18px",
        borderRadius: 9999,
        background: "rgba(255,255,255,0.12)",
        fontSize: 24,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

export default function Image({ params }: { params: { code: string } }) {
  const t = TEAM_MAP[params.code];
  return new ImageResponse(
    (
      <Frame eyebrow={t ? `Grupo ${t.group}` : "Seleção"} accent={t?.firstColor}>
        {t ? (
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 48 }}>
            <TeamBlock code={t.code} />
            <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
              <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{t.confederation}</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Chip>Rating {t.rating}</Chip>
                <Chip>Grupo {t.group}</Chip>
                {t.titles > 0 ? <Chip>{t.titles}× campeã</Chip> : null}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>Seleção</div>
        )}
      </Frame>
    ),
    { ...size },
  );
}
