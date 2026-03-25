// ═══════════════════════════════════════════════════════════════
// OtpVerificationPage.jsx — ZEAL Theme
// ═══════════════════════════════════════════════════════════════
"use client";
import { motion } from "framer-motion";
import { FaClock, FaArrowLeft, FaShieldAlt, FaPen } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { send_otp, varfy_otp } from "@/lib/api";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import { useRouter } from "next/navigation";

export default function OtpVerificationPage() {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const router = useRouter();
  const { data, setdata, user, setUser } = useAuth();

  const RESEND_TIME = 60;
  const [timer,     setTimer]     = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);
  const [shake,     setShake]     = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const length = 6;
  const inputs = useRef([]);
  const [code, setCode] = useState(Array(length).fill(""));

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    if (value.length === length) {
      value.split("").forEach((v, i) => { if (i < length) newCode[i] = v; });
      setCode(newCode);
      inputs.current[length - 1]?.focus();
      setTimeout(verifyOtp, 200);
      return;
    }
    newCode[index] = value;
    setCode(newCode);
    if (value && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleBack = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const otpValue = code.join("");

  const verifyOtp = async () => {
    if (verifying) return;
    if (otpValue.length !== length) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      toast.error("أدخل رمز التحقق كامل");
      return;
    }
    try {
      setVerifying(true);
      const payload = { name: data.name, email: data.email, password: data.password, otp: otpValue };
      const res = await varfy_otp(payload);
      if (res?.success) {
        toast.success(res.message || "تم التحقق بنجاح");
        setUser(res.data);
        router.push("/auth/login");
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        toast.error(res?.message || "رمز غير صحيح");
      }
    } catch (error) {
      setShake(true);
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setVerifying(false); }
  };

  const sendOtp = async () => {
    if (resending) return;
    try {
      setResending(true);
      const res = await send_otp({ email: data.email });
      if (res?.success) {
        toast.success(res.message);
        setTimer(RESEND_TIME);
        setCanResend(false);
      } else {
        toast.error(res?.message || "حدث خطأ ما");
      }
    } catch (error) {
      toast.error(error?.message || error?.response?.data?.message || "فشل الاتصال بالسيرفر");
    } finally { setResending(false); }
  };

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);
  // ── END LOGIC ────────────────────────────────────────────────

  return (
    <main dir="rtl" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-5 py-16"
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

          <div className="px-8 pt-9 pb-8 flex flex-col items-center gap-7 text-center">

            {/* ── HEADER ──────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center border"
                style={{ background: "var(--accent-light)", borderColor: "var(--accent-border)" }}>
                <FaShieldAlt size={17} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h1 className="text-[24px] font-bold tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 400 }}>
                  التحقق من الرمز
                </h1>
                <p className="text-[13px] mt-1.5 leading-[1.7]" style={{ color: "var(--text-muted)" }}>
                  أدخل رمز التحقق المرسل إلى
                  <br />
                  <span dir="ltr" className="font-semibold" style={{ color: "var(--text)" }}>
                    {data?.email || ""}
                  </span>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: "var(--border)" }} />

            {/* ── OTP INPUTS ──────────────────────────────────── */}
            <motion.div
              animate={{ x: shake ? [-8, 8, -6, 6, -4, 4, 0] : 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-row-reverse justify-center gap-2 md:gap-2.5 w-full"
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => (inputs.current[i] = el)}
                  value={digit}
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleBack(i, e)}
                  className="w-9 h-12 md:w-13 md:h-13 text-center text-[18px] font-bold rounded-[var(--radius-md)] border-2 outline-none transition-all duration-150"
                  style={digit
                    ? { borderColor: "var(--accent)", background: "var(--accent)", color: "#fff" }
                    : { borderColor: "var(--border)", background: "var(--bg-secondary)", color: "var(--text)" }
                  }
                />
              ))}
            </motion.div>

            {/* ── VERIFY BUTTON ───────────────────────────────── */}
            <motion.button
              onClick={verifyOtp}
              disabled={verifying}
              whileTap={{ scale: 0.98 }}
              className="w-full h-11 flex items-center justify-center text-[14px] font-semibold rounded-[var(--radius-md)] border-none transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }}
            >
              {verifying ? <Loader size={18} color="#fff" /> : "تحقق من الرمز"}
            </motion.button>

            {/* ── TIMER + RESEND ───────────────────────────────── */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
                <span>لم يصلك الرمز؟</span>
                <span className="flex items-center gap-1.5 font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                  <FaClock size={10} style={{ color: "var(--accent)" }} />
                  <span dir="ltr">{`00:${String(timer).padStart(2, "0")}`}</span>
                </span>
              </div>

              <div className="flex items-center gap-5">
                <button
                  disabled={!canResend || resending}
                  onClick={sendOtp}
                  className="text-[13px] font-semibold underline underline-offset-2 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
                  style={{ color: canResend ? "var(--accent)" : "var(--text-disabled)" }}
                >
                  {resending ? <Loader size={14} color="var(--accent)" /> : "إعادة إرسال الرمز"}
                </button>

                <span className="w-px h-4" style={{ background: "var(--border)" }} />

                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-150"
                  style={{ color: "var(--text-muted)" }}
                >
                  تغيير الإيميل <FaPen size={9} />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Back link */}
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 mt-5 text-[12px] font-medium transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
        >
          <FaArrowLeft size={9} /> العودة لتسجيل الدخول
        </Link>
      </motion.div>
    </main>
  );
}
