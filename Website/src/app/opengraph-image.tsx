import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Imperium Elite — Build the Mind. Command the Future.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#f5e9c8",
          background:
            "linear-gradient(120deg, #0a0a0a 0%, #161208 50%, #0a0a0a 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#c9a45c",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#c9a45c",
            }}
          >
            Imperium Elite
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#ffffff",
            }}
          >
            Build the Mind.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              color: "#c9a45c",
            }}
          >
            Command the Future.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              lineHeight: 1.3,
              color: "#aab1c4",
              maxWidth: 980,
            }}
          >
            Strategic intelligence platform · 28 principles · daily dispatch.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#6a7184",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            secretimperium.com
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#c9a45c",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            By invitation.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
