// ═══════════════════════════════════════════════════════════════
// ResetPasswordPage.jsx — LUMINA Theme V5
// ═══════════════════════════════════════════════════════════════
"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import { resetPassword } from "@/lib/api";
import { motion } from "framer-motion";
import { FaArrowLeft, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
 
export default function ResetPasswordPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const { token } = useParams();
  const router = useRouter();
  const [show1,            setShow1]            = useState(false);
  const [show2,            setShow2]            = useState(false);
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [loading,          setLoading]          = useState(false);
 
  const validate = () => {
    if (!password)                      { toast.error("أدخل كلمة المرور الجديدة"); return false; }
    if (password.length < 6)            { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return false; }
    if (password !== confirmPassword)   { toast.error("كلمتا المرور غير متطابقتين"); return false; }
    if (!token)                         { toast.error("رابط إعادة التعيين غير صالح"); return false; }
    return true;
  };
 
  const handleResetPassword = async () => {
    if (loading || !validate()) return;
    try {
      setLoading(true);
      const res = await resetPassword(token, { password });
      if (res?.success) {
        toast.success(res.message || "تم تحديث كلمة المرور بنجاح");
        router.push("/auth/login");
      } else {
        toast.error(res?.message || "الرابط غير صالح أو منتهي");
      }
    } catch { toast.error("فشل الاتصال بالسيرفر"); }
    finally { setLoading(false); }
  };
  // ── END LOGIC ────────────────────────────────────────────────
 
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px]"
      >
        {/* Card */}
        <div
          className="bg-white rounded-[18px] border border-[#E5E7EB] overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(17,24,39,0.10), 0 8px 24px rgba(17,24,39,0.06)" }}
        >
          {/* Blue top bar */}
          <div className="h-[3px] bg-[#0066FF]" />
 
          <div className="px-8 pt-9 pb-8 flex flex-col gap-7">
 
            {/* ── HEADER ──────────────────────────────────────── */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-[10px] bg-[#EEF4FF] border border-[#BFDBFE] flex items-center justify-center">
                <FaLock size={16} className="text-[#0066FF]" />
              </div>
              <div>
                <h1
                  className="text-[24px] font-extrabold tracking-[-0.02em] text-[#111827]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  إعادة تعيين كلمة المرور
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-1.5">
                  أدخل كلمة مرور جديدة لحسابك
                </p>
              </div>
            </div>
 
            {/* Divider */}
            <div className="h-px bg-[#E5E7EB]" />
 
            {/* ── FORM ────────────────────────────────────────── */}
            <form className="flex flex-col gap-5" onSubmit={e => e.preventDefault()}>
 
              {/* New password */}
              <LuminaPassField
                label="كلمة المرور الجديدة"
                placeholder="6 أحرف على الأقل"
                show={show1}
                toggle={() => setShow1(v => !v)}
                value={password}
                onChange={setPassword}
              />
 
              {/* Confirm password */}
              <LuminaPassField
                label="تأكيد كلمة المرور الجديدة"
                placeholder="أعد إدخال كلمة المرور"
                show={show2}
                toggle={() => setShow2(v => !v)}
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
 
              {/* Submit */}
              <motion.button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center bg-[#0066FF] text-white text-[14px] font-bold rounded-[8px] border-none hover:bg-[#0052CC] hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 cursor-pointer"
                style={{ boxShadow: "0 4px 14px rgba(0,102,255,0.30)" }}
              >
                {loading ? <Loader size={18} color="#fff" /> : "تحديث كلمة المرور"}
              </motion.button>
 
              {/* Back link */}
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-[12px] font-medium text-[#6B7280] hover:text-[#0066FF] transition-colors duration-150"
              >
                <FaArrowLeft size={9} /> العودة لتسجيل الدخول
              </Link>
            </form>
 
          </div>
        </div>
      </motion.div>
    </main>
  );
}