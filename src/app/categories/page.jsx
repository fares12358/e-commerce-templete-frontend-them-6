"use client";
import Loader from "@/Components/Loader";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaBoxOpen } from "react-icons/fa";

export default function CategoriesPage() {
  const { setupData, setupLoading } = useAuth();
  if (setupLoading) return (
    <div className="flex flex-col w-full h-screen items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );
  if (!setupData) return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4" style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>لا يوجد محتوى</p>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }} dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-12 md:py-16">

        {/* Page header */}
        <div className="mb-10">
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2" style={{ color: "var(--text-subtle)" }}>تصفح</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-[clamp(28px,5vw,50px)] leading-[1.08] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
              التصنيفات
            </h1>
            <p className="text-[14px] leading-relaxed mb-1 max-w-xs" style={{ color: "var(--text-muted)" }}>
              استكشف مجموعاتنا المصممة بعناية
            </p>
          </div>
          <div className="h-px mt-7" style={{ background: "var(--border)" }} />
        </div>

        {setupData?.categories?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {setupData.categories.map((cat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}>
                <Link href={`/categories/${cat._id}`} className="group block cursor-pointer">
                  <div className="relative aspect-square overflow-hidden rounded-[14px] transition-all duration-250"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,131,26,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <img src={cat.image.url} alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" />
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-250"
                      style={{ background: "rgba(26,23,20,0)", opacity: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(26,23,20,0.25)"; e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(26,23,20,0)"; e.currentTarget.style.opacity = "0"; }}>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full"
                        style={{ background: "var(--bg)", color: "var(--text)" }}>
                        <FaArrowLeft size={9} /> عرض المنتجات
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-[13px] font-medium transition-colors duration-150"
                      style={{ color: "var(--text-secondary)" }}>
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <FaBoxOpen size={24} style={{ color: "var(--border-strong)" }} />
            <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>لا توجد تصنيفات</p>
          </div>
        )}
      </div>
    </main>
  );
}
