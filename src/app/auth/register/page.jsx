"use client";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { send_otp } from "@/lib/api";
import { useRouter } from "next/navigation";
import Loader from "@/Components/Loader";
import { toast } from "react-toastify";

export default function RegisterPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const router = useRouter();
  const { data, setData } = useAuth();
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState({});

  const handleChange = (field, value) => setData({ ...data, [field]: value });

  const validate = () => {
    const err = {};
    if (!data.name?.trim())                          err.name     = "الاسم مطلوب";
    if (!data.email?.trim())                         err.email    = "البريد الإلكتروني مطلوب";
    else if (!/^\S+@\S+\.\S+$/.test(data.email))   err.email    = "البريد الإلكتروني غير صحيح";
    if (!data.password)                              err.password = "كلمة المرور مطلوبة";
    else if (data.password.length < 6)              err.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (data.confirm !== data.password)             err.confirm  = "كلمتا المرور غير متطابقتين";
    if (!data.checkbox)                              err.terms    = "يجب الموافقة على الشروط";
    if (Object.keys(err).length > 0) Object.values(err).forEach(msg => toast.error(msg));
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const sendOtp = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await send_otp({ email: data.email });
      if (res?.success) { toast.success(res.message); router.push("/auth/otp"); }
      else toast.error(res?.message || "حدث خطأ ما");
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: "var(--bg-secondary)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px]"
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
                إنشاء حساب جديد
              </h1>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                أدخل بياناتك لتبدأ التسوق معنا
              </p>
            </div>

            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>

              {/* Name */}
              <ZealInput label="الاسم الكامل" placeholder="full name" type="text" ltr
                icon={<FaUser size={12} />} value={data.name || ""}
                onChange={e => handleChange("name", e.target.value)} />

              {/* Email */}
              <ZealInput label="البريد الإلكتروني" placeholder="name@example.com" type="email" ltr
                icon={<FaEnvelope size={12} />} value={data.email || ""}
                onChange={e => handleChange("email", e.target.value)} />

              {/* Password */}
              <ZealPassField label="كلمة المرور" placeholder="6 أحرف على الأقل"
                show={showPass} toggle={() => setShowPass(v => !v)}
                value={data.password || ""} onChange={v => handleChange("password", v)} />

              {/* Confirm */}
              <ZealPassField label="تأكيد كلمة المرور" placeholder="أعد إدخال كلمة المرور"
                show={showConfirmPass} toggle={() => setShowConfirmPass(v => !v)}
                value={data.confirm || ""} onChange={v => handleChange("confirm", v)} />

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group mt-1">
                <div className="relative shrink-0 mt-0.5">
                  <input type="checkbox" checked={!!data.checkbox}
                    onChange={() => handleChange("checkbox", !data.checkbox)} className="sr-only" />
                  <div className="w-[17px] h-[17px] rounded-[4px] flex items-center justify-center transition-all duration-150"
                    style={{
                      border: `2px solid ${data.checkbox ? "var(--accent)" : "var(--border-strong)"}`,
                      background: data.checkbox ? "var(--accent)" : "transparent",
                    }}>
                    {data.checkbox && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[12px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                  أوافق على{" "}
                  <Link href="/about" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent)" }}>
                    شروط الخدمة
                  </Link>
                  {" "}و{" "}
                  <Link href="/about" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent)" }}>
                    سياسة الخصوصية
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <motion.button type="button" onClick={sendOtp} disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center text-[14px] font-semibold rounded-[8px] border-none cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", boxShadow: "var(--shadow-accent)" }}>
                {loading ? <Loader size={18} color="var(--text-inverse)" /> : "إنشاء حساب"}
              </motion.button>
            </form>

            {/* Login link */}
            <p className="text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--accent)" }}>
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function ZealInput({ label, placeholder, type = "text", ltr, icon, onChange, value, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2"
        style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <input value={value} onChange={onChange} onKeyDown={onKeyDown} type={type}
          dir={ltr ? "ltr" : "rtl"} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full h-11 rounded-[8px] px-4 pl-11 text-[14px] outline-none placeholder:opacity-40 transition-all duration-200"
          style={{
            background: focused ? "var(--surface)" : "var(--bg-secondary)",
            border: `1px solid ${focused ? "var(--accent-border)" : "var(--border)"}`,
            color: "var(--text)",
            boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.12)" : "none",
          }} />
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
            style={{ color: focused ? "var(--accent)" : "var(--text-disabled)" }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function ZealPassField({ label, placeholder, show, toggle, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2"
        style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} placeholder={placeholder || "••••••••"}
          value={value} onChange={e => onChange(e.target.value)} dir="ltr"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full h-11 rounded-[8px] px-4 pl-11 text-[14px] outline-none placeholder:opacity-40 transition-all duration-200"
          style={{
            background: focused ? "var(--surface)" : "var(--bg-secondary)",
            border: `1px solid ${focused ? "var(--accent-border)" : "var(--border)"}`,
            color: "var(--text)",
            boxShadow: focused ? "0 0 0 3px rgba(200,131,26,0.12)" : "none",
          }} />
        <button type="button" onClick={toggle}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer"
          style={{ color: focused ? "var(--accent)" : "var(--text-disabled)" }}>
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
    </div>
  );
}
