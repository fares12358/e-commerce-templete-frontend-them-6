"use client";
import CategorySlider from "@/Components/CategorySlider";
import ProductCard from "@/Components/ProductCard";
import SearchBar from "@/Components/SearchBar";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaBoxOpen } from "react-icons/fa";
import { getProducts } from "@/lib/api";
import Loader from "@/Components/Loader";
import { useAuth } from "@/context/AuthContext";
import CartSidePanel from "@/Components/CartSidePanel";
import CustomSelect from "@/Components/CustomSelect";

const LIMIT = 20;
const SORT_OPTIONS = [{ label: "الأحدث", value: "new" }, { label: "الأقدم", value: "old" }, { label: "السعر: من الأقل للأعلى", value: "price_asc" }, { label: "السعر: من الأعلى للأقل", value: "price_desc" }];
const TYPE_OPTIONS = [{ label: "الكل", value: "" }, { label: "المميزه", value: "features" }, { label: "الخصومات", value: "discounts" }];

export default function ShopPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { products, setProducts, setupData, shopPag, setShopPag } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); const [activeProduct, setActiveProduct] = useState(null);
  const [sort, setSort] = useState(null); const [type, setType] = useState(null);
  const openCart = (product) => { setActiveProduct(product); setOpen(true); };
  const loadProducts = async (p = shopPag.page, currentSort = sort, currentType = type) => {
    const cacheKey = `${p}_${currentSort || "default"}_${currentType || "all"}`;
    if (products[cacheKey]) { setShopPag(prev => ({ ...prev, page: p })); return; }
    try {
      setLoading(true);
      const res = await getProducts({ page: p, limit: LIMIT, sort: currentSort, type: currentType });
      if (res.success) {
        const { products: newProducts, pagination } = res.data;
        setProducts(prev => ({ ...prev, [cacheKey]: newProducts }));
        setShopPag(prev => ({ ...prev, page: pagination.page, totalPages: pagination.totalPages }));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { loadProducts(1); }, []);
  const changePage = (p) => { if (p < 1 || p > shopPag.totalPages || p === shopPag.page) return; loadProducts(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const getPages = () => {
    const total = shopPag.totalPages, current = shopPag.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1]; if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("..."); pages.push(total);
    return pages;
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const currentKey = `${shopPag.page}_${sort || "default"}_${type || "all"}`;
  const currentProducts = products[currentKey] || [];

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10">
        <SearchBar />
        {setupData?.categories && <CategorySlider />}

        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-7 pb-5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            {!loading && currentProducts.length > 0 && <span>{currentProducts.length} منتج</span>}
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <CustomSelect value={sort} options={SORT_OPTIONS} placeholder="ترتيب حسب"
              onChange={value => { setSort(value); setShopPag(prev => ({ ...prev, page: 1 })); loadProducts(1, value); }} />
            <CustomSelect value={type} options={TYPE_OPTIONS} placeholder="نوع المنتجات"
              onChange={value => { setType(value); setShopPag(prev => ({ ...prev, page: 1 })); loadProducts(1, sort, value); }} />
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader size={32} color="var(--accent)" />
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>جارٍ تحميل المنتجات...</p>
          </div>
        ) : currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {currentProducts.map((p, i) => (
              <div key={p._id} style={{ animation: `zealFadeUp 300ms ${i * 35}ms both` }}>
                <ProductCard id={p._id} title={p.name} price={p.price} image={p.images[0].url} code={p.productNumber}
                  comparePrice={p.comparePrice} stock={p.stock} category={p?.category?.name}
                  onAdd={() => openCart(p)} star={p?.isFeatured} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--text)" }}>لا يوجد منتجات</p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>جرب تغيير الفلتر</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {shopPag.totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-1.5 pt-12 pb-4 select-none flex-wrap">
            <button disabled={shopPag.page === 1} onClick={() => changePage(shopPag.page - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
              <FaChevronRight size={11} />
            </button>
            {getPages().map((p, i) => p === "..." ? (
              <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-[13px]"
                style={{ color: "var(--text-subtle)" }}>···</span>
            ) : (
              <button key={i} onClick={() => changePage(p)}
                className="w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  background: shopPag.page === p ? "var(--accent)" : "var(--surface)",
                  color: shopPag.page === p ? "var(--text-inverse)" : "var(--text-secondary)",
                  border: `1px solid ${shopPag.page === p ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: shopPag.page === p ? "var(--shadow-accent)" : "var(--shadow-xs)",
                  transform: shopPag.page === p ? "scale(1.05)" : "scale(1)",
                }}>
                {p}
              </button>
            ))}
            <button disabled={shopPag.page === shopPag.totalPages} onClick={() => changePage(shopPag.page + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[8px] transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}>
              <FaChevronLeft size={11} />
            </button>
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
