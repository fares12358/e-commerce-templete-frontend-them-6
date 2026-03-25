"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaCheck } from "react-icons/fa";

export default function CustomSelect({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative min-w-[180px]" dir="rtl">
      <button onClick={() => setOpen(!open)}
        className="w-full h-10 px-3.5 flex items-center justify-between gap-3 text-[13px] font-medium cursor-pointer transition-all duration-150 rounded-[8px]"
        style={{
          background: "var(--surface)",
          border: `1px solid ${open ? "var(--accent-border)" : "var(--border)"}`,
          color: selected ? "var(--text)" : "var(--text-subtle)",
          boxShadow: open ? "0 0 0 3px rgba(200,131,26,0.12)" : "var(--shadow-xs)",
        }}>
        <span>{selected?.label || placeholder}</span>
        <FaChevronDown size={10} style={{ color: "var(--text-subtle)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} className="shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 3, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+5px)] right-0 z-[100] w-full overflow-hidden"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)" }}>
            {options.map(opt => {
              const isActive = opt.value === value;
              return (
                <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="flex items-center justify-between px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors duration-100"
                  style={{
                    background: isActive ? "var(--accent-light)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  {opt.label}
                  {isActive && <FaCheck size={10} style={{ color: "var(--accent)" }} className="shrink-0" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
