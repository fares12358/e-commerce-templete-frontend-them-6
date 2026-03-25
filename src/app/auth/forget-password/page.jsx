"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaLock, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim())                    { toast.error("أدخل البريد الإلكتروني"); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email))   { toast.error("البريد الإلكتروني غير صحيح"); return false; }
    return true;
  };

  const handleForgotPassword = async () => {
    if (loading || !validate()) return;
    try {
      setLoading(true);
      const res = await forgotPassword({ email });
      if (res?.success) toast.success(res.message || "تم إرسال الرابط إلى بريدك الإلكتروني");
      else toast.error(res?.message || "تعذر إرسال الرابط");
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const [focused, setFocused] = useState(false);

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ background: "var(--bg-secondary)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "0 20px 60px rgba(26,23,20,0.09), 0 8px 24px rgba(26,23,20,0.05)",
          }}>
          <div className="h-[2px]" style={{ background: "var(--accent)" }} />

          <div className="px-8 pt-9 pb-8 flex flex-col gap-7">

            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center"
                style={{ background: "var(--accent-light)", border: "1px solid var(--accent-border)" }}>
                <FaLock size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h1 className="text-[24px] tracking-[-0.01em]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                  نسيت كلمة المرور؟
                </h1>
                <p className="text-[13px] mt-1.5 leading-[1.7]" style={{ color: "var(--text-muted)" }}>
                  أدخل بريدك وسنرسل لك رابط إعادة التعيين
                </p>
              </div>
            </div>

            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* Form */}
            <div className="flex flex-col gap-5">

              {/* Email field */}
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2"
                  style={{ color: "var(--text-muted)" }}>
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleForgotPassword()}
                    type="email"
                    dir="ltr"
                    placeholder="example@name.com"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full h-11 rounded-[8px] px-4 pl-11 text-[14px] outline-none placeholder:opacity-40 transition-all duration-200"
                    style={{
                      background: focused ? "var(--surface)" : "var(--bg-secondary)",
                      border: `1px solid ${focused ? "var(--accent-border)" : "var(--border)"}`,
                      color: "var(--text)",
                      boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.12)" : "none",
                    }}
                  />
                  <FaEnvelope size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color: focused ? "var(--accent)" : "var(--text-disabled)" }} />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleForgotPassword}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center text-[14px] font-semibold rounded-[8px] border-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}
              >
                {loading ? <Loader size={18} color="var(--text-inverse)" /> : "إرسال رابط الاستعادة"}
              </motion.button>

              {/* Back link */}
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-[12px] font-medium transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
              >
                <FaArrowLeft size={9} /> العودة لتسجيل الدخول
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </main>
  );
}
