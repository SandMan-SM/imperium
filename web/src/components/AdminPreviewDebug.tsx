"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AdminPreviewDebug() {
  const { rawProfile, profile, previewView, setPreview } = useAuth();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try { return sessionStorage.getItem('admin_preview_debug_visible') !== 'false'; } catch (e) { return true; }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const read = () => setLocalPreview(localStorage.getItem("preview_view"));
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "preview_view") read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!rawProfile?.is_admin) return null;
  if (!visible) {
    return (
      <div className="fixed right-4 bottom-4 z-60">
        <button
          onClick={() => { setVisible(true); try { sessionStorage.setItem('admin_preview_debug_visible', 'true'); } catch (e) {} }}
          className="bg-[#071118] border border-white/[0.06] px-3 py-2 rounded-lg text-xs text-white/80 shadow-lg"
        >
          Open Debug
        </button>
      </div>
    );
  }

  const applyPreview = async (v: string | null) => {
    try {
      if (setPreview) {
        await setPreview(v);
      } else {
        if (v) localStorage.setItem("preview_view", v);
        else localStorage.removeItem("preview_view");
        // fallback: reload so helper-less flows pick up change
        window.location.reload();
      }
    } catch (e) {
      console.warn("applyPreview failed", e);
    }
  };

  return (
    <div className={`fixed right-4 bottom-4 z-60 ${collapsed ? "w-40" : "w-80 max-w-[90vw]"}`}>
      <div className={`bg-[#071118] border border-white/[0.06] p-2 rounded-lg text-xs text-white/80 shadow-lg ${collapsed ? "p-2" : "p-3"}`}>
        <div className="flex items-center justify-between mb-2">
          <strong className="text-white text-sm">Admin Preview Debug</strong>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand debug panel" : "Collapse debug panel"}
              className="text-white/40 hover:text-white"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
            <button
              onClick={() => { setVisible(false); try { sessionStorage.setItem('admin_preview_debug_visible', 'false'); } catch (e) {} }}
              aria-label="Close debug panel"
              className="text-white/40 hover:text-white"
            >
              Close
            </button>
            <span className="text-[11px] text-white/40">dev only</span>
          </div>
        </div>

        {!collapsed ? (
          <div className="space-y-2">
            <div className="text-[11px]">
              <div className="text-white/60">previewView (context)</div>
              <pre className="whitespace-pre-wrap break-words bg-black/30 p-2 rounded text-[11px]">{String(previewView)}</pre>
            </div>

            <div className="text-[11px]">
              <div className="text-white/60">localStorage.preview_view</div>
              <pre className="whitespace-pre-wrap break-words bg-black/30 p-2 rounded text-[11px]">{String(localPreview)}</pre>
            </div>

            <div className="text-[11px]">
              <div className="text-white/60">rawProfile</div>
              <pre className="max-h-28 overflow-auto bg-black/30 p-2 rounded text-[11px]">{JSON.stringify(rawProfile, null, 2)}</pre>
            </div>

            <div className="text-[11px]">
              <div className="text-white/60">profile (effective)</div>
              <pre className="max-h-28 overflow-auto bg-black/30 p-2 rounded text-[11px]">{JSON.stringify(profile, null, 2)}</pre>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: "Admin", v: null },
                { label: "Public", v: "public" },
                { label: "Subscriber", v: "subscriber" },
                { label: "Free", v: "free" },
                { label: "Premium", v: "premium" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  onClick={() => applyPreview(opt.v)}
                  className={`px-2 py-1 text-[11px] rounded border ${
                    (opt.v === null && localPreview === null) || localPreview === opt.v ? "border-imperium-gold text-imperium-gold" : "border-white/10 text-white/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-white/60">preview: {String(localPreview ?? 'admin')}</div>
        )}
      </div>
    </div>
  );
}
