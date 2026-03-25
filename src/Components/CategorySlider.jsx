'use client';
import Link from "next/link";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CategorySlider() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData } = useAuth();
  const sliderRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const scroll = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(el.firstChild?.offsetWidth + 16) : (el.firstChild?.offsetWidth + 16), behavior: "smooth" });
  };
  const updateProgress = () => {
    const el = sliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollLeft = Math.abs(el.scrollLeft);
    setProgress(maxScroll ? (scrollLeft / maxScroll) * 100 : 0);
  };
  useEffect(() => { updateProgress(); }, []);
  if (!setupData?.categories) return null;
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <section dir="rtl" className="mb-14 relative">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-1.5" style={{ color: "var(--text-subtle)" }}>استكشف</p>
          <h2 className="text-[clamp(20px,3.5vw,32px)] leading-[1.2] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
            تسوق حسب الفئة
          </h2>
        </div>
        <Link href="/categories"
          className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-[8px] transition-all duration-200 whitespace-nowrap"
          style={{ color: "var(--text-secondary)", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
          عرض الكل <FaArrowLeft size={11} />
        </Link>
      </div>

      <div className="relative">
        <button onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center transition-all duration-150 cursor-pointer z-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)" }}>
          <FaChevronLeft size={10} />
        </button>
        <button onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center transition-all duration-150 cursor-pointer z-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)" }}>
          <FaChevronRight size={10} />
        </button>

        <div ref={sliderRef} onScroll={updateProgress}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth hide-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}>
          {setupData?.categories.map((cat, i) => (
            <Link href={`/categories/${cat._id}`} key={i}
              className="shrink-0 flex flex-col items-center gap-2.5 group"
              style={{ scrollSnapAlign: "start" }}>
              <div className="w-[80px] h-[80px] rounded-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1"
                style={{
                  border: "2px solid var(--border)",
                  background: "var(--bg-secondary)",
                }}>
                <img src={cat.image.url} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
              </div>
              <span className="text-[12px] font-medium text-center max-w-[76px] truncate transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {progress > 0 && (
        <div className="mt-3 h-0.5 w-full rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${progress}%`, background: "var(--accent)" }} />
        </div>
      )}
    </section>
  );
}
