"use client";
import AdsSlider from "@/Components/AdsSlider";
import CategorySlider from "@/Components/CategorySlider";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";
import CartSidePanel from "@/Components/CartSidePanel";
import { useAuth } from "@/context/AuthContext";
import { useRef, useState } from "react";
import { FaBoxOpen, FaStar } from "react-icons/fa";

export default function Home() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData, setupLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const sliderRef = useRef(null); const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRefProd = useRef(null); const [currentIndexProd, setCurrentIndexProd] = useState(0);
  if (setupLoading) return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
      <Loader size={36} color="var(--accent)" />
      <span className="text-[13px] tracking-[0.04em]" style={{ color: "var(--text-subtle)" }}>جارٍ التحميل...</span>
    </div>
  );
  const openCart = (product) => { setActiveProduct(product); setOpen(true); };
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">
      {setupData?.ads && <AdsSlider />}

      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        {setupData?.categories?.length > 0 && (
          <section className="pt-12 md:pt-16">
            <CategorySlider />
          </section>
        )}

        {/* Featured Products */}
        {setupData?.featuredProducts?.length > 0 && (
          <section className="pt-4 pb-6">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2" style={{ color: "var(--text-subtle)" }}>منتجات مختارة</p>
                <h2 className="flex items-center gap-3 text-[clamp(22px,3.5vw,36px)] leading-[1.15] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--text)" }}>
                    <FaStar className="text-white" size={12} />
                  </span>
                  المنتجات المميزة
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {setupData?.featuredProducts.map((item, i) => (
                <div key={item._id} style={{ animation: `zealFadeUp 350ms ${i * 50}ms both` }}>
                  <ProductCard id={item._id} title={item.name} price={item.price} image={item.images[0].url} stock={item.stock} code={item.productNumber} comparePrice={item.comparePrice} category={item?.category?.name} onAdd={() => openCart(item)} star={true} />
                </div>
              ))}
            </div>
          </section>
        )}

        {setupData?.featuredProducts?.length > 0 && setupData?.newProducts?.length > 0 && (
          <div className="my-6 h-px" style={{ background: "var(--border)" }} />
        )}

        {/* New Products */}
        {setupData?.newProducts?.length > 0 ? (
          <section className="pt-4 pb-20">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2" style={{ color: "var(--text-subtle)" }}>وصل حديثاً</p>
                <h2 className="flex items-center gap-3 text-[clamp(22px,3.5vw,36px)] leading-[1.15] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)" }}>
                    <FaBoxOpen className="text-white" size={12} />
                  </span>
                  المنتجات الجديدة
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {setupData?.newProducts.map((item, i) => (
                <div key={item._id} style={{ animation: `zealFadeUp 350ms ${i * 50}ms both` }}>
                  <ProductCard id={item._id} title={item.name} price={item.price} image={item.images[0].url} stock={item.stock} code={item.productNumber} comparePrice={item.comparePrice} category={item?.category?.name} onAdd={() => openCart(item)} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="my-14 min-h-[200px] flex flex-col items-center justify-center gap-3 px-8 mb-20 rounded-[16px]"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <FaBoxOpen size={26} style={{ color: "var(--border-strong)" }} />
            <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>لا يوجد منتجات حاليا</p>
          </div>
        )}
      </div>

      {activeProduct && (
        <CartSidePanel open={open} onClose={() => { setOpen(false); setActiveProduct(null); }}
          selections={activeProduct.selections} id={activeProduct._id} name={activeProduct.name}
          stock={activeProduct.stock} price={activeProduct.price} comparePrice={activeProduct.comparePrice}
          image={activeProduct.images[0].url} />
      )}
    </main>
  );
}
