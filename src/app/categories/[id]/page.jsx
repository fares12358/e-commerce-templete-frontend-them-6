// ═══════════════════════════════════════════════════════════════
// CategoryDetails.jsx — THEME VERSION (Aligned with your system)
// ═══════════════════════════════════════════════════════════════
'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductsByCat } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CustomSelect from "@/Components/CustomSelect";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";
import CartSidePanel from "@/Components/CartSidePanel";
import { FaChevronLeft, FaChevronRight, FaBoxOpen } from "react-icons/fa";

const PAGE_LIMIT = 20;
const SORT_OPTIONS = [
  { value: "oldest", label: "الأقدم" },
  { value: "newest", label: "الأحدث" },
  { value: "priceAsc", label: "السعر: من الأقل" },
  { value: "priceDesc", label: "السعر: من الأعلى" }
];

export default function CategoryDetails() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { id: categoryId } = useParams();
  const { categoryCache, setCategoryCache } = useAuth();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const cacheKey = `${page}-${sort}`;
  const catCache = categoryCache?.[categoryId];
  const pageData = catCache?.pages?.[cacheKey];
  const products = pageData?.products || [];
  const pagination = pageData?.pagination || {};
  const categoryInfo = catCache?.info;

  useEffect(() => {
    if (!categoryId || pageData) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getProductsByCat(categoryId, { page, limit: PAGE_LIMIT, sort });
        const data = res.data;
        setCategoryCache(prev => ({
          ...prev,
          [categoryId]: {
            info: data?.category,
            pages: {
              ...prev[categoryId]?.pages,
              [cacheKey]: {
                products: data.products,
                pagination: data.pagination
              }
            }
          }
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, page, sort]);
  // ── END LOGIC ────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full min-h-screen"
        style={{ background: "var(--bg)" }}
      >
        <Loader size={32} color="var(--accent)" />
      </div>
    );
  }

  return (
    <main className="min-h-screen" dir="rtl" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <div
          className="flex items-center gap-5 mb-8 pb-7"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {categoryInfo?.image?.url && (
            <div
              className="w-18 h-18 md:w-22 md:h-22 rounded-[14px] overflow-hidden shrink-0"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                boxShadow: "var(--shadow-card)"
              }}
            >
              <img src={categoryInfo.image.url} alt={categoryInfo.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-col gap-2 min-w-0">
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              تصنيف
            </p>

            <h1
              className="text-[clamp(20px,3.5vw,38px)] font-extrabold tracking-[-0.02em] leading-[1.1] truncate"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)"
              }}
            >
              {categoryInfo?.name || "—"}
            </h1>

            <span
              className="inline-flex items-center text-[12px] font-semibold px-3 py-1 rounded-full w-fit"
              style={{
                color: (pagination.total ?? 0) > 0 ? "var(--success)" : "var(--error)",
                background: (pagination.total ?? 0) > 0 ? "var(--success-bg)" : "var(--error-bg)",
                border: `1px solid ${(pagination.total ?? 0) > 0 ? "var(--success-border)" : "var(--error-border)"}`
              }}
            >
              {pagination.total ?? 0} منتج
            </span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <p
            className="text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            {products.length > 0 && `عرض ${products.length} من ${pagination.total ?? 0}`}
          </p>

          <CustomSelect
            value={sort}
            options={SORT_OPTIONS}
            placeholder="ترتيب حسب"
            onChange={value => {
              setSort(value);
              setPage(1);
            }}
          />
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {products.map((p, i) => (
              <div key={p._id} style={{ animation: `luminaFadeUp 300ms ${i * 35}ms both` }}>
                <ProductCard
                  id={p._id}
                  title={p.name}
                  price={p.price}
                  comparePrice={p.comparePrice}
                  image={p.images?.[0]?.url}
                  code={p.productNumber}
                  stock={p.stock}
                  category={categoryInfo?.name}
                  onAdd={() => {
                    setActiveProduct(p);
                    setOpen(true);
                  }}
                  star={p?.isFeatured}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div
              className="w-14 h-14 rounded-[14px] flex items-center justify-center"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)"
              }}
            >
              <FaBoxOpen size={22} style={{ color: "var(--text-subtle)" }} />
            </div>

            <p
              className="text-[15px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              لا يوجد منتجات
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 pt-10 pb-4 select-none flex-wrap">

            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-secondary)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <FaChevronRight size={11} />
            </button>

            {/* Pages */}
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const p = i + 1;
              const isActive = p === page;

              return (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? "var(--accent)" : "var(--bg)",
                    color: isActive ? "var(--text-inverse)" : "var(--text-secondary)",
                    border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                    boxShadow: isActive ? "var(--shadow-accent)" : "var(--shadow-xs)",
                    transform: isActive ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  {p}
                </button>
              );
            })}

            {/* Next */}
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-secondary)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <FaChevronLeft size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Cart Panel */}
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
          image={activeProduct.images?.[0]?.url}
        />
      )}
    </main>
  );
}