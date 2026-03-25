'use client';
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addToCart, getProductByID } from "@/lib/api";
import { motion } from "framer-motion";
import { FaShoppingBag, FaCheckCircle, FaTimesCircle, FaTag } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/Components/Loader";
import { toast } from "react-toastify";

export default function ProductDetails() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData, products, simple, user } = useAuth();
  const params = useParams(); const id = params?.id;
  const [quantity, setQuantity] = useState(1); const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState(null); const [selectedOptions, setSelectedOptions] = useState({});
  const [activeImage, setActiveImage] = useState(null); const [loading, setLoading] = useState(false);

  const normalizeProduct = (data) => ({
    ...data,
    images: data.images?.map(img => typeof img === "string" ? img : img.url) || [],
    selections: data.selections?.map(sel => ({ name: sel.name, options: sel.options.map(opt => typeof opt === "string" ? opt : opt.value) })) || [],
    attributes: data.attributes || []
  });

  const handleAddToCart = useCallback(async () => {
    if (!user) { toast.error('تسجيل الدخول مطلوب'); return; }
    if (quantity > product.stock) { toast.error("الكمية المطلوبة غير متاحة"); return; }
    if (product.selections?.length) { for (const sel of product.selections) { if (!selectedOptions[sel.name]) { toast.error(`يرجى اختيار ${sel.name}`); return; } } }
    const selectionsPayload = Object.entries(selectedOptions).map(([name, value]) => ({ name, value }));
    try {
      setAdding(true);
      await addToCart({ productId: product._id, quantity, selections: selectionsPayload });
      toast.success("تمت إضافة المنتج إلى الحقيبة 🛍️");
      setQuantity(1); setSelectedOptions({});
    } catch { toast.error("حدث خطأ أثناء الإضافة"); } finally { setAdding(false); }
  }, [user, quantity, product, selectedOptions]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const apiProduct = await getProductByID(id);
      if (apiProduct.success) { const normalized = normalizeProduct(apiProduct.data); setProduct(normalized); setActiveImage(normalized.images[0]); }
    } catch (error) { toast.error(error.message || 'فشل تحميل المنتج'); } finally { setLoading(false); }
  };
  useEffect(() => { if (!id) return; loadProduct(); }, [id]);
  // ── END LOGIC ────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center w-full h-screen" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );
  if (!product) return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <FaTimesCircle size={20} style={{ color: "var(--border-strong)" }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>المنتج غير متاح</p>
    </div>
  );

  const hasDiscount = product?.comparePrice > product?.price;
  const discountPct = hasDiscount ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* Images column */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <motion.div key={activeImage} initial={{ opacity: 0.6, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-square overflow-hidden group"
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-2xl)",
                border: "1px solid var(--border)",
                padding: "2rem",
                boxShadow: "var(--shadow-card)",
              }}>
              <img src={activeImage} className="w-full h-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" alt={product.name} />
              {hasDiscount && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--accent)", color: "var(--text-inverse)" }}>
                    <FaTag size={7} /> -{discountPct}%
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {product.images.map(img => (
                <button key={img} onClick={() => setActiveImage(img)}
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] overflow-hidden cursor-pointer transition-all duration-150 p-1.5"
                  style={{
                    background: "var(--bg-secondary)",
                    border: `2px solid ${activeImage === img ? "var(--accent-border)" : "var(--border)"}`,
                    boxShadow: activeImage === img ? "0 0 0 2px var(--accent-light)" : "none",
                  }}>
                  <img src={img} className="w-full h-full object-contain" alt="thumb" />
                </button>
              ))}
            </div>
          </div>

          {/* Details column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Category + SKU */}
            <div className="flex items-center gap-2 flex-wrap">
              {product?.categoryId?.name && (
                <span className="text-[11px] font-medium tracking-[0.06em] uppercase px-3 py-1 rounded-full"
                  style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  {product.categoryId.name}
                </span>
              )}
              <span className="text-[11px] font-mono" style={{ color: "var(--text-subtle)" }}>#{product.productNumber}</span>
            </div>

            {/* Name */}
            <h1 className="text-[clamp(22px,3.5vw,34px)] leading-[1.2] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
              {product.name}
            </h1>

            {/* Price block */}
            <div className="flex items-baseline gap-3 py-4"
              style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[clamp(26px,4vw,38px)] font-semibold tracking-[-0.02em] leading-none"
                style={{ color: hasDiscount ? "var(--price-sale)" : "var(--price)", fontFamily: "var(--font-display)" }}>
                {product?.price?.toLocaleString()} {simple}
              </span>
              {hasDiscount && (
                <del className="text-[16px] font-normal" style={{ color: "var(--price-original)" }}>
                  {product?.comparePrice?.toLocaleString()}
                </del>
              )}
            </div>

            {/* Stock status */}
            {inStock ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] w-fit"
                style={{ background: "var(--success-bg)", border: "1px solid var(--success-border)" }}>
                <FaCheckCircle style={{ color: "var(--success)" }} size={13} />
                <span className="text-[13px] font-medium" style={{ color: "var(--success)" }}>متوفر · {product.stock} قطعة</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] w-fit"
                style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)" }}>
                <FaTimesCircle style={{ color: "var(--error)" }} size={13} />
                <span className="text-[13px] font-medium" style={{ color: "var(--error)" }}>غير متوفر في المخزون</span>
              </div>
            )}

            {/* Selections */}
            {product.selections.length > 0 && (
              <div className="flex flex-col gap-5">
                {product.selections.map(selection => (
                  <div key={selection.name}>
                    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                      {selection.name}
                      {selectedOptions[selection.name] && (
                        <span className="normal-case tracking-normal font-normal mr-1.5" style={{ color: "var(--text-subtle)" }}>
                          — {selectedOptions[selection.name]}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selection.options.map(option => {
                        const isActive = selectedOptions[selection.name] === option;
                        return (
                          <button key={option}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [selection.name]: option }))}
                            className="px-3.5 py-2 rounded-[6px] text-[13px] transition-all duration-150 cursor-pointer"
                            style={{
                              border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                              background: isActive ? "var(--accent-light)" : "var(--surface)",
                              color: isActive ? "var(--accent)" : "var(--text-secondary)",
                              fontWeight: isActive ? 600 : 400,
                            }}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>الكمية</p>
              <div className="inline-flex items-center rounded-[8px] overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[17px] font-light transition-colors duration-150 cursor-pointer border-none bg-transparent"
                  style={{ color: "var(--text-secondary)" }}>−</button>
                <span className="min-w-[48px] text-center text-[14px] font-semibold h-11 flex items-center justify-center"
                  style={{ color: "var(--text)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}
                  className="w-11 h-11 flex items-center justify-center text-[17px] font-light transition-colors duration-150 cursor-pointer border-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: "var(--text-secondary)" }}>+</button>
              </div>
            </div>

            {/* Add to cart CTA */}
            <motion.button onClick={handleAddToCart} disabled={adding || !inStock} whileTap={{ scale: 0.98 }}
              className="w-full h-14 flex items-center justify-center gap-2.5 text-[15px] font-semibold rounded-[10px] border-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={inStock ? {
                background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)",
              } : {
                background: "var(--bg-tertiary)", color: "var(--text-disabled)",
              }}>
              {adding ? <Loader size={22} color="var(--text-inverse)" /> : (
                <><FaShoppingBag size={15} />{inStock ? "أضف إلى الحقيبة" : "نفد المخزون"}</>
              )}
            </motion.button>

            {/* Description */}
            {product.description && (
              <div className="rounded-[12px] p-5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: "var(--text-subtle)" }}>الوصف</p>
                <p className="text-[14px] whitespace-pre-line leading-[1.8]" style={{ color: "var(--text-secondary)" }}>{product.description}</p>
              </div>
            )}

            {/* Attributes */}
            {product.attributes.length > 0 && (
              <div className="rounded-[12px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div className="px-5 py-3" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "var(--text-subtle)" }}>المواصفات</p>
                </div>
                {product.attributes.map((attr, i) => (
                  <div key={attr.key} className="flex items-center justify-between px-5 py-3.5 text-[13px]"
                    style={{
                      borderBottom: i < product.attributes.length - 1 ? "1px solid var(--border)" : "none",
                      background: i % 2 === 0 ? "var(--surface)" : "var(--bg-secondary)",
                    }}>
                    <span style={{ color: "var(--text-muted)" }}>{attr.key}</span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
