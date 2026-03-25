"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchProducts } from "@/lib/api";
import Loader from "@/Components/Loader";
import ProductCard from "@/Components/ProductCard";
import SearchBar from "@/Components/SearchBar";
import CartSidePanel from "@/Components/CartSidePanel"; // ✅ restored
import { FaChevronLeft, FaChevronRight, FaSearch, FaBoxOpen } from "react-icons/fa";

export default function SearchPage() {
  // ── LOGIC (RESTORED + UNTOUCHED) ─────────────────────────
  const params = useSearchParams();
  const q = params.get("q");

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ cart logic restored
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const openCart = (product) => {
    setActiveProduct(product);
    setOpen(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchProducts(q, page);
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [q]);
  useEffect(() => { if (q) fetchData(); }, [q, page]);
  // ── END LOGIC ─────────────────────────────────────────────

  return (
    <main className="min-h-screen" dir="rtl" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10">

        <SearchBar />

        {/* Header */}
        {q && (
          <div
            className="flex items-center gap-2.5 mb-7 pb-5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)"
              }}
            >
              <FaSearch size={11} style={{ color: "var(--text-muted)" }} />
            </div>

            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                نتائج البحث
              </p>

              <h2
                className="text-[18px] font-bold tracking-[-0.01em]"
                style={{
                  color: "var(--text)",
                  fontFamily: "var(--font-display)"
                }}
              >
                "{q}"

                {!loading && products.length > 0 && (
                  <span
                    className="text-[14px] font-normal mr-2"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)"
                    }}
                  >
                    — {products.length} نتيجة
                  </span>
                )}
              </h2>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-28">
            <Loader size={32} color="var(--accent)" />
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              جارٍ البحث...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && q && (
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

            <div>
              <p className="text-[16px] font-semibold mb-1" style={{ color: "var(--text)" }}>
                لا توجد نتائج لـ "{q}"
              </p>

              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                جرب كلمات مختلفة أو تصفح المتجر
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {products.map((p, i) => (
                <div key={p._id} style={{ animation: `luminaFadeUp 300ms ${i * 35}ms both` }}>
                  <ProductCard
                    id={p._id}
                    title={p.name}
                    price={p.price}
                    image={p.images[0].url}
                    code={p.productNumber}
                    comparePrice={p.comparePrice}
                    stock={p.stock}
                    category={p?.categoryId?.name}
                    onAdd={() => openCart(p)} // ✅ RESTORED
                  />
                </div>
              ))}
            </div>

            {/* Pagination unchanged */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-10 pb-4 select-none flex-wrap">
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

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isActive = page === pNum;

                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pNum)}
                      className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                      style={{
                        background: isActive ? "var(--accent)" : "var(--bg)",
                        color: isActive ? "var(--text-inverse)" : "var(--text-secondary)",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                        boxShadow: isActive ? "var(--shadow-accent)" : "var(--shadow-xs)",
                        transform: isActive ? "scale(1.05)" : "scale(1)"
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={page === totalPages}
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
          </>
        )}
      </div>

      {/* ✅ Cart Panel RESTORED */}
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