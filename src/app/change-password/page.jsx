// ═══════════════════════════════════════════════════════════════
// ChangePasswordPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import { updatePassword } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { user } = useAuth();
  const router   = useRouter();

  const [current,     setCurrent]     = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleUpdatePassword = async () => {
    if (!current || !password || !confirm)
      return toast.error("يرجى ملء جميع الحقول");
    if (password.length < 8)
      return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    if (password !== confirm)
      return toast.error("كلمتا المرور غير متطابقتين");
    try {
      setLoading(true);
      const res = await updatePassword({ current, password });
      if (res.success) {
        toast.success(res.message);
        setCurrent(""); setPassword(""); setConfirm("");
      }
    } catch (error) {
      toast.error(error.message || "فشل الاتصال بالسيرفر");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!user) router.push('/'); }, [user]);
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px]"
      >
        {/* Card */}
        <div className="rounded-[var(--radius-xl)] border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-modal)" }}>

          {/* Accent top bar */}
          <div className="h-[3px]" style={{ background: "var(--accent)" }} />

          <div className="px-8 pt-9 pb-8 flex flex-col gap-7">

            {/* ── HEADER ──────────────────────────────────────── */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center border"
                style={{ background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                <FaLock size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h1 className="text-[24px] tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                  تغيير كلمة المرور
                </h1>
                <p className="text-[13px] mt-1.5 leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                  أدخل كلمة المرور الحالية والجديدة لتحديث بياناتك
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* ── FORM ────────────────────────────────────────── */}
            <form className="flex flex-col gap-5" onSubmit={e => e.preventDefault()}>

              <ZealPassField
                label="كلمة المرور الحالية"
                placeholder="أدخل كلمة المرور الحالية"
                show={showCurrent}
                toggle={() => setShowCurrent(v => !v)}
                value={current}
                onChange={setCurrent}
              />

              <ZealPassField
                label="كلمة المرور الجديدة"
                placeholder="8 أحرف على الأقل"
                show={showNew}
                toggle={() => setShowNew(v => !v)}
                value={password}
                onChange={setPassword}
              />

              <ZealPassField
                label="تأكيد كلمة المرور الجديدة"
                placeholder="أعد إدخال كلمة المرور الجديدة"
                show={showConfirm}
                toggle={() => setShowConfirm(v => !v)}
                value={confirm}
                onChange={setConfirm}
              />

              {/* Submit */}
              <motion.button
                type="button"
                onClick={handleUpdatePassword}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center text-[14px] font-semibold rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer mt-1 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}
              >
                {loading ? <Loader size={18} color="#fff" /> : "تغيير كلمة المرور"}
              </motion.button>

              {/* Forgot link */}
              <div className="flex justify-center">
                <Link
                  href="/auth/forget-password"
                  className="text-[12px] font-medium transition-colors duration-150 underline underline-offset-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  هل نسيت كلمة المرور؟
                </Link>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// ZealPassField — shared password input component
// ═══════════════════════════════════════════════════════════════
function ZealPassField({ label, placeholder, show, toggle, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder || "••••••••"}
          value={value}
          onChange={e => onChange(e.target.value)}
          dir="ltr"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-11 rounded-[var(--radius-md)] px-4 pl-11 text-[14px] outline-none transition-all duration-200"
          style={{
            background: focused ? "var(--surface)" : "var(--bg-secondary)",
            border: focused ? "1px solid var(--border-focus)" : "1px solid var(--border)",
            boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.15)" : "none",
            color: "var(--text)",
          }}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer"
          style={{ color: focused ? "var(--accent)" : "var(--text-disabled)" }}
        >
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
    </div>
  );
}
