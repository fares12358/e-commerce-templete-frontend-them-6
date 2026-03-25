// ═══════════════════════════════════════════════════════════════
// ContactPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import Loader from "@/Components/Loader";
import { SocialLinks } from "@/Components/SocialLinks";
import { useAuth } from "@/context/AuthContext";
import { sendContact } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaArrowLeft, FaWhatsapp, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ContactPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setupData, setupLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataForm, setDataForm] = useState({ name: "", email: "", message: "" });
  const contact = setupData?.config?.contact;
  const addressLink = setupData?.config?.address;
  const social = setupData?.config?.socialMedia;

  const handleSendContact = async (e) => {
    e.preventDefault();
    if (!dataForm.name || !dataForm.email || !dataForm.message) return toast.error("جميع الحقول مطلوبة");
    try {
      setLoading(true);
      const res = await sendContact(dataForm);
      if (res.success) { toast.success(res.message); setDataForm({ name: "", email: "", message: "" }); }
      else toast.error(res.message || "حدث خطأ");
    } catch { toast.error("فشل الإرسال"); }
    finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  if (setupLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "var(--bg)" }}>
      <Loader size={32} color="var(--accent)" />
    </div>
  );

  if (!contact) return (
    <div className="flex flex-col h-screen w-full items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <FaBoxOpen size={20} style={{ color: "var(--border-strong)" }} />
      </div>
      <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>لا يوجد محتوى متاح</p>
    </div>
  );

  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-18">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-14">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--text-subtle)" }}>تواصل معنا</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="text-[clamp(32px,6vw,60px)] leading-[1.05] tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
              نحن هنا للمساعدة
            </h1>
            <p className="md:max-w-xs text-[14px] leading-[1.8] mb-1" style={{ color: "var(--text-muted)" }}>
              يسعدنا تواصلك معنا في أي وقت. فريقنا جاهز للرد عليك بأسرع وقت ممكن.
            </p>
          </div>
          <div className="h-px mt-8" style={{ background: "var(--border)" }} />
        </motion.div>

        <div className="grid md:grid-cols-12 gap-6 items-start">

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
              <div className="h-[3px]" style={{ background: "var(--accent)" }} />
              <div className="p-5 flex flex-col gap-4">
                <InfoRow icon={<FaEnvelope size={13} />} label="راسلنا" value={contact.email} />
                <InfoRow icon={<FaPhoneAlt size={13} />} label="اتصل بنا" value={contact.phone} ltr />
                {contact.whatsappLink && <a href={contact.whatsappLink} target="_blank" rel="noreferrer"><InfoRow icon={<FaWhatsapp size={13} />} label="واتساب" value="تواصل سريع" highlight /></a>}
                {addressLink && <a href={addressLink} target="_blank" rel="noreferrer"><InfoRow icon={<FaMapMarkerAlt size={13} />} label="الموقع" value="عرض الخريطة" highlight /></a>}
              </div>
            </div>

            {social && (
              <div className="rounded-[var(--radius-lg)] border p-5"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-3.5" style={{ color: "var(--text-subtle)" }}>تابعنا</p>
                <SocialLinks links={social} />
              </div>
            )}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8">
            <div className="rounded-[var(--radius-xl)] border overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}>
              <div className="h-[3px]" style={{ background: "var(--accent)" }} />
              <form onSubmit={handleSendContact} className="p-7 md:p-9 flex flex-col gap-6">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: "var(--text-subtle)" }}>أرسل رسالتك</p>
                    <h2 className="text-[22px] tracking-[-0.02em]"
                      style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                      كيف يمكننا مساعدتك؟
                    </h2>
                  </div>
                  <span className="text-[60px] leading-none font-bold select-none tabular-nums -mt-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--bg-tertiary)" }}>01</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <ContactField label="الاسم الكامل" placeholder="أدخل اسمك الكامل"
                    value={dataForm.name} onChange={e => setDataForm({ ...dataForm, name: e.target.value })} />
                  <ContactField label="البريد الإلكتروني" placeholder="example@domain.com" type="email"
                    value={dataForm.email} onChange={e => setDataForm({ ...dataForm, email: e.target.value })} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>الرسالة</label>
                  <div className="relative">
                    <textarea rows={5} placeholder="اكتب رسالتك هنا…"
                      className="w-full rounded-[var(--radius-md)] px-4 py-3 text-[14px] leading-[1.75] resize-none outline-none transition-all duration-200"
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                      onFocus={e => { e.target.style.borderColor = "var(--border-focus)"; e.target.style.background = "var(--surface)"; e.target.style.boxShadow = "0 0 0 3px rgba(200,131,26,0.15)"; }}
                      onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "var(--bg-secondary)"; e.target.style.boxShadow = "none"; }}
                      value={dataForm.message} onChange={e => setDataForm({ ...dataForm, message: e.target.value })} />
                    <p className="absolute bottom-3 left-4 text-[10px] tabular-nums" style={{ color: "var(--text-disabled)" }}>{dataForm.message.length}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-1 border-t"
                  style={{ borderColor: "var(--border)" }}>
                  <p className="text-[12px]" style={{ color: "var(--text-subtle)" }}>* جميع الحقول مطلوبة</p>
                  <button disabled={loading} type="submit"
                    className="group flex items-center gap-2.5 px-8 py-3 rounded-[var(--radius-md)] text-[13px] font-semibold transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}>
                    <AnimatePresence mode="wait">
                      {loading
                        ? <motion.span key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader size={17} color="#fff" /></motion.span>
                        : <motion.span key="lbl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            إرسال الرسالة <FaArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform duration-200" />
                          </motion.span>
                      }
                    </AnimatePresence>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value, ltr, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="shrink-0 w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center border transition-all duration-200"
        style={highlight
          ? { background: "var(--accent-light)", color: "var(--accent)", borderColor: "var(--accent-border)" }
          : { background: "var(--bg-secondary)", color: "var(--text-subtle)", borderColor: "var(--border)" }
        }>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5" style={{ color: "var(--text-subtle)" }}>{label}</p>
        <p className={`text-[13px] font-medium truncate transition-colors ${ltr ? "direction-ltr text-left" : ""}`}
          style={{ color: "var(--text-secondary)" }}>{value}</p>
      </div>
    </div>
  );
}

function ContactField({ label, placeholder, type = "text", value, onChange }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value?.length > 0;
  return (
    <div className="relative">
      <label className="absolute right-4 transition-all duration-200 pointer-events-none font-semibold"
        style={{
          top: active ? "8px" : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? "9px" : "13px",
          letterSpacing: active ? "0.1em" : undefined,
          textTransform: active ? "uppercase" : undefined,
          color: active ? "var(--accent)" : "var(--text-disabled)",
        }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={focused ? placeholder : ""}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full h-[56px] rounded-[var(--radius-md)] px-4 pt-4 text-[14px] outline-none transition-all duration-200"
        style={{
          background: focused ? "var(--surface)" : "var(--bg-secondary)",
          border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
          boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.15)" : "none",
          color: "var(--text)",
        }} />
    </div>
  );
}
