"use client";

import { useCallback, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

/**
 * Share control: uses the native Web Share sheet when available (mobile),
 * and always offers X / WhatsApp / Facebook / copy fallbacks.
 */
export function ShareButton({
  text,
  url,
  title = "Imperium Assessments",
  variant = "primary",
}: {
  text: string;
  url: string;
  title?: string;
  variant?: "primary" | "subtle";
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const nativeShare = useCallback(async () => {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : null;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({ title, text, url });
        return;
      } catch {
        /* user dismissed — fall through to menu */
      }
    }
    setOpen((o) => !o);
  }, [text, url, title]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text, url]);

  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
  ];

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={nativeShare}
        className={
          variant === "primary"
            ? "btn-secondary rounded-full px-7 py-3.5 text-sm inline-flex items-center gap-2"
            : "inline-flex items-center gap-2 text-label text-white/50 hover:text-white transition-colors"
        }
      >
        <Share2 className="w-4 h-4" /> Share with friends
      </button>

      {open && (
        <div className="mt-3 flex items-center gap-4 text-label">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-white/60 hover:text-imperium-gold transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-imperium-gold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-imperium-gold" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
