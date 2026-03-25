"use client";
import { addToCart } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaShoppingBag, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { useAuth } from "@/context/AuthContext";

export default function CartSidePanel({ selections, id, name, stock, price, image, open, comparePrice, onClose }) {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { simple, user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const handleSelect = (name, value) => setSelected(prev => ({ ...prev, [name]: value }));
  const handleAdd = async () => {
    if (!user) return;
    if (quantity > stock) { toast.error("الكمية غير متاحة"); return; }
    if (selections?.length) { for (const sel of selections) { if (!selected[sel.name]) { toast.error(`اختر ${sel.name} أولاً`); return; } } }
    const selectionsPayload = Object.entries(selected).map(([name, value]) => ({ name, value }));
    try {
      setLoading(true);
      const res = await addToCart({ productId: id, quantity, selections: selectionsPayload });
      if (res.success) { toast.success("تمت إضافة المنتج إلى الحقيبة 🛍️"); onClose(); }
      else toast.error(res.data.message);
    } catch { toast.error("حدث خطأ أثناء الإضافة"); }
    finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const hasDiscount = comparePrice > price;
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300]"
            style={{ background: "rgba(26,23,20,0.35)", backdropFilter: "blur(4px)" }} />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            dir="rtl"
            className="fixed top-0 right-0 h-screen w-full max-w-[400px] flex flex-col z-[400]"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-panel)" }}>

            {/* Header */}
            <div className="sticky top-0 px-5 py-4 flex items-center justify-between z-10 shrink-0"
              style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <FaShoppingBag size={11} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>إضافة إلى الحقيبة</span>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer"
                style={{ border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }}>
                <FaTimes size={11} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
              {/* Product image */}
              <div className="rounded-[14px] overflow-hidden aspect-square max-w-[240px] mx-auto w-full"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <img src={image} alt={name} className="w-full h-full object-contain p-5" />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[16px] leading-snug" style={{ fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-display)" }}>{name}</h2>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[22px] font-semibold tracking-[-0.01em]"
                    style={{ color: hasDiscount ? "var(--price-sale)" : "var(--price)" }}>
                    {price?.toLocaleString()} {simple}
                  </span>
                  {hasDiscount && (
                    <>
                      <del className="text-[13px]" style={{ color: "var(--price-original)" }}>{comparePrice?.toLocaleString()}</del>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error-border)" }}>
                        -{discountPct}%
                      </span>
                    </>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full w-fit"
                  style={{
                    color: stock > 0 ? "var(--success)" : "var(--error)",
                    background: stock > 0 ? "var(--success-bg)" : "var(--error-bg)",
                    border: `1px solid ${stock > 0 ? "var(--success-border)" : "var(--error-border)"}`,
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: stock > 0 ? "var(--success)" : "var(--error)" }} />
                  {stock > 0 ? `متوفر · ${stock} قطعة` : "نفد المخزون"}
                </div>
              </div>

              <div className="h-px" style={{ background: "var(--border)" }} />

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2.5"
                  style={{ color: "var(--text-muted)" }}>الكمية</label>
                <div className="inline-flex items-center rounded-[8px] overflow-hidden"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[17px] font-light transition-colors duration-150 cursor-pointer border-none bg-transparent"
                    style={{ color: "var(--text-secondary)" }}>−</button>
                  <span className="min-w-[44px] text-center text-[14px] font-semibold h-10 flex items-center justify-center"
                    style={{ color: "var(--text)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[17px] font-light transition-colors duration-150 cursor-pointer border-none bg-transparent"
                    style={{ color: "var(--text-secondary)" }}>+</button>
                </div>
              </div>

              {/* Selections */}
              {selections?.map(sel => (
                <div key={sel._id}>
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2.5"
                    style={{ color: "var(--text-muted)" }}>
                    {sel.name}
                    {selected[sel.name] && <span className="normal-case tracking-normal font-normal mr-1.5" style={{ color: "var(--text-subtle)" }}>— {selected[sel.name]}</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sel.options.map(opt => {
                      const isSelected = selected[sel.name] === opt.value;
                      return (
                        <button key={opt._id} onClick={() => handleSelect(sel.name, opt.value)}
                          className="px-3.5 py-2 rounded-[6px] text-[13px] transition-all duration-150 cursor-pointer"
                          style={{
                            border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                            background: isSelected ? "var(--accent-light)" : "var(--surface)",
                            color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                            fontWeight: isSelected ? 600 : 400,
                          }}>
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-5 py-4 flex gap-2.5 shrink-0"
              style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
              <button disabled={loading || stock === 0} onClick={handleAdd}
                className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold rounded-[8px] transition-all duration-200 cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
                {loading ? <Loader size={18} color="var(--text-inverse)" /> : <><FaShoppingBag size={12} />أضف للحقيبة</>}
              </button>
              <button disabled={loading} onClick={onClose}
                className="h-11 px-4 flex items-center justify-center text-[13px] font-medium rounded-[8px] transition-all duration-150 cursor-pointer"
                style={{ color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border)" }}>
                إلغاء
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
