import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Tyrone Ngouamo — strength and nutrition coaching, through Imperium.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#212722",
        color: "#f2ecdf",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "radial-gradient(circle at 84% 30%, rgba(201,179,124,0.16), rgba(33,39,34,0) 42%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 68px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 9, color: "#c9b37c" }}>
          IMPERIUM
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "serif",
              fontSize: 92,
              fontStyle: "italic",
              letterSpacing: -3,
            }}
          >
            Train with intent.
          </div>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 32, color: "#d9c79c" }}>
            Tyrone Ngouamo — strength &amp; nutrition coaching
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#b7b8a9", letterSpacing: 2 }}>
          SESSIONS · MEAL PLANS · ACCOUNTABILITY
        </div>
      </div>
    </div>,
    size,
  );
}
