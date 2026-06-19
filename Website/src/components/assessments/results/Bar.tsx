"use client";

import { motion } from "framer-motion";

export function Bar({
  label,
  value,
  caption,
  delay = 0,
}: {
  label: string;
  value: number; // 0-100
  caption?: string;
  delay?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-body text-sm text-white/80">{label}</span>
        <span className="text-label text-imperium-gold/80">{caption ?? `${value}`}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full gradient-gold"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
