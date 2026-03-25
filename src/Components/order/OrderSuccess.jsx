// ═══════════════════════════════════════════════════════════════
// OrderSuccess.jsx — THEME VERSION (Aligned with your system)
// ═══════════════════════════════════════════════════════════════
"use client";
import { motion } from "framer-motion";
import { FaCheck, FaTruck, FaHome, FaBoxOpen } from "react-icons/fa";

export default function OrderSuccess({ orderId = "#INV-00001", onTrack, onHome }) {
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--bg)" }}>

      <div className="w-full max-w-[460px] flex flex-col items-center text-center">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="relative mb-8"
        >
          <div
            className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
            style={{
              background: "var(--success-bg)",
              borderColor: "var(--success-border)"
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--success-bg)" }}
            >
              <FaCheck size={28} style={{ color: "var(--success)" }} />
            </div>
          </div>

          <span
            className="absolute inset-0 rounded-full animate-ping opacity-50"
            style={{ border: "1px solid var(--success-border)" }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-7"
        >
          <h1
            className="text-[clamp(26px,5vw,38px)] font-extrabold tracking-[-0.02em] mb-3"
            style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}
          >
            تم طلبك بنجاح!
          </h1>

          <p
            className="text-[14px] leading-[1.7]"
            style={{ color: "var(--text-muted)" }}
          >
            شكراً لتسوقك معنا. سنبدأ بتجهيز طلبك فوراً.
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full rounded-[14px] overflow-hidden mb-6"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)"
          }}
        >
          <div style={{ height: "3px", background: "var(--accent)" }} />

          <div className="p-5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)"
              }}
            >
              <FaBoxOpen size={14} style={{ color: "var(--text-muted)" }} />
            </div>

            <div className="text-right flex-1">
              <p
                className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                رقم الطلب
              </p>

              <p
                className="text-[18px] font-bold tabular-nums"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-display)"
                }}
              >
                {orderId}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-2.5 w-full"
        >
          {/* Track */}
          <button
            onClick={onTrack}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-[13px] font-semibold rounded-[8px] border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
            style={{
              background: "var(--accent)",
              color: "var(--text-inverse)",
              boxShadow: "var(--shadow-accent)"
            }}
          >
            <FaTruck size={12} /> تتبع الطلب
          </button>

          {/* Home */}
          <button
            onClick={onHome}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-[13px] font-medium rounded-[8px] cursor-pointer transition-all duration-200 hover:-translate-y-px"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <FaHome size={12} /> الرئيسية
          </button>
        </motion.div>

      </div>
    </main>
  );
}