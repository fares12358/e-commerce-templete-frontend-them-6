"use client";
import AdsSlider from "@/Components/AdsSlider";
import CategorySlider from "@/Components/CategorySlider";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";
import CartSidePanel from "@/Components/CartSidePanel";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { FaBoxOpen, FaStar } from "react-icons/fa";

/* ─────────────────────────────────────────────
   Skeleton card — shown while productsLoading
   Matches the ProductCard grid layout exactly
───────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Image area */}
      <div
        className="w-full aspect-square animate-pulse"
        style={{ background: "var(--bg-secondary)" }}
      />
      {/* Text area */}
      <div className="p-3 flex flex-col gap-2">
        <div
          className="h-3 w-3/4 rounded-full animate-pulse"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-3 w-1/2 rounded-full animate-pulse"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-7 w-full rounded-[6px] mt-1 animate-pulse"
          style={{ background: "var(--bg-secondary)" }}
        />
      </div>
    </div>
  );
}

/* Grid of N skeleton cards */
function ProductSkeletonGrid({ count = 5 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

/* Section heading — reused for both product sections */
function SectionHeading({ eyebrow, title, icon }) {
  return (
    <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
      <div>
        <p
          className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2"
          style={{ color: "var(--text-subtle)" }}
        >
          {eyebrow}
        </p>
        <h2
          className="flex items-center gap-3 text-[clamp(22px,3.5vw,36px)] leading-[1.15] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text)",
            fontWeight: 400,
          }}
        >
          {icon}
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function Home() {
  // ── LOGIC ───────────────────────────────────────────────────
  const { setupData, setupLoading, homepageProducts, productsLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const openCart = (product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  /* ── Phase 1 still loading — show minimal full-screen loader.
     This resolves FAST (only config/categories/ads queries).
     The user will see this for ~100–250ms max.               */
  if (setupLoading) {
    return (
      <div
        className="w-screen h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--bg)" }}
      >
        <Loader size={36} color="var(--accent)" />
        <span
          className="text-[13px] tracking-[0.04em]"
          style={{ color: "var(--text-subtle)" }}
        >
          جارٍ التحميل...
        </span>
      </div>
    );
  }
  // ── END LOGIC ────────────────────────────────────────────────

  const featuredProducts = homepageProducts?.featuredProducts ?? [];
  const newProducts = homepageProducts?.newProducts ?? [];

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">

      {/* ── Ads Slider (shell data — available immediately) ── */}
      {setupData?.ads?.length > 0 && <AdsSlider />}

      <div className="max-w-[1400px] mx-auto px-5 md:px-10">

        {/* ── Category Slider (shell data — available immediately) ── */}
        {setupData?.categories?.length > 0 && (
          <section className="pt-12 md:pt-16">
            <CategorySlider />
          </section>
        )}

        {/* ── Featured Products (phase 2 — skeleton while loading) ── */}
        <section className="pt-4 pb-6">
          <SectionHeading
            eyebrow="منتجات مختارة"
            title="المنتجات المميزة"
            icon={
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--text)" }}
              >
                <FaStar className="text-white" size={12} />
              </span>
            }
          />

          {productsLoading ? (
            <ProductSkeletonGrid count={5} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {featuredProducts.map((item, i) => (
                <div
                  key={item._id}
                  style={{ animation: `zealFadeUp 350ms ${i * 50}ms both` }}
                >
                  <ProductCard
                    id={item._id}
                    title={item.name}
                    price={item.price}
                    image={item.images[0].url}
                    stock={item.stock}
                    code={item.productNumber}
                    comparePrice={item.comparePrice}
                    category={item?.category?.name}
                    onAdd={() => openCart(item)}
                    star={true}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Divider between sections */}
        {(productsLoading || featuredProducts.length > 0) &&
          (productsLoading || newProducts.length > 0) && (
            <div className="my-6 h-px" style={{ background: "var(--border)" }} />
          )}

        {/* ── New Products (phase 2 — skeleton while loading) ── */}
        <section className="pt-4 pb-20">
          <SectionHeading
            eyebrow="وصل حديثاً"
            title="المنتجات الجديدة"
            icon={
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)" }}
              >
                <FaBoxOpen className="text-white" size={12} />
              </span>
            }
          />

          {productsLoading ? (
            <ProductSkeletonGrid count={10} />
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {newProducts.map((item, i) => (
                <div
                  key={item._id}
                  style={{ animation: `zealFadeUp 350ms ${i * 50}ms both` }}
                >
                  <ProductCard
                    id={item._id}
                    title={item.name}
                    price={item.price}
                    image={item.images[0].url}
                    stock={item.stock}
                    code={item.productNumber}
                    comparePrice={item.comparePrice}
                    category={item?.category?.name}
                    onAdd={() => openCart(item)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="my-14 min-h-[200px] flex flex-col items-center justify-center gap-3 px-8 mb-20 rounded-[16px]"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <FaBoxOpen size={26} style={{ color: "var(--border-strong)" }} />
              <p
                className="text-[14px] font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                لا يوجد منتجات حاليا
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Cart Side Panel ── */}
      {activeProduct && (
        <CartSidePanel
          open={open}
          onClose={() => {
            setOpen(false);
            setActiveProduct(null);
          }}
          selections={activeProduct.selections}
          id={activeProduct._id}
          name={activeProduct.name}
          stock={activeProduct.stock}
          price={activeProduct.price}
          comparePrice={activeProduct.comparePrice}
          image={activeProduct.images[0].url}
        />
      )}
    </main>
  );
}
