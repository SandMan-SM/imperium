import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getArchiveEntry } from "@/lib/archive";
import { getArchiveArtwork } from "@/lib/archive-art";

export const runtime = "nodejs";
export const alt = "Original writing and architectural artwork from The Archive by Imperium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArchiveOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getArchiveEntry(slug);
  if (!entry) notFound();

  const artwork = getArchiveArtwork(entry);
  const imageFile = await readFile(join(process.cwd(), "public", artwork.src.replace(/^\/+/, "")));
  const imageSrc = `data:image/png;base64,${imageFile.toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#191c1d", color: "#eee8dc" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600, height: 630, padding: "48px 46px 42px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div style={{ display: "flex", fontSize: 21, letterSpacing: 5 }}>IMPERIUM</div>
          <div style={{ display: "flex", fontSize: 14, color: "#aaa79e", letterSpacing: 1 }}>THE ARCHIVE / {entry.number}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#c0a76f", fontSize: 17, marginBottom: 18 }}>{entry.category} · {entry.readingTime}</div>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: entry.title.length > 32 ? 50 : 56, fontWeight: 400, letterSpacing: -1.7, lineHeight: 1.13, maxWidth: 508 }}>{entry.title}</div>
          <div style={{ display: "flex", fontSize: 21, color: "#b6b5ac", lineHeight: 1.45, marginTop: 21, maxWidth: 490 }}>{entry.description}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 19, borderTop: "1px solid #41453f", color: "#aaa79e", fontSize: 14 }}>
          <span>Imperium editorial</span>
          <span>secretimperium.com</span>
        </div>
      </div>
      <div style={{ display: "flex", width: 600, height: 630, overflow: "hidden", borderLeft: "1px solid #41453f" }}>
        {/* ImageResponse embeds the local original directly; no network fetch is needed. */}
        <img src={imageSrc} alt={artwork.alt} width={600} height={630} style={{ width: 600, height: 630, objectFit: "cover", objectPosition: artwork.position ?? "center" }} />
      </div>
    </div>,
    size,
  );
}
