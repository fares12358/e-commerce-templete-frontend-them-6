"use client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SLIDE_TIME = 4500;

export default function AdsSlider() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData } = useAuth();
  const ads = setupData?.ads || [];
  const [index, setIndex] = useState(0);
  const next = () => setIndex(i => (i + 1) % ads.length);
  const prev = () => setIndex(i => (i - 1 + ads.length) % ads.length);
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(next, SLIDE_TIME);
    return () => clearInterval(t);
  }, [ads.length]);
  if (!ads.length) return null;
  const slide = ads[index];
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", minHeight: "480px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full px-5 md:px-12 py-16"
          dir="rtl"
        >
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Image */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="w-full md:flex-1 flex justify-center order-0"
            >
              <div
                className="w-[260px] h-[260px] md:w-full md:max-w-[360px] md:h-auto md:aspect-square overflow-hidden"
                style={{
                  borderRadius: "var(--radius-2xl)",
                  backgroundImage: `url(${slide.image.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 24px 64px rgba(26,23,20,0.14), 0 8px 24px rgba(26,23,20,0.08)",
                  border: "1px solid var(--border)",
                }}
              />
            </motion.div>

            {/* Text */}
            <div className="flex-1 basis-[280px] flex flex-col gap-5 order-1">
              {slide.tag && (
                <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.1em] uppercase px-3.5 py-1.5 rounded-full w-fit"
                  style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                  {slide.tag}
                </span>
              )}
              <h2
                className="text-[clamp(28px,5vw,54px)] leading-[1.1] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}
              >
                {slide.title}
              </h2>
              {slide.description && (
                <p className="text-[15px] leading-[1.75]" style={{ color: "var(--text-muted)", maxWidth: "440px" }}>
                  {slide.description}
                </p>
              )}
              <Link
                href={slide.link ? `/product/${slide.link}` : "/shop"}
                className="inline-flex items-center text-[14px] font-semibold px-7 py-3.5 rounded-[8px] w-fit transition-all duration-200"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}
              >
                تسوق الآن
              </Link>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {ads.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer z-10"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)" }}>
            <FaChevronRight size={11} />
          </button>
          <button onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer z-10"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", boxShadow: "var(--shadow-sm)" }}>
            <FaChevronLeft size={11} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {ads.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
                style={{ width: i === index ? 20 : 6, background: i === index ? "var(--accent)" : "var(--border-strong)" }} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 z-10" style={{ background: "var(--border)" }}>
            <motion.div
              key={index}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: SLIDE_TIME / 1000, ease: "linear" }}
              className="h-full"
              style={{ background: "var(--accent)" }}
            />
          </div>
        </>
      )}
    </section>
  );
}
