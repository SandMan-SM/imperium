import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Success Empire — Apply to join. Build with intention.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photograph = await readFile(
    join(process.cwd(), "public/editorial/hero-acropolis-v1.png"),
  );
  const image = `data:image/png;base64,${photograph.toString("base64")}`;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: "#252b27", color: "#f3eddf" }}>
      <img src={image} alt="" width={1200} height={630} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(90deg,rgba(30,37,31,.98),rgba(30,37,31,.86) 48%,rgba(30,37,31,.14))" }} />
      <div style={{ display: "flex", position: "relative", flexDirection: "column", justifyContent: "space-between", padding: "55px 65px", width: "100%" }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, color: "#d0bb8e" }}>IMPERIUM</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 104, letterSpacing: -4 }}>Success Empire.</div>
          <div style={{ display: "flex", maxWidth: 760, fontSize: 34, lineHeight: 1.35, color: "#e3d5b7" }}>Apply to join. Build with intention.</div>
        </div>
        <div style={{ display: "flex", fontSize: 19, letterSpacing: 2, color: "#d4d1c4" }}>IMPERIUM / APPLICATION</div>
      </div>
    </div>,
    size,
  );
}
