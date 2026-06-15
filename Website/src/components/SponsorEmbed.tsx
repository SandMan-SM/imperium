"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Federation sponsor embed for Imperium. Suppressed on commerce +
// account flows where any cross-promo would compete for the user's
// purchase attention or leak into authenticated surfaces.
const SUPPRESS = ["/checkout", "/cart", "/admin", "/account", "/portal"];

export default function SponsorEmbed() {
  const path = usePathname();
  const inserted = useRef(false);

  useEffect(() => {
    if (inserted.current) return;
    if (typeof document === "undefined") return;
    if (SUPPRESS.some((s) => path?.startsWith(s))) return;
    if (document.querySelector('script[data-omni-sponsor-script="1"]')) {
      inserted.current = true;
      return;
    }
    const s = document.createElement("script");
    s.src = "https://omnileadsagi.com/embed/sponsor.js";
    s.async = true;
    s.setAttribute("data-omni-sponsor-script", "1");
    document.body.appendChild(s);
    inserted.current = true;
  }, [path]);

  if (SUPPRESS.some((s) => path?.startsWith(s))) return null;

  return (
    <div
      id="omni-sponsor"
      data-slug="imperium"
      data-brand="Imperium Elite"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
    />
  );
}
