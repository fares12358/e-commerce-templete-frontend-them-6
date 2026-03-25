// ═══════════════════════════════════════════════════════════════
// NotFoundPage.jsx — THEME VERSION (Aligned with your system)
// ═══════════════════════════════════════════════════════════════
"use client";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-[520px]"
      >
        {/* 404 */}
        <p
          className="text-[clamp(88px,18vw,180px)] font-extrabold leading-none tracking-[-0.06em] select-none tabular-nums"
          style={{
            color: "var(--border)",
            fontFamily: "var(--font-display)"
          }}
        >
          404
        </p>

        {/* Accent Line */}
        <div
          className="w-10 h-1 rounded-full mb-7 -mt-2"
          style={{ background: "var(--accent)" }}
        />

        {/* Title */}
        <h1
          className="text-[clamp(20px,3.5vw,30px)] font-extrabold tracking-[-0.02em] mb-4"
          style={{
            color: "var(--text)",
            fontFamily: "var(--font-display)"
          }}
        >
          الصفحة غير موجودة
        </h1>

        {/* Description */}
        <p
          className="text-[14px] leading-[1.75] max-w-[360px] mb-9"
          style={{ color: "var(--text-muted)" }}
        >
          عذراً، الرابط الذي تحاول الوصول إليه غير متوفر حالياً.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[13px] font-bold px-8 py-3.5 rounded-[10px] transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "var(--accent)",
            color: "var(--text-inverse)",
            boxShadow: "var(--shadow-accent)"
          }}
        >
          العودة للرئيسية <FaArrowLeft size={11} />
        </Link>

        {/* Quick Links */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p
            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--text-subtle)" }}
          >
            روابط سريعة
          </p>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[
              { href: "/", label: "الرئيسية" },
              { href: "/shop", label: "المتجر" },
              { href: "/contact", label: "الدعم" }
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium underline underline-offset-4 transition-colors duration-150"
                style={{
                  color: "var(--text-secondary)",
                  textDecorationColor: "var(--border)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.textDecorationColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.textDecorationColor = "var(--border)";
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <p
        className="absolute bottom-6 text-[11px] tracking-[0.06em]"
        style={{ color: "var(--text-subtle)" }}
      >
        © {new Date().getFullYear()} — جميع الحقوق محفوظة
      </p>
    </main>
  );
}