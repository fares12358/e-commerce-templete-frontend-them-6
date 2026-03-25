// ═══════════════════════════════════════════════════════════════
// AboutPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { useAuth } from "@/context/AuthContext";
import { FaBoxOpen } from "react-icons/fa";

export default function AboutPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData } = useAuth();
  const content = setupData?.content;
  // ── END LOGIC ────────────────────────────────────────────────

  if (!content) return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4"
      style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>لا يوجد محتوى متاح</p>
    </div>
  );

  const { aboutUs, vision, mission, termsOfUse = [], privacyPolicy = [] } = content;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }} dir="rtl">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
          <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.1em] uppercase px-3.5 py-1.5 rounded-[var(--radius-full)] mb-6 border"
            style={{ borderColor: "var(--accent-border)", background: "var(--accent-light)", color: "var(--accent)" }}>
            من نحن
          </span>
          <h1 className="text-[clamp(30px,6vw,62px)] leading-[1.07] mb-7 max-w-4xl mx-auto tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
            {aboutUs?.title}
          </h1>
          <p className="text-[16px] md:text-[18px] leading-[1.8] max-w-2xl mx-auto mb-4" style={{ color: "var(--text-secondary)" }}>
            {aboutUs?.description}
          </p>
          {aboutUs?.secondaryDescription && (
            <p className="text-[14px] max-w-xl mx-auto leading-[1.8]" style={{ color: "var(--text-muted)" }}>
              {aboutUs.secondaryDescription}
            </p>
          )}
        </div>
      </section>

      {/* ── VISION & MISSION ─────────────────────────────────── */}
      {(vision || mission) && (
        <section style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-14 md:py-18">
            <div className="grid md:grid-cols-2 gap-5">

              {vision && (
                <div className="p-8 rounded-[var(--radius-xl)] flex flex-col gap-4 transition-all duration-250"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-subtle)" }}>رؤيتنا</p>
                  <h3 className="text-[clamp(20px,3vw,30px)] tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                    {vision?.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8] italic pr-4"
                    style={{ color: "var(--text-muted)", borderRight: "3px solid var(--accent)" }}>
                    "{vision?.description}"
                  </p>
                </div>
              )}

              {mission && (
                <div className="p-8 rounded-[var(--radius-xl)] flex flex-col gap-4"
                  style={{ background: "var(--accent)", boxShadow: "var(--shadow-accent)" }}>
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: "rgba(253,252,250,0.65)" }}>رسالتنا</p>
                  <h3 className="text-[clamp(20px,3vw,30px)] tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display)", color: "#FDFCFA", fontWeight: 400 }}>
                    {mission?.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(253,252,250,0.78)" }}>{mission?.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── TERMS ────────────────────────────────────────────── */}
      {termsOfUse.length > 0 && (
        <section style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-14 md:py-18">
            <div className="mb-10">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "var(--text-subtle)" }}>قانوني</p>
              <h2 className="text-[clamp(24px,4vw,42px)] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>شروط الاستخدام</h2>
            </div>
            <div className="rounded-[var(--radius-lg)] border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
              {termsOfUse.map((term, i) => (
                <div key={term._id}
                  className="px-6 py-5 flex flex-col gap-2"
                  style={{
                    borderBottom: i !== termsOfUse.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "var(--surface)" : "var(--bg-secondary)",
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] font-mono shrink-0 border"
                      style={{ color: "var(--accent)", background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{term.title}</h4>
                  </div>
                  <p className="text-[13px] leading-[1.75] pr-9" style={{ color: "var(--text-secondary)" }}>{term.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRIVACY ──────────────────────────────────────────── */}
      {privacyPolicy.length > 0 && (
        <section style={{ background: "var(--text)" }}>
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-14 md:py-18">
            <div className="mb-10">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "rgba(253,252,250,0.4)" }}>خصوصيتك تهمنا</p>
              <h2 className="text-[clamp(24px,4vw,42px)] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--bg)", fontWeight: 400 }}>سياسة الخصوصية</h2>
            </div>
            <div className="flex flex-col gap-3">
              {privacyPolicy.map((policy, i) => (
                <div key={policy._id}
                  className="p-6 rounded-[var(--radius-lg)] transition-all duration-200"
                  style={{ border: "1px solid rgba(253,252,250,0.08)", background: "rgba(253,252,250,0.05)" }}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] font-mono"
                      style={{ color: "rgba(253,252,250,0.4)", background: "rgba(253,252,250,0.08)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-[14px] font-semibold" style={{ color: "var(--bg)" }}>{policy.title}</h4>
                  </div>
                  <p className="text-[13px] leading-[1.8] pr-9" style={{ color: "rgba(253,252,250,0.55)" }}>{policy.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
