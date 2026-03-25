"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaShoppingBag, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function ProductCard({ title, price, image, stock, code, id, comparePrice, category, onAdd, star = false }) {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { simple, user } = useAuth();
  const router = useRouter();
  const inStock = stock > 0;
  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied!"); }
    catch { toast.error("Failed to copy"); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const hasDiscount = comparePrice > price;
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      dir="rtl"
      className="group flex flex-col overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow 250ms ease, border-color 250ms ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {/* Image */}
      <div onClick={() => router.push(`/product/${id}`)}
        className="relative aspect-square overflow-hidden cursor-pointer"
        style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }}>
        <img src={image} alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />

        <div className="absolute inset-0 transition-colors duration-300" style={{ background: "rgba(26,23,20,0)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,23,20,0.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,23,20,0)"; }} />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {star && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.04em] px-2.5 py-1 rounded-full"
              style={{ background: "var(--text)", color: "var(--text-inverse)" }}>
              <FaStar size={7} /> مميز
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>
              -{discountPct}%
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(253,252,250,0.80)", backdropFilter: "blur(2px)" }}>
            <span className="text-[11px] font-semibold tracking-[0.04em] px-4 py-1.5 rounded-full"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category + Code */}
        <div className="flex items-center justify-between">
          {category && <span className="text-[11px] font-medium tracking-[0.05em] uppercase" style={{ color: "var(--text-subtle)" }}>{category}</span>}
          <button onClick={() => copyToClipboard(code)}
            className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] cursor-pointer transition-colors duration-150"
            style={{ color: "var(--text-subtle)", background: "var(--bg-tertiary)" }}>
            #{code}
          </button>
        </div>

        {/* Title */}
        <h3 onClick={() => router.push(`/product/${id}`)}
          className="text-[14px] leading-[1.45] line-clamp-2 min-h-[40px] cursor-pointer transition-colors duration-150"
          style={{ fontWeight: 500, color: "var(--text)" }}>
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-[18px] font-semibold tracking-[-0.01em]"
            style={{ color: hasDiscount ? "var(--price-sale)" : "var(--price)" }}>
            {price.toLocaleString()} {simple}
          </span>
          {hasDiscount && <del className="text-[12px]" style={{ color: "var(--price-original)" }}>{comparePrice.toLocaleString()}</del>}
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: inStock ? "var(--success)" : "var(--error)" }} />
          <span className="text-[11px] font-medium"
            style={{ color: inStock ? "var(--success)" : "var(--error)" }}>
            {inStock ? `متوفر · ${stock}` : "غير متوفر"}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={e => { if (!user) { toast.error("تسجيل الدخول مطلوب"); return; } e.stopPropagation(); onAdd(); }}
          disabled={!inStock}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] text-[13px] font-semibold transition-all duration-200 border-none cursor-pointer"
          style={inStock ? {
            background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)",
          } : {
            background: "var(--bg-tertiary)", color: "var(--text-disabled)", cursor: "not-allowed",
          }}>
          <FaShoppingBag size={11} />
          {inStock ? "أضف إلى الحقيبة" : "نفد المخزون"}
        </button>
      </div>
    </motion.div>
  );
}
