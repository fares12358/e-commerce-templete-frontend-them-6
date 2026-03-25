"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheck } from "react-icons/fa";
import Loader from "./Loader";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, icon }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed h-screen w-full inset-0 z-[500] flex items-center justify-center px-5"
        style={{ background: "rgba(26,23,20,0.40)", backdropFilter: "blur(8px)" }}>
        <motion.div initial={{ scale: 0.94, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          dir="rtl"
          className="w-full max-w-[400px] overflow-hidden"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-modal)",
          }}>
          {/* Accent top strip */}
          <div className="h-[2px]" style={{ background: "var(--accent)" }} />
          <div className="px-7 pt-8 pb-6 flex flex-col items-center text-center gap-3">
            {icon && (
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {icon}
              </div>
            )}
            <h2 className="text-[20px] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>{title}</h2>
            <p className="text-[14px] leading-[1.65]" style={{ color: "var(--text-muted)" }}>{message}</p>
          </div>
          <div className="px-7 pb-7 flex gap-2.5">
            <button disabled={loading} onClick={onCancel}
              className="flex-1 h-11 flex items-center justify-center gap-1.5 text-[13px] font-medium rounded-[8px] cursor-pointer disabled:opacity-50 transition-all duration-150"
              style={{ color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border)" }}>
              <FaTimes size={10} /> إلغاء
            </button>
            <button disabled={loading} onClick={onConfirm}
              className="flex-1 h-11 flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-[8px] cursor-pointer disabled:opacity-60 border-none transition-all duration-200"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
              {loading ? <Loader size={17} color="var(--text-inverse)" /> : <><FaCheck size={10} />تأكيد</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
