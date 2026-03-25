// ═══════════════════════════════════════════════════════════════
// Loading.jsx — FINAL POLISHED THEME VERSION
// ═══════════════════════════════════════════════════════════════
"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loading() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 1 : 100));
    }, 30);
    return () => clearInterval(interval);
  }, []);
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main
      dir="rtl"
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex flex-col items-center gap-10 w-full max-w-[280px] px-6">

        {/* Logo */}
        <img
          src="/img/logo.webp"
          alt="logo"
          className="h-9 w-auto object-contain"
          onError={e => { e.currentTarget.style.display = "none"; }}
        />

        {/* Progress */}
        <div className="w-full flex flex-col gap-3">

          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              جاري التحميل
            </p>

            <p
              className="text-[11px] font-bold tabular-nums"
              style={{ color: "var(--accent)" }}
            >
              {progress}%
            </p>
          </div>

          {/* Progress Bar */}
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: "var(--bg-secondary)" }} // ✅ better than border
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "var(--shadow-accent)" // ✨ subtle glow consistency
              }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>

          <p
            className="text-[11px] text-center mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            يتم تحضير تجربة تسوق فريدة لك
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1.5">
        <div
          className="w-6 h-0.5 rounded-full opacity-40"
          style={{ background: "var(--accent)" }}
        />
        <p
          className="text-[9px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: "var(--text-subtle)" }}
        >
          Premium E-Commerce
        </p>
      </div>
    </main>
  );
}