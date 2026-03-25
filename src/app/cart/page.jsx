"use client";
import { motion } from "framer-motion";
import { FaPlus, FaMinus, FaTrash, FaBoxOpen, FaShoppingBag } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCart, updateCart, removeCart, clearCart } from "@/lib/api";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import ConfirmModal from "@/Components/ConfirmModal";
import Link from "next/link";

export default function CartPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const router = useRouter();
  const { user, cart, setCart, setupData, simple } = useAuth();
  const [clearing, setClearing] = useState(false); const [loadingItem, setLoadingItem] = useState(false);
  const [loadingQnty, setLoadingQnty] = useState(false); const [viewConfirm, setviewConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(null); const [targetId, setTargetId] = useState(null);
  const [pendingQty, setPendingQty] = useState({}); const [hasChanges, setHasChanges] = useState(false);
  const [deleting, setDeleting] = useState(false); const [loading, setLoading] = useState(false);

  const inc = (itemId, stock) => { setPendingQty(prev => { if (prev[itemId] >= stock) return prev; const updated = { ...prev, [itemId]: prev[itemId] + 1 }; setHasChanges(true); return updated; }); };
  const dec = (itemId) => { setPendingQty(prev => { if (prev[itemId] <= 1) return prev; const updated = { ...prev, [itemId]: prev[itemId] - 1 }; setHasChanges(true); return updated; }); };
  const subtotal = cart.reduce((s, i) => s + i.price * (pendingQty[i.itemId] ?? i.quantity), 0);
  const tax = +(subtotal * (setupData?.config?.vat / 100 || 0)).toFixed(2);
  const total = (subtotal + tax).toFixed(2);
  const fetchCart = async () => { try { setLoading(true); const res = await getCart(); setCart(res.data.items || []); } catch (err) { toast.error(err.message); } finally { setLoading(false); } };
  const handleConfirmAction = async () => {
    try {
      if (confirmType === "remove") { setLoadingItem(targetId); await removeCart(targetId); }
      if (confirmType === "clear") { setClearing(true); await clearCart(); }
      await fetchCart();
    } catch (err) { toast.error(err.message); } finally { setLoadingItem(null); setClearing(false); setTargetId(null); setConfirmType(null); setviewConfirm(false); }
  };
  const handleSaveChanges = async () => {
    try {
      setDeleting(true);
      for (const item of cart) { const newQty = pendingQty[item.itemId]; if (newQty !== item.quantity) await updateCart({ itemId: item.itemId, quantity: newQty }); }
      toast.success("تم حفظ التغييرات"); setHasChanges(false); await fetchCart();
    } catch (err) { toast.error(err.message); } finally { setDeleting(false); }
  };
  useEffect(() => { const map = {}; cart.forEach(item => { map[item.itemId] = item.quantity; }); setPendingQty(map); }, [cart]);
  useEffect(() => { setHasChanges(cart.some(item => (pendingQty[item.itemId] ?? item.quantity) !== item.quantity)); }, [pendingQty, cart]);
  useEffect(() => { if (!user) { router.push('/'); } else { fetchCart(); } }, [user]);
  // ── END LOGIC ────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center w-full h-screen" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );
  if (!user) return null;

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10">

        {/* Page Header */}
        <div className="flex items-end justify-between pb-7 mb-8 flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>مراجعة طلبك</p>
            <h1 className="text-[clamp(24px,4vw,38px)] leading-[1.1] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
              حقيبة التسوق
            </h1>
          </div>
          {cart.length > 0 && (
            <span className="text-[12px] font-medium px-3 py-1.5 rounded-full"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", boxShadow: "var(--shadow-xs)" }}>
              {cart.length} {cart.length === 1 ? "منتج" : "منتجات"}
            </span>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Items list */}
            <div className="flex-1 min-w-0 overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
              {cart.map((item, i) => (
                <motion.div key={item.itemId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="p-5 md:p-6"
                  style={{ borderBottom: i < cart.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div className="flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div onClick={() => router.push(`/product/${item.productId}`)}
                      className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 group"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[14px] font-medium line-clamp-2 leading-snug flex-1"
                          style={{ color: "var(--text)" }}>{item.name}</p>
                        <p className="text-[16px] font-semibold shrink-0 tabular-nums"
                          style={{ color: "var(--text)" }}>
                          {(item.price * (pendingQty[item.itemId] ?? item.quantity)).toLocaleString()} {simple}
                        </p>
                      </div>

                      {/* Stock badge */}
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full w-fit"
                        style={{
                          color: item.stock > 0 ? "var(--success)" : "var(--error)",
                          background: item.stock > 0 ? "var(--success-bg)" : "var(--error-bg)",
                          border: `1px solid ${item.stock > 0 ? "var(--success-border)" : "var(--error-border)"}`,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background: item.stock > 0 ? "var(--success)" : "var(--error)" }} />
                        {item.stock > 0 ? `متوفر · ${item.stock}` : "نفد"}
                      </div>

                      {/* Selections */}
                      {item.selections?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.selections.map((sel, idx) => (
                            <span key={idx} className="text-[11px] px-2.5 py-1 rounded-full"
                              style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                              {sel.name}: <span style={{ fontWeight: 600, color: "var(--text)" }}>{sel.value}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Qty + remove */}
                      <div className="flex items-center justify-between mt-1.5 pt-3"
                        style={{ borderTop: "1px solid var(--border)" }}>
                        <div className="inline-flex items-center rounded-[8px] overflow-hidden"
                          style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                          {loadingQnty === item.itemId ? (
                            <div className="flex items-center justify-center min-w-[96px] h-9">
                              <Loader size={14} color="var(--accent)" />
                            </div>
                          ) : (
                            <>
                              <button disabled={loadingQnty === item.productId} onClick={() => dec(item.itemId)}
                                className="w-9 h-9 flex items-center justify-center transition-colors duration-150 cursor-pointer border-none bg-transparent"
                                style={{ color: "var(--text-secondary)" }}>
                                <FaMinus size={9} />
                              </button>
                              <span className="min-w-[34px] text-center text-[13px] font-semibold h-9 flex items-center justify-center px-2 tabular-nums"
                                style={{ color: "var(--text)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                                {pendingQty[item.itemId] ?? item.quantity}
                              </span>
                              <button disabled={(pendingQty[item.itemId] ?? item.quantity) >= item.stock} onClick={() => inc(item.itemId, item.stock)}
                                className="w-9 h-9 flex items-center justify-center transition-colors duration-150 cursor-pointer border-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ color: "var(--text-secondary)" }}>
                                <FaPlus size={9} />
                              </button>
                            </>
                          )}
                        </div>
                        <button onClick={() => { setConfirmType("remove"); setTargetId(item.itemId); setviewConfirm(true); }}
                          disabled={loadingItem === item.itemId}
                          className="flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer disabled:opacity-40"
                          style={{ color: "var(--text-subtle)" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--error)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-subtle)"; }}>
                          {loadingItem === item.itemId
                            ? <Loader size={13} color="var(--text-subtle)" />
                            : <><FaTrash size={10} /> إزالة</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-3 lg:sticky lg:top-[84px]">
              {/* Unsaved changes banner */}
              {hasChanges && (
                <div className="rounded-[10px] p-3.5 flex items-center gap-3"
                  style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)" }}>
                  <span className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                    style={{ background: "var(--accent)" }} />
                  <p className="text-[12px] flex-1" style={{ color: "var(--text-secondary)" }}>لديك تغييرات غير محفوظة</p>
                  <motion.button disabled={deleting} whileTap={{ scale: 0.97 }} onClick={handleSaveChanges}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-[6px] cursor-pointer disabled:opacity-50 shrink-0 border-none"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>
                    {deleting ? <Loader size={14} color="var(--text-inverse)" /> : "حفظ"}
                  </motion.button>
                </div>
              )}

              <div className="overflow-hidden"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" }}>
                <div className="h-[2px]" style={{ background: "var(--accent)" }} />
                <div className="p-5 flex flex-col gap-4">
                  <p className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: "var(--text-subtle)" }}>ملخص الطلب</p>
                  <div className="flex flex-col gap-2.5">
                    <SummaryRow label="المجموع الفرعي" value={`${subtotal.toLocaleString()} ${simple}`} />
                    {setupData?.config?.vat > 0 && <SummaryRow label={`الضريبة (${setupData?.config?.vat}%)`} value={`${tax.toLocaleString()} ${simple}`} />}
                    {setupData?.config?.shipment > 0 && <SummaryRow label="الشحن" value={`${setupData?.config?.shipment} ${simple}`} />}
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <span className="text-[14px] font-medium" style={{ color: "var(--text)" }}>الإجمالي</span>
                    <span className="text-[22px] font-semibold tracking-[-0.01em] tabular-nums"
                      style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                      {total.toLocaleString()} {simple}
                    </span>
                  </div>
                  <motion.button onClick={() => router.push('/checkout')} whileTap={{ scale: 0.98 }}
                    className="w-full h-12 flex items-center justify-center gap-2 text-[14px] font-semibold rounded-[8px] cursor-pointer border-none transition-all duration-200"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
                    <FaBoxOpen size={13} /> إتمام الشراء
                  </motion.button>
                  <button onClick={() => { setConfirmType("clear"); setviewConfirm(true); }}
                    className="w-full h-9 flex items-center justify-center gap-1.5 text-[12px] font-medium rounded-[8px] cursor-pointer border transition-all duration-150"
                    style={{ color: "var(--text-muted)", background: "transparent", borderColor: "var(--border)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--error-border)"; e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.background = "var(--error-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
                    {clearing ? <Loader size={14} color="var(--error)" /> : <><FaTrash size={10} /> تفريغ الحقيبة</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-5 py-28 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
              <FaShoppingBag size={24} style={{ color: "var(--border-strong)" }} />
            </div>
            <div>
              <p className="text-[17px] font-medium mb-1.5" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>الحقيبة فارغة</p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>لا توجد منتجات في حقيبتك بعد</p>
            </div>
            <Link href="/shop"
              className="inline-flex items-center gap-2 text-[13px] font-semibold px-6 py-3 rounded-[8px] transition-all duration-200"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
              <FaShoppingBag size={12} /> تسوق الآن
            </Link>
          </div>
        )}
      </div>

      <ConfirmModal open={viewConfirm}
        title={confirmType === "clear" ? "تفريغ الحقيبة" : "إزالة منتج"}
        message={confirmType === "clear" ? "هل تريد تفريغ الحقيبة بالكامل؟" : "هل تريد إزالة هذا المنتج؟"}
        onConfirm={handleConfirmAction} onCancel={() => setviewConfirm(false)}
        loading={confirmType === "clear" ? clearing : loadingItem === targetId}
        icon={<FaTrash size={20} style={{ color: "var(--error)" }} />} />
    </main>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="font-medium tabular-nums" style={{ color: "var(--text)" }}>{value}</span>
    </div>
  );
}
