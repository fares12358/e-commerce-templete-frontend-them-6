"use client";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";

export default function LoginPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    if (!email.trim())                      { toast.error("أدخل البريد الإلكتروني"); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email))     { toast.error("البريد الإلكتروني غير صحيح"); return false; }
    if (!password)                          { toast.error("أدخل كلمة المرور"); return false; }
    return true;
  };

  const handleLogin = async () => {
    if (loading || !validate()) return;
    try {
      setLoading(true);
      const res = await login({ email, password });
      if (res?.success) {
        toast.success("تم تسجيل الدخول بنجاح");
        setUser(res.data);
        router.push("/");
      } else {
        toast.error(res?.message || "بيانات غير صحيحة");
      }
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

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
            <div className="text-center flex flex-col gap-2">
              <h1 className="text-[24px] tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                مرحباً بعودتك
              </h1>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                أدخل بياناتك للوصول إلى حسابك
              </p>
            </div>

            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={e => e.preventDefault()}>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2"
                  style={{ color: "var(--text-muted)" }}>
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    type="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full h-11 rounded-[8px] px-4 pl-11 text-[14px] outline-none placeholder:opacity-40 transition-all duration-200"
                    style={{
                      background: emailFocused ? "var(--surface)" : "var(--bg-secondary)",
                      border: `1px solid ${emailFocused ? "var(--accent-border)" : "var(--border)"}`,
                      color: "var(--text)",
                      boxShadow: emailFocused ? "0 0 0 3px rgba(200,131,26,0.12)" : "none",
                    }}
                  />
                  <FaEnvelope size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color: emailFocused ? "var(--accent)" : "var(--text-disabled)" }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: "var(--text-muted)" }}>
                    كلمة المرور
                  </label>
                  <Link href="/auth/forget-password"
                    className="text-[11px] font-medium underline underline-offset-2 transition-colors duration-150"
                    style={{ color: "var(--accent)" }}>
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    dir="ltr"
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    className="w-full h-11 rounded-[8px] px-4 pl-11 text-[14px] outline-none placeholder:opacity-40 transition-all duration-200"
                    style={{
                      background: passFocused ? "var(--surface)" : "var(--bg-secondary)",
                      border: `1px solid ${passFocused ? "var(--accent-border)" : "var(--border)"}`,
                      color: "var(--text)",
                      boxShadow: passFocused ? "0 0 0 3px rgba(200,131,26,0.12)" : "none",
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer"
                    style={{ color: passFocused ? "var(--accent)" : "var(--text-disabled)" }}>
                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center text-[14px] font-semibold rounded-[8px] border-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
                {loading ? <Loader size={18} color="var(--text-inverse)" /> : "تسجيل الدخول"}
              </motion.button>

              {/* Register link */}
              <p className="text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                ليس لديك حساب؟{" "}
                <Link href="/auth/register"
                  className="font-semibold underline underline-offset-2 transition-colors duration-150"
                  style={{ color: "var(--accent)" }}>
                  تسجيل حساب جديد
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
