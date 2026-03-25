// ═══════════════════════════════════════════════════════════════
// MyOrdersPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaChevronLeft, FaChevronRight, FaBoxOpen, FaTimes } from "react-icons/fa";
import { getOrders } from "@/lib/api";
import { toast } from "react-toastify";
import CustomSelect from "@/Components/CustomSelect";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/Components/Loader";
import { useRouter } from "next/navigation";

// ── STATUS CONFIG ────────────────────────────────────────────
const statusStyles = {
  pending:   { bg: "var(--warning-bg)",  border: "var(--warning-border)",  text: "var(--warning)",  label: "قيد الانتظار" },
  confirmed: { bg: "var(--bg-secondary)", border: "var(--border)",          text: "var(--text-secondary)", label: "تم التأكيد" },
  shipped:   { bg: "var(--accent-light)", border: "var(--accent-border)",   text: "var(--accent)",   label: "تم الشحن"     },
  delivered: { bg: "var(--success-bg)",   border: "var(--success-border)",  text: "var(--success)",  label: "تم التوصيل"  },
  cancelled: { bg: "var(--error-bg)",     border: "var(--error-border)",    text: "var(--error)",    label: "تم الإلغاء"   },
};

const statusOptions = [
  { value: "all",       label: "كل الطلبات"   },
  { value: "pending",   label: "قيد الانتظار" },
  { value: "confirmed", label: "قيد التجهيز"  },
  { value: "shipped",   label: "تم الشحن"     },
  { value: "delivered", label: "تم التوصيل"   },
  { value: "cancelled", label: "تم الإلغاء"   },
];

const sortOptions = [
  { value: "new", label: "الأحدث أولاً" },
  { value: "old", label: "الأقدم أولاً" },
];

// ── ORDER CARD ───────────────────────────────────────────────
function OrderCard({ order, simple }) {
  const { orderNumber, status, createdAt, items, totalPrice, paymentMethod, _id } = order;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  const totalItems = items?.reduce((acc, item) => acc + item.quantity, 0);
  const s = statusStyles[status] || statusStyles.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[var(--radius-lg)] border overflow-hidden transition-all duration-200"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Card header */}
      <div className="px-5 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-0.5" style={{ color: "var(--text-subtle)" }}>رقم الطلب</p>
          <h2 className="text-[16px] font-bold tracking-[-0.01em] tabular-nums"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
            #{orderNumber}
          </h2>
        </div>
        <span className="inline-flex items-center text-[11px] font-semibold px-3 py-1.5 rounded-[var(--radius-full)] border"
          style={{ background: s.bg, borderColor: s.border, color: s.text }}>
          {s.label}
        </span>
      </div>

      {/* Card body */}
      <div className="px-5 md:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "التاريخ",        value: formatDate(createdAt),                                              accent: false },
          { label: "عدد المنتجات",   value: `${totalItems} منتج`,                                              accent: false },
          { label: "طريقة الدفع",    value: paymentMethod === "cash" ? "الدفع عند الاستلام" : paymentMethod,   accent: false },
          { label: "الإجمالي",       value: `${totalPrice.toLocaleString()} ${simple}`,                        accent: true  },
        ].map(({ label, value, accent }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-1" style={{ color: "var(--text-subtle)" }}>{label}</p>
            <p className="text-[13px] tabular-nums font-medium"
              style={{ color: accent ? "var(--accent)" : "var(--text-secondary)", fontWeight: accent ? 700 : undefined }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div className="px-5 md:px-6 py-3.5 flex justify-end"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <Link
          href={`/orderDetails/${_id}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-[var(--radius-md)] border transition-all duration-150"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          عرض التفاصيل <FaChevronLeft size={9} />
        </Link>
      </div>
    </motion.div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────
export default function MyOrdersPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { orders, setOrders, user, simple } = useAuth();
  const [filter,     setFilter]     = useState("all");
  const [sort,       setSort]       = useState("new");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const router = useRouter();
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const cacheKey = `${filter}_${sort}_${page}_${search}`;
      if (orders[cacheKey]) return;
      setLoading(true);
      const params = { page, sort };
      if (filter !== "all") params.status = filter;
      if (search) params.orderNumber = search;
      const res = await getOrders(params);
      setOrders(prev => ({ ...prev, [cacheKey]: res.data }));
      setTotalPages(res.pagination.totalPages);
    } catch { toast.error("فشل تحميل الطلبات"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter, sort, page, search]);

  const getVisiblePages = () => {
    const pages = [], siblingCount = 2;
    const start = Math.max(2, page - siblingCount);
    const end   = Math.min(totalPages - 1, page + siblingCount);
    pages.push(1);
    if (start > 2) pages.push("start-ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("end-ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  useEffect(() => { if (!user) router.push('/'); }, [user]);
  // ── END LOGIC ────────────────────────────────────────────────

  const currentKey    = `${filter}_${sort}_${page}_${search}`;
  const currentOrders = orders[currentKey] || [];

  const handleSearch = () => { setPage(1); setSearch(searchTerm); };
  const clearSearch  = () => { setSearchTerm(""); setPage(1); setSearch(""); };

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1000px] mx-auto px-5 md:px-8 py-10 flex flex-col gap-6">

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div className="pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>حسابي</p>
          <h1 className="text-[clamp(24px,4vw,40px)] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
            طلباتي
          </h1>
        </div>

        {/* ── SEARCH BAR ──────────────────────────────────── */}
        <div
          className="flex items-center rounded-[var(--radius-lg)] border overflow-hidden transition-all duration-200"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-xs)" }}
        >
          <div className="pl-4 pr-2 flex items-center shrink-0">
            <FaSearch size={13} style={{ color: "var(--text-subtle)" }} />
          </div>

          <div className="relative flex-1 min-w-0">
            <input
              className="w-full h-11 bg-transparent outline-none text-[14px] pr-1"
              style={{
                color: "var(--text)",
                paddingLeft: searchTerm ? "2rem" : undefined,
              }}
              placeholder="ابحث عن رقم الطلب..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            />

            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer"
                style={{ color: "var(--text-subtle)" }}
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="h-11 px-4 md:px-5 text-[13px] font-semibold transition-colors duration-150 cursor-pointer shrink-0 border-none whitespace-nowrap"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <span className="hidden sm:inline">بحث</span>
            <FaSearch size={13} className="sm:hidden" />
          </button>
        </div>

        {/* ── FILTERS ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold shrink-0" style={{ color: "var(--text-muted)" }}>الحالة:</span>
            <CustomSelect
              value={filter}
              options={statusOptions}
              placeholder="اختر الحالة"
              onChange={val => { setFilter(val); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold shrink-0" style={{ color: "var(--text-muted)" }}>الترتيب:</span>
            <CustomSelect
              value={sort}
              options={sortOptions}
              placeholder="ترتيب الطلبات"
              onChange={val => { setSort(val); setPage(1); }}
            />
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader size={32} color="var(--accent)" />
          </div>
        ) : currentOrders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {currentOrders.map(order => (
              <OrderCard key={order._id} order={order} simple={simple} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center border"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
              <FaBoxOpen size={22} style={{ color: "var(--border-strong)" }} />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--text-muted)" }}>لا توجد طلبات</p>
          </div>
        )}

        {/* ── PAGINATION ───────────────────────────────────── */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-1.5 pt-4 pb-2 select-none flex-wrap">

            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
            >
              <FaChevronRight size={11} />
            </button>

            {getVisiblePages().map((p, i) =>
              p === "start-ellipsis" || p === "end-ellipsis" ? (
                <span key={i} className="w-9 h-9 flex items-center justify-center text-[13px]" style={{ color: "var(--text-subtle)" }}>
                  ···
                </span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[13px] font-semibold transition-all duration-150 cursor-pointer border"
                  style={page === p
                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", boxShadow: "var(--shadow-accent)", transform: "scale(1.05)" }
                    : { background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)", boxShadow: "var(--shadow-xs)" }
                  }
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] border transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
            >
              <FaChevronLeft size={11} />
            </button>

          </div>
        )}

      </div>
    </main>
  );
}
